from sklearn.ensemble import IsolationForest
import pandas as pd
import numpy as np

def train_and_predict_anomaly(features_df):
    """
    Trains an Isolation Forest model to detect anomalous return behavior
    Returns the dataframe with an 'anomaly_score' column (0 to 1 scaling, 1 being most anomalous)
    """
    if features_df.empty:
        return features_df
        
    # Features used for anomaly detection
    cols = ['return_frequency', 'fast_return_count', 'high_val_return_count']
    X = features_df[cols].copy()
    
    # If all values are 0, handle it
    if X.sum().sum() == 0 or len(X) < 2:
        features_df['anomaly_score'] = 0.0
        return features_df
        
    clf = IsolationForest(contamination=0.1, random_state=42)
    clf.fit(X)
    
    # isolation forest returns negative scores for anomalies (-1 to 0.5 roughly)
    # lower is more anomalous
    scores = clf.decision_function(X)
    
    # Invert and scale to 0-1 range approx so 1 is high anomaly
    # If max == min, avoid div by zero
    if scores.max() != scores.min():
        scaled_scores = (scores.max() - scores) / (scores.max() - scores.min())
    else:
        scaled_scores = np.zeros(len(scores))
        
    features_df['anomaly_score'] = scaled_scores
    
    return features_df
