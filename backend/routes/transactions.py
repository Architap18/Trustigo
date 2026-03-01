from fastapi import APIRouter, Depends
from backend.database import get_db
from backend.models import Transaction
from backend.schemas import TransactionOut
import pymongo

router = APIRouter()

@router.get("/transactions", response_model=list[TransactionOut])
async def get_recent_transactions(skip: int = 0, limit: int = 100, db = Depends(get_db)):
    # Sort descending by date using PyMongo sorting convention (-1)
    txns_cursor = db.transactions.find().sort("date", pymongo.DESCENDING).skip(skip).limit(limit)
    txns = await txns_cursor.to_list(length=limit)
    return txns
