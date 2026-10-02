"""Auth and user Pydantic schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.enums import UserRole


class RegisterRequest(BaseModel):
    firstName: str = Field(min_length=1, max_length=80)
    lastName: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.STUDENT

    @field_validator("role")
    @classmethod
    def restrict_self_register_roles(cls, value: UserRole) -> UserRole:
        # Public registration may only create students or instructors.
        # Admins must be created by an existing admin (later phase).
        if value == UserRole.ADMIN:
            raise ValueError("Cannot self-register as ADMIN")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: EmailStr
    role: UserRole
    profileImage: str = ""
    bio: str = ""
    isActive: bool = True
    createdAt: datetime
    updatedAt: datetime


class AuthTokenResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    user: UserPublic


class UpdateProfileRequest(BaseModel):
    firstName: Optional[str] = Field(default=None, min_length=1, max_length=80)
    lastName: Optional[str] = Field(default=None, min_length=1, max_length=80)
    bio: Optional[str] = Field(default=None, max_length=1000)
    profileImage: Optional[str] = None
