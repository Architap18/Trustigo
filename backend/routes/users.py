from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User
from backend.schemas import UserOut, UserDetailOut

router = APIRouter()

@router.get("/users", response_model=list[UserOut])
def get_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/user/{user_id}", response_model=UserDetailOut)
def get_user_detail(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
