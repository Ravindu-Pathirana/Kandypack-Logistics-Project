from app.core.security import hash_password
from datetime import datetime
from app.core.database import get_db
from typing import Optional

def create_auth_user(conn, username: str, email: str, password_hash: str) -> int:
    cursor = conn.cursor()
    hashed_password = hash_password(password_hash)
    cursor.execute(
        "INSERT INTO auth_users (username, email, password_hash) VALUES (%s, %s, %s)",
        (username, email, hashed_password)
    )
    auth_id = cursor.lastrowid
    cursor.close()
    return auth_id


def create_employee(conn, employee_name, employee_nic, official_contact_number,
                    registrated_date, role_id, store_id, username, password) -> int:
    cursor = conn.cursor()

    hashed_password = hash_password(password)
    cursor.execute(
        """
        INSERT INTO employee
        (employee_name, username, password_hash, employee_nic, official_contact_number, registrated_date,
         employee_status, total_hours_week, role_id, store_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (employee_name,username, hashed_password, employee_nic, official_contact_number, registrated_date,
         "Active", 0, role_id, store_id)
    )
    employee_id = cursor.lastrowid
    cursor.close()
    return employee_id


def create_driver(conn, employee_id):
    cursor = conn.cursor()
    next_available_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        """
        INSERT INTO driver (employee_id, consecutive_deliveries, next_available_time, status)
        VALUES (%s, %s, %s, %s)
        """,
        (employee_id, 0, next_available_time, 'Available')
    )
    cursor.close()


def create_assistant(conn, employee_id):
    cursor = conn.cursor()
    next_available_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        """
        INSERT INTO assistant (employee_id, consecutive_deliveries, next_available_time, status)
        VALUES (%s, %s, %s, %s)
        """,
        (employee_id, 0, next_available_time, 'Available')
    )
    cursor.close()


def get_managers(status: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT * FROM employee WHERE role_id = 1"
    params = []

    if status:
        query += " AND employee_status = %s"
        params.append(status)

    cursor.execute(query, params)
    managers = cursor.fetchall()

    cursor.close()
    conn.close()
    return managers


from app.core.database import get_db

def get_employee_info(employee_id: int):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # Call the stored procedure you created
    cursor.callproc("GetEmployeeInfo", [employee_id])

    result = None
    for res in cursor.stored_results():
        result = res.fetchone()

    cursor.close()
    conn.close()
    return result
