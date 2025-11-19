from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..deps import get_db, get_current_hcp
from ..models.tables import User, Log, PatientAssignment, TriageCase
from datetime import datetime, timedelta

hcp_router = APIRouter(prefix="/hcp", tags=["hcp"])

@hcp_router.get("/stats")
def stats(db: Session = Depends(get_db), hcp=Depends(get_current_hcp)):
    # Patients assigned to this HCP
    pa_ids = [p.patient_id for p in db.exec(select(PatientAssignment).where(PatientAssignment.hcp_id == hcp.id)).all()]
    total_patients = len(pa_ids)
    since = datetime.utcnow() - timedelta(days=7)
    recent_logs = len(db.exec(select(Log).where((Log.created_at >= since) & (Log.user_id.in_(pa_ids)))).all()) if pa_ids else 0
    # Risk buckets by simple heuristic on latest log per user in panel
    patients = db.exec(select(User).where((User.id.in_(pa_ids)) & (User.share_with_hcps == True))).all() if pa_ids else []
    high = med = low = 0
    for u in patients:
        last = db.exec(select(Log).where(Log.user_id == u.id).order_by(Log.created_at.desc())).first()
        if not last:
            continue
        score = 0.0
        if last.pain_level >= 7:
            score += 0.35
        if (last.spo2 or 100) < 94:
            score += 0.25
        if (last.heart_rate or 60) > 110:
            score += 0.10
        if last.hydration_ml < 1500:
            score += 0.15
        if score < 0.33:
            low += 1
        elif score < 0.66:
            med += 1
        else:
            high += 1
    open_cases = len(db.exec(select(TriageCase).where((TriageCase.hcp_id == hcp.id) & (TriageCase.status == "open"))).all())
    return {"total_patients": total_patients, "recent_logs": recent_logs, "open_cases": open_cases, "risk": {"low": low, "medium": med, "high": high}}

@hcp_router.get("/patients")
def list_patients(q: str | None = None, limit: int = 50, offset: int = 0, db: Session = Depends(get_db), hcp=Depends(get_current_hcp)):
    pa_ids = [p.patient_id for p in db.exec(select(PatientAssignment).where(PatientAssignment.hcp_id == hcp.id)).all()]
    if not pa_ids:
        return {"total": 0, "items": []}
    stmt = select(User).where((User.id.in_(pa_ids)) & (User.share_with_hcps == True))
    if q:
        stmt = stmt.where((User.email.contains(q)) | (User.full_name.contains(q)))
    total = len(db.exec(stmt).all())
    rows = db.exec(stmt.offset(offset).limit(limit)).all()
    items = []
    for u in rows:
        last = db.exec(select(Log).where(Log.user_id == u.id).order_by(Log.created_at.desc())).first()
        last_risk = None
        if last:
            score = 0.0
            if last.pain_level >= 7:
                score += 0.35
            if (last.spo2 or 100) < 94:
                score += 0.25
            if (last.heart_rate or 60) > 110:
                score += 0.10
            if last.hydration_ml < 1500:
                score += 0.15
            level = "high" if score >= 0.66 else ("medium" if score >= 0.33 else "low")
            last_risk = {"score": round(min(1.0, score), 2), "level": level}
        items.append({"id": u.id, "email": u.email, "full_name": u.full_name, "last_log_at": last.created_at.isoformat() if last else None, "last_risk": last_risk})
    return {"total": total, "items": items}

@hcp_router.get("/find-patient")
def find_patient(q: str, db: Session = Depends(get_db), hcp=Depends(get_current_hcp)):
    # Search patients who allow sharing
    stmt = select(User).where((User.role == "patient") & (User.share_with_hcps == True) & ((User.email.contains(q)) | (User.full_name.contains(q))))
    rows = db.exec(stmt.limit(20)).all()
    return [{"id": u.id, "email": u.email, "full_name": u.full_name} for u in rows]

@hcp_router.post("/assign")
def assign_patient(patient_id: int, db: Session = Depends(get_db), hcp=Depends(get_current_hcp)):
    # Avoid dup
    existing = db.exec(select(PatientAssignment).where((PatientAssignment.hcp_id == hcp.id) & (PatientAssignment.patient_id == patient_id))).first()
    if existing:
        return {"ok": True}
    db.add(PatientAssignment(hcp_id=hcp.id, patient_id=patient_id))
    db.commit()
    return {"ok": True}

@hcp_router.get("/triage/open")
def triage_open(db: Session = Depends(get_db), hcp=Depends(get_current_hcp)):
    cases = db.exec(select(TriageCase).where((TriageCase.hcp_id == hcp.id) & (TriageCase.status == "open")).order_by(TriageCase.created_at.desc()))
    return [
        {"id": c.id, "patient_id": c.patient_id, "score": c.score, "level": c.level, "message": c.message, "created_at": c.created_at.isoformat()} for c in cases
    ]

@hcp_router.post("/triage/{case_id}/resolve")
def triage_resolve(case_id: int, db: Session = Depends(get_db), hcp=Depends(get_current_hcp)):
    c = db.get(TriageCase, case_id)
    if not c or c.hcp_id != hcp.id:
        raise HTTPException(status_code=404, detail="Case not found")
    c.status = "resolved"
    db.add(c)
    db.commit()
    return {"ok": True}

@hcp_router.get("/patient/{user_id}/logs")
def patient_logs(user_id: int, limit: int = 100, db: Session = Depends(get_db), hcp=Depends(get_current_hcp)):
    # Ensure assignment exists
    assigned = db.exec(select(PatientAssignment).where((PatientAssignment.hcp_id == hcp.id) & (PatientAssignment.patient_id == user_id))).first()
    if not assigned:
        raise HTTPException(status_code=403, detail="Not assigned to this patient")
    user = db.get(User, user_id)
    if not user or user.role != "patient":
        raise HTTPException(status_code=404, detail="Patient not found")
    if not user.share_with_hcps:
        raise HTTPException(status_code=403, detail="Patient has disabled sharing")
    logs = db.exec(select(Log).where(Log.user_id == user_id).order_by(Log.created_at.desc()).limit(limit)).all()
    return {"patient": {"id": user.id, "email": user.email, "full_name": user.full_name}, "logs": [l.dict() for l in logs]}
