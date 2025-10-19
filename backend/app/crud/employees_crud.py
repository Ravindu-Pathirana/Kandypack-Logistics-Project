from app.core.security import hash_password
from datetime import datetime

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
                    registrated_date, role_id, store_id) -> int:
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO employee
        (employee_name, employee_nic, official_contact_number, registrated_date,
         employee_status, total_hours_week, role_id, store_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (employee_name, employee_nic, official_contact_number, registrated_date,
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
