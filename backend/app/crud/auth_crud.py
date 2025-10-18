
from app.core.database import get_db

def get_user_by_username(username: str):
    db = get_db() 
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM auth_users WHERE username=%s", (username,)
    )
    user = cursor.fetchone() 
    cursor.close() 
    db.close() 
    return user   


def create_user(username, email, hashed):
    db = get_db() 
    cursor = db.cursor(dictionary=True) 
    cursor.execute (
        "INSERT INTO auth_users (username, email, password_hash) VALUES (%s, %s, %s)", (username, email, hashed)
    )
    db.commit()
    cursor.close()
    db.close() 
    