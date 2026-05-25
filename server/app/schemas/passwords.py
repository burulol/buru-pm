from pydantic import BaseModel


class PasswordCreateRequest(BaseModel):
    platform: str
    username: str
    password: str
