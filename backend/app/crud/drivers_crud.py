from app.core.database import get_db
from typing import Optional

def get_summary(role: str, store_id: int):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.callproc("get_summary_for_user", [role, store_id])

    result = None
    for res in cursor.stored_results():
        result = res.fetchone()

    cursor.close()
    conn.close()
    return result


def get_drivers(role: str, store_id: int):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # Call the role/store-based procedure
    cursor.callproc("get_drivers_for_user", [role, store_id])

    results = []
    for res in cursor.stored_results():
        results = res.fetchall()

    cursor.close()
    conn.close()
    return results


def get_assistants(role: str, store_id: int):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # Call the role/store-based procedure
    cursor.callproc("get_assistants_for_user", [role, store_id])

    results = []
    for res in cursor.stored_results():
        results = res.fetchall()

    cursor.close()
    conn.close()
    return results
