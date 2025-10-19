from fastapi import APIRouter, HTTPException
from app.crud import orders_crud
from app.models.order_models import Order
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/orders", tags=["orders"])

# Pydantic model for creating new orders
class CreateOrder(BaseModel):
    customer_id: int
    order_date: str
    required_date: str
    status: str = "Pending"
    total_quantity: int
    total_price: float

@router.get("/", response_model=List[Order])
def get_orders():
    return orders_crud.get_orders()

@router.post("/", response_model=dict)
def create_order(order_data: CreateOrder):
    try:
        # Call the CRUD function to create order
        result = orders_crud.create_order(order_data)
        return {"message": "Order created successfully", "order_id": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))