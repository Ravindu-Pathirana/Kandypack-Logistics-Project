from app.core.database import get_db




def get_active_deliveries(role: str, store_id: int):
    """
    Returns active deliveries filtered by the current user's role and store.
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    # Call the role/store-based procedure
    cursor.callproc("get_active_deliveries_for_user", [role, store_id])
    
    results = []
    for res in cursor.stored_results():
        results = res.fetchall()
    
    cursor.close()
    conn.close()
    return results