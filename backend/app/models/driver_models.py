from pydantic import BaseModel
from datetime import datetime


class DriverBase(BaseModel):
    employee_name: str
    employee_nic: str
    official_contact_number: str | None = None
    role_id: int
    store_id: int
    status: str = "Active"
    total_hours_week: float = 0.0


class DriverCreate(DriverBase):
    auth_id: int | None = None


class DriverUpdate(BaseModel):
    employee_name: str | None = None
    employee_nic: str | None = None
    official_contact_number: str | None = None
    role_id: int | None = None
    store_id: int | None = None
    status: str | None = None
    total_hours_week: float | None = None
    auth_id: int | None = None


class Driver(DriverBase):
    employee_id: int
    registrated_date: datetime

    # allow reading from ORM objects
    model_config = {"from_attributes": True}
