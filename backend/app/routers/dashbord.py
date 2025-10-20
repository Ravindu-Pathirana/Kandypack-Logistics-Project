from fastapi import APIRouter, Depends
from typing import Optional
from app.crud.dashboard_crud import get_active_deliveries
from app.core.security import get_current_user



router = APIRouter()



@router.get("/active-deliveries/")
def get_active_deliveries_endpoint(current_user=Depends(get_current_user)):
    """
    Returns a list of active deliveries filtered by the current user's role and store.
    """
    return get_active_deliveries(role=current_user.role, store_id=current_user.store_id)