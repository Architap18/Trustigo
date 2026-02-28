from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str
    account_age: int

class UserOut(UserBase):
    user_id: int
    class Config:
        from_attributes = True

class BehaviorScoreOut(BaseModel):
    user_id: int
    return_rate_90d: float
    avg_return_time_days: float
    fast_return_count: int
    high_value_return_count: int
    refund_value_ratio: float
    category_risk_score: float
    payment_risk_score: float
    anomaly_score: float
    overall_risk_score: float
    engine_used: str
    class Config:
        from_attributes = True

class FraudAlertOut(BaseModel):
    alert_id: int
    user_id: int
    date: datetime
    risk_score: float
    primary_reason: str
    status: str
    class Config:
        from_attributes = True

class UserDetailOut(UserOut):
    behavior_score: Optional[BehaviorScoreOut]
    fraud_alerts: List[FraudAlertOut] = []
    class Config:
        from_attributes = True

class TransactionOut(BaseModel):
    transaction_id: str
    user_id: int
    date: datetime
    total_amount: float
    payment_method: str
    ip_address: str
    device_fingerprint: str
    shipping_address_risk: str
    class Config:
        from_attributes = True
