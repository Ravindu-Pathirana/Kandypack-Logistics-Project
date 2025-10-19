from fastapi import APIRouter, Depends
from app.crud.stores_crud import StoreCreate, create_store
from app.core.security import get_current_user

router = APIRouter()

@router.post("/stores")
def create_store_endpoint(store: StoreCreate, current_user=Depends(get_current_user)):
    """
    Creates a new store. Only accessible to admin users.
    """
    return create_store(store, current_user.role)