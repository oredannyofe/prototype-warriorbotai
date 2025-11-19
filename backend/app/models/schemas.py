from pydantic import BaseModel, Field
from typing import Optional, List

class RiskInput(BaseModel):
    pain_level: int = Field(ge=0, le=10)
    hydration_ml: int = Field(ge=0)
    activity_level: int = Field(ge=0, le=10)
    heart_rate: Optional[int] = Field(default=None, ge=30, le=220)
    spo2: Optional[int] = Field(default=None, ge=50, le=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class RiskExplanation(BaseModel):
    factor: str
    weight: float
    note: str

class RiskResponse(BaseModel):
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_level: str
    message: str
    next_steps: List[str]
    explanations: List[RiskExplanation] = []

class RiskForecastInput(RiskInput):
    days: int = Field(default=5, ge=1, le=7)

class RiskForecastDay(BaseModel):
    date: str
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_level: str
    message: str

class RiskForecastResponse(BaseModel):
    days: List[RiskForecastDay]

class LogEntry(BaseModel):
    pain_level: int
    hydration_ml: int
    activity_level: int
    heart_rate: Optional[int] = None
    spo2: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class EducationItem(BaseModel):
    id: str
    title: str
    language: str
    audience: str
    body: str

class TherapySimInput(BaseModel):
    genotype: str
    age: int
    baseline_crises_per_year: float
    therapy: str  # "crispr" | "voxelotor" | "hydroxyurea"

class TherapySimResponse(BaseModel):
    expected_crisis_reduction_pct: float
    side_effect_risk_pct: float
    projected_life_expectancy_gain_years: float
    rationale: str

class HcpSummary(BaseModel):
    total_patients: int
    high_risk: int
    medium_risk: int
    low_risk: int
