from datetime import datetime
from app.core.database import get_db 
from typing import Optional

def get_summary():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT e.employee_id, e.role_id, d.status, d.consecutive_deliveries, d.next_available_time
        FROM employee e
        JOIN driver d ON e.employee_id = d.employee_id
        JOIN roles r ON e.role_id = r.role_id
    """)
    rows = cursor.fetchall()

    on_duty_drivers = 0
    on_duty_assistants = 0
    available_to_schedule = 0
    drivers_weekly_limit = 40
    assistants_weekly_limit = 60

    now = datetime.now()

    for row in rows:
        if row['role_id'] == 2:  # Driver
            # drivers_weekly_limit = row['max_hours_per_week']
            if row['status'] == "On Duty":
                on_duty_drivers += 1
        elif row['role_id'] == 1:  # Assistant
            # assistants_weekly_limit = row['max_hours_per_week']
            if row['status'] == "On Duty":
                on_duty_assistants += 1

        if row['status'] == "Available" and row['next_available_time'] <= now:
            available_to_schedule += 1

    cursor.close()
    conn.close()

    return {
        "on_duty_drivers": on_duty_drivers,
        "drivers_weekly_limit": drivers_weekly_limit,
        "on_duty_assistants": on_duty_assistants,
        "assistants_weekly_limit": assistants_weekly_limit,
        "available_to_schedule": available_to_schedule,
        "compliance": "Compliance met"
    }


def get_drivers(status: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    query = """SELECT employee_id,employee_name, 
    consecutive_deliveries, status, next_available_time,
    total_hours_week, store_id, official_contact_number 
    FROM driver 
    JOIN employee 
    using(employee_id) 
    WHERE 1=1"""
    params = []

    if status:
        status_map = {"available": "Available", "on_duty": "On Duty", "on_leave": "On Leave"}
        db_status = status_map.get(status.lower())
        if db_status:
            query += " AND status = %s"
            params.append(db_status)

    cursor.execute(query, params)
    results = cursor.fetchall()

    cursor.close()
    conn.close()
    return results



def get_assistants(status: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    query = """SELECT employee_id,employee_name, 
    consecutive_deliveries, status, next_available_time,
    total_hours_week, store_id, official_contact_number 
    FROM assistant 
    JOIN employee 
    using(employee_id) 
    WHERE 1=1"""
    params = []

    if status:
        status_map = {"available": "Available", "on_duty": "On Duty", "on_leave": "On Leave"}
        db_status = status_map.get(status.lower())
        if db_status:
            query += " AND status = %s"
            params.append(db_status)

    cursor.execute(query, params)
    results = cursor.fetchall()

    cursor.close()
    conn.close()
    return results