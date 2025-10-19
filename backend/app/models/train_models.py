from pydantic import BaseModel
from datetime import datetime
from enum import Enum
from pydantic import validator

class TrainStatus(str, Enum):
    ON_TIME = "on-time"
    DELAYED = "delayed"

class TrainCreate(BaseModel):
    train_name: str
    start_station: str
    destination_station: str
    departure_date_time: datetime
    arrival_date_time: datetime
    capacity_space: float  
    status: str

    @validator('status', pre=True)
    def map_status(cls, value):
        status_map = {
            "On Time": "on-time",
            "Delayed": "delayed"
        }
        return status_map.get(value, value)  # Default to original if not mapped

class TrainSchedule(BaseModel):
    departure_date_time: datetime
    arrival_date_time: datetime

class TrainSchedule(TrainCreate):
    train_id: int

    class Config:
        orm_mode = True