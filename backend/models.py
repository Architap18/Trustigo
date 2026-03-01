from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class User(BaseModel):
    user_id: int
    name: str = Field(default="Unknown Shopper")
    email: str = Field(default="")
    account_age: int = 0

class Transaction(BaseModel):
    transaction_id: str
    user_id: int
    date: datetime = Field(default_factory=datetime.utcnow)
    total_amount: float = 0.0
    payment_method: str = "Credit Card"
    ip_address: str = "0.0.0.0"
    device_fingerprint: str = "unknown"
    shipping_address_risk: str = "Low"

class Item(BaseModel):
    item_id: str
    transaction_id: str
    name: str = ""
    price: float = 0.0
    category: str = "Unknown"

class Return(BaseModel):
    return_id: str
    transaction_id: str
    user_id: int
    item_id: str
    return_date: datetime = Field(default_factory=datetime.utcnow)
    reason: str = ""
    return_reason_category: str = "General"
    refund_amount: float = 0.0
    item_condition: str = "Unknown"

class BehaviorScore(BaseModel):
    user_id: int
    return_rate_90d: float = 0.0
    avg_return_time_days: float = 0.0
    fast_return_count: int = 0
    high_value_return_count: int = 0
    refund_value_ratio: float = 0.0
    category_risk_score: float = 0.0
    payment_risk_score: float = 0.0
    anomaly_score: float = 0.0
    overall_risk_score: float = 0.0
    engine_used: str = "Engine 1: Behavioral"

class FraudAlert(BaseModel):
    user_id: int
    date: datetime = Field(default_factory=datetime.utcnow)
    risk_score: float = 0.0
    primary_reason: str = ""
    status: str = "Active"
