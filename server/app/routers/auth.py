from fastapi import APIRouter, HTTPException
from app.schemas.auth import RegisterRequest
from app.services import auth as auth_service

router = APIRouter()

fake_db: dict = {}


@router.post("/register", status_code=201)
def register(body: RegisterRequest):
    if body.email in fake_db:
        raise HTTPException(status_code=400, detail="Email already registered")

    fake_db[body.email] = {
        "email": body.email,
        "auth_key_hash": auth_service.hash(body.auth_key),
        "salt": body.salt,
    }

    return {"message": "User registered successfully"}
