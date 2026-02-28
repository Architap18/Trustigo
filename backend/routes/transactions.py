from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Transaction
from backend.schemas import TransactionOut

router = APIRouter()

@router.get("/transactions", response_model=list[TransactionOut])
def get_recent_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Sort descending by date
    txns = db.query(Transaction).order_by(Transaction.date.desc()).offset(skip).limit(limit).all()
    return txns
