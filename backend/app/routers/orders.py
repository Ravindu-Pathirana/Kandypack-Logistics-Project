from fastapi import APIRouter
from typing import List
from app.models.order_models import OrderCreate, OrderResponse, TrainAllocationRequest
from app.crud import orders_crud
import mysql.connector
import os
from fastapi import HTTPException
from fastapi import Request

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=dict)
def create_order(order: OrderCreate):
    return orders_crud.create_order(order)


@router.get("/", response_model=List[dict])
def list_orders():
    return orders_crud.get_orders()

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", ""),
        database=os.getenv("DB_NAME", "kandypacklogistics"),
    )

@router.get("/")
def get_orders():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT 
            o.order_id,
            o.customer_id,
            c.customer_name,
            o.order_date,
            o.required_date,
            o.status,
            
            SUM(oi.quantity * oi.unit_price) AS total_price,
            o.total_space,
        FROM `order` o
        JOIN customer c ON o.customer_id = c.customer_id
        LEFT JOIN orderitem oi ON o.order_id = oi.order_id
        GROUP BY o.order_id, o.customer_id, c.customer_name, o.order_date, o.required_date, o.status
        ORDER BY o.order_id DESC
    """)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

@router.get("/{order_id}/items")
def get_order_items(order_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT 
            oi.order_id,
            oi.product_id,
            oi.quantity,
            -- remaining quantity after allocations to this order/product
            GREATEST(
                oi.quantity - COALESCE(alloc.total_allocated, 0),
                0
            ) AS remaining_qty,
            oi.unit_price,
            p.product_name,
            p.unit_space
        FROM orderitem oi
        JOIN product p ON oi.product_id = p.product_id
        LEFT JOIN (
            SELECT 
                ta.order_id,
                ta.product_id,
                COALESCE(SUM(ta.allocated_qty), 0) AS total_allocated
            FROM TrainAllocation ta
            WHERE ta.status IN ('Allocated','Shipped','Delivered')
            GROUP BY ta.order_id, ta.product_id
        ) AS alloc
            ON alloc.order_id = oi.order_id AND alloc.product_id = oi.product_id
        WHERE oi.order_id = %s
    """

    cursor.execute(query, (order_id,))
    items = cursor.fetchall()

    cursor.close()
    conn.close()

    return items


@router.post("/{order_id}/allocate")
async def allocate_order_to_train(order_id: int, allocation: TrainAllocationRequest, request: Request):
    """
    Insert a row into TrainAllocation for the given order.
    Validates available capacity on the train.
    Marks the allocation as finalized if this completes the order quantity.
    """
    train_id = allocation.train_id
    product_id = allocation.product_id
    allocated_qty = allocation.allocated_qty
    store_id = allocation.store_id

    if allocated_qty <= 0:
        raise HTTPException(status_code=400, detail="allocated_qty must be > 0")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # fetch product unit space if not provided
        unit_space = allocation.unit_space
        if unit_space is None:
            cursor.execute("SELECT unit_space FROM Product WHERE product_id=%s", (product_id,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Product not found")
            unit_space = float(row["unit_space"])  # type: ignore

        # check train capacity
        cursor.execute("SELECT capacity_space FROM Train WHERE train_id=%s", (train_id,))
        trow = cursor.fetchone()
        if not trow:
            raise HTTPException(status_code=404, detail="Train not found")
        capacity = float(trow["capacity_space"])

        cursor.execute("""
            SELECT COALESCE(SUM(ta.allocated_qty * p.unit_space), 0) AS utilized
            FROM TrainAllocation ta
            JOIN Product p ON ta.product_id = p.product_id
            WHERE ta.train_id=%s
        """, (train_id,))
        urow = cursor.fetchone()
        utilized = float(urow["utilized"]) if urow and urow["utilized"] is not None else 0.0

        this_allocation_space = allocated_qty * unit_space
        if utilized + this_allocation_space > capacity + 1e-9:
            raise HTTPException(status_code=409, detail="Not enough space on the train")

        # check total order quantity already allocated
        cursor.execute("""
            SELECT COALESCE(SUM(allocated_qty), 0) AS total_allocated
            FROM TrainAllocation
            WHERE order_id=%s
        """, (order_id,))
        alloc_row = cursor.fetchone()
        total_allocated = float(alloc_row["total_allocated"]) if alloc_row else 0.0

        # fetch order total quantity
        cursor.execute("SELECT total_quantity FROM `Order` WHERE order_id=%s", (order_id,))
        order_row = cursor.fetchone()
        if not order_row:
            raise HTTPException(status_code=404, detail="Order not found")
        order_qty = float(order_row["total_quantity"])

        # will this allocation complete the order?
        finalized = (total_allocated + allocated_qty) >= order_qty

        # insert allocation
        cursor.execute("""
            INSERT INTO TrainAllocation (
                train_id, order_id, product_id, store_id, allocated_qty,
                start_date_time, status, unit_space, finalized
            ) VALUES (%s,%s,%s,%s,%s, NOW(), 'Allocated', %s, %s)
        """, (train_id, order_id, product_id, store_id, allocated_qty, unit_space, finalized))

        conn.commit()
        return {"trip_id": cursor.lastrowid, "message": "Allocated", "finalized": finalized}

    except mysql.connector.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
