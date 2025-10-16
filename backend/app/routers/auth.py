from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.auth_models import UserRegister, UserLogin, Token 
from app.crud import auth_crud
from app.core import security
from app.core.database import get_db

router = APIRouter(prefix="/auth", tags=["authentication"]) 

@router.post("/register/", response_model=dict)
def register(user: UserRegister, db: Session = Depends(get_db)):
    if auth_crud.get_user_by_username(db, user.username):
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )
    
    hashed = security.hash_password(user.password)
    auth_crud.create_user(db, user.username, user.email, hashed)
    return {
        "message": "User created successfully"
    }