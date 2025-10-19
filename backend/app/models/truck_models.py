
from pydantic import BaseModel
from typing import Optional


class TruckCreate(BaseModel):
    store_id: int
    plate_number: str
    is_available: Optional[bool] = True