from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal

class EmployeeCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    employee_name: str
    employee_nic: str
    official_contact_number: str
    registrated_date: str  # or datetime.date
    role_id: int  # 2 = Driver, 3 = Assistant, etc
    store_id: int


