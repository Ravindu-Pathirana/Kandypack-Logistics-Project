from fastapi import APIRouter, HTTPException
from app.crud import orders_crud
from app.models.order_models import Order, OrderCreate, OrderDetail
from typing import List
import logging

router = APIRouter(prefix="/orders", tags=["orders"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[Order])
def list_orders():
    """Fetch all orders"""
    try:
        return orders_crud.get_all_orders()
    except Exception as e:
        logger.error(f"Error fetching orders: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{order_id}", response_model=OrderDetail)
def get_order(order_id: int):
    """Fetch single order details"""
    try:
        order = orders_crud.get_order_details(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order
    except Exception as e:
        logger.error(f"Error fetching order {order_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=int)
def create_order(order: OrderCreate):
    """Add a new order"""
    try:
        new_id = orders_crud.create_order(order.dict())
        logger.info(f"Order created with ID: {new_id}")
        return new_id
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail=str(e))
