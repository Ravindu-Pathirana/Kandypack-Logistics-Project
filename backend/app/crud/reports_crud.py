from app.core.database import get_db

def get_kpis():
    """
    Get key performance indicators (KPIs) for the current quarter.
    Returns:
    - List of dictionaries with KPI names and values.
    
    KPIs:
    - This Quarter Revenue
    - Orders Delivered
    """


    conn = get_db()
    cur = conn.cursor()

    """ Calculate current quarter revenue and delivered orders 
    """

    cur.execute("""
        SELECT SUM(total_price) AS total_sales
FROM `order`
WHERE YEAR(order_date) = YEAR(CURDATE()) 
  AND QUARTER(order_date) = QUARTER(CURDATE());
        """)
    
    revenue = cur.fetchone()
    current_revenue = revenue if revenue and revenue is not None else 0


    # Calculate number of orders delivered in the current quarter

    cur.execute("""
        SELECT COUNT(*) AS delivered_count
        FROM `order`
        WHERE status = 'Delivered'
          AND YEAR(order_date) = YEAR(CURDATE()) 
          AND QUARTER(order_date) = QUARTER(CURDATE());
        """)
    
    delivered = cur.fetchone()
    delivered_count = delivered if delivered and delivered is not None else 0
    cur.close()

    return [
        {"name": "This Quarter Revenue", "value": current_revenue},
        {"name": "Orders Delivered", "value": delivered_count}
    ]


# def get_quarterly_sales_report():
#     """
#     Get quarterly sales report data.
#     Returns:
#     - List of dictionaries with month names and sales totals.
#     """
#     conn = get_db()
#     cur = conn.cursor()

#     cur.execute("""
#         SELECT 
#             MONTH(order_date) AS month_num,
#             MONTHNAME(order_date) AS month,
#             SUM(total_price) AS total_sales
#         FROM `order`
#         WHERE YEAR(order_date) = YEAR(CURDATE())
#         GROUP BY MONTH(order_date), MONTHNAME(order_date)
#         ORDER BY MONTH(order_date);
#     """)

#     results = cur.fetchall()
#     cur.close()

#     report = []
#     for row in results:
#         month_num, month, total_sales = row
#         report.append({
#             "month": month,
#             "month_num": month_num,
#             "total_sales": total_sales if total_sales is not None else 0
#         })

#     return report


def get_most_ordered_items(year: int, quarter: int):
    """
    Get the most ordered items for a given year and quarter.

    Args:
        year (int): The year to filter orders.
        quarter (int): The quarter (1-4) to filter orders.

    Returns:
        List[Dict]: List of dictionaries with product names and order counts,
                    ordered by order count descending.
    """
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT p.product_name, COUNT(*) AS order_count
        FROM orderitem oi
        JOIN `order` o USING(order_id)
        JOIN product p USING(product_id)
        WHERE YEAR(o.order_date) = %s
          AND QUARTER(o.order_date) = %s
        GROUP BY p.product_name
        ORDER BY order_count DESC
    """, (year, quarter))

    results = cur.fetchall()
    cur.close()

    most_ordered = []
    for row in results:
        product_name, order_count = row
        most_ordered.append({
            "product_name": product_name,
            "order_count": order_count
        })

    return most_ordered








def get_quarterly_sales_report():
    """
    Get quarterly sales report data.
    Returns:
    - List of dictionaries with month names, total sales, and order count (volume).
    """
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            MONTH(order_date) AS month_num,
            MONTHNAME(order_date) AS month,
            SUM(total_price) AS total_sales,
            COUNT(*) AS order_count
        FROM `order`
        WHERE YEAR(order_date) = YEAR(CURDATE()) AND QUARTER(order_date) = QUARTER(CURDATE())
        GROUP BY MONTH(order_date), MONTHNAME(order_date)
        ORDER BY MONTH(order_date);
    """)

    results = cur.fetchall()
    cur.close()
    conn.close()

    report = []
    for row in results:
        month_num, month, total_sales, order_count = row
        report.append({
            "month": month,
            "month_num": month_num,
            "total_sales": total_sales or 0,
            "order_count": order_count or 0
        })

    return report



def get_city_wise_sales(year: int, quarter: int):
    """
    Get city-wise sales data for a given year and quarter.

    Args:
        year (int): The year to filter orders.
        quarter (int): The quarter (1-4) to filter orders.

    Returns:
        List[Dict]: Each dict contains 'city', 'total_sales', and 'order_count'.
    """
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
    c.city_name AS city,
    SUM(o.total_price) AS total_sales,
    COUNT(*) AS order_count
FROM `order` o
JOIN `customeraddress` ca ON o.address_id = ca.address_id
JOIN `city` c ON ca.city_id = c.city_id
WHERE YEAR(o.order_date) = %s
  AND QUARTER(o.order_date) = %s
GROUP BY c.city_name
ORDER BY total_sales DESC;
    """, (year, quarter))

    results = cur.fetchall()
    cur.close()
    conn.close()

    report = []
    for row in results:
        city, total_sales, order_count = row
        report.append({
            "city": city,
            "total_sales": total_sales or 0,
            "order_count": order_count or 0
        })

    return report



def get_route_wise_report(year: int, quarter: int):
    """
    Get route-wise delivery performance for a given year and quarter.

    Args:
        year (int): The year to filter deliveries.
        quarter (int): The quarter (1-4) to filter deliveries.

    Returns:
        List[Dict]: Each dict contains route_id, area_name, total_deliveries,
                    delivered_count, delayed_count, avg_delivery_hours, and on_time_percentage.
    """
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            tr.route_id,
            tr.area_name,
            COUNT(td.delivery_id) AS total_deliveries,
            SUM(CASE WHEN td.status = 'Delivered' THEN 1 ELSE 0 END) AS delivered_count,
            SUM(CASE WHEN td.status = 'Delayed' THEN 1 ELSE 0 END) AS delayed_count,
            ROUND(AVG(TIMESTAMPDIFF(HOUR, td.actual_departure, td.actual_arrival)), 2) AS avg_delivery_hours,
            ROUND(
                SUM(CASE 
                        WHEN TIMESTAMPDIFF(HOUR, td.actual_departure, td.actual_arrival) <= tr.max_delivery_time
                             AND td.status = 'Delivered'
                        THEN 1 ELSE 0 END
                    ) / COUNT(td.delivery_id) * 100, 
                2
            ) AS on_time_percentage
        FROM truckdelivery td
        JOIN truckroute tr ON td.route_id = tr.route_id
        WHERE YEAR(td.scheduled_departure) = %s
          AND QUARTER(td.scheduled_departure) = %s
        GROUP BY tr.route_id, tr.area_name
        ORDER BY total_deliveries DESC;
    """, (year, quarter))

    results = cur.fetchall()
    cur.close()
    conn.close()

    report = []
    for row in results:
        (route_id, area_name, total_deliveries, delivered_count, 
         delayed_count, avg_delivery_hours, on_time_percentage) = row

        report.append({
            "route_id": route_id,
            "area_name": area_name,
            "total_deliveries": total_deliveries or 0,
            "delivered_count": delivered_count or 0,
            "delayed_count": delayed_count or 0,
            "avg_delivery_hours": avg_delivery_hours or 0.0,
            "on_time_percentage": on_time_percentage or 0.0
        })

    return report



def get_driver_hours_report(year: int, quarter: int):
    """
    Returns driver and assistant working hours for a given year and quarter.

    Returns a list of dicts with:
        - driver_name
        - assistant_name
        - total_deliveries
        - total_hours
        - avg_hours_per_delivery
    """
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
    e.employee_id,
    e.employee_name,
    e.role_id,
    SUM(tea.assigned_hours) AS total_hours,
    COUNT(td.delivery_id) AS total_deliveries
FROM truckemployeeassignment tea
JOIN employee e ON tea.employee_id = e.employee_id
JOIN truckdelivery td ON tea.truck_delivery_id = td.delivery_id
WHERE YEAR(td.scheduled_departure) = %s
  AND QUARTER(td.scheduled_departure) = %s
GROUP BY e.employee_id
ORDER BY total_hours DESC;

    """, (year, quarter))

    results = cur.fetchall()
    cur.close()
    conn.close()

    report = []
    for row in results:
        driver_name, assistant_name, total_deliveries, total_hours, avg_hours = row
        report.append({
            "driver_name": driver_name,
            "assistant_name": assistant_name,
            "total_deliveries": total_deliveries or 0,
            "total_hours": total_hours or 0,
            "avg_hours_per_delivery":avg_hours or 0,
        })
    
    return report



def get_truck_usage_report(year: int, month: int):
    """
    Get truck usage analysis for a given year and month.

    Args:
        year (int): Year to filter deliveries
        month (int): Month (1-12) to filter deliveries

    Returns:
        List[Dict]: Each dict contains truck_id, total_deliveries, total_hours, delivered_count, delayed_count
    """
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            td.truck_id,
            COUNT(*) AS total_deliveries,
            SUM(TIMESTAMPDIFF(HOUR, td.actual_departure, td.actual_arrival)) AS total_hours,
            SUM(CASE WHEN td.status = 'Delivered' THEN 1 ELSE 0 END) AS delivered_count,
            SUM(CASE WHEN td.status = 'Delayed' THEN 1 ELSE 0 END) AS delayed_count
        FROM truckdelivery td
        WHERE YEAR(td.scheduled_departure) = %s
          AND MONTH(td.scheduled_departure) = %s
        GROUP BY td.truck_id
        ORDER BY total_deliveries DESC;
    """, (year, month))

    results = cur.fetchall()
    cur.close()
    conn.close()

    report = []
    for row in results:
        truck_id, total_deliveries, total_hours, delivered_count, delayed_count = row
        report.append({
            "truck_id": truck_id,
            "total_deliveries": total_deliveries or 0,
            "total_hours": total_hours or 0,
            "delivered_count": delivered_count or 0,
            "delayed_count": delayed_count or 0
        })

    return report




def get_customer_order_history(customer_id: int):
    """
    Get all orders of a customer along with delivery details.
    """
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            o.order_id,
            o.order_date,
            o.total_price,
            td.truck_id,
            td.route_id,
            td.scheduled_departure,
            td.actual_departure,
            td.actual_arrival,
            td.status AS delivery_status
        FROM `order` o
        LEFT JOIN truckdelivery td ON o.order_id = td.order_id
        WHERE o.customer_id = %s
        ORDER BY o.order_date DESC;
    """, (customer_id,))

    results = cur.fetchall()
    cur.close()
    conn.close()

    history = []
    for row in results:
        order_id, order_date, total_price, truck_id, route_id, sched_dep, actual_dep, actual_arrival, status = row
        history.append({
            "order_id": order_id,
            "order_date": order_date,
            "total_price": total_price,
            "truck_id": truck_id,
            "route_id": route_id,
            "scheduled_departure": sched_dep,
            "actual_departure": actual_dep,
            "actual_arrival": actual_arrival,
            "delivery_status": status
        })
    return history

