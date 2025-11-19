from ..models.schemas import RiskInput, RiskResponse, RiskExplanation, RiskForecastInput, RiskForecastDay, RiskForecastResponse
from .weather import get_environmental_factors, get_forecast_summary
import httpx

import os

async def call_ml_service(features: dict):
    try:
        url = os.getenv("ML_SERVICE_URL", "http://127.0.0.1:7000") + "/score"
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.post(url, json=features)
            r.raise_for_status()
            return r.json()
    except Exception:
        return None

async def _heuristic_score(inp: RiskInput, env: dict) -> tuple[float, list[RiskExplanation]]:
    score = 0.0
    reasons: list[RiskExplanation] = []
    if inp.pain_level >= 7:
        score += 0.35; reasons.append(RiskExplanation(factor="pain", weight=0.35, note="High pain reported"))
    if (inp.spo2 or 100) < 94:
        score += 0.25; reasons.append(RiskExplanation(factor="spo2", weight=0.25, note="Low oxygen saturation"))
    if (inp.heart_rate or 60) > 110:
        score += 0.1; reasons.append(RiskExplanation(factor="tachycardia", weight=0.10, note="Elevated heart rate"))
    if (inp.hydration_ml) < 1500:
        score += 0.15; reasons.append(RiskExplanation(factor="hydration", weight=0.15, note="Low hydration"))
    if env.get("temperature_c") is not None and env.get("temperature_c") < 18:
        score += 0.05; reasons.append(RiskExplanation(factor="cold", weight=0.05, note="Cold ambient temp"))
    if env.get("relative_humidity") is not None and env.get("relative_humidity") > 85:
        score += 0.05; reasons.append(RiskExplanation(factor="humidity", weight=0.05, note="High humidity"))
    score = max(0.0, min(1.0, score))
    return score, reasons

async def predict_risk(inp: RiskInput) -> RiskResponse:
    env = await get_environmental_factors(inp.latitude, inp.longitude)

    features = {
        "pain_level": inp.pain_level,
        "hydration_ml": inp.hydration_ml,
        "activity_level": inp.activity_level,
        "heart_rate": inp.heart_rate or 0,
        "spo2": inp.spo2 or 0,
        "temperature_c": env.get("temperature_c") or 0.0,
        "relative_humidity": env.get("relative_humidity") or 0.0,
        "pressure_hpa": env.get("pressure_hpa") or 0.0,
    }

    ml = await call_ml_service(features)
    if ml and "risk_score" in ml:
        score = float(ml["risk_score"])  # 0..1
        reasons = [RiskExplanation(**e) for e in ml.get("explanations", [])]
    else:
        score, reasons = await _heuristic_score(inp, env)

    if score < 0.33:
        level = "low"; message = "Risk low—maintain routine hydration and rest."
        steps = ["Drink water", "Light stretching", "Log symptoms daily"]
    elif score < 0.66:
        level = "medium"; message = "Risk rising—hydrate, reduce exertion, monitor pain."
        steps = ["Increase fluids", "Avoid temperature extremes", "Prepare rescue meds per plan"]
    else:
        level = "high"; message = "High risk—rest, hydrate, and consider contacting your clinician."
        steps = ["Rest now", "Warmth and hydration", "If pain escalates, call care team / ER"]

    return RiskResponse(
        risk_score=round(score, 2),
        risk_level=level,
        message=message,
        next_steps=steps,
        explanations=reasons,
    )


async def forecast_risk(inp: RiskForecastInput) -> RiskForecastResponse:
    # get per-day environmental summary
    days = inp.days or 5
    lat = inp.latitude or 0.0
    lon = inp.longitude or 0.0
    env_days = await get_forecast_summary(lat, lon, days)
    items: list[RiskForecastDay] = []
    for e in env_days:
        env = {"temperature_c": e.get("temperature_c"), "relative_humidity": e.get("relative_humidity"), "pressure_hpa": e.get("pressure_hpa")}
        score, _ = await _heuristic_score(inp, env)
        if score < 0.33:
            level = "low"; message = "Low risk forecast—maintain routine."
        elif score < 0.66:
            level = "medium"; message = "Moderate risk—hydrate and avoid extremes."
        else:
            level = "high"; message = "High risk—plan rest and clinician check-ins."
        items.append(RiskForecastDay(date=e.get("date"), risk_score=round(score,2), risk_level=level, message=message))
    return RiskForecastResponse(days=items)
