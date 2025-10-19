from pydantic import BaseModel

# Pydantic schema for city creation
class CityCreate(BaseModel):
    city_name: str