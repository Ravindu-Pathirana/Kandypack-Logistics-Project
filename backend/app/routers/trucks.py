from fastapi import APIRouter, Depends
from app.crud.trucks_crud import TruckCreate, create_truck, get_trucks
from app.core.security import get_current_user

router = APIRouter()

@router.post("/trucks")
def create_truck_endpoint(truck: TruckCreate, current_user=Depends(get_current_user)):
    """
    Creates a new truck for the current user's store.
    """
    return create_truck(truck, current_user.store_id, role=current_user.role)

@router.get("/trucks")
def get_trucks_endpoint(current_user=Depends(get_current_user)):
    """
    Returns a list of trucks filtered by the current user's role and store.
    """
    return get_trucks(role=current_user.role, store_id=current_user.store_id)