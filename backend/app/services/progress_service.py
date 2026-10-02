"""Progress calculation and lesson completion."""

from datetime import datetime, timezone
from typing import List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.enums import EnrollmentStatus
from app.schemas.enrollment import (
    AccessLessonResponse,
    CourseProgressOut,
    LessonProgressOut,
    StudentProgressSummary,
)
from app.services.enrollment_service import EnrollmentService
from app.services.lesson_service import LessonService, serialize_lesson
from app.utils.helpers import parse_object_id
from app.utils.responses import ApiError


def serialize_progress(doc: dict, lesson: Optional[dict] = None) -> LessonProgressOut:
    return LessonProgressOut(
        id=str(doc["_id"]),
        studentId=doc["studentId"],
        courseId=doc["courseId"],
        lessonId=doc["lessonId"],
        isCompleted=bool(doc.get("isCompleted", False)),
        completedAt=doc.get("completedAt"),
        accessedAt=doc.get("accessedAt", datetime.now(timezone.utc)),
        lessonTitle=(lesson or {}).get("title"),
        lessonOrder=(lesson or {}).get("order"),
    )


class ProgressService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.enrollments = EnrollmentService(db)
        self.lessons = LessonService(db)

    async def _recalculate_enrollment(self, student_id: str, course_id: str) -> int:
        total = await self.db.lessons.count_documents(
            {"courseId": course_id, "isPublished": True}
        )
        completed = await self.db.progress.count_documents(
            {
                "studentId": student_id,
                "courseId": course_id,
                "isCompleted": True,
            }
        )
        percentage = int(round((completed / total) * 100)) if total else 0
        updates = {
            "progressPercentage": percentage,
            "updatedAt": datetime.now(timezone.utc),
        }
        is_complete = await self.check_course_completion(student_id, course_id)
        if is_complete:
            updates["status"] = EnrollmentStatus.COMPLETED.value
            updates["completedAt"] = datetime.now(timezone.utc)
        else:
            updates["status"] = EnrollmentStatus.ACTIVE.value
            updates["completedAt"] = None

        await self.db.enrollments.update_one(
            {"studentId": student_id, "courseId": course_id},
            {"$set": updates},
        )
        return percentage

    async def check_course_completion(self, student_id: str, course_id: str) -> bool:
        """Authoritatively evaluate published lessons and required quiz passes."""
        published_lessons = await self.db.lessons.find(
            {"courseId": course_id, "isPublished": True}, {"_id": 1}
        ).to_list(length=None)
        if not published_lessons:
            return False
        lesson_ids = [str(item["_id"]) for item in published_lessons]
        completed = await self.db.progress.count_documents(
            {
                "studentId": student_id,
                "courseId": course_id,
                "lessonId": {"$in": lesson_ids},
                "isCompleted": True,
            }
        )
        if completed < len(lesson_ids):
            return False

        quizzes = self.db.quizzes.find({"courseId": course_id})
        async for quiz in quizzes:
            if not quiz.get("required", True):
                continue
            if quiz.get("lessonId") and quiz["lessonId"] not in lesson_ids:
                continue
            passed = await self.db.quiz_attempts.find_one(
                {"quizId": str(quiz["_id"]), "studentId": student_id, "passed": True},
                {"_id": 1},
            )
            if not passed:
                return False
        return True

    async def access_lesson(self, lesson_id: str, student: dict) -> AccessLessonResponse:
        lesson_doc = await self.db.lessons.find_one(
            {"_id": parse_object_id(lesson_id, "lesson id")}
        )
        if not lesson_doc or not lesson_doc.get("isPublished", False):
            raise ApiError("Lesson not found", status_code=404)

        course_id = lesson_doc["courseId"]
        await self.enrollments.require_enrollment(course_id, student["id"])

        now = datetime.now(timezone.utc)
        existing = await self.db.progress.find_one(
            {"studentId": student["id"], "lessonId": lesson_id}
        )
        if existing:
            await self.db.progress.update_one(
                {"_id": existing["_id"]},
                {"$set": {"accessedAt": now}},
            )
            existing["accessedAt"] = now
            progress_doc = existing
        else:
            progress_doc = {
                "studentId": student["id"],
                "courseId": course_id,
                "lessonId": lesson_id,
                "isCompleted": False,
                "completedAt": None,
                "accessedAt": now,
            }
            result = await self.db.progress.insert_one(progress_doc)
            progress_doc["_id"] = result.inserted_id

        await self.db.enrollments.update_one(
            {"studentId": student["id"], "courseId": course_id},
            {"$set": {"lastAccessedLessonId": lesson_id}},
        )

        published = await self.lessons.list_for_course(course_id, student)
        ids = [item.id for item in published]
        idx = ids.index(lesson_id) if lesson_id in ids else -1
        previous_id = ids[idx - 1] if idx > 0 else None
        next_id = ids[idx + 1] if 0 <= idx < len(ids) - 1 else None

        return AccessLessonResponse(
            lesson=serialize_lesson(lesson_doc),
            progress=serialize_progress(progress_doc, lesson_doc),
            previousLessonId=previous_id,
            nextLessonId=next_id,
        )

    async def complete_lesson(self, lesson_id: str, student: dict) -> CourseProgressOut:
        lesson_doc = await self.db.lessons.find_one(
            {"_id": parse_object_id(lesson_id, "lesson id")}
        )
        if not lesson_doc or not lesson_doc.get("isPublished", False):
            raise ApiError("Lesson not found", status_code=404)

        course_id = lesson_doc["courseId"]
        await self.enrollments.require_enrollment(course_id, student["id"])
        now = datetime.now(timezone.utc)

        await self.db.progress.update_one(
            {"studentId": student["id"], "lessonId": lesson_id},
            {
                "$set": {
                    "studentId": student["id"],
                    "courseId": course_id,
                    "lessonId": lesson_id,
                    "isCompleted": True,
                    "completedAt": now,
                    "accessedAt": now,
                }
            },
            upsert=True,
        )
        await self.db.enrollments.update_one(
            {"studentId": student["id"], "courseId": course_id},
            {"$set": {"lastAccessedLessonId": lesson_id}},
        )
        await self._recalculate_enrollment(student["id"], course_id)
        from app.services.certificate_service import CertificateService

        await CertificateService(self.db).issue_if_completed(student["id"], course_id)
        return await self.course_progress(course_id, student)

    async def course_progress(self, course_id: str, student: dict) -> CourseProgressOut:
        enrollment = await self.enrollments.require_enrollment(course_id, student["id"])
        course = await self.db.courses.find_one({"_id": parse_object_id(course_id, "course id")})
        if not course:
            raise ApiError("Course not found", status_code=404)

        lessons = await self.lessons.list_for_course(course_id, student)
        progress_docs = {
            doc["lessonId"]: doc
            async for doc in self.db.progress.find(
                {"studentId": student["id"], "courseId": course_id}
            )
        }

        lesson_progress: List[LessonProgressOut] = []
        completed = 0
        for lesson in lessons:
            raw = progress_docs.get(lesson.id)
            if raw:
                item = serialize_progress(raw, {"title": lesson.title, "order": lesson.order})
            else:
                item = LessonProgressOut(
                    id="",
                    studentId=student["id"],
                    courseId=course_id,
                    lessonId=lesson.id,
                    isCompleted=False,
                    completedAt=None,
                    accessedAt=datetime.now(timezone.utc),
                    lessonTitle=lesson.title,
                    lessonOrder=lesson.order,
                )
            if item.isCompleted:
                completed += 1
            lesson_progress.append(item)

        total = len(lessons)
        percentage = int(enrollment.get("progressPercentage", 0))
        if total:
            percentage = int(round((completed / total) * 100))

        return CourseProgressOut(
            courseId=course_id,
            courseTitle=course.get("title", ""),
            enrollmentStatus=enrollment.get("status", EnrollmentStatus.ACTIVE.value),
            progressPercentage=percentage,
            totalLessons=total,
            completedLessons=completed,
            lastAccessedLessonId=enrollment.get("lastAccessedLessonId"),
            lessons=lesson_progress,
        )

    async def summary(self, student: dict) -> StudentProgressSummary:
        enrollments = await self.enrollments.my_courses(student)
        courses: List[CourseProgressOut] = []
        completed_courses = 0
        total_lessons_completed = 0
        progress_values: List[int] = []

        for enrollment in enrollments:
            item = await self.course_progress(enrollment.courseId, student)
            courses.append(item)
            if item.enrollmentStatus == EnrollmentStatus.COMPLETED.value:
                completed_courses += 1
            total_lessons_completed += item.completedLessons
            progress_values.append(item.progressPercentage)

        overall = int(round(sum(progress_values) / len(progress_values))) if progress_values else 0
        return StudentProgressSummary(
            enrolledCourses=len(enrollments),
            completedCourses=completed_courses,
            totalLessonsCompleted=total_lessons_completed,
            overallProgress=overall,
            courses=courses,
        )
