from datetime import datetime, timedelta
from typing import Dict, Tuple

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..deps import get_db
from ..models.tables import Log, User

advocacy_router = APIRouter(prefix="/advocacy", tags=["advocacy"])

@advocacy_router.get("/aggregate")
def aggregate(days: int = 30, db: Session = Depends(get_db)):
    days = max(1, min(days, 90))
    since = datetime.utcnow() - timedelta(days=days)
    # Only include opt-in users
    optin_users = [
        u.id
        for u in db.exec(select(User).where(User.data_commons_opt_in.is_(True))).all()
    ]
    if not optin_users:
        return {"since": since.isoformat(), "days": days, "series": []}
    logs = db.exec(select(Log).where((Log.user_id.in_(optin_users)) & (Log.created_at >= since))).all()
    buckets: Dict[str, Dict[str, float]] = {}
    for l in logs:
        d = l.created_at.date().isoformat()
        b = buckets.setdefault(d, {"count": 0, "sum_pain": 0, "sum_hydration": 0})
        b["count"] += 1
        b["sum_pain"] += l.pain_level
        b["sum_hydration"] += l.hydration_ml
    series = []
    for day, b in sorted(buckets.items()):
        c = b["count"]
        series.append({
            "date": day,
            "count": c,
            "avg_pain": round(b["sum_pain"] / c, 2) if c else 0,
            "avg_hydration": round(b["sum_hydration"] / c, 1) if c else 0,
        })
    return {"since": since.isoformat(), "days": days, "series": series}

@advocacy_router.get("/geo")
def geo(days: int = 30, db: Session = Depends(get_db)):
    days = max(1, min(days, 90))
    since = datetime.utcnow() - timedelta(days=days)
    optin_users = [
        u.id
        for u in db.exec(select(User).where(User.data_commons_opt_in.is_(True))).all()
    ]
    if not optin_users:
        return []
    logs = db.exec(
        select(Log).where(
            (Log.user_id.in_(optin_users)) & (Log.created_at >= since) & (Log.latitude.is_not(None)) & (Log.longitude.is_not(None))
        )
    ).all()
    bins: Dict[Tuple[float, float], int] = {}
    for l in logs:
        lat = round(float(l.latitude), 1)
        lon = round(float(l.longitude), 1)
        key = (lat, lon)
        bins[key] = bins.get(key, 0) + 1
    return [{"lat": k[0], "lon": k[1], "count": v} for k, v in bins.items()]
