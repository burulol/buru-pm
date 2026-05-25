from jose import JWTError, jwt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from sqlalchemy import and_, select
from app.database import get_db
from app.models.session import UserSession
import hmac
import hashlib


def hash(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def verify(plain: str, hashed: str) -> bool:
    return hashlib.sha256(plain.encode()).hexdigest() == hashed


def create_full_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc)
        + timedelta(days=settings.FULL_ACCESS_TOKEN_EXPIRE_DAYS),
        "scope": "full",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def create_limited_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc)
        + timedelta(days=settings.LIMITED_ACCESS_TOKEN_EXPIRE_DAYS),
        "scope": "limited",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


bearer_scheme = HTTPBearer()


def require_limited_access(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    token = credentials.credentials
    payload = decode_token(token)

    if payload.get("scope") not in ("full", "limited"):
        raise HTTPException(status_code=403, detail="Authentication required")

    return payload


async def require_full_access(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> dict:

    token = credentials.credentials
    payload = decode_token(token)

    if payload.get("scope") != "full":
        raise HTTPException(status_code=403, detail="Full access required")

    # check token exists in DB (not logged out)
    token_hash = hash(token)
    result = await db.execute(
        select(UserSession).where(
            and_(
                UserSession.full_access_token_hash == token_hash,
                UserSession.expires_at > datetime.now(timezone.utc),
            )
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=401, detail="Session expired or logged out")

    return payload


def generate_fake_salt(email: str) -> str:
    return hmac.new(
        settings.SECRET_KEY.encode(), email.encode(), hashlib.sha256
    ).hexdigest()
