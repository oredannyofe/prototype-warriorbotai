from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlmodel import Session
from ..deps import get_db, get_current_user
from ..models.tables import User

class PushTokenPayload(BaseModel):
    expo_push_token: str

class SettingsPayload(BaseModel):
    share_with_hcps: bool | None = None
    data_commons_opt_in: bool | None = None

users_router = APIRouter(prefix="/users", tags=["users"])

@users_router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}

@users_router.get("/settings")
def get_settings(user: User = Depends(get_current_user)):
    return {"share_with_hcps": user.share_with_hcps, "data_commons_opt_in": user.data_commons_opt_in}

@users_router.post("/settings")
def update_settings(payload: SettingsPayload, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if payload.share_with_hcps is not None:
        user.share_with_hcps = payload.share_with_hcps
    if payload.data_commons_opt_in is not None:
        user.data_commons_opt_in = payload.data_commons_opt_in
    db.add(user)
    db.commit()
    return {"ok": True}

@users_router.post("/push-token")
def save_push_token(payload: PushTokenPayload, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    user.expo_push_token = payload.expo_push_token
    db.add(user)
    db.commit()
    return {"ok": True}

@users_router.post("/notify/test")
def test_notify(background_tasks: BackgroundTasks, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.expo_push_token:
        raise HTTPException(status_code=400, detail="No push token saved")
    background_tasks.add_task(send_push_to_expo, user.expo_push_token, "WarriorBot", "This is a test notification")
    return {"ok": True}
