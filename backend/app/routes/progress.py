"""Progress routes."""

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_db, require_role
from app.models.enums import UserRole
from app.services.progress_service import ProgressService
from app.utils.responses import success

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("/summary")
async def progress_summary(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.STUDENT.value)),
):
    data = await ProgressService(db).summary(current_user)
    return success(data=data.model_dump(mode="json"), message="Progress summary retrieved")


@router.get("/course/{course_id}")
async def course_progress(
    course_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.STUDENT.value)),
):
    data = await ProgressService(db).course_progress(course_id, current_user)
    return success(data=data.model_dump(mode="json"), message="Course progress retrieved")


@router.post("/lesson/{lesson_id}/access")
async def access_lesson(
    lesson_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.STUDENT.value)),
):
    data = await ProgressService(db).access_lesson(lesson_id, current_user)
    return success(data=data.model_dump(mode="json"), message="Lesson accessed")


@router.post("/lesson/{lesson_id}/complete")
async def complete_lesson(
    lesson_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.STUDENT.value)),
):
    data = await ProgressService(db).complete_lesson(lesson_id, current_user)
    return success(data=data.model_dump(mode="json"), message="Lesson marked complete")
