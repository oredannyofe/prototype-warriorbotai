from fastapi import APIRouter, Depends, Header, HTTPException
from sqlmodel import Session, select
from ..deps import get_db
from ..models.tables import User, PatientAssignment, Log
from ..core.security import hash_password
from datetime import datetime, timedelta

admin_router = APIRouter(prefix="/admin", tags=["admin"])

@admin_router.post("/seed")
def seed(x_admin_secret: str | None = Header(default=None, alias="x-admin-secret"), db: Session = Depends(get_db)):
    import os
    admin_secret = os.getenv("ADMIN_SECRET")
    if not admin_secret or x_admin_secret != admin_secret:
        raise HTTPException(status_code=403, detail="Invalid admin secret")

    # Create HCP
    hcp = db.exec(select(User).where(User.email == "hcp@example.com")).first()
    if not hcp:
        hcp = User(email="hcp@example.com", full_name="Demo HCP", role="hcp", password_hash=hash_password("password123"))
        db.add(hcp)
        db.commit(); db.refresh(hcp)

    # Create Patient
    pat = db.exec(select(User).where(User.email == "patient@example.com")).first()
    if not pat:
        pat = User(email="patient@example.com", full_name="Demo Patient", role="patient", password_hash=hash_password("password123"))
        db.add(pat)
        db.commit(); db.refresh(pat)

    # Assign
    assigned = db.exec(select(PatientAssignment).where((PatientAssignment.hcp_id == hcp.id) & (PatientAssignment.patient_id == pat.id))).first()
    if not assigned:
        db.add(PatientAssignment(hcp_id=hcp.id, patient_id=pat.id))
        db.commit()

    # Seed logs (last 5 days)
    now = datetime.utcnow()
    for i in range(5):
        when = now - timedelta(days=i)
        log = Log(user_id=pat.id, pain_level=3+i%3, hydration_ml=1200, activity_level=4, heart_rate=90+i*2, spo2=96-i)
        log.created_at = when
        db.add(log)
    db.commit()

    return {"ok": True, "hcp": hcp.email, "patient": pat.email}
