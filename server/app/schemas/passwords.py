from pydantic import BaseModel
from typing import Optional


class PasswordCreateRequest(BaseModel):
    platform: str
    username: str
    password: str
