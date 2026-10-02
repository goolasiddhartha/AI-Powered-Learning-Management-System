"""Common validators and helpers."""

from bson import ObjectId
from bson.errors import InvalidId

from app.utils.responses import ApiError


def parse_object_id(value: str, field_name: str = "id") -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError) as exc:
        raise ApiError(f"Invalid {field_name}", status_code=400) from exc


def oid_str(value) -> str:
    return str(value)
