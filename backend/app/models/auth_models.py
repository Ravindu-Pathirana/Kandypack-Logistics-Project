from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str 


class UserLogin(BaseModel):
    username: str 
    password: str 


class Token(BaseModel):
    access_token: str 
    token_type: str

class Employee(Base):
    __tablename__ = "Employee"

    employee_id = Column(Integer, primary_key=True, index=True)
    employee_name = Column(String(20), nullable=False)
    employee_nic = Column(String(12), unique=True, nullable=False)
    official_contact_number = Column(String(10))
    registrated_date = Column(DateTime, nullable=False)
    status = Column(String(20), default="Active")
    total_hours_week = Column(Float, default=0)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("Roles.role_id"), nullable=False)
    store_id = Column(Integer, ForeignKey("Store.store_id"), nullable=False)
    auth_id = Column(Integer, ForeignKey("auth_users.id"), unique=True)

    role = relationship("Roles")
    store = relationship("Store")
