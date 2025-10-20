from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import mysql.connector
from mysql.connector import Error
from app.core.database import get_db

app = FastAPI()


class DeliveryCompletionRequest(BaseModel):
    delivery_id: int
    actual_arrival_datetime: datetime
    status: str = "Delivered"

def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

@app.post("/api/deliveries/complete")
async def complete_delivery(request: DeliveryCompletionRequest):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Start transaction
        conn.start_transaction()
        
        # 1. Update delivery table
        update_delivery_query = """
            UPDATE delivery 
            SET status = %s, actual_arrival_datetime = %s 
            WHERE delivery_id = %s
        """
        cursor.execute(update_delivery_query, (request.status, request.actual_arrival_datetime, request.delivery_id))
        
        # 2. Get delivery details to find assigned employees
        get_delivery_query = """
            SELECT delivery_id, route_id 
            FROM delivery 
            WHERE delivery_id = %s
        """
        cursor.execute(get_delivery_query, (request.delivery_id,))
        delivery = cursor.fetchone()
        
        if not delivery:
            conn.rollback()
            raise HTTPException(status_code=404, detail="Delivery not found")
        
        # 3. Get employees assigned to this delivery
        # Assuming you have a delivery_assignments or similar table
        get_employees_query = """
            SELECT DISTINCT employee_id 
            FROM delivery_assignments 
            WHERE delivery_id = %s
        """
        cursor.execute(get_employees_query, (request.delivery_id,))
        employees = cursor.fetchall()
        
        if not employees:
            conn.rollback()
            raise HTTPException(status_code=404, detail="No employees assigned to this delivery")
        
        # 4. Update employee records
        current_time = datetime.now()
        # Set next_available_time to current time (employees are now available)
        next_available_time = current_time
        
        update_employee_query = """
            UPDATE employee 
            SET consecutive_deliveries = consecutive_deliveries + 1,
                status = 'Available',
                next_available_time = %s,
                last_delivery_time = %s
            WHERE employee_id = %s
        """
        
        for emp in employees:
            cursor.execute(update_employee_query, 
                          (next_available_time, request.actual_arrival_datetime, emp['employee_id']))
        
        # Commit transaction
        conn.commit()
        
        return {
            "success": True,
            "message": "Delivery completed successfully",
            "delivery_id": request.delivery_id,
            "employees_updated": len(employees),
            "completion_time": request.actual_arrival_datetime,
            "status": request.status
        }
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing delivery: {str(e)}")
    
    finally:
        cursor.close()
        conn.close()

@app.get("/api/deliveries/{delivery_id}/status")
async def get_delivery_status(delivery_id: int):
    """Get current delivery and assigned employees status"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get delivery info
        delivery_query = """
            SELECT * FROM delivery WHERE delivery_id = %s
        """
        cursor.execute(delivery_query, (delivery_id,))
        delivery = cursor.fetchone()
        
        if not delivery:
            raise HTTPException(status_code=404, detail="Delivery not found")
        
        # Get assigned employees
        employees_query = """
            SELECT e.* 
            FROM employee e
            JOIN delivery_assignments da ON e.employee_id = da.employee_id
            WHERE da.delivery_id = %s
        """
        cursor.execute(employees_query, (delivery_id,))
        employees = cursor.fetchall()
        
        return {
            "delivery": delivery,
            "assigned_employees": employees
        }
        
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving data: {str(e)}")
    
    finally:
        cursor.close()
        conn.close()

