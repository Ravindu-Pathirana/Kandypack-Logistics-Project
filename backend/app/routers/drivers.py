from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.crud import driver_crud
from app.models.driver_models import Driver, DriverCreate, DriverUpdate
from app.core.database import get_db

router = APIRouter(
    prefix="/drivers",
    tags=["drivers"]
)

@router.get("/", response_model=List[Driver])
def read_drivers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    drivers = driver_crud.get_drivers(db, skip=skip, limit=limit)
    return drivers

@router.get("/{driver_id}", response_model=Driver)
def read_driver(driver_id: int, db: Session = Depends(get_db)):
    driver = driver_crud.get_driver(db, driver_id)
    if driver is None:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@router.post("/", response_model=Driver, status_code=status.HTTP_201_CREATED)
def create_driver(driver: DriverCreate, db: Session = Depends(get_db)):
    return driver_crud.create_driver(db=db, driver=driver)

@router.put("/{driver_id}", response_model=Driver)
def update_driver(driver_id: int, driver: DriverUpdate, db: Session = Depends(get_db)):
    updated_driver = driver_crud.update_driver(db, driver_id, driver)
    if updated_driver is None:
        raise HTTPException(status_code=404, detail="Driver not found")
    return updated_driver

@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(driver_id: int, db: Session = Depends(get_db)):
    success = driver_crud.delete_driver(db, driver_id)
    if not success:
        raise HTTPException(status_code=404, detail="Driver not found")
    return None