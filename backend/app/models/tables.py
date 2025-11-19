from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    role: str = Field(default="patient", index=True)  # 'patient' | 'hcp'
    full_name: Optional[str] = None
    share_with_hcps: bool = Field(default=True)
    data_commons_opt_in: bool = Field(default=False)
    expo_push_token: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    logs: list["Log"] = Relationship(back_populates="user")

class Log(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    pain_level: int
    hydration_ml: int
    activity_level: int
    heart_rate: Optional[int] = None
    spo2: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional[User] = Relationship(back_populates="logs")

class LogSecure(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    payload_encrypted: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PatientAssignment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hcp_id: int = Field(foreign_key="user.id")
    patient_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TriageCase(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hcp_id: int = Field(foreign_key="user.id")
    patient_id: int = Field(foreign_key="user.id")
    score: float
    level: str
    message: str
    status: str = Field(default="open")  # open|resolved
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Audit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    action: str
    data: Optional[str] = None  # JSON string payload
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DataCommit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    root_hash: str  # sha256 of exported payload for transparency (prototype for blockchain)
    payload_size: int
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
