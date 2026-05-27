from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    auth_key: str


class LoginRequest(BaseModel):
    email: EmailStr
    auth_key: str
    device: str


class SaltRequest(BaseModel):
    email: EmailStr


class EmailUpdateRequest(BaseModel):
    new_email: EmailStr


class DeleteSessionRequest(BaseModel):
    device: str
