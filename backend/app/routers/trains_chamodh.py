from fastapi import APIRouter, Depends, HTTPException
from app.crud import trains_chamodh_crud  # ✅ import the new CRUD
from app.core.security import get_current_user
from app.models.chamodh_models import AssignDeliveryIn
router = APIRouter()

@router.get("/trains/pending")
def get_pending_trains_endpoint(current_user=Depends(get_current_user)):
    """Returns trains that haven’t reached the store."""
    return trains_chamodh_crud.get_pending_trains(store_id=current_user.store_id)

@router.post("/trains/{train_id}/arrived")
def mark_train_arrived_endpoint(train_id: int, current_user=Depends(get_current_user)):
    """Marks all orders for a given train_id as 'at the store'."""
    try:
        return trains_chamodh_crud.mark_train_at_store(train_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders/at-store")
def get_orders_at_store_endpoint(current_user=Depends(get_current_user)):
    """Returns all orders currently 'at the store' for the current user's store."""
    return trains_chamodh_crud.get_orders_at_store(current_user.store_id)

# ✅ Moved the raw SQL out to routes_crud.py
@router.get("/routes/")
def get_routes_endpoint():
    """Returns all truck routes."""
    return trains_chamodh_crud.get_routes()

@router.get("/employees-eligible")
def get_eligible_employees_for_route(
    route_id: str,
    current_user=Depends(get_current_user)
):
    """
    Returns all eligible drivers and assistants for a given route,
    based on the current user's store ID.
    """
    store_id = current_user.store_id
    return trains_chamodh_crud.get_eligible_employees(store_id, route_id)



@router.post("/deliveries/assign")
def assign_delivery(
    data: AssignDeliveryIn,
    current_user=Depends(get_current_user)
):
    """
    Assigns a truck, driver, and assistant for a delivery order.
    """
    store_id = current_user.store_id
    return trains_chamodh_crud.assign_truck_delivery(store_id, data)