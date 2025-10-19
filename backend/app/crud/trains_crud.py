import mysql.connector
from dotenv import load_dotenv
from datetime import datetime
import os

load_dotenv()

def get_db():
    db = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", ""),
        database=os.getenv("DB_NAME", "kandypacklogistics")
    )
    return db

def get_train_schedules():
    """Retrieve all train schedules from database"""
    db = get_db()
    cursor = db.cursor(dictionary=True)
    query = """
SELECT 
    CONCAT('TR-', LPAD(t.train_id, 3, '0')) AS id,
    CONCAT(t.start_station, ' → ', t.destination_station) AS route,
    TIME_FORMAT(t.departure_date_time, '%H:%i:%s') AS departure,  -- Format as HH:MM:SS
    TIME_FORMAT(t.arrival_date_time, '%H:%i:%s') AS arrival,     -- Format as HH:MM:SS
    t.capacity_space AS capacity,
    COALESCE(SUM(ta.allocated_qty * p.unit_space), 0) AS utilized,
    t.status,
    COUNT(DISTINCT ta.order_id) AS orders,
    DATE_FORMAT(t.departure_date_time, '%Y-%m-%d') AS nextDeparture
FROM Train t
LEFT JOIN TrainAllocation ta ON t.train_id = ta.train_id
LEFT JOIN Product p ON ta.product_id = p.product_id
WHERE t.departure_date_time >= CURDATE()
GROUP BY t.train_id, t.start_station, t.destination_station, t.departure_date_time, t.arrival_date_time, t.capacity_space, t.status
ORDER BY t.departure_date_time
"""
    cursor.execute(query)
    schedules = cursor.fetchall()
    cursor.close()
    db.close()
    return schedules

def create_train(train: dict):
    """Create a new train schedule entry"""
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Get datetime strings - they come in format: "2024-10-20T14:30:00"
        departure_str = train['departure_date_time']
        arrival_str = train['arrival_date_time']
        
        # Check if already datetime objects (from Pydantic conversion) or strings
        if isinstance(departure_str, datetime):
            departure_dt = departure_str
            departure_formatted = departure_dt.strftime('%Y-%m-%d %H:%M:%S')
        else:
            # It's a string, parse it
            departure_str = departure_str.split('+')[0].replace('T', ' ').strip()
            departure_dt = datetime.strptime(departure_str, '%Y-%m-%d %H:%M:%S')
            departure_formatted = departure_str
        
        if isinstance(arrival_str, datetime):
            arrival_dt = arrival_str
            arrival_formatted = arrival_dt.strftime('%Y-%m-%d %H:%M:%S')
        else:
            # It's a string, parse it
            arrival_str = arrival_str.split('+')[0].replace('T', ' ').strip()
            arrival_dt = datetime.strptime(arrival_str, '%Y-%m-%d %H:%M:%S')
            arrival_formatted = arrival_str
        
        # Validate that arrival is after departure
        if arrival_dt <= departure_dt:
            raise ValueError("Arrival time must be after departure time")
        
        # Ensure capacity is a valid float
        capacity = float(train['capacity_space']) if train['capacity_space'] else 0.0
        if capacity <= 0:
            raise ValueError("Capacity must be greater than 0")
        
        query = """
        INSERT INTO Train (train_name, start_station, destination_station, 
                          departure_date_time, arrival_date_time, capacity_space, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        
        cursor.execute(query, (
            train['train_name'],
            train['start_station'],
            train['destination_station'],
            departure_formatted,
            arrival_formatted,
            capacity,
            train['status']
        ))
        
        db.commit()
        new_id = cursor.lastrowid
        
        return new_id
        
    except mysql.connector.Error as e:
        db.rollback()
        raise Exception(f"Database error: {str(e)}")
    except ValueError as e:
        db.rollback()
        raise e
    except Exception as e:
        db.rollback()
        raise Exception(f"Error creating train: {str(e)}")
    finally:
        cursor.close()
        db.close()

def get_train_details(train_id: int):
    """Get detailed information about a specific train including all allocated orders"""
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    try:
        # First, get the train basic information
        train_query = """
        SELECT 
            t.train_id,
            t.train_name,
            CONCAT(t.start_station, ' → ', t.destination_station) AS route,
            DATE_FORMAT(t.departure_date_time, '%%Y-%%m-%%d %%H:%%i:%%s') AS departure_date_time,
            DATE_FORMAT(t.arrival_date_time, '%%Y-%%m-%%d %%H:%%i:%%s') AS arrival_date_time,
            t.status,
            t.capacity_space,
            COALESCE(SUM(ta.total_space_used), 0) AS total_utilized
        FROM Train t
        LEFT JOIN TrainAllocation ta ON t.train_id = ta.train_id
        WHERE t.train_id = %s
        GROUP BY t.train_id, t.train_name, t.start_station, t.destination_station, 
                 t.departure_date_time, t.arrival_date_time, t.status, t.capacity_space
        """
        
        cursor.execute(train_query, (train_id,))
        train_info = cursor.fetchone()
        
        if not train_info:
            return None
        
        # Calculate utilization percentage
        total_utilized = float(train_info['total_utilized'])
        capacity = float(train_info['capacity_space'])
        utilization_percentage = (total_utilized / capacity * 100) if capacity > 0 else 0
        
        # Now get all orders allocated to this train
        orders_query = """
        SELECT 
            ta.order_id,
            c.customer_name,
            p.product_name,
            ta.allocated_qty,
            ta.unit_space,
            ta.total_space_used,
            ta.status,
            DATE_FORMAT(ta.start_date_time, '%%Y-%%m-%%d %%H:%%i:%%s') AS start_date_time,
            DATE_FORMAT(ta.reached_date_time, '%%Y-%%m-%%d %%H:%%i:%%s') AS reached_date_time
        FROM TrainAllocation ta
        JOIN `Order` o ON ta.order_id = o.order_id
        JOIN Customer c ON o.customer_id = c.customer_id
        JOIN Product p ON ta.product_id = p.product_id
        WHERE ta.train_id = %s
        ORDER BY ta.order_id, p.product_name
        """
        
        cursor.execute(orders_query, (train_id,))
        orders = cursor.fetchall()
        
        # Build the response
        result = {
            'train_id': train_info['train_id'],
            'train_name': train_info['train_name'],
            'route': train_info['route'],
            'departure_date_time': train_info['departure_date_time'],
            'arrival_date_time': train_info['arrival_date_time'],
            'status': train_info['status'],
            'capacity_space': capacity,
            'total_utilized': total_utilized,
            'utilization_percentage': round(utilization_percentage, 2),
            'orders': orders if orders else []
        }
        
        return result
        
    except Exception as e:
        raise Exception(f"Error fetching train details: {str(e)}")
    finally:
        cursor.close()
        db.close()