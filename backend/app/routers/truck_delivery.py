from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.core.database import get_db  # import your connection helper
from mysql.connector import Error

router = APIRouter()


@router.post("/deliveries/{delivery_id}/finish")
def finish_delivery_endpoint(delivery_id: int, current_user=Depends(get_current_user)):
    """
    Marks a truck delivery as 'Delivered' by calling the stored procedure
    `finish_truck_delivery` in MySQL.
    """
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()

        # Call the stored procedure
        cursor.callproc("finish_truck_delivery", [delivery_id])
        conn.commit()

        return {"message": f"Delivery {delivery_id} marked as Delivered successfully."}

    except Error as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=400, detail=f"MySQL Error: {str(e)}")

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
