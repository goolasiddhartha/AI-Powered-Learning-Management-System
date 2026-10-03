"""Enrollment routes."""

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_db, require_role
from app.models.enums import UserRole
from app.services.enrollment_service import EnrollmentService
from app.utils.responses import success

router = APIRouter(tags=["Enrollments"])


@router.post("/courses/{course_id}/enroll")
async def enroll(
    course_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.STUDENT.value)),
):
    enrollment = await EnrollmentService(db).enroll(course_id, current_user)
    return success(data=enrollment.model_dump(mode="json"), message="Enrolled successfully")


@router.get("/enrollments/my-courses")
async def my_courses(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.STUDENT.value)),
):
    items = await EnrollmentService(db).my_courses(current_user)
    return success(
        data=[item.model_dump(mode="json") for item in items],
        message="Enrollments retrieved successfully",
    )


@router.get("/courses/{course_id}/enrollments")
async def course_students(
    course_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.INSTRUCTOR.value, UserRole.ADMIN.value)),
):
    items = await EnrollmentService(db).course_students(course_id, current_user)
    return success(
        data=[item.model_dump(mode="json") for item in items],
        message="Course learners retrieved successfully",
    )
