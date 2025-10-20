from fastapi import HTTPException
from app.core.database import get_db
from app.models.truck_models import TruckCreate

# Pydantic schema for truck creation


def create_truck(truck: TruckCreate, user_store_id: int, role: str):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    # Validate store_id matches user's store_id
    if  role != "admin" and truck.store_id != user_store_id:
        raise HTTPException(status_code=403, detail="Cannot create truck for a different store")
    
    # Validate plate number length
    if len(truck.plate_number) > 10:
        raise HTTPException(status_code=400, detail="Plate number must be 10 characters or less")
    
    try:
        # Insert new truck
        query = """
            INSERT INTO truck (store_id, plate_number, is_available)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (truck.store_id, truck.plate_number, int(truck.is_available)))
        conn.commit()
        
        # Fetch the inserted truck
        truck_id = cursor.lastrowid
        cursor.execute("SELECT truck_id, store_id, plate_number, is_available FROM truck WHERE truck_id = %s", (truck_id,))
        result = cursor.fetchone()
        
        return result
    except:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cursor.close()
        conn.close()



def get_trucks(role: str, store_id: int):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # Call the role/store-based procedure
    cursor.callproc("get_trucks_for_user", [role, store_id])

    results = []
    for res in cursor.stored_results():
        results = res.fetchall()

    cursor.close()
    conn.close()
    return results