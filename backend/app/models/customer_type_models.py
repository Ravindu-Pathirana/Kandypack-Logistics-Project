from pydantic import BaseModel

# Pydantic schema for customer type creation
class CustomerTypeCreate(BaseModel):
    customer_type: str
    credit_limit: float