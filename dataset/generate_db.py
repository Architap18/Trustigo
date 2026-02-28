import os
import random
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy.orm import Session
from backend.database import engine, Base, SessionLocal
from backend.models import User, Transaction, Item, Return

fake = Faker()

def generate_synthetic_data(num_users=50, num_transactions_per_user=(1, 10)):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(User).first():
        print("Database already populated. Skipping generation.")
        db.close()
        return

    print(f"Generating synthetic dataset with {num_users} users...")
    
    categories = ["Electronics", "Clothing", "Home", "Beauty", "Sports"]
    users = []
    
    for i in range(num_users):
        u = User(
            name=fake.name(),
            email=fake.email(),
            account_age=random.randint(10, 365 * 3)
        )
        db.add(u)
        users.append(u)
    
    db.commit()
    
    # Create specific fraudster behavior profiles
    # user_id 1: The Serial Returner
    # user_id 2: The Wardrober
    # user_id 3: The High Value Abuser
    
    all_users = db.query(User).all()
    for u in all_users:
        txn_count = random.randint(*num_transactions_per_user)
        # Override for fraudsters to ensure they have enough history
        if u.user_id in [1, 2, 3]:
            txn_count = random.randint(10, 20)
            
        for _ in range(txn_count):
            txn_date = fake.date_time_between(start_date="-90d", end_date="now")
            
            t = Transaction(
                transaction_id=fake.uuid4(),
                user_id=u.user_id,
                date=txn_date,
                total_amount=0.0,
                payment_method=random.choice(["Credit Card", "Debit Card", "COD", "PayPal", "Gift Card"]),
                ip_address=fake.ipv4(),
                device_fingerprint=fake.md5(),
                shipping_address_risk=random.choice(["Low", "Medium", "High"])
            )
            db.add(t)
            db.flush() # get id
            
            # Add items
            num_items = random.randint(1, 3)
            txn_total = 0.0
            items_for_return = []
            
            for _ in range(num_items):
                category = random.choice(categories)
                price = round(random.uniform(20.0, 500.0), 2)
                
                # Force high value items for abuser
                if u.user_id == 3 and category == "Electronics":
                    price = round(random.uniform(1000.0, 3000.0), 2)
                    
                item = Item(
                    item_id=fake.uuid4(),
                    transaction_id=t.transaction_id,
                    name=fake.word() + " " + category,
                    price=price,
                    category=category
                )
                db.add(item)
                txn_total += price
                items_for_return.append(item)
                
            t.total_amount = txn_total
            
            # Handle returning logic
            for item in items_for_return:
                should_return = False
                days_to_return = random.randint(1, 30)
                
                if u.user_id == 1:
                    # Serial Returner: 90% return rate
                    should_return = random.random() < 0.90
                elif u.user_id == 2:
                    # Wardrober: 70% return rate, always under 2 days
                    should_return = random.random() < 0.70
                    days_to_return = random.randint(0, 1) # fast!
                elif u.user_id == 3:
                    # High Value Abuser: only returning expensive stuff
                    if item.price > 800:
                        should_return = random.random() < 0.85
                else:
                    # Normal User: 10% return rate
                    should_return = random.random() < 0.10
                    
                if should_return:
                    r_date = txn_date + timedelta(days=days_to_return)
                    # Don't return if date is in the future relative to today
                    if r_date > datetime.utcnow():
                        continue
                        
                    ret = Return(
                        return_id=fake.uuid4(),
                        transaction_id=t.transaction_id,
                        user_id=u.user_id,
                        item_id=item.item_id,
                        return_date=r_date,
                        reason=fake.sentence(nb_words=4),
                        return_reason_category=random.choice(["Damaged", "Wrong Item", "Quality Issue", "Sizing", "Changed Mind"]),
                        refund_amount=item.price,
                        item_condition=random.choice(["New", "Used", "Damaged"])
                    )
                    db.add(ret)
                    
    db.commit()
    print("Synthetic dataset generated and inserted into database.")
    db.close()

if __name__ == "__main__":
    generate_synthetic_data()
