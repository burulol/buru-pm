from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.services import auth as auth_service
from app.models.entry import Entry
from app.schemas.passwords import PasswordCreateRequest, PasswordPatchRequest
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
        url=body.url,
        tag=body.tag,
    )

    db.add(new_password)
    await db.commit()

    return {}


@router.get("/{id}", status_code=200)
async def get_password(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(auth_service.require_full_access),
):

    user_id = payload["sub"]

    result = await db.execute(
        select(Entry).where(
            and_(
                Entry.user_id == uuid.UUID(user_id),
                Entry.id == id,
            )
        )
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=404, detail="Password not found")

    return {"password": entry.password, "iv": entry.iv}


@router.patch("", status_code=204)
async def update_password(
    body: PasswordPatchRequest,
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(auth_service.require_full_access),
):

    user_id = payload["sub"]

    result = await db.execute(
        select(Entry).where(
            and_(
                Entry.user_id == uuid.UUID(user_id),
                Entry.id == body.id,
            )
        )
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=404, detail="Password not found")

    if body.platform is not None or body.username is not None:
        checked_platform = (
            body.platform if body.platform is not None else entry.platform
        )
        checked_username = (
            body.username if body.username is not None else entry.username
        )
        check_platform = await db.execute(
            select(Entry).where(
                and_(
                    Entry.user_id == uuid.UUID(user_id),
                    Entry.platform == checked_platform,
                    Entry.username == checked_username,
                    Entry.id != body.id,
                )
            )
        )
        existing_entry = check_platform.scalar_one_or_none()

        if existing_entry:
            raise HTTPException(
                status_code=400,
                detail="Another entry with this platform and username already exists",
            )

    if body.platform is not None:
        entry.platform = body.platform
    if body.username is not None:
        entry.username = body.username

    if body.password is not None and body.iv is not None:
        entry.password = body.password
        entry.iv = body.iv
    if body.url is not None:
        entry.url = body.url
    if body.tag is not None:
        entry.tag = body.tag

    await db.commit()


@router.delete("/{id}", status_code=204)
async def delete_password(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(auth_service.require_full_access),
):

    user_id = payload["sub"]

    result = await db.execute(
        select(Entry).where(
            and_(
                Entry.user_id == uuid.UUID(user_id),
                Entry.id == id,
            )
        )
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=404, detail="Password not found")

    await db.delete(entry)
    await db.commit()
