import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_transactions(num_records=1000, num_users=100):
    np.random.seed(42)
    random.seed(42)
    
    categories = ['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports']
    
    data = []
    
    # Let's create a few specific "fraud" users.
    # User 1: Serial Returner (returns everything)
    # User 2: Wardrober (buys and returns within 48 hours frequently)
    # User 3: High Value Abuser (returns laptops/expensive items)
    fraud_users = [1, 2, 3]
    
    for i in range(num_records):
        user_id = random.randint(1, num_users)
        order_id = f"ORD-{10000+i}"
        category = random.choice(categories)
        
        # Base price
        if category == 'Electronics':
            price = round(random.uniform(200, 2000), 2)
        elif category == 'Clothing':
            price = round(random.uniform(20, 200), 2)
        else:
            price = round(random.uniform(10, 500), 2)
            
        purchase_date = datetime.now() - timedelta(days=random.randint(10, 100))
        
        # Determine if returned
        return_date = ""
        
        if user_id == 1:
            # Serial returner (90% return rate)
            if random.random() < 0.9:
                return_date = purchase_date + timedelta(days=random.randint(5, 15))
        elif user_id == 2:
            # Wardrober (returns quickly)
            if random.random() < 0.7:
                # Returns within 1-2 days
                return_date = purchase_date + timedelta(days=random.randint(1, 2))
        elif user_id == 3:
            # High value abuser
            category = 'Electronics'
            price = round(random.uniform(1500, 3000), 2)
            if random.random() < 0.8:
                return_date = purchase_date + timedelta(days=random.randint(5, 20))
        else:
            # Normal user (10% return rate)
            if random.random() < 0.1:
                return_date = purchase_date + timedelta(days=random.randint(5, 30))
                
        data.append({
            'user_id': user_id,
            'order_id': order_id,
            'category': category,
            'price': price,
            'purchase_date': purchase_date.strftime('%Y-%m-%d %H:%M:%S'),
            'return_date': return_date.strftime('%Y-%m-%d %H:%M:%S') if return_date else ""
        })
        
    df = pd.DataFrame(data)
    df.to_csv('transactions.csv', index=False)
    print("Dataset generated: transactions.csv")

if __name__ == "__main__":
    generate_transactions()
