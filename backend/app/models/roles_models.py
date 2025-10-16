from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base


class Roles(Base):
    __tablename__ = "Roles"

    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True, nullable=False)
    # some existing schema contains this column; include it for ORM parity
    max_hours_week = Column(Float, nullable=False, default=40)


class Store(Base):
    __tablename__ = "Store"

    store_id = Column(Integer, primary_key=True, index=True)
    # DB schema indicates store_name is VARCHAR(20) and contact_number exists
    store_name = Column(String(20), nullable=False)
    contact_number = Column(String(10), nullable=False)
    nearest_station_id = Column(Integer, nullable=True)
