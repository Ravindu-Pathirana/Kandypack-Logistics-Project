from fastapi import APIRouter
from typing import List
from app.models.order_models import OrderCreate, OrderResponse
from app.crud import orders_crud
import mysql.connector
import os

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=dict)
def create_order(order: OrderCreate):
    return orders_crud.create_order(order)


@router.get("/", response_model=List[dict])
def list_orders():
    return orders_crud.get_orders()

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", ""),
        database=os.getenv("DB_NAME", "kandypacklogistics"),
    )

@router.get("/")
def get_orders():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT 
            o.order_id,
            o.customer_id,
            c.customer_name,
            o.order_date,
            o.required_date,
            o.status,
            SUM(oi.quantity * oi.unit_price) AS total_price,
            o.total_space,
        FROM `order` o
        JOIN customer c ON o.customer_id = c.customer_id
        LEFT JOIN orderitem oi ON o.order_id = oi.order_id
        GROUP BY o.order_id, o.customer_id, c.customer_name, o.order_date, o.required_date, o.status
        ORDER BY o.order_id DESC
    """)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

@router.get("/{order_id}/items")
def get_order_items(order_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT oi.order_id, oi.product_id, oi.quantity, oi.unit_price, p.product_name, p.unit_space
        FROM orderitem oi
        JOIN product p ON oi.product_id = p.product_id
        WHERE oi.order_id = %s
    """

    cursor.execute(query, (order_id,))
    items = cursor.fetchall()

    cursor.close()
    conn.close()

    return items
