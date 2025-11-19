from fastapi import APIRouter, Depends
from sqlmodel import Session
from ..models.schemas import (
    RiskInput,
    RiskResponse,
    EducationItem,
    TherapySimInput,
    TherapySimResponse,
    HcpSummary,
    RiskForecastInput,
    RiskForecastResponse,
)
from ..services.risk import predict_risk, forecast_risk
from ..services.education import get_education
from ..services.therapy_sim import simulate_therapy
from ..deps import get_db, get_optional_user
from ..models.tables import Audit, User, PatientAssignment, TriageCase
from ..services.notify import send_push_to_expo
from sqlmodel import select
import json

router = APIRouter(tags=["core"])

@router.post("/risk/predict", response_model=RiskResponse)
async def risk_predict(payload: RiskInput, db: Session = Depends(get_db), user: User | None = Depends(get_optional_user)):
    resp = await predict_risk(payload)
    try:
        if user:
            db.add(Audit(user_id=user.id, action="risk_predict", data=json.dumps({"score": resp.risk_score, "level": resp.risk_level})))
            # High-risk actions: notify patient, open triage for assigned HCPs
            if resp.risk_level == "high":
                # patient push
                if user.expo_push_token:
                    # fire and forget
                    from fastapi import BackgroundTasks
                    # can't inject BackgroundTasks here easily; call directly (async inside ignored) best-effort
                    try:
                        import anyio
                        anyio.from_thread.run(send_push_to_expo, expo_push_token=user.expo_push_token, title="High risk alert", body=resp.message)
                    except Exception:
                        pass
                # triage cases for assigned HCPs
                hcp_assigns = db.exec(select(PatientAssignment).where(PatientAssignment.patient_id == user.id)).all()
                for a in hcp_assigns:
                    db.add(TriageCase(hcp_id=a.hcp_id, patient_id=user.id, score=resp.risk_score, level=resp.risk_level, message=resp.message))
                    # notify HCP if they use mobile app
                    try:
                        hcp = db.get(User, a.hcp_id)
                        if hcp and hcp.expo_push_token:
                            import anyio
                            anyio.from_thread.run(send_push_to_expo, expo_push_token=hcp.expo_push_token, title="Patient high risk", body=f"Patient {user.full_name or user.email}: {resp.message}")
                    except Exception:
                        pass
            db.commit()
    except Exception:
        pass
    return resp

@router.post("/risk/forecast", response_model=RiskForecastResponse)
async def risk_forecast(payload: RiskForecastInput):
    return await forecast_risk(payload)

@router.get("/education", response_model=list[EducationItem])
async def education(lang: str | None = None):
    return get_education(lang)

@router.post("/simulate/therapy", response_model=TherapySimResponse)
async def therapy_simulate(payload: TherapySimInput):
    return simulate_therapy(payload)

@router.get("/hcp/summary", response_model=HcpSummary)
async def hcp_summary():
    # Stubbed summary
    return HcpSummary(total_patients=42, high_risk=5, medium_risk=12, low_risk=25)
