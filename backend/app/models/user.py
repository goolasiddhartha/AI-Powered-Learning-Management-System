"""User document helpers."""

from datetime import datetime, timezone
from typing import Any, Dict

from app.schemas.auth import UserPublic


def serialize_user(doc: Dict[str, Any]) -> UserPublic:
    return UserPublic(
        id=str(doc["_id"]),
        firstName=doc.get("firstName", ""),
        lastName=doc.get("lastName", ""),
        email=doc["email"],
        role=doc["role"],
        profileImage=doc.get("profileImage", ""),
        bio=doc.get("bio", ""),
        isActive=doc.get("isActive", True),
        createdAt=doc.get("createdAt", datetime.now(timezone.utc)),
        updatedAt=doc.get("updatedAt", datetime.now(timezone.utc)),
    )


def user_public_dict(doc: Dict[str, Any]) -> dict:
    return serialize_user(doc).model_dump(mode="json")
