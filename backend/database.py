import os
from unittest.mock import AsyncMock

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

class MockCollection:
    def __init__(self, name):
        self.name = name
        self.data = []
        
    async def insert_many(self, docs):
        self.data.extend(docs)
        return True
        
    async def insert_one(self, doc):
        self.data.append(doc)
        return True
        
    async def delete_many(self, query):
        self.data = []
        return dict(deleted_count=len(self.data))
        
    def find(self, query=None):
        filtered = self.data
        if query:
            filtered = [d for d in self.data if all(d.get(k) == v or (isinstance(v, dict) and "$in" in v and d.get(k) in v["$in"]) or (isinstance(v, dict) and "$gte" in v and d.get(k) >= v["$gte"]) for k, v in query.items())]
        class MockCursor:
            def __init__(self, data):
                self.data = data
            def sort(self, *args, **kwargs):
                return self
            def limit(self, *args, **kwargs):
                return self
            async def to_list(self, length=None):
                return self.data
        return MockCursor(filtered)
        
    async def find_one(self, query=None):
        filtered = self.data
        if query:
            filtered = [d for d in self.data if all(d.get(k) == v for k, v in query.items())]
        if filtered: return filtered[0]
        return None
        
    async def count_documents(self, query=None):
        filtered = self.data
        if query:
            filtered = [d for d in self.data if all(d.get(k) == v for k, v in query.items())]
        return len(filtered)

        
    async def update_one(self, filter_opts, update_opts, upsert=False):
        self.data.append(update_opts.get("$set", {}))
        return True

class MockDB:
    def __init__(self):
        self.users = MockCollection("users")
        self.transactions = MockCollection("transactions")
        self.items = MockCollection("items")
        self.returns = MockCollection("returns")
        self.behavior_scores = MockCollection("behavior_scores")
        self.fraud_alerts = MockCollection("fraud_alerts")

class MockClient:
    def __init__(self):
        self.trustigo = MockDB()
        
    def close(self):
        pass

class DataBase:
    client = None

db_state = DataBase()

async def get_db():
    yield db_state.client.trustigo
