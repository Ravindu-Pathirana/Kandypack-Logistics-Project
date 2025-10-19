from pydantic import BaseModel
from datetime import date


class CustomerCreate(BaseModel):
    customer_name: str
    registration_date: date
    customer_type_id: int