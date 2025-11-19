from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict, List

app = FastAPI(title="WarriorBot ML Scoring Service", version="0.1.0")

class Explanation(BaseModel):
    factor: str
    weight: float
    note: str

class ScoreResponse(BaseModel):
    risk_score: float
    explanations: List[Explanation]

@app.post("/score", response_model=ScoreResponse)
async def score(features: Dict[str, Any]):
    f = features or {}
    score = 0.0
    expl: list[Explanation] = []
    def add(cond: bool, w: float, factor: str, note: str):
        nonlocal score, expl
        if cond:
            score += w
            expl.append(Explanation(factor=factor, weight=w, note=note))
    add((f.get("pain_level", 0) >= 7), 0.35, "pain", "High pain reported")
    add((f.get("spo2", 100) < 94), 0.25, "spo2", "Low oxygen saturation")
    add((f.get("heart_rate", 60) > 110), 0.10, "tachycardia", "Elevated heart rate")
    add((f.get("hydration_ml", 2000) < 1500), 0.15, "hydration", "Low hydration")
    add((f.get("temperature_c") is not None and f.get("temperature_c") < 18), 0.05, "cold", "Cold ambient temp")
    add((f.get("relative_humidity") is not None and f.get("relative_humidity") > 85), 0.05, "humidity", "High humidity")
    score = max(0.0, min(1.0, score))
    return ScoreResponse(risk_score=round(score, 2), explanations=expl)
