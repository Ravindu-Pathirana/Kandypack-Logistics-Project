import mysql.connector
from dotenv import load_dotenv
from datetime import datetime
import os

load_dotenv()

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", ""),
        database=os.getenv("DB_NAME", "kandypacklogistics"),
    )

def get_train_schedules():
    """
    Return trains from today up to 14 days ahead.
    Includes is_cancelled flag and utilization as before.
    """
    db = get_db()
    cursor = db.cursor(dictionary=True)
    query = """
SELECT 
    t.train_id,
    CONCAT('TR-', LPAD(t.train_id, 3, '0')) AS id,
    CONCAT(t.start_station, ' → ', t.destination_station) AS route,
    TIME_FORMAT(t.departure_date_time, '%H:%i:%s') AS departure,
    TIME_FORMAT(t.arrival_date_time,   '%H:%i:%s') AS arrival,
    t.capacity_space AS capacity,
    COALESCE(SUM(ta.allocated_qty * p.unit_space), 0) AS utilized,
    t.status,
    CASE WHEN t.status = 'cancelled' THEN TRUE ELSE FALSE END AS is_cancelled,
    DATE_FORMAT(t.departure_date_time, '%Y-%m-%d') AS nextDeparture
FROM Train t
LEFT JOIN TrainAllocation ta ON t.train_id = ta.train_id
LEFT JOIN Product p          ON ta.product_id = p.product_id
WHERE t.departure_date_time >= CURDATE()
  AND t.departure_date_time < DATE_ADD(CURDATE(), INTERVAL 14 DAY)
GROUP BY t.train_id, t.start_station, t.destination_station, t.departure_date_time, t.arrival_date_time, t.capacity_space, t.status
ORDER BY t.departure_date_time;
"""
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return rows

def create_train(train: dict) -> int:
    db = get_db()
    cursor = db.cursor()
    try:
        # validate & normalize
        dep = datetime.strptime(train['departure_date_time'], '%Y-%m-%d %H:%M:%S')
        arr = datetime.strptime(train['arrival_date_time'],   '%Y-%m-%d %H:%M:%S')
        if arr <= dep:
            raise ValueError("Arrival time must be after departure time")

        capacity = float(train['capacity_space'])
        if capacity <= 0:
            raise ValueError("Capacity must be greater than 0")

        q = """
        INSERT INTO Train (train_name, start_station, destination_station,
                           departure_date_time, arrival_date_time,
                           capacity_space, status, template_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """
        cursor.execute(q, (
            train['train_name'],
            train['start_station'],
            train['destination_station'],
            train['departure_date_time'],
            train['arrival_date_time'],
            capacity,
            train['status'],           # normalized 'on-time'/'delayed'
            train.get('template_id')
        ))
        db.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        db.close()

def create_train_template(template: dict) -> int:
    db = get_db()
    cursor = db.cursor()
    try:
        capacity = float(template['capacity_space'])
        if capacity <= 0:
            raise ValueError("Capacity must be greater than 0")

        q = """
        INSERT INTO TrainTemplate (train_name, start_station, destination_station,
                                   departure_time, arrival_time,
                                   capacity_space, status, frequency_days)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """
        cursor.execute(q, (
            template['train_name'],
            template['start_station'],
            template['destination_station'],
            template['departure_time'],  # 'HH:MM:SS'
            template['arrival_time'],    # 'HH:MM:SS'
            capacity,
            template['status'],          # 'on-time'|'delayed'
            template['frequency_days']   # 'Mon,Wed'... or full week
        ))
        db.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        db.close()

def update_train(train_id: int, updates: dict) -> bool:
    db = get_db()
    cursor = db.cursor()
    try:
        if not updates:
            return False
        fields, values = [], []
        for k, v in updates.items():
            fields.append(f"{k}=%s")
            values.append(v)
        values.append(train_id)

        q = f"UPDATE Train SET {', '.join(fields)} WHERE train_id=%s"
        cursor.execute(q, tuple(values))
        db.commit()
        return cursor.rowcount > 0
    finally:
        cursor.close()
        db.close()

def cancel_train(train_id: int) -> bool:
    db = get_db()
    cursor = db.cursor()
    try:
        q = "UPDATE Train SET status='cancelled' WHERE train_id=%s"
        cursor.execute(q, (train_id,))
        db.commit()
        return cursor.rowcount > 0
    finally:
        cursor.close()
        db.close()

def generate_horizon(days_ahead: int = 14) -> int:
    """
    Call the stored procedure to populate Train from TrainTemplate.
    Returns number of rows in Train for the horizon (optional sanity).
    """
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.callproc('sp_populate_trains_for_next_n_days', (days_ahead,))
        db.commit()
        # optional sanity count
        cursor.execute("""
          SELECT COUNT(*) FROM Train
          WHERE departure_date_time >= CURDATE()
            AND departure_date_time < DATE_ADD(CURDATE(), INTERVAL %s DAY)
        """, (days_ahead,))
        cnt = cursor.fetchone()[0]
        return cnt
    finally:
        cursor.close()
        db.close()
