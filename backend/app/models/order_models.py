from pydantic import BaseModel

class Order(BaseModel):
    id: str
    customer: str
    destination: str
    route: str
    orderDate: str
    items: int
    totalValue: str
    weight: str
    status: str
    trainTrip: str
    driver: str
