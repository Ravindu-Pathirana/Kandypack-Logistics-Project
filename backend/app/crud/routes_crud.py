# routes_crud.py
from ..models.routes_models import get_db_connection, Route

# ---------- FETCH ALL ROUTES ----------
def get_all_routes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT 
            tr.route_id,
            tr.route_name,
            tr.area,
            tr.max_delivery_time,
            tr.coverage,
            tr.active_orders,
            tr.assigned_trucks,
            tr.assigned_drivers,
            tr.status,
            tr.last_delivery
        FROM TruckRoute tr
        ORDER BY tr.route_id;
    """
    cursor.execute(query)
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result


# ---------- FETCH SINGLE ROUTE ----------
def get_route_by_id(route_id: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT 
            tr.route_id,
            tr.area_name,
            tr.max_delivery_time,
            COUNT(DISTINCT td.order_id) AS orders,
            COUNT(DISTINCT td.truck_id) AS trucks,
            COUNT(DISTINCT tea.employee_id) AS drivers,
            MAX(td.actual_arrival) AS last_delivery
        FROM TruckRoute tr
        LEFT JOIN TruckDelivery td ON tr.route_id = td.route_id
        LEFT JOIN TruckEmployeeAssignment tea ON td.delivery_id = tea.truck_delivery_id
        WHERE tr.route_id = %s
        GROUP BY tr.route_id, tr.area_name, tr.max_delivery_time;
    """
    cursor.execute(query, (route_id,))
    route = cursor.fetchone()
    cursor.close()
    conn.close()
    return route


# ---------- CREATE NEW ROUTE ----------
def create_route(route: Route):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        INSERT INTO TruckRoute 
        (route_id, route_name, area, max_delivery_time, coverage, 
         active_orders, assigned_trucks, assigned_drivers, status, last_delivery)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);
    """
    cursor.execute(query, (
        route.route_id, route.route_name, route.area, route.max_delivery_time,
        route.coverage, route.active_orders, route.assigned_trucks,
        route.assigned_drivers, route.status, route.last_delivery
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Route added successfully"}



# ---------- UPDATE EXISTING ROUTE ----------
def update_route(route_id, route):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
    UPDATE TruckRoute
    SET route_name=%s, area=%s, coverage=%s, max_delivery_time=%s,
        active_orders=%s, assigned_trucks=%s, assigned_drivers=%s,
        status=%s, last_delivery=%s
    WHERE route_id=%s
    """
    cursor.execute(query, (
        route.route_name, route.area, route.coverage, route.max_delivery_time,
        route.active_orders, route.assigned_trucks, route.assigned_drivers,
        route.status, route.last_delivery, route_id
    ))
    conn.commit()
    rows = cursor.rowcount
    conn.close()
    return rows > 0


# ---------- DELETE ROUTE ----------
def delete_route(route_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM TruckRoute WHERE route_id=%s", (route_id,))
    conn.commit()
    rows = cursor.rowcount
    conn.close()
    return rows > 0
