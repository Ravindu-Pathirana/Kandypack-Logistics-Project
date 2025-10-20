
from pydantic import BaseModel
from datetime import datetime

class DeliveryCompletionRequest(BaseModel):
    delivery_id: int
    actual_arrival_datetime: datetime
    status: str = "Delivered"