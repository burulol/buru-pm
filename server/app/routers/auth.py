from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from app.schemas.auth import RegisterRequest, LoginRequest, SaltRequest
from app.services import auth as auth_service
from app.models.user import User
from app.models.session import UserSession as Session
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db

router = APIRouter()

fake_user_db: dict = {}


@router.post("/register", status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(User).where(User.email == body.email))
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=body.email,
        auth_key_hash=auth_service.hash(body.auth_key),
        salt=body.salt,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {"message": "User registered successfully"}


@router.post("/login", status_code=200)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not auth_service.verify(body.auth_key, user.auth_key_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    full_access_token = auth_service.create_full_access_token(user_id=user.id.hex)
    limited_access_token = auth_service.create_limited_access_token(user_id=user.id.hex)

    result = await db.execute(
        select(Session).where(
            Session.user_id == user.id
            and Session.expires_at > datetime.now(timezone.utc)
            and Session.device_name == body.device
        )
    )
    session = result.scalar_one_or_none()

    if session:
        session.full_access_token_hash = auth_service.hash(full_access_token)
        session.expires_at = datetime.now(timezone.utc) + auth_service.timedelta(
            days=auth_service.settings.FULL_ACCESS_TOKEN_EXPIRE_DAYS
        )

    return {
        "message": "User logged in successfully",
        "full_access_token": full_access_token,
        "limited_access_token": limited_access_token,
    }


@router.post("/salt", status_code=200)
def get_salt(body: SaltRequest):
    if body.email not in fake_user_db:
        return {"salt": auth_service.generate_fake_salt(email=body.email)}

    return {"salt": fake_user_db[body.email]["salt"]}
