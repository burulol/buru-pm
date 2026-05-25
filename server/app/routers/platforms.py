from fastapi import APIRouter, Depends

from app.database import get_db
from app.services import auth as auth_service
from app.models.entry import Entry
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

router = APIRouter()


@router.get("", status_code=200)
async def list_platforms(
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(auth_service.require_limited_access),
):

    user_id = payload.get("sub")

    result = await db.execute(
        select(Entry.id, Entry.platform, Entry.optional_name).where(
            Entry.user_id == user_id
        )
    )
    platforms = [
        {"id": row[0], "platform": row[1], "optional_name": row[2]} for row in result
    ]

    return {"platforms": platforms}
