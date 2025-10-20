from pydantic import BaseModel
from typing import List,Optional

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class OrderCreate(BaseModel):
    customer_id: int
    order_date: str
    required_date: str
    status: str
    total_quantity: int
    total_price: float
    total_space: float
    items: List[OrderItemCreate]

class OrderItemResponse(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class OrderResponse(BaseModel):
    order_id: int
    customer_id: int
    order_date: str
    required_date: str
    status: str
    total_quantity: int
    total_price: float
    total_space: float
    items: List[OrderItemResponse]
