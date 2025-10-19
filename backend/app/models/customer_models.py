from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class CustomerContactCreate(BaseModel):
    contact_number: str
    is_primary: bool = False

class CustomerAddressCreate(BaseModel):
    address_line_1: str
    address_line_2: Optional[str] = None
    city_id: int
    district: Optional[str] = None
    is_primary: bool = False

class CustomerCreate(BaseModel):
    customer_name: str
    registration_date: date
    customer_type_id: Optional[int] = None
    contacts: List[CustomerContactCreate]
    addresses: List[CustomerAddressCreate]

class CustomerOut(BaseModel):
    customer_id: int
    customer_name: str
    registration_date: date
    customer_type_id: Optional[int]
    contacts: List[CustomerContactCreate]
    addresses: List[CustomerAddressCreate]
