from pydantic import BaseModel

class StoreCreate(BaseModel):
    store_name: str
    contact_number: str
    city_id: int