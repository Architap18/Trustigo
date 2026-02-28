from sklearn.ensemble import IsolationForest
import pandas as pd
import numpy as np

def train_and_predict_anomaly(features_list):
    """
    Expects a list of dictionaries containing:
    return_rate_90d, avg_return_time_days, fast_return_count, high_value_return_count
    Returns a dictionary mapping user_id -> anomaly_score (scaled 0.0 - 1.0)
    """
    if not features_list:
        return {}
        
    df = pd.DataFrame(features_list)
    if df.empty or len(df) < 5:
        # Not enough data to reliably run IsolationForest
        return {row['user_id']: 0.0 for row in features_list}
        
    X = df[['return_rate_90d', 'fast_return_count', 'high_value_return_count']].copy()
    
    # Check if all 0
    if X.sum().sum() == 0:
        return {row['user_id']: 0.0 for row in features_list}
        
    clf = IsolationForest(contamination=0.1, random_state=42)
    clf.fit(X)
    
    scores = clf.decision_function(X)
    
    # Scale scores: lower decision function means more anomalous
    max_s = scores.max()
    min_s = scores.min()
    
    if max_s != min_s:
        scaled_scores = (max_s - scores) / (max_s - min_s)
    else:
        scaled_scores = np.zeros(len(scores))
        
    df['anomaly_score'] = scaled_scores
    
    return dict(zip(df['user_id'], df['anomaly_score']))
