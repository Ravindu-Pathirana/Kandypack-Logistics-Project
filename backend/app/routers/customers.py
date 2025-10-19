# app/routers/customertypes.py
from fastapi import APIRouter
import mysql.connector, os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/customertypes", tags=["CustomerTypes"])
router = APIRouter(prefix="/customers", tags=["Customers"])

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", ""),
        database=os.getenv("DB_NAME", "kandypacklogistics"),
    )

@router.get("/")
def get_customer_types():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT customer_type_id, customer_type FROM CustomerType")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

@router.get("/")
def get_customers():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT customer_id, customer_name FROM customer")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows
