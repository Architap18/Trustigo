import asyncio
import io
import pandas as pd
from backend.models import User, BehaviorScore, FraudAlert, Transaction, Return, Item
from motor.motor_asyncio import AsyncIOMotorClient

async def run():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.trustigo
    
    with open("test_amazon.csv", "rb") as f:
        contents = f.read()
        decoded = contents.decode("utf-8")
        df = pd.read_csv(io.StringIO(decoded), sep=",")
        
    column_mapping = {
        'amazon-order-id': 'transaction_id',
        'buyer-name': 'user_id',
        'sku': 'item_id',
        'item-price': 'price',
        'purchase-date': 'date',
        'return-date': 'return_date'
    }
    df.columns = [str(c).lower().strip() for c in df.columns]
    lower_mapping = {k.lower(): v for k, v in column_mapping.items()}
    df.rename(columns=lower_mapping, inplace=True)
    
    df['buyer_name_raw'] = df['user_id'].astype(str)
    
    def safe_hash_uid(val):
        try: return int(float(val))
        except ValueError: return abs(hash(str(val))) % (10 ** 8)
            
    df['user_id'] = df['user_id'].apply(safe_hash_uid)

    new_users_dict = {}
    new_txns_dict = {}
    new_items_dict = {}
    new_returns_dict = {}
    
    for _, row in df.iterrows():
        uid = int(row['user_id'])
        tid = str(row['transaction_id']) if pd.notna(row['transaction_id']) else "TXN-AUTO"
        iid = str(row['item_id']) if pd.notna(row['item_id']) else "UNKNOWN"
        price_val = str(row['price']).replace('$', '').replace(',', '').strip()
        price = float(price_val) if price_val else 0.0
        txn_date = pd.to_datetime(row['date'], errors='coerce')
        if pd.isna(txn_date): txn_date = pd.Timestamp.utcnow()
        
        # 1. Batch Users
        if uid not in new_users_dict:
            raw_name = str(row.get('buyer_name_raw', f"User {uid}"))
            new_users_dict[uid] = User(user_id=uid, name=raw_name, email=f"user{uid}@example.com", account_age=30).model_dump()
            
        # 2. Batch Transactions
        if tid not in new_txns_dict:
            new_txns_dict[tid] = Transaction(transaction_id=tid, user_id=uid, date=txn_date, total_amount=price).model_dump()
        else:
            new_txns_dict[tid]['total_amount'] += price
            
        # 3. Batch Items
        if iid not in new_items_dict:
            new_items_dict[iid] = Item(item_id=iid, transaction_id=tid, name="Imported Item", price=price, category="Unknown").model_dump()
            
        # 4. Batch Returns
        if 'return_date' in df.columns and pd.notna(row['return_date']):
            ret_date = pd.to_datetime(row['return_date'], errors='coerce')
            if pd.notna(ret_date):
                if iid not in new_returns_dict:
                    new_returns_dict[iid] = Return(
                        return_id=f"RET-{iid}",
                        transaction_id=tid,
                        user_id=uid,
                        item_id=iid,
                        return_date=ret_date,
                        reason="CSV Import",
                        refund_amount=price,
                        item_condition="Unknown"
                    ).model_dump()
                    
    print("Models parsed successfully.")
    
asyncio.run(run())
