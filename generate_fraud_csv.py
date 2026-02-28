import csv
from datetime import datetime, timedelta
import random

now = datetime.utcnow()

# Seed Lists
fraud_buyers = [f"SerialAbuser_{i}" for i in range(1, 151)]  # 150 Fraudsters
cold_buyers = [f"NewFraudster_{i}" for i in range(1, 101)]   # 100 Cold start abusers
good_buyers = [f"NormalShopper_{i}" for i in range(1, 301)]  # 300 Good people

data = []
txn_id_counter = 5000

# 1. Serial Abusers (High Return Rate, Fast Returns)
# They buy 10 items, return 8-10 of them within 1-2 days.
for f in fraud_buyers:
    for i in range(random.randint(8, 12)):
        d_buy = now - timedelta(days=random.randint(5, 80))
        txn_str = f"AMZ-{txn_id_counter}"
        txn_id_counter += 1
        
        # 90% chance to return this item fast
        if random.random() < 0.90:
            d_ret = d_buy + timedelta(days=random.randint(0, 2))
            ret_str = d_ret.strftime('%Y-%m-%dT%H:00:00Z')
        else:
            ret_str = ""
            
        data.append({
            "amazon-order-id": txn_str,
            "buyer-name": f,
            "sku": f"SKU-SHIRT-{random.randint(100,999)}",
            "item-price": f"{random.randint(40, 150)}.00",
            "purchase-date": d_buy.strftime('%Y-%m-%dT%H:00:00Z'),
            "return-date": ret_str
        })

# 2. Cold Start Abusers (New accounts, 1 high-value item, instant return)
for c in cold_buyers:
    d_buy = now - timedelta(days=random.randint(1, 10))
    d_ret = d_buy + timedelta(days=1)
    txn_str = f"AMZ-{txn_id_counter}"
    txn_id_counter += 1
    
    data.append({
        "amazon-order-id": txn_str,
        "buyer-name": c,
        "sku": f"SKU-MACBOOK-{random.randint(100,999)}",
        "item-price": f"{random.randint(1500, 3000)}.00", # HIGH VALUE
        "purchase-date": d_buy.strftime('%Y-%m-%dT%H:00:00Z'),
        "return-date": d_ret.strftime('%Y-%m-%dT%H:00:00Z')
    })
    
# 3. Normal Shoppers (Buy a few items over time, rare returns)
for n in good_buyers:
    for i in range(random.randint(2, 6)):
        d_buy = now - timedelta(days=random.randint(15, 85))
        txn_str = f"AMZ-{txn_id_counter}"
        txn_id_counter += 1
        
        # 10% chance to return, but taking an average 5-15 days, not fast
        if random.random() < 0.10:
            d_ret = d_buy + timedelta(days=random.randint(5, 15))
            ret_str = d_ret.strftime('%Y-%m-%dT%H:00:00Z')
        else:
            ret_str = ""
            
        data.append({
            "amazon-order-id": txn_str,
            "buyer-name": n,
            "sku": f"SKU-BOOK-{random.randint(100,999)}",
            "item-price": f"{random.randint(10, 50)}.00", # LOW VALUE
            "purchase-date": d_buy.strftime('%Y-%m-%dT%H:00:00Z'),
            "return-date": ret_str
        })
        
# Randomize data structure so it's a realistic messy distribution
random.shuffle(data)

# Write to CSV
with open("massive_fraud_dataset.csv", "w", newline='') as f:
    writer = csv.DictWriter(f, fieldnames=["amazon-order-id", "buyer-name", "sku", "item-price", "purchase-date", "return-date"])
    writer.writeheader()
    writer.writerows(data)
    
print(f"Generated massive_fraud_dataset.csv with {len(data)} transactions!")
