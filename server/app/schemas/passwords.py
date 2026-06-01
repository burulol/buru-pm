from pydantic import BaseModel, model_validator
from typing import Optional
import uuid


class PasswordCreateRequest(BaseModel):
    platform: str
    username: str
    password: Optional[str] = None
    iv: Optional[str] = None
    url: Optional[str] = None
    tag: Optional[str] = None


class PasswordPatchRequest(BaseModel):
    id: uuid.UUID
    platform: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    iv: Optional[str] = None
    url: Optional[str] = None
    tag: Optional[str] = None

    @model_validator(mode="after")
    def password_requires_iv(self):
        if (self.password is not None and self.iv is None) or (
            self.password is None and self.iv is not None
        ):
            raise ValueError("Password and IV must be provided together")
        return self
