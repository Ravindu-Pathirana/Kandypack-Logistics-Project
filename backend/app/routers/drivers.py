from fastapi import APIRouter
from app.crud import drivers_crud, employees_crud
from typing import Optional
from fastapi import Query
router = APIRouter()


@router.get("/summary")
def get_summary():
    return drivers_crud.get_summary()
    

@router.get("/drivers")
def get_employees(
    status: Optional[str] = Query(None, description="Filter by status: available, on_duty, on_leave")
):
    """
    Returns a list of employees with optional filters by role and status.
    """
    return drivers_crud.get_drivers(status=status)


@router.get("/assistants")
def get_assistants(
    status: Optional[str] = Query(None, description="Filter by status: available, on_duty, on_leave")
):
    """
    Returns a list of assistants with optional filters by status.
    """
    return drivers_crud.get_assistants(status=status)


