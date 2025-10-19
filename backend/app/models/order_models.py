from pydantic import BaseModel
from datetime import date
from typing import Optional, List

class OrderItem(BaseModel):
    product_name: str
    quantity: int
    unit_price: float
    weight: str

class OrderCreate(BaseModel):
    customer_id: int
    destination: str
    route_code: str
    order_date: date
    delivery_date: date
    status: str
    train_id: Optional[int] = None
    driver_id: Optional[int] = None

class Order(BaseModel):
    id: str
    customer: str
    customerType: str
    destination: str
    route: str
    orderDate: str
    deliveryDate: str
    items: int
    totalValue: str
    weight: str
    status: str
    trainTrip: str
    driver: str

class OrderDetail(BaseModel):
    id: str
    customer: str
    customerType: str
    destination: str
    route: str
    orderDate: str
    deliveryDate: str
    status: str
    trainTrip: str
    driver: str
    items: List[OrderItem]
