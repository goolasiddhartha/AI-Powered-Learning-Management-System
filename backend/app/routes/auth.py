"""Auth routes: register, login, me."""

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_current_user, get_db
from app.models.user import user_public_dict
from app.schemas.auth import AuthTokenResponse, LoginRequest, RegisterRequest
from app.services.auth_service import AuthService
from app.utils.responses import success

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
async def register(payload: RegisterRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    result: AuthTokenResponse = await AuthService(db).register(payload)
    return success(
        data=result.model_dump(mode="json"),
        message="Registration successful",
    )


@router.post("/login")
async def login(payload: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    result: AuthTokenResponse = await AuthService(db).login(payload)
    return success(
        data=result.model_dump(mode="json"),
        message="Login successful",
    )


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return success(
        data=user_public_dict(current_user),
        message="Current user retrieved successfully",
    )
