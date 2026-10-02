from fastapi import APIRouter

from app.routes import ai, auth, certificates, courses, enrollments, health, lessons, progress, quizzes

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(courses.router)
api_router.include_router(lessons.router)
api_router.include_router(enrollments.router)
api_router.include_router(progress.router)
api_router.include_router(quizzes.router)
api_router.include_router(ai.router)
api_router.include_router(certificates.router)
