from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    account_age = Column(Integer) # age in days
    
    transactions = relationship("Transaction", back_populates="user")
    returns = relationship("Return", back_populates="user")
    behavior_score = relationship("BehaviorScore", back_populates="user", uselist=False)
    fraud_alerts = relationship("FraudAlert", back_populates="user")

class Transaction(Base):
    __tablename__ = "transactions"
    
    transaction_id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    date = Column(DateTime, default=datetime.utcnow)
    total_amount = Column(Float)
    
    # New Transaction Risk fields
    payment_method = Column(String, default="Credit Card")
    ip_address = Column(String, default="0.0.0.0")
    device_fingerprint = Column(String, default="unknown")
    shipping_address_risk = Column(String, default="Low") # Low, Medium, High
    
    user = relationship("User", back_populates="transactions")
    items = relationship("Item", back_populates="transaction")
    returns = relationship("Return", back_populates="transaction")

class Item(Base):
    __tablename__ = "items"
    
    item_id = Column(String, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.transaction_id"))
    name = Column(String)
    price = Column(Float)
    category = Column(String)
    
    transaction = relationship("Transaction", back_populates="items")

class Return(Base):
    __tablename__ = "returns"
    
    return_id = Column(String, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.transaction_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    item_id = Column(String, ForeignKey("items.item_id"))
    return_date = Column(DateTime, default=datetime.utcnow)
    reason = Column(String)
    return_reason_category = Column(String, default="General") # e.g. Quality, Sizing, Damaged
    refund_amount = Column(Float)
    item_condition = Column(String)
    
    user = relationship("User", back_populates="returns")
    transaction = relationship("Transaction", back_populates="returns")
    item = relationship("Item")

class BehaviorScore(Base):
    __tablename__ = "behavior_scores"
    
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    return_rate_90d = Column(Float, default=0.0)
    avg_return_time_days = Column(Float, default=0.0)
    fast_return_count = Column(Integer, default=0)
    high_value_return_count = Column(Integer, default=0)
    refund_value_ratio = Column(Float, default=0.0)         # total_refunds / total_spent
    category_risk_score = Column(Float, default=0.0)        # based on returning risky categories (electronics, event fashion)
    payment_risk_score = Column(Float, default=0.0)         # based on COD abuse, multiple cards, IP
    anomaly_score = Column(Float, default=0.0)
    overall_risk_score = Column(Float, default=0.0)
    engine_used = Column(String, default="Engine 1: Behavioral") # To show whether cold-start transaction risk or historical risk was applied
    
    user = relationship("User", back_populates="behavior_score")

class FraudAlert(Base):
    __tablename__ = "fraud_alerts"
    
    alert_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    date = Column(DateTime, default=datetime.utcnow)
    risk_score = Column(Float)
    primary_reason = Column(String)
    status = Column(String, default="Active") # Active, Investigating, Resolved
    
    user = relationship("User", back_populates="fraud_alerts")
