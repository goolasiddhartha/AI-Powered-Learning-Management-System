"""AI routes."""

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.ai.tutor import AIService
from app.core.deps import get_db, require_role
from app.models.enums import UserRole
from app.schemas.ai import TutorRequest
from app.utils.responses import success

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/tutor")
async def ai_tutor(
    payload: TutorRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.STUDENT.value)),
):
    data = await AIService(db).tutor(payload, current_user)
    return success(data=data.model_dump(mode="json"), message="AI tutor response generated")


@router.get("/recommendations")
async def ai_recommendations(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.STUDENT.value)),
):
    data = await AIService(db).recommendations(current_user)
    return success(data=data.model_dump(mode="json"), message="Recommendations retrieved")
