from fastapi import HTTPException
from app.core.database import get_db
from app.models.city_models import CityCreate

def create_city(city: CityCreate, user_role: str):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    # Validate user role (only admins can create cities)
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create cities")
    
    # Validate city name length
    if len(city.city_name) > 50:
        raise HTTPException(status_code=400, detail="City name must be 50 characters or less")
    
    try:
        # Insert new city
        query = "INSERT INTO city (city_name) VALUES (%s)"
        cursor.execute(query, (city.city_name,))
        conn.commit()
        
        # Fetch the inserted city
        city_id = cursor.lastrowid
        cursor.execute("SELECT city_id, city_name FROM city WHERE city_id = %s", (city_id,))
        result = cursor.fetchone()
        
        return result
    except:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cursor.close()
        conn.close()

def get_cities():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT city_id, city_name FROM city")
        results = cursor.fetchall()
        return results
    except:
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cursor.close()
        conn.close()