

from pydantic import BaseModel
class OrderAtStore(BaseModel):
    order_id: int
    customer_id: int
    address_id: int
    status: str
    total_quantity: int


from datetime import datetime
from typing import Optional

class AssignDeliveryIn(BaseModel):
    order_id: int
    route_id: str
    truck_id: int
    driver_id: int
    assistant_id: Optional[int] = None
    scheduled_departure: datetime