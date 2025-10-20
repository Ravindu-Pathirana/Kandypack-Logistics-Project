from fastapi import APIRouter, Depends
from app.crud.stores_crud import StoreCreate, create_store, get_all_stores
from app.core.security import get_current_user

router = APIRouter()

@router.post("/stores")
def create_store_endpoint(store: StoreCreate, current_user=Depends(get_current_user)):
    """
    Creates a new store. Only accessible to admin users.
    """
    return create_store(store, current_user.role)

@router.get("/stores")
def get_stores_endpoint(current_user=Depends(get_current_user)):
    """
    Retrieves all stores. Only accessible to admin users.
    """
    return get_all_stores(current_user.role)