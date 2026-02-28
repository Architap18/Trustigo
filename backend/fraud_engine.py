from backend.anomaly_model import train_and_predict_anomaly

def generate_reasoning(row):
    reasons = []
    
    if row.get('engine_used') == "Engine 2: First-Order":
        if row.get('payment_risk_score', 0) > 50:
            reasons.append("High Payment/Shipping Risk on New Account")
        if row.get('high_value_return_count', 0) > 0:
            reasons.append("High-Value First Order Return")
        if row.get('refund_value_ratio', 0) > 0.8:
            reasons.append("Full Order Refund on First Purchase")
    else:
        if row['return_rate_90d'] > 0.8 and row['fast_return_count'] > 0:
            reasons.append("Serial Returner")
            
        if row['fast_return_count'] >= 2:
            reasons.append("Wardrobing (Frequent fast returns < 48h)")
            
        if row['high_value_return_count'] >= 2:
            reasons.append("High-Value Item Abuse")
            
        if row.get('category_risk_score', 0) > 50:
            reasons.append("Category-Specific Event Abuse")

    if row['anomaly_score'] > 0.7:
        reasons.append("Highly Anomalous Pattern")
        
    return ", ".join(reasons) if reasons else "Normal Pattern"

def calculate_final_scores(features_list):
    """
    Given the list of feature dictionaries, returns dicts to update the BehaviorScore DB
    as well as generating FraudAlerts.
    """
    
    # First, calculate anomalies across cohort
    anomalies = train_and_predict_anomaly(features_list)
    
    results = []
    for f in features_list:
        uid = f['user_id']
        anom_score = anomalies.get(uid, 0.0)
        f['anomaly_score'] = anom_score
        
        if f.get('engine_used') == "Engine 2: First-Order":
            # Engine 2 (Cold Start): Transaction Risk Heavily Weighted
            comp1 = min(f.get('payment_risk_score', 0), 100) * 0.40
            comp2 = min(f.get('high_value_return_count', 0) * 20, 100) * 0.30
            comp3 = min(f.get('refund_value_ratio', 0) * 100, 100) * 0.20
            comp4 = anom_score * 100 * 0.10
            risk = comp1 + comp2 + comp3 + comp4
        else:
            # Engine 1 (Behavioral)
            comp1 = min(f['return_rate_90d'], 1.0) * 100 * 0.30
            comp2 = min((f['fast_return_count'] / 5.0) * 100, 100) * 0.20
            comp3 = min((f['high_value_return_count'] / 5.0) * 100, 100) * 0.15
            comp4 = min(f.get('refund_value_ratio', 0), 1.0) * 100 * 0.15
            comp5 = min(f.get('category_risk_score', 0), 100) * 0.10
            comp6 = anom_score * 100 * 0.10
            risk = comp1 + comp2 + comp3 + comp4 + comp5 + comp6
        
        f['overall_risk_score'] = round(risk, 2)
        f['reasoning'] = generate_reasoning(f)
        
        results.append(f)
        
    return results
