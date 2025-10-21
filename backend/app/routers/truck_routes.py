from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_db # We'll define this below

router = APIRouter(prefix="/routes", tags=["Routes"])


