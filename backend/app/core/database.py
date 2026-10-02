"""MongoDB connection via Motor (async)."""

import logging
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongo() -> None:
    global _client, _db
    settings = get_settings()
    _client = AsyncIOMotorClient(
        settings.mongodb_uri,
        serverSelectionTimeoutMS=8000,
        connectTimeoutMS=8000,
    )
    _db = _client[settings.database_name]
    # Verify connectivity early so misconfigured URI fails fast at startup.
    await _client.admin.command("ping")
    logger.info("Connected to MongoDB database=%s", settings.database_name)


async def close_mongo_connection() -> None:
    global _client, _db
    if _client is not None:
        _client.close()
        logger.info("MongoDB connection closed")
    _client = None
    _db = None


def get_database() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("Database is not initialized. Call connect_to_mongo() first.")
    return _db


async def ensure_indexes() -> None:
    """Create application indexes (idempotent)."""
    db = get_database()

    await db.users.create_index("email", unique=True)
    await db.users.create_index("role")

    await db.categories.create_index("name", unique=True)

    await db.courses.create_index("instructorId")
    await db.courses.create_index("status")
    await db.courses.create_index([("status", 1), ("category", 1)])

    await db.lessons.create_index("courseId")
    await db.lessons.create_index([("courseId", 1), ("order", 1)])

    await db.enrollments.create_index(
        [("studentId", 1), ("courseId", 1)],
        unique=True,
        name="unique_student_course",
    )
    await db.enrollments.create_index("studentId")
    await db.enrollments.create_index("courseId")

    await db.progress.create_index(
        [("studentId", 1), ("lessonId", 1)],
        unique=True,
        name="unique_student_lesson",
    )
    await db.progress.create_index([("studentId", 1), ("courseId", 1)])

    await db.quizzes.create_index("courseId")
    await db.quizzes.create_index("lessonId")
    await db.quizzes.create_index([("courseId", 1), ("createdAt", -1)])
    await db.certificates.create_index(
        [("studentId", 1), ("courseId", 1)], unique=True, name="unique_student_course_certificate"
    )
    await db.certificates.create_index("certificateId", unique=True, name="unique_certificate_id")
    await db.certificates.create_index("studentId")

    await db.quiz_attempts.create_index("studentId")
    await db.quiz_attempts.create_index("quizId")
    await db.quiz_attempts.create_index([("studentId", 1), ("quizId", 1)])
    await db.quiz_attempts.create_index(
        [("quizId", 1), ("studentId", 1), ("attemptNumber", 1)],
        unique=True,
        name="unique_quiz_student_attempt",
    )
    await db.quiz_attempt_counters.create_index(
        [("quizId", 1), ("studentId", 1)],
        unique=True,
        name="unique_quiz_student_attempt_counter",
    )

    await db.course_materials.create_index("courseId")
    await db.document_chunks.create_index("courseId")
    await db.document_chunks.create_index("documentId")
    await db.document_chunks.create_index([("courseId", 1), ("lessonId", 1)])

    await db.ai_conversations.create_index("studentId")
    await db.ai_conversations.create_index([("studentId", 1), ("courseId", 1)])

    await db.ai_summaries.create_index([("studentId", 1), ("lessonId", 1)])
    await db.ai_recommendations.create_index("studentId")

    logger.info("MongoDB indexes ensured")
