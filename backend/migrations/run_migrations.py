"""Simple SQL migrations runner.

This script looks for the SQL dump at ../FrontEnd/database.sql, cleans it,
and applies statements to the `kandypack` database. It records applied
migrations in the `schema_migrations` table so reruns are idempotent.

Usage:
  source env/bin/activate
  PYTHONPATH=$(pwd) python backend/migrations/run_migrations.py
"""
import os
import pathlib
import re
from datetime import datetime

from app.core.database import engine


MIGRATION_ID = "0001_initial_from_database_sql"
SQL_PATH = pathlib.Path(__file__).resolve().parents[2] / 'FrontEnd' / 'database.sql'


def read_and_clean_sql(path: pathlib.Path) -> str:
    text = path.read_text(encoding='utf-8')
    # Remove git conflict markers
    text = re.sub(r"^<<<<<<<.*$", "", text, flags=re.M)
    text = re.sub(r"^=======.*$", "", text, flags=re.M)
    text = re.sub(r"^>>>>>>>.*$", "", text, flags=re.M)
    # Remove code fences and leading/trailing ``` markers
    text = re.sub(r"^```.*$", "", text, flags=re.M)
    # Remove MySQL-specific /*! ... */ directives (a conservative approach)
    text = re.sub(r"/\*!.*?\*/;?", "", text, flags=re.S)
    # Remove leftover MySQL comments like /*!40101 ... */ lines
    text = re.sub(r"/\*!.*?\*/", "", text, flags=re.S)
    # Remove standalone lines that are only comments
    lines = []
    for line in text.splitlines():
        if line.strip().startswith('--'):
            continue
        if line.strip() == '':
            continue
        lines.append(line)
    cleaned = '\n'.join(lines)
    return cleaned


def ensure_schema_migrations(conn):
    conn.exec_driver_sql(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version VARCHAR(100) PRIMARY KEY,
            applied_at DATETIME NOT NULL
        ) ENGINE=InnoDB
        """
    )


def has_migration(conn, version: str) -> bool:
    rs = conn.exec_driver_sql("SELECT version FROM schema_migrations WHERE version=%s", (version,))
    return rs.first() is not None


def record_migration(conn, version: str):
    conn.exec_driver_sql("INSERT INTO schema_migrations (version, applied_at) VALUES (%s, %s)", (version, datetime.utcnow()))


def run():
    if not SQL_PATH.exists():
        print('Error: SQL file not found at', SQL_PATH)
        return

    sql = read_and_clean_sql(SQL_PATH)

    # Split statements on semicolon. This is simple but adequate for typical dumps.
    # Remove any trailing semicolons and split.
    parts = [p.strip() for p in re.split(r";\s*(?=\n|$)", sql) if p.strip()]

    with engine.begin() as conn:
        ensure_schema_migrations(conn)
        if has_migration(conn, MIGRATION_ID):
            print('Migration', MIGRATION_ID, 'already applied - skipping')
            return

        # Disable foreign key checks to allow creating tables in any order
        try:
            conn.exec_driver_sql('SET FOREIGN_KEY_CHECKS=0')
        except Exception:
            pass

        print(f'Applying {len(parts)} statements...')
        for i, stmt in enumerate(parts, 1):
            try:
                if not stmt.strip():
                    continue
                # execute raw SQL
                conn.exec_driver_sql(stmt)
            except Exception as e:
                print(f'Error executing statement #{i}:', e)
                raise

        try:
            conn.exec_driver_sql('SET FOREIGN_KEY_CHECKS=1')
        except Exception:
            pass

        record_migration(conn, MIGRATION_ID)
        print('Migration applied and recorded as', MIGRATION_ID)


if __name__ == '__main__':
    run()
