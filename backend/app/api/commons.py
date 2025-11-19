from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from ..deps import get_db
from ..models.tables import User, Log, DataCommit
from hashlib import sha256
from datetime import datetime, timedelta
import json

commons_router = APIRouter(prefix="/commons", tags=["commons"])

@commons_router.get("/export")
def export(days: int = 30, db: Session = Depends(get_db)):
    days = max(1, min(days, 90))
    since = datetime.utcnow() - timedelta(days=days)
    # Only opt-in users; coarse geo to protect privacy
    uids = [u.id for u in db.exec(select(User).where(User.data_commons_opt_in == True)).all()]
    if not uids:
        return {"since": since.isoformat(), "count": 0, "items": []}
    logs = db.exec(select(Log).where((Log.user_id.in_(uids)) & (Log.created_at >= since))).all()
    items = []
    for l in logs:
        items.append({
            "date": l.created_at.date().isoformat(),
            "lat": round(float(l.latitude), 1) if l.latitude is not None else None,
            "lon": round(float(l.longitude), 1) if l.longitude is not None else None,
            "pain": l.pain_level,
            "hydration_ml": l.hydration_ml,
            "activity": l.activity_level,
            "hr": l.heart_rate,
            "spo2": l.spo2,
        })
    return {"since": since.isoformat(), "count": len(items), "items": items}

@commons_router.post("/commit")
def commit(days: int = 30, note: str | None = None, db: Session = Depends(get_db)):
    payload = export(days, db)
    # Canonical JSON without whitespace to hash deterministically
    blob = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode()
    root = sha256(blob).hexdigest()
    db.add(DataCommit(root_hash=root, payload_size=len(blob), note=note))
    db.commit()
    return {"root_hash": root, "bytes": len(blob)}