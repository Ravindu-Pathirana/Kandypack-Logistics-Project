from app.core.database import get_db
from fastapi import HTTPException

def get_pending_trains(store_id: int):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # Call the stored procedure
    cursor.callproc("GetPendingTrainAllocations", [store_id])

    results = []
    for res in cursor.stored_results():
        results = res.fetchall()

    cursor.close()
    conn.close()
    return results

def mark_train_at_store(train_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    # Call the stored procedure
    cursor.callproc("MarkTrainAtStore", [train_id])
    
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Train {train_id} orders marked as 'at the store'"}


def get_orders_at_store(store_id: int):
    """
    Calls the GetOrdersAtStore MySQL procedure and returns all orders
    currently 'at the store' for the given store_id.
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.callproc("GetOrdersAtStore", [store_id])
        results = []
        # Fetch all result sets returned by the procedure
        for result in cursor.stored_results():
            results.extend(result.fetchall())
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()



#

def get_routes():
    """
    Fetch all truck routes from the database using raw SQL.
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                route_id,
                area_name
            FROM truckroute;
        """)
        routes = cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cursor.close()
        conn.close()

    if not routes:
        raise HTTPException(status_code=404, detail="No routes found")

    return routes


def get_eligible_employees(store_id: int, route_id: str):
    """
    Calls the stored procedure get_eligible_employees_for_route(store_id, route_id)
    and returns both eligible drivers and assistants.
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        # Call the stored procedure
        cursor.callproc("get_eligible_employees_for_route", [store_id, route_id])

        # MySQL stores each result set separately — fetch all results
        results = []
        for result in cursor.stored_results():
            results.extend(result.fetchall())

        if not results:
            raise HTTPException(status_code=404, detail="No eligible employees found")

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching eligible employees: {str(e)}")
    finally:
        cursor.close()
        conn.close()



def assign_truck_delivery(store_id: int, data):
    """
    Calls the stored procedure assign_truck_delivery to create a new truck delivery
    and assign driver/assistant to it.
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.callproc("assign_truck_delivery", [
            store_id,
            data.order_id,
            data.route_id,
            data.truck_id,
            data.driver_id,
            data.assistant_id,
            data.scheduled_departure
        ])

        result = None
        for res in cursor.stored_results():
            result = res.fetchall()

        conn.commit()
        return result or {"message": "No result returned"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cursor.close()
        conn.close()