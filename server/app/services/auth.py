from jose import jwt
from datetime import datetime, timedelta, timezone
from app.config import settings
import hashlib


def hash(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def verify(plain: str, hashed: str) -> bool:
    return hashlib.sha256(plain.encode()).hexdigest() == hashed


def create_full_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc)
        + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "scope": "full",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def create_limited_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc)
        + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        "scope": "limited",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
