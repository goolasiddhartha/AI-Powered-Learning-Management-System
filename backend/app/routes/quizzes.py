"""Quiz authoring and student attempt routes."""

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_db, require_role
from app.models.enums import UserRole
from app.schemas.quiz import QuizAttemptSubmit, QuizCreate, QuizUpdate
from app.services.quiz_service import QuizService
from app.utils.responses import success

router = APIRouter(tags=["Quizzes"])


@router.post("/courses/{course_id}/quizzes")
async def create_quiz(
    course_id: str,
    payload: QuizCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.INSTRUCTOR.value, UserRole.ADMIN.value)),
):
    quiz = await QuizService(db).create(course_id, payload, current_user)
    return success(data=quiz.model_dump(mode="json"), message="Quiz created successfully")


@router.get("/courses/{course_id}/quizzes")
async def list_course_quizzes(
    course_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.INSTRUCTOR.value, UserRole.ADMIN.value)),
):
    quizzes = await QuizService(db).list_for_course(course_id, current_user)
    return success(
        data=[quiz.model_dump(mode="json") for quiz in quizzes],
        message="Quizzes retrieved successfully",
    )


@router.get("/courses/{course_id}/quizzes/available")
async def list_available_quizzes(
    course_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.STUDENT.value)),
):
    quizzes = await QuizService(db).list_for_student(course_id, current_user)
    return success(
        data=[quiz.model_dump(mode="json") for quiz in quizzes],
        message="Available quizzes retrieved successfully",
    )


@router.get("/quizzes/{quiz_id}")
async def get_student_quiz(
    quiz_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.STUDENT.value)),
):
    quiz = await QuizService(db).get_for_student(quiz_id, current_user)
    return success(data=quiz.model_dump(mode="json"), message="Quiz retrieved successfully")


@router.put("/quizzes/{quiz_id}")
async def update_quiz(
    quiz_id: str,
    payload: QuizUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.INSTRUCTOR.value, UserRole.ADMIN.value)),
):
    quiz = await QuizService(db).update(quiz_id, payload, current_user)
    return success(data=quiz.model_dump(mode="json"), message="Quiz updated successfully")


@router.delete("/quizzes/{quiz_id}")
async def delete_quiz(
    quiz_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.INSTRUCTOR.value, UserRole.ADMIN.value)),
):
    await QuizService(db).delete(quiz_id, current_user)
    return success(message="Quiz deleted successfully")


@router.post("/quizzes/{quiz_id}/attempts")
async def submit_quiz_attempt(
    quiz_id: str,
    payload: QuizAttemptSubmit,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.STUDENT.value)),
):
    attempt = await QuizService(db).submit(quiz_id, payload, current_user)
    return success(data=attempt.model_dump(mode="json"), message="Quiz submitted successfully")


@router.get("/quizzes/{quiz_id}/attempts")
async def list_quiz_attempts(
    quiz_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.STUDENT.value)),
):
    attempts = await QuizService(db).list_attempts(quiz_id, current_user)
    return success(
        data=[attempt.model_dump(mode="json") for attempt in attempts],
        message="Quiz attempts retrieved successfully",
    )
