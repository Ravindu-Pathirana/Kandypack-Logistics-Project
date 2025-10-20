from fastapi import APIRouter, Depends
from app.crud.customers1_crud import  create_customer_type, get_customers, create_customer, delete_customer
from app.core.security import get_current_user
from app.models.customer_type_models import CustomerTypeCreate
from app.models.customers1_models import CustomerCreate
import os,mysql.connector

router = APIRouter()
router = APIRouter(prefix="/customers", tags=["Customers"])


def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", ""),
        database=os.getenv("DB_NAME", "kandypacklogistics"),
    )

@router.post("/customer-types")
def create_customer_type_endpoint(customer_type: CustomerTypeCreate, current_user=Depends(get_current_user)):
    """
    Creates a new customer type. Only accessible to admin users.
    """
    return create_customer_type(customer_type, current_user.role)



@router.get("/customers")
def get_customers_endpoint(current_user=Depends(get_current_user)):
    """
    Returns a list of all customers with their customer type details.
    """
    return get_customers(current_user.role, current_user.store_id)

@router.post("/customers")
def create_customer_endpoint(customer: CustomerCreate, current_user=Depends(get_current_user)):
    """
    Creates a new customer. Only accessible to admin users.
    """
    return create_customer(customer, current_user.role)

@router.get("/")
def get_customers():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT customer_id, customer_name FROM customer")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

@router.get("/{customer_id}")
def get_customer_details(customer_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT 
            c.customer_id, 
            c.customer_name,
            ca.address_line_1,
            ca.address_line_2,
            ca.district,
            ci.city_name as city
        FROM customer c
        LEFT JOIN customeraddress ca ON c.customer_id = ca.customer_id AND ca.is_primary = 1
        LEFT JOIN city ci ON ca.city_id = ci.city_id
        WHERE c.customer_id = %s
    """, (customer_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row

@router.delete("/customers/{customer_id}")
def delete_customer_endpoint(customer_id: int, current_user=Depends(get_current_user)):
    """
    Deletes a customer by ID. Only accessible to admin users.
    """
    return delete_customer(customer_id, current_user.role)