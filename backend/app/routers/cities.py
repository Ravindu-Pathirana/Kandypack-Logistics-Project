from fastapi import APIRouter, Depends
from app.crud.cities_crud import CityCreate, create_city, get_cities
from app.core.security import get_current_user

router = APIRouter()

@router.post("/cities")
def create_city_endpoint(city: CityCreate, current_user=Depends(get_current_user)):
    """
    Creates a new city. Only accessible to admin users.
    """
    return create_city(city, current_user.role)

@router.get("/cities")
def get_cities_endpoint(current_user=Depends(get_current_user)):
    """
    Returns a list of all cities.
    """
    return get_cities()