"""Course business logic with ownership checks."""

from datetime import datetime, timezone
import re
from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.enums import CourseStatus, UserRole
from app.schemas.course import CourseCreate, CourseOut, CourseUpdate
from app.utils.helpers import parse_object_id
from app.utils.responses import ApiError


def serialize_course(doc: Dict[str, Any], lesson_count: int = 0) -> CourseOut:
    return CourseOut(
        id=str(doc["_id"]),
        title=doc.get("title", ""),
        description=doc.get("description", ""),
        shortDescription=doc.get("shortDescription", ""),
        thumbnail=doc.get("thumbnail", ""),
        category=doc.get("category", ""),
        instructorId=doc.get("instructorId", ""),
        instructorName=doc.get("instructorName", ""),
        difficulty=doc.get("difficulty", "BEGINNER"),
        duration=doc.get("duration", ""),
        language=doc.get("language", "English"),
        prerequisites=doc.get("prerequisites", []),
        learningObjectives=doc.get("learningObjectives", []),
        status=doc.get("status", CourseStatus.DRAFT.value),
        enrollmentCount=doc.get("enrollmentCount", 0),
        lessonCount=lesson_count,
        createdAt=doc.get("createdAt", datetime.now(timezone.utc)),
        updatedAt=doc.get("updatedAt", datetime.now(timezone.utc)),
    )


def course_visibility_query(
    current_user: Optional[dict] = None,
    *,
    mine: bool = False,
    status: Optional[str] = None,
) -> Dict[str, Any]:
    query: Dict[str, Any] = {}
    role = (current_user or {}).get("role")

    if mine and current_user:
        query["instructorId"] = current_user["id"]
    elif role == UserRole.ADMIN.value:
        if status:
            query["status"] = status
    elif role == UserRole.INSTRUCTOR.value:
        visible = [
            {"status": CourseStatus.PUBLISHED.value},
            {"instructorId": current_user["id"]},
        ]
        query["$or"] = visible
        if status:
            query = {"$and": [{"$or": visible}, {"status": status}]}
    else:
        query["status"] = CourseStatus.PUBLISHED.value
    return query


def _sort_spec(sort: str) -> tuple[str, int]:
    allowed = {
        "newest": ("createdAt", -1),
        "oldest": ("createdAt", 1),
        "title_asc": ("title", 1),
        "title_desc": ("title", -1),
        "popular": ("enrollmentCount", -1),
    }
    if sort not in allowed:
        raise ApiError("Unsupported course sort order", status_code=422)
    return allowed[sort]


class CourseService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def _lesson_count(self, course_id: str) -> int:
        return await self.db.lessons.count_documents({"courseId": course_id})

    async def create(self, payload: CourseCreate, instructor: dict) -> CourseOut:
        now = datetime.now(timezone.utc)
        doc = {
            **payload.model_dump(),
            "difficulty": payload.difficulty.value,
            "instructorId": instructor["id"],
            "instructorName": f"{instructor.get('firstName', '')} {instructor.get('lastName', '')}".strip(),
            "status": CourseStatus.DRAFT.value,
            "enrollmentCount": 0,
            "createdAt": now,
            "updatedAt": now,
        }
        result = await self.db.courses.insert_one(doc)
        doc["_id"] = result.inserted_id
        return serialize_course(doc, 0)

    async def list_courses(
        self,
        *,
        current_user: Optional[dict] = None,
        mine: bool = False,
        status: Optional[str] = None,
        search: Optional[str] = None,
        category: Optional[str] = None,
        difficulty: Optional[str] = None,
        sort: str = "newest",
        page: Optional[int] = None,
        page_size: int = 12,
    ) -> List[CourseOut] | Dict[str, Any]:
        query = course_visibility_query(current_user, mine=mine, status=status)
        filters: List[Dict[str, Any]] = []
        if search:
            escaped = re.escape(search.strip())
            if escaped:
                filters.append({
                    "$or": [
                        {"title": {"$regex": escaped, "$options": "i"}},
                        {"description": {"$regex": escaped, "$options": "i"}},
                        {"shortDescription": {"$regex": escaped, "$options": "i"}},
                        {"instructorName": {"$regex": escaped, "$options": "i"}},
                    ]
                })
        if category:
            filters.append({"category": category})
        if difficulty:
            filters.append({"difficulty": difficulty})
        if filters:
            query = {"$and": [query, *filters]} if query else {"$and": filters}

        sort_field, sort_direction = _sort_spec(sort)
        cursor = self.db.courses.find(query).sort(
            [(sort_field, sort_direction), ("_id", 1)]
        )
        total = await self.db.courses.count_documents(query) if page is not None else None
        if page is not None:
            cursor = cursor.skip((page - 1) * page_size).limit(page_size)
        courses: List[CourseOut] = []
        async for doc in cursor:
            cid = str(doc["_id"])
            courses.append(serialize_course(doc, await self._lesson_count(cid)))
        if page is not None:
            return {
                "items": courses,
                "total": total or 0,
                "page": page,
                "pageSize": page_size,
                "totalPages": ((total or 0) + page_size - 1) // page_size,
            }
        return courses

    async def list_categories(
        self,
        *,
        current_user: Optional[dict] = None,
        mine: bool = False,
        status: Optional[str] = None,
    ) -> List[str]:
        query = course_visibility_query(current_user, mine=mine, status=status)
        categories = await self.db.courses.distinct("category", query)
        return sorted((value for value in categories if value), key=str.casefold)

    async def get(self, course_id: str, current_user: Optional[dict] = None) -> CourseOut:
        doc = await self.db.courses.find_one({"_id": parse_object_id(course_id, "course id")})
        if not doc:
            raise ApiError("Course not found", status_code=404)

        if doc.get("status") != CourseStatus.PUBLISHED.value:
            if not current_user:
                raise ApiError("Course not found", status_code=404)
            role = current_user.get("role")
            is_owner = current_user["id"] == doc.get("instructorId")
            if role != UserRole.ADMIN.value and not is_owner:
                raise ApiError("Course not found", status_code=404)

        return serialize_course(doc, await self._lesson_count(str(doc["_id"])))

    async def _require_owner_or_admin(self, course_id: str, user: dict) -> dict:
        doc = await self.db.courses.find_one({"_id": parse_object_id(course_id, "course id")})
        if not doc:
            raise ApiError("Course not found", status_code=404)
        if user.get("role") != UserRole.ADMIN.value and doc.get("instructorId") != user["id"]:
            raise ApiError("You are not authorized to modify this course", status_code=403)
        return doc

    async def update(self, course_id: str, payload: CourseUpdate, user: dict) -> CourseOut:
        await self._require_owner_or_admin(course_id, user)
        updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
        if "difficulty" in updates and hasattr(updates["difficulty"], "value"):
            updates["difficulty"] = updates["difficulty"].value
        if "status" in updates and hasattr(updates["status"], "value"):
            updates["status"] = updates["status"].value
        if not updates:
            return await self.get(course_id, user)

        updates["updatedAt"] = datetime.now(timezone.utc)
        await self.db.courses.update_one(
            {"_id": parse_object_id(course_id, "course id")},
            {"$set": updates},
        )
        return await self.get(course_id, user)

    async def publish(self, course_id: str, user: dict) -> CourseOut:
        await self._require_owner_or_admin(course_id, user)
        lesson_count = await self._lesson_count(course_id)
        if lesson_count < 1:
            raise ApiError("Add at least one lesson before publishing", status_code=400)

        await self.db.courses.update_one(
            {"_id": parse_object_id(course_id, "course id")},
            {
                "$set": {
                    "status": CourseStatus.PUBLISHED.value,
                    "updatedAt": datetime.now(timezone.utc),
                }
            },
        )
        return await self.get(course_id, user)

    async def delete(self, course_id: str, user: dict) -> None:
        await self._require_owner_or_admin(course_id, user)
        oid = parse_object_id(course_id, "course id")
        await self.db.progress.delete_many({"courseId": course_id})
        await self.db.enrollments.delete_many({"courseId": course_id})
        await self.db.lessons.delete_many({"courseId": course_id})
        await self.db.courses.delete_one({"_id": oid})
