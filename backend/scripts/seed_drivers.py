from datetime import datetime
from app.core.database import engine


def run_sql(conn, sql, params=None):
    if params is None:
        params = ()
    conn.exec_driver_sql(sql, params)


def seed():
    with engine.begin() as conn:
        # disable FK checks for seeding
        try:
            conn.exec_driver_sql('SET FOREIGN_KEY_CHECKS=0')
        except Exception:
            pass

        # ensure Driver role exists
        row = conn.exec_driver_sql("SELECT role_id FROM Roles WHERE role_name=%s", ('Driver',)).first()
        if row:
            role_id = row[0]
        else:
            conn.exec_driver_sql("INSERT INTO Roles (role_name, max_hours_week) VALUES (%s, %s)", ('Driver', 40))
            role_id = conn.exec_driver_sql("SELECT LAST_INSERT_ID()").scalar()

        # ensure store exists
        row = conn.exec_driver_sql("SELECT store_id FROM Store WHERE store_name=%s", ('Main Store',)).first()
        if row:
            store_id = row[0]
        else:
            conn.exec_driver_sql("INSERT INTO Store (store_name, contact_number) VALUES (%s, %s)", ('Main Store', '0111234567'))
            store_id = conn.exec_driver_sql("SELECT LAST_INSERT_ID()").scalar()

        sample = [
            ('Kamal Perera', '901234567V', '0771234567', datetime.utcnow(), 'On Duty', 35.0, 'kamal@example.com', 'seeded'),
            ('Sunil Fernando', '901234568V', '0772345678', datetime.utcnow(), 'Off Duty', 38.0, 'sunil@example.com', 'seeded'),
            ('Ravi Silva', '901234569V', '0773456789', datetime.utcnow(), 'On Duty', 28.0, 'ravi@example.com', 'seeded'),
        ]

        for name, nic, phone, reg_date, status, hours, email, pwd in sample:
            exists = conn.exec_driver_sql("SELECT employee_id FROM Employee WHERE employee_nic=%s", (nic,)).first()
            if exists:
                print('Skipping existing', name)
                continue
            conn.exec_driver_sql(
                """
                INSERT INTO Employee (employee_name, employee_nic, official_contact_number, registrated_date, status, total_hours_week, email, password_hash, role_id, store_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (name, nic, phone, reg_date, status, hours, email, pwd, role_id, store_id),
            )

        try:
            conn.exec_driver_sql('SET FOREIGN_KEY_CHECKS=1')
        except Exception:
            pass

        print('Seeding complete')


if __name__ == '__main__':
    seed()
