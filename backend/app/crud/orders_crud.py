import mysql.connector
from fastapi import HTTPException
from app.models.order_models import OrderCreate
import os

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", ""),
        database=os.getenv("DB_NAME", "kandypacklogistics"),
    )

def create_order(order: OrderCreate):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            INSERT INTO `Order` (customer_id, order_date, required_date, status, total_quantity, total_price)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            order.customer_id,
            order.order_date,
            order.required_date,
            order.status,
            order.total_quantity,
            order.total_price,
        ))
        order_id = cursor.lastrowid

        for item in order.items:
            cursor.execute("""
                INSERT INTO OrderItem (order_id, product_id, quantity, unit_price)
                VALUES (%s, %s, %s, %s)
            """, (
                order_id,
                item.product_id,
                item.quantity,
                item.unit_price,
            ))

        conn.commit()
        return { "order_id": order_id, "message": "Order created successfully" }

    except mysql.connector.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()



def get_orders():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT 
            o.order_id,
            o.customer_id,
            c.customer_name,
            o.order_date,
            o.required_date,
            o.status,
            COALESCE(SUM(oi.quantity), 0) AS total_quantity,
            COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_price
        FROM `order` o
        JOIN customer c ON o.customer_id = c.customer_id
        LEFT JOIN orderitem oi ON o.order_id = oi.order_id
        GROUP BY o.order_id, o.customer_id, c.customer_name, o.order_date, o.required_date, o.status
        ORDER BY o.order_date DESC
    """
    cursor.execute(query)
    orders = cursor.fetchall()

    cursor.close()
    conn.close()
    return orders
