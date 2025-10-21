from fastapi import APIRouter
import mysql.connector, os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/customertypes", tags=["CustomerTypes"])

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", "ravi@12345"),
        database=os.getenv("DB_NAME", "kandypacklogistics"),
    )

@router.get("/")
def get_customer_types():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT customer_type_id, customer_type, credit_limit FROM customertype")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

