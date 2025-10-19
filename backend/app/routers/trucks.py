from fastapi import APIRouter, Depends
from app.crud.trucks_crud import TruckCreate, create_truck
from app.core.security import get_current_user

router = APIRouter()

@router.post("/trucks")
def create_truck_endpoint(truck: TruckCreate, current_user=Depends(get_current_user)):
    """
    Creates a new truck for the current user's store.
    """
    return create_truck(truck, current_user.store_id)