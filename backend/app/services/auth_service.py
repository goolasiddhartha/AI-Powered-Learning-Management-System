"""Authentication business logic."""

from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import serialize_user
from app.schemas.auth import AuthTokenResponse, LoginRequest, RegisterRequest
from app.utils.responses import ApiError


class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def register(self, payload: RegisterRequest) -> AuthTokenResponse:
        existing = await self.db.users.find_one({"email": payload.email.lower()})
        if existing:
            raise ApiError("Email is already registered", status_code=409)

        now = datetime.now(timezone.utc)
        doc = {
            "firstName": payload.firstName.strip(),
            "lastName": payload.lastName.strip(),
            "email": payload.email.lower(),
            "passwordHash": hash_password(payload.password),
            "role": payload.role.value,
            "profileImage": "",
            "bio": "",
            "isActive": True,
            "createdAt": now,
            "updatedAt": now,
        }
        result = await self.db.users.insert_one(doc)
        doc["_id"] = result.inserted_id

        token = create_access_token(str(result.inserted_id), doc["role"])
        return AuthTokenResponse(accessToken=token, user=serialize_user(doc))

    async def login(self, payload: LoginRequest) -> AuthTokenResponse:
        user = await self.db.users.find_one({"email": payload.email.lower()})
        if not user or not verify_password(payload.password, user.get("passwordHash", "")):
            raise ApiError("Invalid email or password", status_code=401)
        if not user.get("isActive", True):
            raise ApiError("Account is deactivated", status_code=403)

        token = create_access_token(str(user["_id"]), user["role"])
        return AuthTokenResponse(accessToken=token, user=serialize_user(user))
