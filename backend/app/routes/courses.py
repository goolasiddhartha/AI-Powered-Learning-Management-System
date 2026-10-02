"""Course routes."""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_current_user_optional, get_db, require_role
from app.models.enums import CourseDifficulty, UserRole
from app.schemas.course import CourseCreate, CourseUpdate
from app.services.course_service import CourseService
from app.utils.responses import success

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.post("")
async def create_course(
    payload: CourseCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.INSTRUCTOR.value, UserRole.ADMIN.value)),
):
    course = await CourseService(db).create(payload, current_user)
    return success(data=course.model_dump(mode="json"), message="Course created successfully")


@router.get("")
async def list_courses(
    mine: bool = Query(False),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None, max_length=120),
    category: Optional[str] = Query(None, max_length=120),
    difficulty: Optional[CourseDifficulty] = Query(None),
    sort: str = Query("newest"),
    page: Optional[int] = Query(None, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict | None = Depends(get_current_user_optional),
):
    if mine and not current_user:
        from app.utils.responses import ApiError

        raise ApiError("Authentication required", status_code=401)
    courses = await CourseService(db).list_courses(
        current_user=current_user,
        mine=mine,
        status=status,
        search=search,
        category=category,
        difficulty=difficulty.value if difficulty else None,
        sort=sort,
        page=page,
        page_size=page_size,
    )
    data = (
        {**courses, "items": [c.model_dump(mode="json") for c in courses["items"]]}
        if isinstance(courses, dict)
        else [c.model_dump(mode="json") for c in courses]
    )
    return success(
        data=data,
        message="Courses retrieved successfully",
    )


@router.get("/categories")
async def list_course_categories(
    mine: bool = Query(False),
    status: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict | None = Depends(get_current_user_optional),
):
    if mine and not current_user:
        from app.utils.responses import ApiError

        raise ApiError("Authentication required", status_code=401)
    categories = await CourseService(db).list_categories(
        current_user=current_user,
        mine=mine,
        status=status,
    )
    return success(data=categories, message="Course categories retrieved successfully")


@router.get("/{course_id}")
async def get_course(
    course_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict | None = Depends(get_current_user_optional),
):
    course = await CourseService(db).get(course_id, current_user)
    return success(data=course.model_dump(mode="json"), message="Course retrieved successfully")


@router.put("/{course_id}")
async def update_course(
    course_id: str,
    payload: CourseUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.INSTRUCTOR.value, UserRole.ADMIN.value)),
):
    course = await CourseService(db).update(course_id, payload, current_user)
    return success(data=course.model_dump(mode="json"), message="Course updated successfully")


@router.post("/{course_id}/publish")
async def publish_course(
    course_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.INSTRUCTOR.value, UserRole.ADMIN.value)),
):
    course = await CourseService(db).publish(course_id, current_user)
    return success(data=course.model_dump(mode="json"), message="Course published successfully")


@router.delete("/{course_id}")
async def delete_course(
    course_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.INSTRUCTOR.value, UserRole.ADMIN.value)),
):
    await CourseService(db).delete(course_id, current_user)
    return success(message="Course deleted successfully")
