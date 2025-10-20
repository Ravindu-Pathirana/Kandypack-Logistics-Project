from pydantic import BaseModel
import mysql.connector

# ---------- DB CONNECTION ----------
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="kandypack",
        password="kandypackpassword", 
        database="kandypacklogistics"
    )
 
# ---------- SCHEMA ----------
class Route(BaseModel):
    route_id: str
    route_name: str
    area: str
    max_delivery_time: int
    coverage: str
    active_orders: int
    assigned_trucks: int
    assigned_drivers: int
    status: str
    last_delivery: str | None = None

