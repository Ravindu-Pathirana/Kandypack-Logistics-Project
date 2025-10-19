from fastapi import APIRouter, HTTPException
from app.core.database import get_db
from app.crud import employees_crud
from app.models.employee_models import EmployeeCreate

router = APIRouter()

@router.post("/employees/create")
def create_employee(emp: EmployeeCreate):
    conn = get_db()
    try:
        # Start transaction
        cursor = conn.cursor()

        auth_id = employees_crud.create_auth_user(conn, emp.username, emp.email, emp.password)
        employee_id = employees_crud.create_employee(
            conn,
            employee_name=emp.employee_name,
            employee_nic=emp.employee_nic,
            official_contact_number=emp.official_contact_number,
            registrated_date=emp.registrated_date,
            role_id=emp.role_id,
            store_id=emp.store_id,
        )

        if emp.role_id == 2:
            employees_crud.create_driver(conn, employee_id)
        elif emp.role_id == 3:
            employees_crud.create_assistant(conn, employee_id)

        conn.commit()
        return {"message": "Employee created successfully", "employee_id": employee_id}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        conn.close()
