# app/models/product_type_models.py
from pydantic import BaseModel, Field

class ProductTypeCreate(BaseModel):
    type_name: str = Field(..., max_length=20)

class ProductTypeResponse(BaseModel):
    product_type_id: int
    type_name: str