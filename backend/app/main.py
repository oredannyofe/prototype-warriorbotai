import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router
from .api.auth import auth_router
from .api.users import users_router
from .api.logs import logs_router
from .api.hcp import hcp_router
from .api.admin import admin_router
from .api.advocacy import advocacy_router
from .db import init_db
from .core.config import settings

try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except Exception:
    pass

app = FastAPI(title="WarriorBot API", version="0.2.0")

allowed = os.getenv("CORS_ALLOW_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True, "db": True}

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(logs_router)
app.include_router(hcp_router)
app.include_router(admin_router)
app.include_router(advocacy_router)
app.include_router(router)
