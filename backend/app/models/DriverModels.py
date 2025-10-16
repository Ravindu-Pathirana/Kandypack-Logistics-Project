from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DriverBase(BaseModel):
    name: str
    phone: str
    role: str
    experience: str
    current_route: str
    current_location: str
    status: str
    weekly_hours: float
    max_weekly_hours: float
    rating: float
    completed_deliveries: int

class DriverCreate(DriverBase):
    employee_nic: str
    store_id: int
    role_id: int
    auth_id: Optional[int] = None

class DriverUpdate(DriverBase):
    pass

class Driver(DriverBase):
    employee_id: int
    registrated_date: datetime
    
    class Config:
        from_attributes = True