from fastapi import APIRouter
from typing import List
from app.models.order_models import OrderCreate, OrderResponse
from app.crud import orders_crud

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=dict)
def create_order(order: OrderCreate):
    return orders_crud.create_order(order)

@router.get("/", response_model=List[OrderResponse])
def list_orders():
    return orders_crud.get_orders()
