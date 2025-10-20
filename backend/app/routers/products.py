from fastapi import APIRouter, Depends, HTTPException
from app.crud.product_crud import get_product_types, create_product_type, get_products, create_product, delete_product
from app.core.security import get_current_user
from app.models.product_type_models import ProductTypeCreate, ProductTypeResponse
from app.models.product_models import ProductCreate, ProductResponse
import mysql.connector,os
from app.crud import product_crud

router = APIRouter()


@router.get("/product-types", response_model=list[ProductTypeResponse])
def get_product_types_endpoint(current_user=Depends(get_current_user)):
    """
    Returns a list of all product types.
    """
    return get_product_types()

@router.post("/product-types", response_model=ProductTypeResponse)
def create_product_type_endpoint(product_type: ProductTypeCreate, current_user=Depends(get_current_user)):
    """
    Creates a new product type. Only accessible to admin users.
    """
    return create_product_type(product_type, current_user.role)

@router.get("/products", response_model=list[ProductResponse])
def get_products_endpoint(current_user=Depends(get_current_user)):
    """
    Returns a list of all products with their product type details.
    """
    return get_products(current_user.role, current_user.store_id)

@router.post("/products", response_model=ProductResponse)
def create_product_endpoint(product: ProductCreate, current_user=Depends(get_current_user)):
    """
    Creates a new product. Only accessible to admin users.
    """
    return create_product(product, current_user.role)

@router.delete("/products/{product_id}")
def delete_product_endpoint(product_id: int, current_user=Depends(get_current_user)):
    """
    Deletes a product by ID. Only accessible to admin users.
    """
<<<<<<< HEAD
    return delete_product(product_id, current_user.role)
=======
    return delete_product(product_id, current_user.role, current_user.store_id)

@router.get("/")
def list_products():
    return product_crud.get_products()
>>>>>>> 9e86c40 (WIP: local changes before merge)
