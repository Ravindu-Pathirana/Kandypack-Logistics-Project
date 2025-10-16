from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.driver_models import DriverCreate, DriverUpdate
from app.models import Employee, Roles, Store

def get_drivers(db: Session, skip: int = 0, limit: int = 100):
    return (db.query(Employee)
            .filter(Employee.role_id == Roles.role_id)
            .filter(Roles.role_name.in_(['Driver', 'Assistant']))
            .offset(skip)
            .limit(limit)
            .all())

def get_driver(db: Session, driver_id: int):
    return (db.query(Employee)
            .filter(Employee.employee_id == driver_id)
            .first())

def create_driver(db: Session, driver: DriverCreate):
    db_driver = Employee(
        employee_name=driver.name,
        employee_nic=driver.employee_nic,
        official_contact_number=driver.phone,
        role_id=driver.role_id,
        store_id=driver.store_id,
        status=driver.status,
        total_hours_week=driver.weekly_hours,
        registrated_date=datetime.now(),
        auth_id=driver.auth_id
    )
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver

def update_driver(db: Session, driver_id: int, driver: DriverUpdate):
    db_driver = get_driver(db, driver_id)
    if db_driver:
        for key, value in driver.dict(exclude_unset=True).items():
            setattr(db_driver, key, value)
        db.commit()
        db.refresh(db_driver)
    return db_driver

def delete_driver(db: Session, driver_id: int):
    driver = get_driver(db, driver_id)
    if driver:
        db.delete(driver)
        db.commit()
        return True
    return False