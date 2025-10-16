from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Roles

router = APIRouter(
    prefix="/roles",
    tags=["roles"]
)


@router.get("/", response_model=List[dict])
def read_roles(db: Session = Depends(get_db)):
    rows = db.query(Roles).all()
    # return list of plain dicts so frontend has id and name
    return [{"role_id": r.role_id, "role_name": r.role_name, "max_hours_week": r.max_hours_week} for r in rows]
