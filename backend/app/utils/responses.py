"""Shared API response helpers and exception types."""

from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "OK"
    data: Optional[T] = None


class ApiError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def success(data: Any = None, message: str = "OK") -> dict:
    return {"success": True, "message": message, "data": data}


def failure(message: str) -> dict:
    return {"success": False, "message": message, "data": None}
