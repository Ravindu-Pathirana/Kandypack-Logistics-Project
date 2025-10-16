"""Apply SQL migration files from migrations/versions in order.

This runner executes each .sql file (split by semicolons) and records the
applied version in `schema_migrations` to avoid reapplying.
"""
import pathlib
import re
from datetime import datetime, timezone
from app.core.database import engine


VERSIONS_DIR = pathlib.Path(__file__).resolve().parents[0] / 'versions'


def ensure_schema_migrations(conn):
    conn.exec_driver_sql(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version VARCHAR(200) PRIMARY KEY,
            applied_at DATETIME NOT NULL
        ) ENGINE=InnoDB
        """
    )


def is_applied(conn, version):
    rs = conn.exec_driver_sql("SELECT version FROM schema_migrations WHERE version=%s", (version,))
    return rs.first() is not None


def record(conn, version):
    # store UTC timezone-aware timestamp
    ts = datetime.now(timezone.utc)
    # MySQL DATETIME does not store tz info; convert to ISO-like naive UTC string
    conn.exec_driver_sql(
        "INSERT INTO schema_migrations (version, applied_at) VALUES (%s, %s)",
        (version, ts.replace(tzinfo=None)),
    )


def apply_file(conn, path: pathlib.Path):
    sql = path.read_text(encoding='utf-8')
    # Simple split on semicolon followed by newline or end
    parts = [p.strip() for p in re.split(r";\s*(?=\n|$)", sql) if p.strip()]
    for i, stmt in enumerate(parts, 1):
        conn.exec_driver_sql(stmt)


def run():
    if not VERSIONS_DIR.exists():
        print('No migrations/versions directory found at', VERSIONS_DIR)
        return

    files = sorted([p for p in VERSIONS_DIR.iterdir() if p.suffix.lower() == '.sql'])
    if not files:
        print('No SQL migration files found in', VERSIONS_DIR)
        return

    with engine.begin() as conn:
        ensure_schema_migrations(conn)
        for f in files:
            version = f.stem
            print('Processing', f.name)
            if is_applied(conn, version):
                print('  already applied, skipping')
                continue
            try:
                # disable fk checks
                try:
                    conn.exec_driver_sql('SET FOREIGN_KEY_CHECKS=0')
                except Exception:
                    pass
                apply_file(conn, f)
                try:
                    conn.exec_driver_sql('SET FOREIGN_KEY_CHECKS=1')
                except Exception:
                    pass
                record(conn, version)
                print('  applied', version)
            except Exception as e:
                print('  FAILED applying', version, '->', e)
                raise


if __name__ == '__main__':
    run()
