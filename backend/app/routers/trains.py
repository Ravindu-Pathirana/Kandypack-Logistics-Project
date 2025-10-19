from pydantic import BaseModel
from app.crud import trains_crud
from fastapi import APIRouter, HTTPException
from app.models.train_models import TrainCreate, TrainSchedule  # Import your models
from typing import List
import logging

router = APIRouter()

class TrainSchedule(BaseModel):
    id: str
    route: str
    departure: str
    arrival: str
    capacity: int
    utilized: float
    status: str
    nextDeparture: str
  
@router.get("/trains/", response_model=list[TrainSchedule])
def get_train_schedules():
    return trains_crud.get_train_schedules()


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/trains", tags=["trains"])

@router.get("/", response_model=List[TrainSchedule])
def get_train_schedules():
    return trains_crud.get_train_schedules()

@router.post("/", response_model=int)
def add_train_trip(train: TrainCreate):
    try:
        logger.info(f"Received train data: {train.dict()}")
        new_id = trains_crud.create_train(train.dict())
        logger.info(f"Successfully added train with ID: {new_id}")
        
        return new_id
    except Exception as e:
        logger.error(f"Error adding train: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))