from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from backend.models import User
from backend.schemas import UserOut, UserDetailOut

router = APIRouter()

@router.get("/users", response_model=list[UserOut])
async def get_all_users(skip: int = 0, limit: int = 100, db = Depends(get_db)):
    users_cursor = db.users.find().skip(skip).limit(limit)
    users = await users_cursor.to_list(length=limit)
    return users

@router.get("/user/{user_id}", response_model=UserDetailOut)
async def get_user_detail(user_id: int, db = Depends(get_db)):
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Manually fetch relations since we aren't using an ORM anymore
    bs = await db.behavior_scores.find_one({"user_id": user_id})
    user['behavior_score'] = bs if bs else None
    
    alerts = await db.fraud_alerts.find({"user_id": user_id}).to_list(length=None)
    user['fraud_alerts'] = alerts
    
    return user
