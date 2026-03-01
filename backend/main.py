import os
from dotenv import load_dotenv
load_dotenv()  # This must happen before we initialize other config variables

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from backend.database import db_state
from backend.routes import users, transactions, fraud

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to Real MongoDB (Local or Atlas)
    db_state.client = AsyncIOMotorClient(MONGO_URI)
    yield
    # Shutdown: Close connection
    db_state.client.close()


app = FastAPI(
    title="Trustigo API V2", 
    description="React + FastAPI E-commerce Returns Fraud Detection Dashboard",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(users.router, tags=["Users"])
app.include_router(transactions.router, tags=["Transactions"])
app.include_router(fraud.router, tags=["Fraud & Machine Learning"])

@app.get("/")
def read_root():
    return {"status": "Trustigo Backend API is Running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
