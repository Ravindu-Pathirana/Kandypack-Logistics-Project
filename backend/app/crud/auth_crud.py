from sqlalchemy.orm import Session
from datetime import datetime
from app.models.auth_models import Employee
from app.core.database import Base

def get_user_by_username(db: Session, username: str):
    return db.query(Employee).filter(Employee.employee_name == username).first()

def create_user(db: Session, username: str, email: str, hashed_password: str):
    db_user = Employee(
        employee_name=username,
        employee_nic="TEMP",  # This should be provided in production
        official_contact_number="0000000000",  # This should be provided in production
        registrated_date=datetime.now(),
        password_hash=hashed_password,
        email=email
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
    cursor.execute (
        "INSERT INTO auth_users (username, email, password_hash) VALUES (%s, %s, %s)", (username, email, hashed)
    )
    db.commit()
    cursor.close()
    db.close() 
    