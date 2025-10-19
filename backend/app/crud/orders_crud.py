import mysql.connector
from dotenv import load_dotenv
import os
from datetime import date
from decimal import Decimal

load_dotenv()

def get_db():
    db = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", ""),
        database=os.getenv("DB_NAME", "kandypacklogistics")
    )
    return db

def get_orders():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    query = """
    SELECT 
        CONCAT('ORD-', LPAD(o.order_id, 3, '0')) AS id,
        c.customer_name AS customer,
        COALESCE(city.city_name, 'Unknown') AS destination,
        COALESCE(tr.route_id, 'Not Assigned') AS route,
        o.order_date AS orderDate,
        COALESCE(o.total_quantity, 0) AS items,
        COALESCE(o.total_price, 0.00) AS totalValue,
        '150 kg' AS weight,
        COALESCE(o.status, 'Pending') AS status,
        CASE 
            WHEN ta.trip_id IS NOT NULL THEN CONCAT('TR-', LPAD(ta.trip_id, 3, '0'))
            ELSE 'Not Assigned'
        END AS trainTrip,
        COALESCE(e.employee_name, 'Not Assigned') AS driver
    FROM `Order` o
    LEFT JOIN Customer c ON o.customer_id = c.customer_id
    LEFT JOIN CustomerAddress ca ON c.customer_id = ca.customer_id AND ca.is_primary = TRUE
    LEFT JOIN City city ON ca.city_id = city.city_id
    LEFT JOIN TruckDelivery td ON o.order_id = td.order_id
    LEFT JOIN TruckRoute tr ON td.route_id = tr.route_id
    LEFT JOIN TrainAllocation ta ON o.order_id = ta.order_id
    LEFT JOIN TruckEmployeeAssignment tea ON td.delivery_id = tea.truck_delivery_id
    LEFT JOIN Employee e ON tea.employee_id = e.employee_id
    ORDER BY o.order_id DESC
    """
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    db.close()
    
    # Convert data types to strings and handle None values
    formatted_results = []
    for row in results:
        formatted_row = {
            'id': str(row['id']),
            'customer': str(row['customer']),
            'destination': str(row['destination']),
            'route': str(row['route']),
            'orderDate': row['orderDate'].strftime('%Y-%m-%d') if isinstance(row['orderDate'], date) else str(row['orderDate']),
            'items': int(row['items']),
            'totalValue': f"${float(row['totalValue']):.2f}",
            'weight': str(row['weight']),
            'status': str(row['status']),
            'trainTrip': str(row['trainTrip']),
            'driver': str(row['driver'])
        }
        formatted_results.append(formatted_row)
    
    return formatted_results

def create_order(order_data):
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Insert the new order
        query = """
        INSERT INTO `Order` (
            customer_id, order_date, required_date, status, 
            total_quantity, total_price
        ) VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        values = (
            order_data.customer_id,
            order_data.order_date,
            order_data.required_date,
            order_data.status,
            order_data.total_quantity,
            order_data.total_price
        )
        
        cursor.execute(query, values)
        order_id = cursor.lastrowid
        db.commit()
        
        return order_id
        
    except Exception as e:
        db.rollback()
        raise e
    finally:
        cursor.close()
        db.close()