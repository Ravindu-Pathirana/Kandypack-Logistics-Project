import mysql.connector, os
from dotenv import load_dotenv
from fastapi import HTTPException
from app.models.customer_models import CustomerCreate

load_dotenv()

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", ""),
        database=os.getenv("DB_NAME", "kandypacklogistics"),
    )

def create_customer(customer: CustomerCreate):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "INSERT INTO Customer (customer_name, registration_date, customer_type_id) VALUES (%s, %s, %s)",
            (customer.customer_name, customer.registration_date, customer.customer_type_id)
        )
        customer_id = cursor.lastrowid

        # Insert contact numbers
        for c in customer.contacts:
            cursor.execute(
                "INSERT INTO CustomerContactNumber (contact_number, customer_id, is_primary) VALUES (%s, %s, %s)",
                (c.contact_number, customer_id, c.is_primary)
            )

        # Insert addresses
        for a in customer.addresses:
            cursor.execute(
                """INSERT INTO CustomerAddress (customer_id, address_line_1, address_line_2, city_id, district, is_primary)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (customer_id, a.address_line_1, a.address_line_2, a.city_id, a.district, a.is_primary)
            )

        conn.commit()
        return {
            "customer_id": customer_id,
            "customer_name": customer.customer_name,
            "registration_date": customer.registration_date,
            "customer_type_id": customer.customer_type_id
        }

    finally:
        cursor.close()
        conn.close()

def get_customers():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM customer ORDER BY customer_id DESC")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

