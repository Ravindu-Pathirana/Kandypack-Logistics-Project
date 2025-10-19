from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from app.models.auth_models import Token
from app.crud import auth_crud
from app.core import security

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


@router.post("/login/", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Log in a user using username and password, return JWT token.
    """
    user = auth_crud.get_user_by_username(form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    # Access password hash as a dictionary
    if not security.verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    role = ""
    if (user["role_id"]) == 3:
        role = "admin"
    elif (user["role_id"]) == 1:
        role = "store_manager"
    elif (user["role_id"]) == 2:
        role =  "driver"
    elif (user["role_id"]) == 4:
        role = "assistant"
    

    access_token = security.create_access_token(
        data={
            "sub": user["username"],
            "role": role,
            "store_id": user["store_id"]  # store the user belongs to
        }
    )

    return Token(access_token=access_token, token_type="bearer")


@router.post("/logout/")
def logout(token: str = Depends(oauth2_scheme)):
    """
    "Log out" a user. Currently just returns a success message.
    You can implement token blacklisting here if needed.
    """
    # If you implement a blacklist, add the token here.
    return {"message": "Logged out successfully"}