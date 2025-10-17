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


def get_most_ordered_items():
    """
    Get the most ordered items.
    Returns:
    - List of dictionaries with item names and order counts.
    """
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT product_id, count(*) as count
FROM orderitem oi
JOIN `order`
using(order_id)
GROUP BY (product_id)
    """)

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