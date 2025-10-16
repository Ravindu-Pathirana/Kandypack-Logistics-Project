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
    delivered_count = delivered[0] if delivered and delivered[0] is not None else 0
    cur.close()

    return [
        {"name": "This Quarter Revenue", "value": current_revenue[0]},
        {"name": "Orders Delivered", "value": delivered_count}
    ]