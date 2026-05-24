from fastapi import APIRouter, HTTPException
from app.schemas.auth import RegisterRequest, LoginRequest, SaltRequest
from app.services import auth as auth_service

router = APIRouter()

fake_user_db: dict = {}


@router.post("/register", status_code=201)
def register(body: RegisterRequest):
    if body.email in fake_user_db:
        raise HTTPException(status_code=400, detail="Email already registered")

    fake_user_db[body.email] = {
        "email": body.email,
        "auth_key_hash": auth_service.hash(body.auth_key),
        "salt": body.salt,
        "sessions": {},
    }

    return {"message": "User registered successfully"}


@router.post("/login", status_code=200)
def login(body: LoginRequest):
    if body.email not in fake_user_db:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    user = fake_user_db[body.email]
    if not auth_service.verify(body.auth_key, user["auth_key_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    full_access_token = auth_service.create_full_access_token(user_id=body.email)
    limited_access_token = auth_service.create_limited_access_token(user_id=body.email)

    fake_user_db[body.email]["sessions"][body.device] = {
        "full_access_token_hash": auth_service.hash(full_access_token),
    }

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
