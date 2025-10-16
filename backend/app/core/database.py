import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()  # loads environment variables from .env

def get_db():
    """
    Create and return a MySQL database connection.
    Make sure to close it after use.
    """
    db = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", ""),
        database=os.getenv("DB_NAME", "kandypacklogistics")
    )
    return db