import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

class DataBase:
    client = None

db_state = DataBase()

async def get_db():
    yield db_state.client.trustigo
