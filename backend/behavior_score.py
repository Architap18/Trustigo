from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from backend.models import User, Transaction, Return, Item, BehaviorScore

def calculate_user_behavior_metrics(db: Session, user_id: int):
    # Transactions in last 90 days
    ninety_days_ago = datetime.utcnow() - timedelta(days=90)
    txns = db.query(Transaction).filter(
        Transaction.user_id == user_id, 
        Transaction.date >= ninety_days_ago
    ).all()
    
    txn_ids = [t.transaction_id for t in txns]
    
    total_spent = sum(t.total_amount for t in txns)
    
    # Total items bought
    items_bought = db.query(Item).filter(Item.transaction_id.in_(txn_ids)).count() if txn_ids else 0
    
    # Returns in last 90 days
    returns = db.query(Return).filter(
        Return.user_id == user_id,
        Return.return_date >= ninety_days_ago
    ).all()
    
    # Metrics
    return_rate_90d = len(returns) / items_bought if items_bought > 0 else 0.0
    
    total_days = 0
    fast_count = 0
    high_value_count = 0
    total_refund = sum(r.refund_amount for r in returns)
    
    refund_value_ratio = total_refund / total_spent if total_spent > 0 else 0.0
    
    risky_categories_count = 0
    
    for r in returns:
        # Need to find the original txn date
        txn = next((t for t in txns if t.transaction_id == r.transaction_id), None)
        if txn:
            diff = (r.return_date - txn.date).days
            total_days += diff
            if diff <= 2:
                fast_count += 1
                
        if r.refund_amount > 800:
            high_value_count += 1
            
        item = db.query(Item).filter(Item.item_id == r.item_id).first()
        if item and item.category in ["Electronics", "Clothing"]:
            risky_categories_count += 1
            
    avg_return_time = (total_days / len(returns)) if len(returns) > 0 else 0.0
    category_risk_score = min(risky_categories_count / max(len(returns), 1), 1.0) * 100
    
    # Check for payment/device risk based on recent txns
    payment_risk_score = 0.0
    cod_count = sum(1 for t in txns if t.payment_method == "COD")
    if cod_count > 0:
        payment_risk_score += 30.0
    high_risk_shipping = sum(1 for t in txns if t.shipping_address_risk == "High")
    if high_risk_shipping > 0:
        payment_risk_score += (high_risk_shipping * 20.0)
    
    payment_risk_score = min(payment_risk_score, 100.0)
    
    # Determine Engine
    engine_used = "Engine 1: Behavioral"
    if len(txns) <= 1:
        # First order or very new user -> Use Engine 2
        engine_used = "Engine 2: First-Order"
    
    return {
        "user_id": user_id,
        "return_rate_90d": return_rate_90d,
        "avg_return_time_days": avg_return_time,
        "fast_return_count": fast_count,
        "high_value_return_count": high_value_count,
        "refund_value_ratio": refund_value_ratio,
        "category_risk_score": category_risk_score,
        "payment_risk_score": payment_risk_score,
        "engine_used": engine_used,
        "txns_count": len(txns)
    }
