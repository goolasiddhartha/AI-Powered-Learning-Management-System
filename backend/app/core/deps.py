"""FastAPI dependencies: current user + role checks."""

from typing import Callable, List

from fastapi import Depends, Header
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.core.security import decode_access_token
from app.models.enums import UserRole
from app.utils.helpers import parse_object_id
from app.utils.responses import ApiError


async def get_db() -> AsyncIOMotorDatabase:
    return get_database()


def _extract_bearer(authorization: str | None) -> str:
    if not authorization:
        raise ApiError("Authentication required", status_code=401)
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise ApiError("Invalid authorization header", status_code=401)
    return parts[1]


async def get_current_user(
    authorization: str | None = Header(default=None),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    token = _extract_bearer(authorization)
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise ApiError(str(exc), status_code=401) from exc

    user_id = payload.get("sub")
    if not user_id:
        raise ApiError("Invalid token payload", status_code=401)

    user = await db.users.find_one({"_id": parse_object_id(user_id, "user id")})
    if not user:
        raise ApiError("User not found", status_code=401)
    if not user.get("isActive", True):
        raise ApiError("Account is deactivated", status_code=403)

    user["id"] = str(user["_id"])
    return user


async def get_current_user_optional(
    authorization: str | None = Header(default=None),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict | None:
    if not authorization:
        return None
    try:
        return await get_current_user(authorization=authorization, db=db)
    except ApiError:
        return None


def require_role(*allowed_roles: str) -> Callable:
    """Dependency factory: require_role('ADMIN') or require_role('INSTRUCTOR', 'ADMIN')."""

    allowed = {role.upper() for role in allowed_roles}

    async def _checker(current_user: dict = Depends(get_current_user)) -> dict:
        role = str(current_user.get("role", "")).upper()
        if role not in allowed:
            raise ApiError(
                "You are not authorized to perform this action",
                status_code=403,
            )
        return current_user

    return _checker


RequireAdmin = Depends(require_role(UserRole.ADMIN.value))
RequireInstructor = Depends(require_role(UserRole.INSTRUCTOR.value, UserRole.ADMIN.value))
RequireStudent = Depends(require_role(UserRole.STUDENT.value))
RequireAnyAuthenticated = Depends(get_current_user)
