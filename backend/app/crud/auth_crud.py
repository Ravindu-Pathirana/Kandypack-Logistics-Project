
from app.core.database import get_db

def get_user_by_username(username: str):
    db = get_db() 
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM employee WHERE username=%s", (username,)
    )
    user = cursor.fetchone() 
    cursor.close() 
    db.close() 
    return user   

