from fastapi import HTTPException
from app.core.database import get_db
from app.models.store_models import StoreCreate


def create_store(store: StoreCreate, user_role: str):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    # Validate user role (only admins can create stores)
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create stores")
    
    # Validate store name length
    if len(store.store_name) > 20:
        raise HTTPException(status_code=400, detail="Store name must be 20 characters or less")
    
    # Validate contact number length and format
    if len(store.contact_number) != 10 or not store.contact_number.isdigit():
        raise HTTPException(status_code=400, detail="Contact number must be exactly 10 digits")
    
    # Validate city_id is positive
    if store.city_id <= 0:
        raise HTTPException(status_code=400, detail="City ID must be a positive integer")
    
    try:
        # Insert new store
        query = """
            INSERT INTO store (store_name, contact_number, city_id)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (store.store_name, store.contact_number, store.city_id))
        conn.commit()
        
        # Fetch the inserted store
        store_id = cursor.lastrowid
        cursor.execute("SELECT store_id, store_name, contact_number, city_id FROM store WHERE store_id = %s", (store_id,))
        result = cursor.fetchone()
        
        return result
    except:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cursor.close()
        conn.close()




def get_all_stores(user_role: str):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    # Validate user role (only admins can retrieve stores)
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view stores")
    
    try:
        # Fetch all stores
        query = """
            SELECT store_id, store_name, contact_number FROM store
        """
        cursor.execute(query)
        result = cursor.fetchall()
        
        return result
    except:
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cursor.close()
        conn.close()