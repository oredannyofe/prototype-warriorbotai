from typing import Generator
from sqlmodel import SQLModel, Session, create_engine
from .core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=False)

# Import models for table creation
from .models.tables import User, Log, LogSecure, Audit, PatientAssignment, TriageCase  # noqa: E402,F401

def init_db():
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
