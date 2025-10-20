from pydantic import BaseModel, Field
from datetime import datetime

class ProductCreate(BaseModel):
    product_name: str = Field(..., max_length=20)
    unit_space: float = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    product_type: str = Field(..., max_length=20)  # Matches type_name in product_type

class ProductResponse(BaseModel):
    product_id: int
    product_name: str
    unit_space: float
    unit_price: float
    product_type: str