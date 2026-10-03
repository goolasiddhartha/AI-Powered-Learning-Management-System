"""Enrollment business logic."""

from datetime import datetime, timezone
from typing import List

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

from app.models.enums import CourseStatus, EnrollmentStatus, UserRole
from app.schemas.enrollment import CourseStudentOut, EnrollmentOut
from app.services.course_service import CourseService, serialize_course
from app.utils.helpers import parse_object_id
from app.utils.responses import ApiError


def serialize_enrollment(doc: dict, course=None) -> EnrollmentOut:
    return EnrollmentOut(
        id=str(doc["_id"]),
        studentId=doc["studentId"],
        courseId=doc["courseId"],
        enrolledAt=doc.get("enrolledAt", datetime.now(timezone.utc)),
        completedAt=doc.get("completedAt"),
        status=doc.get("status", EnrollmentStatus.ACTIVE.value),
        progressPercentage=int(doc.get("progressPercentage", 0)),
        lastAccessedLessonId=doc.get("lastAccessedLessonId"),
        course=course,
    )


class EnrollmentService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def enroll(self, course_id: str, student: dict) -> EnrollmentOut:
        if student.get("role") != UserRole.STUDENT.value:
            raise ApiError("Only students can enroll in courses", status_code=403)

        course = await self.db.courses.find_one({"_id": parse_object_id(course_id, "course id")})
        if not course or course.get("status") != CourseStatus.PUBLISHED.value:
            raise ApiError("Published course not found", status_code=404)

        existing = await self.db.enrollments.find_one(
            {"studentId": student["id"], "courseId": course_id}
        )
        if existing:
            raise ApiError("You are already enrolled in this course", status_code=409)

        now = datetime.now(timezone.utc)
        doc = {
            "studentId": student["id"],
            "courseId": course_id,
            "enrolledAt": now,
            "completedAt": None,
            "status": EnrollmentStatus.ACTIVE.value,
            "progressPercentage": 0,
            "lastAccessedLessonId": None,
        }
        try:
            result = await self.db.enrollments.insert_one(doc)
        except DuplicateKeyError as exc:
            raise ApiError("You are already enrolled in this course", status_code=409) from exc
        doc["_id"] = result.inserted_id

        await self.db.courses.update_one(
            {"_id": course["_id"]},
            {"$inc": {"enrollmentCount": 1}},
        )
        course["enrollmentCount"] = int(course.get("enrollmentCount", 0)) + 1
        lesson_count = await self.db.lessons.count_documents({"courseId": course_id})
        return serialize_enrollment(doc, serialize_course(course, lesson_count))

    async def my_courses(self, student: dict) -> List[EnrollmentOut]:
        cursor = self.db.enrollments.find({"studentId": student["id"]}).sort("enrolledAt", -1)
        items: List[EnrollmentOut] = []
        async for doc in cursor:
            course = await self.db.courses.find_one(
                {"_id": parse_object_id(doc["courseId"], "course id")}
            )
            course_out = None
            if course:
                lesson_count = await self.db.lessons.count_documents({"courseId": doc["courseId"]})
                course_out = serialize_course(course, lesson_count)
            items.append(serialize_enrollment(doc, course_out))
        return items

    async def course_students(self, course_id: str, instructor: dict) -> List[CourseStudentOut]:
        await CourseService(self.db)._require_owner_or_admin(course_id, instructor)
        cursor = self.db.enrollments.find({"courseId": course_id}).sort("enrolledAt", -1)
        items: List[CourseStudentOut] = []
        async for enrollment in cursor:
            student = await self.db.users.find_one(
                {"_id": parse_object_id(enrollment["studentId"], "student id")},
                {"firstName": 1, "lastName": 1, "email": 1, "profileImage": 1},
            )
            if not student:
                continue
            name = f"{student.get('firstName', '')} {student.get('lastName', '')}".strip()
            items.append(
                CourseStudentOut(
                    studentId=enrollment["studentId"],
                    studentName=name or "Learner",
                    studentEmail=student.get("email", ""),
                    profileImage=student.get("profileImage", ""),
                    enrolledAt=enrollment.get("enrolledAt", datetime.now(timezone.utc)),
                    status=enrollment.get("status", EnrollmentStatus.ACTIVE.value),
                    progressPercentage=int(enrollment.get("progressPercentage", 0)),
                )
            )
        return items

    async def require_enrollment(self, course_id: str, student_id: str) -> dict:
        enrollment = await self.db.enrollments.find_one(
            {"studentId": student_id, "courseId": course_id}
        )
        if not enrollment:
            raise ApiError("You must enroll in this course first", status_code=403)
        return enrollment
