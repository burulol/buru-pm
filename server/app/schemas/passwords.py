from pydantic import BaseModel


class PasswordCreateRequest(BaseModel):
    platform: str
    username: str
    password: str


class PasswordDeleteRequest(BaseModel):
    platform: str
    username: str
