from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from .db import get_session
from .core.security import decode_token
from .models.tables import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db(session: Session = Depends(get_session)):
    return session


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    email = payload["sub"]
    user = db.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_optional_user(token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User | None:
    if not token:
        return None
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        return None
    user = db.exec(select(User).where(User.email == payload["sub"]).limit(1)).first()
    return user


def get_current_hcp(user: User = Depends(get_current_user)) -> User:
    if user.role != "hcp":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="HCP role required")
    return user
