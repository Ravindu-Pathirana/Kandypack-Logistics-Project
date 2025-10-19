from fastapi import APIRouter, HTTPException
from app.core.database import get_db
from app.crud import employees_crud
from app.models.employee_models import EmployeeCreate
from typing import Optional
from fastapi import Query, Depends
from app.core import security
from app.models.auth_models import TokenData
router = APIRouter()

@router.post("/employees/create")
def create_employee(emp: EmployeeCreate):
    conn = get_db()
    try:
        # Start transaction
        cursor = conn.cursor()

        # auth_id = employees_crud.create_auth_user(conn, emp.username, emp.email, emp.password)
        employee_id = employees_crud.create_employee(
            conn,
            employee_name=emp.employee_name,
            employee_nic=emp.employee_nic,
            official_contact_number=emp.official_contact_number,
            registrated_date=emp.registrated_date,
            role_id=emp.role_id,
            store_id=emp.store_id,
            username=emp.username,
            password=emp.password,
        )

        if emp.role_id == 2:
            employees_crud.create_driver(conn, employee_id)
        elif emp.role_id == 4:
            employees_crud.create_assistant(conn, employee_id)

        conn.commit()
        return {"message": "Employee created successfully", "employee_id": employee_id}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        conn.close()



@router.get("/managers")
def get_managers(
    status: Optional[str] = Query(None, description="Filter by status: active, inactive"),
    current_user: TokenData = Depends(security.get_current_user)
):
    """
    Returns a list of managers with optional filters by status.
    Only accessible by admin users.
    """
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view managers")
    
    return employees_crud.get_managers(status=status)




@router.get("/employees/{employee_id}")
def get_employee_info(
    employee_id: int,
    current_user: TokenData = Depends(security.get_current_user)
):
    """
    Returns detailed information about a specific employee.
    - If role = driver → joins driver table
    - If role = assistant → joins assistant table
    - Only admins can view employee details
    """
    # ✅ Only allow admin users to fetch detailed employee info
    if current_user.role not in ("admin", "store_manager"):
        raise HTTPException(status_code=403, detail="Only admins can view employee information")
    
    employee = employees_crud.get_employee_info(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return employee

