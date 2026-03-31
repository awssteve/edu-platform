from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer, Numeric, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
import uuid
from database import Base

class OrderType(str, enum.Enum):
    SUBSCRIPTION = "subscription"
    COURSE = "course"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    order_type = Column(String(20), nullable=False)  # OrderType
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="CNY")
    status = Column(String(20), default="pending")  # OrderStatus
    payment_method = Column(String(50))
    paid_at = Column(DateTime(timezone=True))
    expired_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    school = relationship("School")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    item_type = Column(String(20), nullable=False)  # subscription, course
    item_id = Column(UUID(as_uuid=True))
    item_name = Column(String(200))
    quantity = Column(Integer, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="items")
