"""Lesson business logic."""

from datetime import datetime, timezone
from typing import Any, Dict, List

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.enums import EnrollmentStatus, UserRole
from app.schemas.course import LessonCreate, LessonOut, LessonUpdate
from app.utils.helpers import parse_object_id
from app.utils.responses import ApiError


def serialize_lesson(doc: Dict[str, Any]) -> LessonOut:
    return LessonOut(
        id=str(doc["_id"]),
        courseId=doc["courseId"],
        title=doc.get("title", ""),
        description=doc.get("description", ""),
        order=doc.get("order", 1),
        content=doc.get("content", ""),
        videoUrl=doc.get("videoUrl", ""),
        resources=doc.get("resources", []),
        estimatedMinutes=doc.get("estimatedMinutes", 10),
        isPublished=doc.get("isPublished", False),
        createdAt=doc.get("createdAt", datetime.now(timezone.utc)),
        updatedAt=doc.get("updatedAt", datetime.now(timezone.utc)),
    )


class LessonService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def _get_course(self, course_id: str) -> dict:
        doc = await self.db.courses.find_one({"_id": parse_object_id(course_id, "course id")})
        if not doc:
            raise ApiError("Course not found", status_code=404)
        return doc

    async def _require_course_owner(self, course_id: str, user: dict) -> dict:
        course = await self._get_course(course_id)
        if user.get("role") != UserRole.ADMIN.value and course.get("instructorId") != user["id"]:
            raise ApiError("You are not authorized to manage lessons for this course", status_code=403)
        return course

    async def create(self, course_id: str, payload: LessonCreate, user: dict) -> LessonOut:
        await self._require_course_owner(course_id, user)
        now = datetime.now(timezone.utc)
        doc = {
            **payload.model_dump(),
            "courseId": course_id,
            "createdAt": now,
            "updatedAt": now,
        }
        result = await self.db.lessons.insert_one(doc)
        doc["_id"] = result.inserted_id
        await self.db.courses.update_one(
            {"_id": parse_object_id(course_id, "course id")},
            {"$set": {"updatedAt": now}},
        )
        return serialize_lesson(doc)

    async def list_for_course(self, course_id: str, current_user: dict | None = None) -> List[LessonOut]:
        course = await self._get_course(course_id)
        is_owner = bool(
            current_user
            and (
                current_user.get("role") == UserRole.ADMIN.value
                or current_user["id"] == course.get("instructorId")
            )
        )
        query: Dict[str, Any] = {"courseId": course_id}
        if not is_owner:
            query["isPublished"] = True

        cursor = self.db.lessons.find(query).sort("order", 1)
        return [serialize_lesson(doc) async for doc in cursor]

    async def get(self, lesson_id: str, current_user: dict | None = None) -> LessonOut:
        doc = await self.db.lessons.find_one({"_id": parse_object_id(lesson_id, "lesson id")})
        if not doc:
            raise ApiError("Lesson not found", status_code=404)

        if not doc.get("isPublished", False):
            course = await self._get_course(doc["courseId"])
            is_owner = bool(
                current_user
                and (
                    current_user.get("role") == UserRole.ADMIN.value
                    or current_user["id"] == course.get("instructorId")
                )
            )
            if not is_owner:
                raise ApiError("Lesson not found", status_code=404)

        return serialize_lesson(doc)

    async def update(self, lesson_id: str, payload: LessonUpdate, user: dict) -> LessonOut:
        doc = await self.db.lessons.find_one({"_id": parse_object_id(lesson_id, "lesson id")})
        if not doc:
            raise ApiError("Lesson not found", status_code=404)
        await self._require_course_owner(doc["courseId"], user)

        updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
        if not updates:
            return serialize_lesson(doc)

        updates["updatedAt"] = datetime.now(timezone.utc)
        await self.db.lessons.update_one({"_id": doc["_id"]}, {"$set": updates})
        refreshed = await self.db.lessons.find_one({"_id": doc["_id"]})
        return serialize_lesson(refreshed)

    async def delete(self, lesson_id: str, user: dict) -> None:
        doc = await self.db.lessons.find_one({"_id": parse_object_id(lesson_id, "lesson id")})
        if not doc:
            raise ApiError("Lesson not found", status_code=404)
        await self._require_course_owner(doc["courseId"], user)
        await self.db.lessons.delete_one({"_id": doc["_id"]})
        await self.db.progress.delete_many({"lessonId": lesson_id})

        published_cursor = self.db.lessons.find(
            {"courseId": doc["courseId"], "isPublished": True},
            {"_id": 1},
        )
        published_ids = [str(lesson["_id"]) async for lesson in published_cursor]
        total = len(published_ids)
        enrollments = self.db.enrollments.find({"courseId": doc["courseId"]})
        async for enrollment in enrollments:
            completed = (
                await self.db.progress.count_documents(
                    {
                        "studentId": enrollment["studentId"],
                        "courseId": doc["courseId"],
                        "lessonId": {"$in": published_ids},
                        "isCompleted": True,
                    }
                )
                if published_ids
                else 0
            )
            percentage = int(round(completed / total * 100)) if total else 0
            status = (
                EnrollmentStatus.COMPLETED.value
                if total and completed >= total
                else (
                    EnrollmentStatus.DROPPED.value
                    if enrollment.get("status") == EnrollmentStatus.DROPPED.value
                    else EnrollmentStatus.ACTIVE.value
                )
            )
            updates = {
                "progressPercentage": percentage,
                "status": status,
                "completedAt": (
                    enrollment.get("completedAt") or datetime.now(timezone.utc)
                    if status == EnrollmentStatus.COMPLETED.value
                    else None
                ),
            }
            await self.db.enrollments.update_one(
                {"_id": enrollment["_id"]},
                {"$set": updates},
            )
        await self.db.courses.update_one(
            {"_id": parse_object_id(doc["courseId"], "course id")},
            {"$set": {"updatedAt": datetime.now(timezone.utc)}},
        )
