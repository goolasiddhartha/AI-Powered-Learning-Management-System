"""Lesson routes."""

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_current_user_optional, get_db, require_role
from app.models.enums import UserRole
from app.schemas.course import LessonCreate, LessonUpdate
from app.services.lesson_service import LessonService
from app.utils.responses import success

router = APIRouter(tags=["Lessons"])


@router.post("/courses/{course_id}/lessons")
async def create_lesson(
    course_id: str,
    payload: LessonCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.INSTRUCTOR.value, UserRole.ADMIN.value)),
):
    lesson = await LessonService(db).create(course_id, payload, current_user)
    return success(data=lesson.model_dump(mode="json"), message="Lesson created successfully")


@router.get("/courses/{course_id}/lessons")
async def list_lessons(
    course_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict | None = Depends(get_current_user_optional),
):
    lessons = await LessonService(db).list_for_course(course_id, current_user)
    return success(
        data=[lesson.model_dump(mode="json") for lesson in lessons],
        message="Lessons retrieved successfully",
    )


@router.get("/lessons/{lesson_id}")
async def get_lesson(
    lesson_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict | None = Depends(get_current_user_optional),
):
    lesson = await LessonService(db).get(lesson_id, current_user)
    return success(data=lesson.model_dump(mode="json"), message="Lesson retrieved successfully")


@router.put("/lessons/{lesson_id}")
async def update_lesson(
    lesson_id: str,
    payload: LessonUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.INSTRUCTOR.value, UserRole.ADMIN.value)),
):
    lesson = await LessonService(db).update(lesson_id, payload, current_user)
    return success(data=lesson.model_dump(mode="json"), message="Lesson updated successfully")


@router.delete("/lessons/{lesson_id}")
async def delete_lesson(
    lesson_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.INSTRUCTOR.value, UserRole.ADMIN.value)),
):
    await LessonService(db).delete(lesson_id, current_user)
    return success(message="Lesson deleted successfully")
