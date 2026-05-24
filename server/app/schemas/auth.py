from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    auth_key: str
    salt: str


class LoginRequest(BaseModel):
    email: EmailStr
    auth_key: str
    device: str
