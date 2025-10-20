from pydantic import BaseModel, validator
from datetime import time, datetime
from enum import Enum
from typing import Optional, List


# --- Enums ---
class TrainStatus(str, Enum):
    ON_TIME = "on-time"
    DELAYED = "delayed"
    CANCELLED = "cancelled"

# --- Request models ---

class TrainCreateOccasional(BaseModel):
    # used by POST /trains/  (one-off trip)
    train_name: str
    start_station: str
    destination_station: str
    departure_date_time: str  # "YYYY-MM-DDTHH:MM" or "...:SS"
    arrival_date_time: str
    capacity_space: float
    status: str  # "On Time" | "Delayed" from UI
    template_id: Optional[int] = None  # keep optional

    @validator("status")
    def normalize_status(cls, v: str) -> str:
        s = (v or "").strip().lower().replace(" ", "-")
        if s not in {"on-time", "delayed"}:
            # accept "On Time"/"on time"/etc., coerce
            if v.strip().lower() in {"on time", "on-time"}:
                return "on-time"
            if v.strip().lower() == "delayed":
                return "delayed"
            raise ValueError("status must be 'On Time' or 'Delayed'")
        return s

class TrainTemplateCreate(BaseModel):
    # used by POST /trains/templates/  (recurring)
    train_name: str
    start_station: str
    destination_station: str
    departure_time: str  # "HH:MM" or "HH:MM:SS"
    arrival_time: str
    capacity_space: float
    status: str = "on-time"  # default normalized
    frequency_days: Optional[List[str]] = None  # ["Monday","Wednesday",...]

    @validator("status", pre=True, always=True)
    def normalize_status(cls, v: str) -> str:
        if not v:
            return "on-time"
        s = v.strip().lower().replace(" ", "-")
        return "on-time" if s in {"on-time", "on time"} else "delayed"

# --- Response model for GET /trains/ ---
class TrainScheduleOut(BaseModel):
    id: str
    route: str
    departure: str
    arrival: str
    capacity: float
    utilized: float
    status: str
    nextDeparture: str
