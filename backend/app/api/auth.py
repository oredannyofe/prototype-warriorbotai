from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select
from ..core.security import hash_password, verify_password, create_access_token
from ..models.tables import User, Audit
from ..deps import get_db
import json

class RegisterPayload(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None

class LoginPayload(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/register", response_model=TokenResponse)
def register(payload: RegisterPayload, db: Session = Depends(get_db)):
    existing = db.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=payload.email, full_name=payload.full_name or None, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    # audit
    db.add(Audit(user_id=user.id, action="register", data=json.dumps({"role": user.role})))
    db.commit()
    token = create_access_token(user.email)
    return TokenResponse(access_token=token)

class RegisterHcpPayload(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None

from fastapi import Header

@auth_router.post("/register-hcp", response_model=TokenResponse)
def register_hcp(payload: RegisterHcpPayload, x_admin_secret: str | None = Header(default=None, alias="x-admin-secret"), db: Session = Depends(get_db)):
    import os
    admin_secret = os.getenv("ADMIN_SECRET")
    if not admin_secret:
        raise HTTPException(status_code=500, detail="Admin not configured")
    if not x_admin_secret or x_admin_secret != admin_secret:
        raise HTTPException(status_code=403, detail="Invalid admin secret")
    existing = db.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=payload.email, full_name=payload.full_name or None, role="hcp", password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.email)
    return TokenResponse(access_token=token)

@auth_router.post("/login", response_model=TokenResponse)
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    user = db.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    # audit
    db.add(Audit(user_id=user.id, action="login", data=json.dumps({"role": user.role})))
    db.commit()
    token = create_access_token(user.email)
    return TokenResponse(access_token=token)
