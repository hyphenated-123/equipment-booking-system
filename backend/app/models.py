from sqlalchemy import Boolean, Column, Date, DateTime
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="user")
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    bookings = relationship(
        "Booking",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(String(500), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    available = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    bookings = relationship(
        "Booking",
        back_populates="resource",
    )


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )
    resource_id = Column(
        Integer,
        ForeignKey("resources.id"),
        nullable=False,
    )
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(
        String(20),
        nullable=False,
        default="active",
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user = relationship(
        "User",
        back_populates="bookings",
    )

    resource = relationship(
        "Resource",
        back_populates="bookings",
    )
