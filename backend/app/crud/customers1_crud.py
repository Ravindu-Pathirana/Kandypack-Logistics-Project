from fastapi import HTTPException
from app.core.database import get_db
from app.models.customer_type_models import CustomerTypeCreate
from app.models.customers1_models import CustomerCreate

def create_customer_type(customer_type: CustomerTypeCreate, user_role: str):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    # Validate user role (only admins can create customer types)
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create customer types")
    
    # Validate customer type length
    if len(customer_type.customer_type) > 20:
        raise HTTPException(status_code=400, detail="Customer type must be 20 characters or less")
    
    # Validate credit limit (non-negative and within reasonable range)
    if customer_type.credit_limit < 0 or customer_type.credit_limit > 99999999.99:
        raise HTTPException(status_code=400, detail="Credit limit must be between 0 and 99999999.99")
    
    try:
        # Insert new customer type
        query = """
            INSERT INTO customer_type (customer_type, credit_limit)
            VALUES (%s, %s)
        """
        cursor.execute(query, (customer_type.customer_type, customer_type.credit_limit))
        conn.commit()
        
        # Fetch the inserted customer type
        customer_type_id = cursor.lastrowid
        cursor.execute("SELECT customer_type_id, customer_type, credit_limit FROM customer_type WHERE customer_type_id = %s", (customer_type_id,))
        result = cursor.fetchone()
        
        return result
    except:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cursor.close()
        conn.close()



def get_customers(role: str, store_id: int):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Query to fetch customers with customer type details
        query = """
            SELECT 
                c.customer_id,
                c.customer_name,
                c.registration_date,
                ct.customer_type,
                ct.credit_limit
            FROM customer c
            JOIN customertype ct ON c.customer_type_id = ct.customer_type_id
        """
        cursor.execute(query)
        results = cursor.fetchall()
        return results
    except:
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cursor.close()
        conn.close()


def create_customer(customer: CustomerCreate, user_role: str):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    # Validate user role (only admins can create customers)
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create customers")
    
    # Validate customer name length
    if len(customer.customer_name) > 20:
        raise HTTPException(status_code=400, detail="Customer name must be 20 characters or less")
    
    # Validate customer_type_id exists
    cursor.execute("SELECT customer_type_id FROM customertype WHERE customer_type_id = %s", (customer.customer_type_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=400, detail="Invalid customer type ID")
    
    try:
        # Insert new customer
        query = """
            INSERT INTO customer (customer_name, registration_date, customer_type_id)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (customer.customer_name, customer.registration_date, customer.customer_type_id))
        conn.commit()
        
        # Fetch the inserted customer with customer type details
        customer_id = cursor.lastrowid
        cursor.execute("""
            SELECT 
                c.customer_id,
                c.customer_name,
                c.registration_date,
                c.customer_type_id,
                ct.customer_type,
                ct.credit_limit
            FROM customer c
            JOIN customertype ct ON c.customer_type_id = ct.customer_type_id
            WHERE c.customer_id = %s
        """, (customer_id,))
        result = cursor.fetchone()
        
        return result
    except:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cursor.close()
        conn.close()

def delete_customer(customer_id: int, user_role: str):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    # Validate user role (only admins can delete customers)
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete customers")
    
    try:
        # Check if customer exists
        cursor.execute("SELECT customer_id FROM customer WHERE customer_id = %s", (customer_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Check if customer has any orders
        cursor.execute("SELECT COUNT(*) as order_count FROM `order` WHERE customer_id = %s", (customer_id,))
        result = cursor.fetchone()
        if result['order_count'] > 0:
            raise HTTPException(status_code=400, detail="Cannot delete customer with existing orders")
        
        # Delete customer
        query = "DELETE FROM customer WHERE customer_id = %s"
        cursor.execute(query, (customer_id,))
        conn.commit()
        
        return {"message": "Customer deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cursor.close()
        conn.close()