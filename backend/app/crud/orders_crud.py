import mysql.connector
from dotenv import load_dotenv
from datetime import datetime
import os

load_dotenv()

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", ""),
        database=os.getenv("DB_NAME", "kandypacklogistics")
    )

def get_all_orders():
    """Retrieve all orders with customer and trip info"""
    db = get_db()
    cursor = db.cursor(dictionary=True)

    query = """
    SELECT 
        CONCAT('ORD-', LPAD(o.order_id, 3, '0')) AS id,
        c.customer_name AS customer,
        c.customer_type AS customerType,
        o.destination,
        o.route_code AS route,
        DATE_FORMAT(o.order_date, '%Y-%m-%d') AS orderDate,
        DATE_FORMAT(o.delivery_date, '%Y-%m-%d') AS deliveryDate,
        COUNT(oi.product_id) AS items,
        CONCAT('Rs. ', FORMAT(SUM(oi.quantity * oi.unit_price), 0)) AS totalValue,
        CONCAT(FORMAT(SUM(oi.quantity * p.unit_weight), 0), ' kg') AS weight,
        o.status,
        CONCAT('TR-', LPAD(o.train_id, 3, '0')) AS trainTrip,
        COALESCE(e.employee_name, 'Pending') AS driver
    FROM `Order` o
    JOIN Customer c ON o.customer_id = c.customer_id
    LEFT JOIN OrderItem oi ON o.order_id = oi.order_id
    LEFT JOIN Product p ON oi.product_id = p.product_id
    LEFT JOIN Employee e ON o.driver_id = e.employee_id
    GROUP BY o.order_id, c.customer_name, c.customer_type, o.destination, 
             o.route_code, o.order_date, o.delivery_date, o.status, o.train_id, e.employee_name
    ORDER BY o.order_date DESC
    """
    cursor.execute(query)
    results = cursor.fetchall()

    cursor.close()
    db.close()
    return results


def create_order(order: dict):
    """Insert new order with basic details"""
    db = get_db()
    cursor = db.cursor()

    try:
        query = """
        INSERT INTO `Order` (customer_id, destination, route_code, order_date, delivery_date, status, train_id, driver_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(query, (
            order['customer_id'],
            order['destination'],
            order.get('route_code', 'R-00'),
            order['order_date'],
            order['delivery_date'],
            order['status'],
            order.get('train_id'),
            order.get('driver_id')
        ))

        db.commit()
        return cursor.lastrowid

    except mysql.connector.Error as e:
        db.rollback()
        raise Exception(f"Database error: {e}")
    finally:
        cursor.close()
        db.close()


def get_order_details(order_id: int):
    """Get detailed order info including items"""
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        order_query = """
        SELECT 
            CONCAT('ORD-', LPAD(o.order_id, 3, '0')) AS id,
            c.customer_name AS customer,
            c.customer_type AS customerType,
            o.destination,
            o.route_code AS route,
            DATE_FORMAT(o.order_date, '%Y-%m-%d') AS orderDate,
            DATE_FORMAT(o.delivery_date, '%Y-%m-%d') AS deliveryDate,
            o.status,
            CONCAT('TR-', LPAD(o.train_id, 3, '0')) AS trainTrip,
            COALESCE(e.employee_name, 'Pending') AS driver
        FROM `Order` o
        JOIN Customer c ON o.customer_id = c.customer_id
        LEFT JOIN Employee e ON o.driver_id = e.employee_id
        WHERE o.order_id = %s
        """
        cursor.execute(order_query, (order_id,))
        order_info = cursor.fetchone()

        if not order_info:
            return None

        # Get item list
        items_query = """
        SELECT 
            p.product_name,
            oi.quantity,
            CONCAT('Rs. ', FORMAT(oi.unit_price, 0)) AS unitPrice,
            CONCAT(FORMAT(p.unit_weight, 0), ' kg') AS weight
        FROM OrderItem oi
        JOIN Product p ON oi.product_id = p.product_id
        WHERE oi.order_id = %s
        """
        cursor.execute(items_query, (order_id,))
        items = cursor.fetchall()

        order_info["items"] = items
        return order_info

    except Exception as e:
        raise Exception(f"Error fetching order details: {e}")
    finally:
        cursor.close()
        db.close()
