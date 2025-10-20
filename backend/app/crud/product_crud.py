from fastapi import HTTPException
from app.core.database import get_db
from app.models.product_models import ProductCreate
from app.models.product_type_models import ProductTypeCreate
from mysql.connector.errors import Error as MySQLError

def get_product_types():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT product_type_id, type_name
            FROM product_type
        """
        cursor.execute(query)
        results = cursor.fetchall()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cursor.close()
        conn.close()

def create_product_type(product_type: ProductTypeCreate, user_role: str):
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create product types")

    if len(product_type.type_name) > 20:
        raise HTTPException(status_code=400, detail="Product type name must be 20 characters or less")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            INSERT INTO product_type (type_name)
            VALUES (%s)
        """
        cursor.execute(query, (product_type.type_name,))
        conn.commit()

        product_type_id = cursor.lastrowid
        cursor.execute("SELECT product_type_id, type_name FROM product_type WHERE product_type_id = %s", (product_type_id,))
        result = cursor.fetchone()
        return result
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cursor.close()
        conn.close()

def get_products(role: str, store_id: int):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT 
                p.product_id,
                p.product_name,
                p.unit_space,
                p.unit_price,
                pt.type_name AS product_type
            FROM product p
            JOIN product_type pt ON p.product_type_id = pt.product_type_id
            
        """
        cursor.execute(query)
        results = cursor.fetchall()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cursor.close()
        conn.close()

def create_product(product: ProductCreate, user_role: str):
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create products")

    if len(product.product_name) > 20:
        raise HTTPException(status_code=400, detail="Product name must be 20 characters or less")
    if product.unit_space <= 0:
        raise HTTPException(status_code=400, detail="Unit space must be greater than 0")
    if product.unit_price <= 0:
        raise HTTPException(status_code=400, detail="Unit price must be greater than 0")
    if len(product.product_type) > 50:
        raise HTTPException(status_code=400, detail="Product type must be 50 characters or less")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        # Validate product_type exists
        cursor.execute("SELECT product_type_id FROM product_type WHERE type_name = %s", (product.product_type,))
        product_type = cursor.fetchone()
        if not product_type:
            raise HTTPException(status_code=400, detail="Invalid product type")

        query = """
            INSERT INTO product (product_name, unit_space, unit_price, product_type_id)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (
            product.product_name,
            product.unit_space,
            product.unit_price,
            product_type["product_type_id"]
        ))
        conn.commit()

        product_id = cursor.lastrowid
        cursor.execute("""
            SELECT 
                p.product_id,
                p.product_name,
                p.unit_space,
                p.unit_price,
                pt.type_name AS product_type
            FROM product p
            JOIN product_type pt ON p.product_type_id = pt.product_type_id
            WHERE p.product_id = %s
        """, (product_id,))
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=500, detail="Failed to retrieve created product")
        return result
    except MySQLError as e:
        conn.rollback()
        print(f"Database error: {str(e)}")  # Log for debugging
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cursor.close()
        conn.close()


def delete_product(product_id: int, user_role: str):
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete products")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if product exists and belongs to the user's store
        cursor.execute("SELECT product_id FROM product WHERE product_id = %s ", (product_id, ))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found ")

        query = "DELETE FROM product WHERE product_id = %s"
        cursor.execute(query, (product_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        
        conn.commit()
        return {"detail": "Product deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"{e}")
    finally:
        cursor.close()
        conn.close()