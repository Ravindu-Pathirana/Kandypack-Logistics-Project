from fastapi import APIRouter, HTTPException
from app.models.auth_models import UserRegister, UserLogin, Token 
from app.crud import auth_crud
from app.core import security

router = APIRouter() 


@router.post("/register/",response_model=dict)
def register(user: UserRegister):
    if auth_crud.get_user_by_username(user.username):
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )
    
    hashed = security.hash_password(user.password)
    auth_crud.create_user(user.username, user.email, hashed)
    return {
        "message": "User created successfully"
    }