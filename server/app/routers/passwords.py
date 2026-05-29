from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.services import auth as auth_service
from app.models.entry import Entry
from app.schemas.passwords import PasswordCreateRequest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, select
import uuid


router = APIRouter()


@router.post("", status_code=201)
async def create_password(
    body: PasswordCreateRequest,
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(auth_service.require_full_access),
):

    user_id = payload["sub"]

    result = await db.execute(
        select(Entry).where(
            and_(
                Entry.user_id == uuid.UUID(user_id),
                Entry.platform == body.platform,
                Entry.username == body.username,
            )
        )
    )
    existing_entry = result.scalar_one_or_none()

    if existing_entry:
        raise HTTPException(
            status_code=400,
            detail="Entry for this platform and username already exists, do an update instead",
        )

    new_password = Entry(
        user_id=uuid.UUID(user_id),
        platform=body.platform,
        username=body.username,
        password=body.password,
        iv=body.iv,
    )

    db.add(new_password)
    await db.commit()

    return {}


@router.get("/{platform}/{username}", status_code=200)
async def get_password(
    platform: str,
    username: str,
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(auth_service.require_full_access),
):

    user_id = payload["sub"]

    result = await db.execute(
        select(Entry).where(
            and_(
                Entry.user_id == uuid.UUID(user_id),
                Entry.platform == platform,
                Entry.username == username,
            )
        )
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=404, detail="Password not found")

    return {"password": entry.password, "iv": entry.iv}


@router.patch("", status_code=204)
async def update_password(
    body: PasswordCreateRequest,
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(auth_service.require_full_access),
):

    user_id = payload["sub"]

    result = await db.execute(
        select(Entry).where(
            and_(
                Entry.user_id == uuid.UUID(user_id),
                Entry.platform == body.platform,
                Entry.username == body.username,
            )
        )
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=404, detail="Password not found")

    entry.password = body.password
    entry.iv = body.iv
    await db.commit()


@router.delete("/{platform}/{username}", status_code=204)
async def delete_password(
    platform: str,
    username: str,
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(auth_service.require_full_access),
):

    user_id = payload["sub"]

    result = await db.execute(
        select(Entry).where(
            and_(
                Entry.user_id == uuid.UUID(user_id),
                Entry.platform == platform,
                Entry.username == username,
            )
        )
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=404, detail="Password not found")

    await db.delete(entry)
    await db.commit()
