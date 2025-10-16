from fastapi import APIRouter
from app.models.report_models import KPI 
from app.crud import reports_crud
from typing import List


router = APIRouter()


@router.get("/dasshboard/kpi")
def dashboard_kpis():
    return reports_crud.get_kpis()