from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from backend.database import get_db
from backend.models import User, BehaviorScore, FraudAlert, Transaction, Return, Item
from backend.schemas import BehaviorScoreOut, FraudAlertOut
from backend.behavior_score import calculate_user_behavior_metrics
from backend.fraud_engine import calculate_final_scores
import pandas as pd
import io
import pymongo

router = APIRouter()

@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...), db = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV.")
    
    try:
        # Wipe old database state before importing!
        await db.returns.delete_many({})
        await db.items.delete_many({})
        await db.transactions.delete_many({})
        await db.behavior_scores.delete_many({})
        await db.fraud_alerts.delete_many({})
        await db.users.delete_many({})
        
        contents = await file.read()
        try:
            decoded = contents.decode('utf-8')
        except UnicodeDecodeError:
            decoded = contents.decode('latin-1')
            
        try:
            df = pd.read_csv(io.StringIO(decoded), sep=None, engine='python')
        except Exception:
            # Fallback to standard comma if engine=python fails
            df = pd.read_csv(io.StringIO(decoded), sep=',')
        
        # Dynamic Mapping for Amazon/Flipkart
        column_mapping = {
            'amazon-order-id': 'transaction_id',
            'Order ID': 'transaction_id',
            'buyer-email': 'user_id',
            'buyer-name': 'user_id',
            'sku': 'item_id',
            'asin': 'item_id',
            'Item ID': 'item_id',
            'item-price': 'price',
            'Price': 'price',
            'purchase-date': 'date',
            'Order Date': 'date',
            'return-date': 'return_date'
        }
        
        # Standardize column names
        df.columns = [str(c).lower().strip() for c in df.columns]
        
        # apply lowercase mappings
        lower_mapping = {k.lower(): v for k, v in column_mapping.items()}
        df.rename(columns=lower_mapping, inplace=True)
        
        # Fallbacks for missing columns in some custom formats
        if 'user_id' not in df.columns and 'buyer-name' in df.columns:
             df['user_id'] = df['buyer-name']
             
        if 'user_id' not in df.columns:
            # If completely missing, generate a dummy user per transaction for mvp
             df['user_id'] = df.index + 10000
             
        # Preserve original name format right before hashing
        if 'user_id' in df.columns:
            df['buyer_name_raw'] = df['user_id'].astype(str)
        else:
            df['buyer_name_raw'] = "Unknown Shopper"
             
        # Hash non-numeric user_ids
        def safe_hash_uid(val):
            try:
                return int(float(val))
            except ValueError:
                return abs(hash(str(val))) % (10 ** 8)
                
        df['user_id'] = df['user_id'].apply(safe_hash_uid)

        if 'price' not in df.columns:
            df['price'] = 0.0
            
        if 'date' not in df.columns:
            df['date'] = pd.Timestamp.utcnow()
            
        if 'item_id' not in df.columns:
            df['item_id'] = "UNKNOWN-ITEM"
            
        if 'transaction_id' not in df.columns:
            df['transaction_id'] = ["TXN-" + str(i) for i in range(len(df))]
        
        required_cols = {'user_id'} # Base requirement so we know who to evaluate
        if not required_cols.issubset(df.columns):
            # If still missing even after dynamic fallback mappings, auto assign
            df['user_id'] = df.index + 10000
            
        new_users_dict = {}
        new_txns_dict = {}
        new_items_dict = {}
        new_returns_dict = {}
        
        for _, row in df.iterrows():
            uid = int(row['user_id'])
            
            # Sanitize TID and IID against NaNs
            tid = str(row['transaction_id']) if pd.notna(row['transaction_id']) else "TXN-AUTO"
            iid = str(row['item_id']) if pd.notna(row['item_id']) else "UNKNOWN"
            
            # Robust Price Parsing
            price_val = str(row['price']).replace('$', '').replace('€', '').replace('£', '').replace(',', '').strip()
            try:
                price = float(price_val)
            except ValueError:
                price = 0.0
                
            # Robust Date Parsing
            txn_date = pd.to_datetime(row['date'], errors='coerce')
            if pd.isna(txn_date):
                txn_date = pd.Timestamp.utcnow()
            
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
                        
        if new_users_dict: await db.users.insert_many(list(new_users_dict.values()))
        if new_txns_dict: await db.transactions.insert_many(list(new_txns_dict.values()))
        if new_items_dict: await db.items.insert_many(list(new_items_dict.values()))
        if new_returns_dict: await db.returns.insert_many(list(new_returns_dict.values()))
        
        return {
            "message": "CSV Processed Successfully",
            "stats": {
                "new_users": len(new_users_dict),
                "new_transactions": len(new_txns_dict),
                "new_returns": len(new_returns_dict)
            }
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="The uploaded CSV file is empty.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")

@router.get("/fraud-users", response_model=list[BehaviorScoreOut])
async def get_fraud_users(limit: int = 15000, db = Depends(get_db)):
    # Returns users with high risk score, sorted descending
    cursor = db.behavior_scores.find().sort("overall_risk_score", pymongo.DESCENDING).limit(limit)
    return await cursor.to_list(length=limit)

@router.get("/alerts", response_model=list[FraudAlertOut])
async def get_alerts(limit: int = 20, db = Depends(get_db)):
    cursor = db.fraud_alerts.find().sort("date", pymongo.DESCENDING).limit(limit)
    return await cursor.to_list(length=limit)

@router.post("/run-fraud-analysis")
async def run_analysis(db = Depends(get_db)):
    users = await db.users.find().to_list(length=None)
    all_metrics = []
    
    for u in users:
        mets = await calculate_user_behavior_metrics(db, u['user_id'])
        all_metrics.append(mets)
        
    final_scores = calculate_final_scores(list(all_metrics))

    
    # Save to db
    for fs in final_scores:
        uid = fs['user_id']
        
        bs_dict = {
            "user_id": uid,
            "return_rate_90d": fs['return_rate_90d'],
            "avg_return_time_days": fs['avg_return_time_days'],
            "fast_return_count": fs['fast_return_count'],
            "high_value_return_count": fs['high_value_return_count'],
            "refund_value_ratio": fs.get('refund_value_ratio', 0.0),
            "category_risk_score": fs.get('category_risk_score', 0.0),
            "payment_risk_score": fs.get('payment_risk_score', 0.0),
            "engine_used": fs.get('engine_used', 'Engine 1: Behavioral'),
            "anomaly_score": fs['anomaly_score'],
            "overall_risk_score": fs['overall_risk_score']
        }
        
        # update or create BehaviorScore using Motor update_one with upsert
        await db.behavior_scores.update_one(
            {"user_id": uid},
            {"$set": bs_dict},
            upsert=True
        )
        
        # Handle Alerts
        if fs['overall_risk_score'] > 60:
            existing_alert = await db.fraud_alerts.find_one({
                "user_id": uid, 
                "status": "Active"
            })
            
            if not existing_alert:
                alert = FraudAlert(
                    user_id=uid,
                    risk_score=fs['overall_risk_score'],
                    primary_reason=fs['reasoning'],
                    status="Active"
                ).model_dump()
                await db.fraud_alerts.insert_one(alert)
                
    return {"message": f"Successfully ran analysis on {len(users)} users"}

@router.get("/analytics-summary")
async def get_analytics_summary(db = Depends(get_db)):
    # 1. Total Monitored API (total unique transactions)
    total_txns = await db.transactions.count_documents({})
    
    # 2. Capital Saved ($ value of all returned items flagged by high-risk users)
    high_risk_cursor = db.behavior_scores.find({"overall_risk_score": {"$gte": 60}})
    high_risk_users = await high_risk_cursor.to_list(length=None)
    high_risk_uids = [h['user_id'] for h in high_risk_users]
    
    blocked_returns = await db.returns.find({"user_id": {"$in": high_risk_uids}}).to_list(length=None)
    capital_saved = sum(r.get('refund_amount', 0.0) for r in blocked_returns)
    blocked_count = len(blocked_returns)
    
    allowed_returns = await db.returns.find({"user_id": {"$nin": high_risk_uids}}).to_list(length=None)
    unrecognized_leakage = sum(r.get('refund_amount', 0.0) for r in allowed_returns)
    manual_reviews = len(allowed_returns)

    # 3. Time Series Data (Mocked out over months based on dynamic scalar ratio of actual db size for hackathon demo purposes)
    def distribute_over_7(total):
        import random
        fractions = [random.uniform(0.5, 1.5) for _ in range(7)]
        base = sum(fractions)
        return [int((f / base) * total) for f in fractions]

    # Gross Volume Calculation
    all_txns_cursor = db.transactions.find()
    all_txns = await all_txns_cursor.to_list(length=None)
    gross_volume = sum(t.get('total_amount', 0.0) for t in all_txns)

    expected_earnings = gross_volume - unrecognized_leakage

    revenueLossData = {
        "prevented": distribute_over_7(capital_saved if capital_saved > 0 else 120000),
        "expected_earnings": distribute_over_7(expected_earnings if expected_earnings > 0 else 450000),
        "leakage": distribute_over_7(unrecognized_leakage if unrecognized_leakage > 0 else 18000)
    }
    
    blockRateData = {
        "blocked": [int(x) for x in distribute_over_7(blocked_count if blocked_count > 0 else 150)],
        "manual": [int(x) for x in distribute_over_7(manual_reviews if manual_reviews > 0 else 40)]
    }
    
    catch_rate = 0.0
    if (capital_saved + unrecognized_leakage) > 0:
        catch_rate = (capital_saved / (capital_saved + unrecognized_leakage)) * 100

    return {
        "capital_saved": capital_saved,
        "gross_volume": gross_volume,
        "expected_earnings": expected_earnings,
        "catch_rate": round(catch_rate, 1),
        "total_txns": total_txns,
        "revenue_timeseries": revenueLossData,
        "block_timeseries": blockRateData
    }
