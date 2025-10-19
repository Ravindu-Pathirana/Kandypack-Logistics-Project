from fastapi import APIRouter, Depends
from typing import Optional
from app.crud import drivers_crud
from app.core.security import get_current_user

router = APIRouter()


@router.get("/drivers")
def get_drivers_endpoint(current_user=Depends(get_current_user)):
    """
    Returns a list of drivers filtered by the current user's role and store.
    """
    return drivers_crud.get_drivers(role=current_user.role, store_id=current_user.store_id)


@router.get("/assistants")
def get_assistants_endpoint(current_user=Depends(get_current_user)):
    """
    Returns a list of assistants filtered by the current user's role and store.
    """
    return drivers_crud.get_assistants(role=current_user.role, store_id=current_user.store_id)


@router.get("/summary")
def get_summary_endpoint(current_user=Depends(get_current_user)):
    """
    Returns a summary for the current user.
    """
    return drivers_crud.get_summary(role=current_user.role, store_id=current_user.store_id)
