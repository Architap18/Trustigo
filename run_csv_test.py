from fastapi.testclient import TestClient
from backend.main import app
import json
from datetime import datetime, timedelta

now = datetime.utcnow()
d1 = (now - timedelta(days=10)).strftime("%Y-%m-%dT%H:00:00Z")
d1_ret = (now - timedelta(days=9)).strftime("%Y-%m-%dT%H:00:00Z")
d2 = (now - timedelta(days=8)).strftime("%Y-%m-%dT%H:00:00Z")
d2_ret = (now - timedelta(days=7)).strftime("%Y-%m-%dT%H:00:00Z")
d3 = (now - timedelta(days=6)).strftime("%Y-%m-%dT%H:00:00Z")
d3_ret = (now - timedelta(days=4)).strftime("%Y-%m-%dT%H:00:00Z")
d_cold = (now - timedelta(days=2)).strftime("%Y-%m-%dT%H:00:00Z")
d_cold_ret = (now - timedelta(days=1)).strftime("%Y-%m-%dT%H:00:00Z")

csv_content = f"""amazon-order-id,buyer-name,sku,item-price,purchase-date,return-date
AMZ-1001,888001,SKU-SHIRT,55.00,{d1},{d1_ret}
AMZ-1002,888001,SKU-PANTS,65.00,{d2},{d2_ret}
AMZ-1003,888001,SKU-SHOES,120.00,{d3},{d3_ret}
AMZ-1004,888002,SKU-LAPTOP,2500.00,{d_cold},{d_cold_ret}
AMZ-1005,888003,SKU-BOOK,25.00,{d1},
AMZ-1006,888003,SKU-MUG,15.00,{d2},
AMZ-1007,888003,SKU-DESK,300.00,{d3},{d_cold}
"""
with open("test_amazon.csv", "w") as f:
    f.write(csv_content)

client = TestClient(app)

print("--- Uploading test_amazon.csv ---")
with open("test_amazon.csv", "rb") as f:
    response = client.post("/upload-csv", files={"file": ("test_amazon.csv", f, "text/csv")})
    print(f"Upload Status: {response.status_code}")

print("\n--- Running Fraud Analysis ---")
analyze_res = client.post("/run-fraud-analysis")

print("\n--- Fetching Target User Outcomes ---")
users_res = client.get("/fraud-users")
users = users_res.json()

target_ids = {
    888001: "User A (Serial Returner)",
    888002: "User B (Cold Start Fraud)",
    888003: "User C (Good Shopper)"
}

for u in users:
    if u['user_id'] in target_ids:
        score = u['overall_risk_score']
        engine = u['engine_used']
        name = target_ids[u['user_id']]
        print(f"\n{name} (ID: {u['user_id']})")
        print(f"Risk Engine: {engine}")
        print(f"Score: {score}/100")
        print(f"Flags/Reasoning: {u.get('reasoning', '')}")
        print(f"Return Rate: {u['return_rate_90d']*100:.1f}% | Fast Returns (<48h): {u['fast_return_count']}")
        print(f"Refund/Value Ratio: {u.get('refund_value_ratio', 0.0)*100:.1f}% | High Value: {u['high_value_return_count']}")
        print("-" * 40)
