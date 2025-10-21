from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session
from ..deps import get_db, get_current_user
from ..models.tables import Log, LogSecure, User
from ..models.schemas import LogEntry
from ..core.crypto import encrypt_string
import json

logs_router = APIRouter(prefix="", tags=["logs"])

@logs_router.post("/logs", status_code=201)
def create_log(payload: LogEntry, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    row = Log(
        user_id=user.id,
        pain_level=payload.pain_level,
        hydration_ml=payload.hydration_ml,
        activity_level=payload.activity_level,
        heart_rate=payload.heart_rate,
        spo2=payload.spo2,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    db.add(row)
    # encrypted copy
    enc_data = encrypt_string(json.dumps(payload.model_dump()))
    if enc_data:
        db.add(LogSecure(user_id=user.id, payload_encrypted=enc_data))
    db.commit()
    db.refresh(row)
    return {"id": row.id}
