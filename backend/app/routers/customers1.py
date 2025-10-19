from fastapi import APIRouter, Depends
from app.crud.customers1_crud import  create_customer_type, get_customers, create_customer
from app.core.security import get_current_user
from app.models.customer_type_models import CustomerTypeCreate
from app.models.customers1_models import CustomerCreate

router = APIRouter()

@router.post("/customer-types")
def create_customer_type_endpoint(customer_type: CustomerTypeCreate, current_user=Depends(get_current_user)):
    """
    Creates a new customer type. Only accessible to admin users.
    """
    return create_customer_type(customer_type, current_user.role)


@router.get("/customers")
def get_customers_endpoint(current_user=Depends(get_current_user)):
    """
    Returns a list of all customers with their customer type details.
    """
    return get_customers(current_user.role, current_user.store_id)

@router.post("/customers")
def create_customer_endpoint(customer: CustomerCreate, current_user=Depends(get_current_user)):
    """
    Creates a new customer. Only accessible to admin users.
    """
    return create_customer(customer, current_user.role)