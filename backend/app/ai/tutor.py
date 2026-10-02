"""AI Tutor and personalized recommendations."""

from datetime import datetime, timezone
from typing import List

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.ai.llm import generate_text, is_gemini_configured
from app.schemas.ai import (
    ChatMessageOut,
    RecommendationItem,
    RecommendationsResponse,
    TutorRequest,
    TutorResponse,
)
from app.services.enrollment_service import EnrollmentService
from app.utils.helpers import parse_object_id
from app.utils.responses import ApiError

TUTOR_SYSTEM = (
    "You are an AI tutor for an online learning platform. "
    "Answer using the provided course context. Explain clearly. "
    "If the answer cannot be found in the supplied course context, "
    "say that the information is not available in the course material. "
    "Do not fabricate course-specific information."
)


class AIService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.enrollments = EnrollmentService(db)

    async def _course_context(self, course_id: str, lesson_id: str | None = None) -> tuple[str, List[str]]:
        course = await self.db.courses.find_one({"_id": parse_object_id(course_id, "course id")})
        if not course:
            raise ApiError("Course not found", status_code=404)

        sources: List[str] = [course.get("title", "Course")]
        chunks: List[str] = [
            f"Course: {course.get('title', '')}",
            f"Description: {course.get('description', '')}",
            f"Objectives: {', '.join(course.get('learningObjectives', []))}",
        ]

        query = {"courseId": course_id, "isPublished": True}
        if lesson_id:
            query["_id"] = parse_object_id(lesson_id, "lesson id")

        async for lesson in self.db.lessons.find(query).sort("order", 1).limit(8):
            sources.append(lesson.get("title", "Lesson"))
            chunks.append(
                f"Lesson {lesson.get('order')}: {lesson.get('title')}\n"
                f"{lesson.get('description', '')}\n{lesson.get('content', '')[:2500]}"
            )

        return "\n\n".join(chunks), sources

    def _fallback_answer(self, question: str, context: str, sources: List[str]) -> str:
        q = question.lower()
        lines = [line.strip() for line in context.splitlines() if line.strip()]
        matches = [
            line
            for line in lines
            if any(token in line.lower() for token in q.split() if len(token) > 3)
        ]
        configured = is_gemini_configured()
        tip = (
            "Gemini did not respond for this request. Check LLM_MODEL in backend/.env "
            "(use gemini-2.5-flash) and restart the backend."
            if configured
            else "Add a valid GEMINI_API_KEY from Google AI Studio in backend/.env."
        )
        if matches:
            excerpt = " ".join(matches[:4])[:700]
            return (
                "Based on your enrolled course material:\n\n"
                f"{excerpt}\n\n"
                f"Sources: {', '.join(sources[:4])}\n\n"
                f"Tip: {tip}"
            )
        return (
            "I could not find a clear answer in the supplied course material. "
            "Try asking about a topic covered in your current lessons "
            f"(for example: Express, MongoDB, or REST APIs).\n\nTip: {tip}"
        )

    async def tutor(self, payload: TutorRequest, student: dict) -> TutorResponse:
        await self.enrollments.require_enrollment(payload.courseId, student["id"])
        context, sources = await self._course_context(payload.courseId, payload.lessonId)

        prompt = (
            f"Course context:\n{context}\n\n"
            f"Student question:\n{payload.question}\n\n"
            "Answer for the student:"
        )
        ai_answer = await generate_text(prompt, system=TUTOR_SYSTEM)
        used_ai = bool(ai_answer)
        answer = ai_answer or self._fallback_answer(payload.question, context, sources)

        now = datetime.now(timezone.utc)
        user_msg = {"role": "user", "content": payload.question, "timestamp": now}
        assistant_msg = {"role": "assistant", "content": answer, "timestamp": now}

        conversation = None
        if payload.conversationId:
            conversation = await self.db.ai_conversations.find_one(
                {
                    "_id": parse_object_id(payload.conversationId, "conversation id"),
                    "studentId": student["id"],
                }
            )

        if conversation:
            messages = list(conversation.get("messages", []))
            messages.extend([user_msg, assistant_msg])
            await self.db.ai_conversations.update_one(
                {"_id": conversation["_id"]},
                {"$set": {"messages": messages, "updatedAt": now}},
            )
            conversation_id = str(conversation["_id"])
        else:
            doc = {
                "studentId": student["id"],
                "courseId": payload.courseId,
                "lessonId": payload.lessonId,
                "messages": [user_msg, assistant_msg],
                "createdAt": now,
                "updatedAt": now,
            }
            result = await self.db.ai_conversations.insert_one(doc)
            conversation_id = str(result.inserted_id)
            messages = doc["messages"]

        return TutorResponse(
            conversationId=conversation_id,
            answer=answer,
            sources=sources[:5],
            usedAiModel=used_ai and is_gemini_configured(),
            messages=[ChatMessageOut(**m) for m in messages],
        )

    async def recommendations(self, student: dict) -> RecommendationsResponse:
        enrollments = []
        async for doc in self.db.enrollments.find({"studentId": student["id"]}).sort("enrolledAt", -1):
            enrollments.append(doc)

        items: List[RecommendationItem] = []
        if not enrollments:
            published = await self.db.courses.find({"status": "PUBLISHED"}).sort("createdAt", -1).to_list(5)
            for course in published:
                items.append(
                    RecommendationItem(
                        type="COURSE",
                        title=course.get("title", "Course"),
                        reason="Start with a published course that matches the catalog.",
                        courseId=str(course["_id"]),
                        actionUrl=f"/student/courses/{course['_id']}",
                    )
                )
            summary = "You are not enrolled yet. Browse a course and enroll to unlock personalized guidance."
        else:
            for enrollment in enrollments[:5]:
                course = await self.db.courses.find_one(
                    {"_id": parse_object_id(enrollment["courseId"], "course id")}
                )
                if not course:
                    continue
                progress = int(enrollment.get("progressPercentage", 0))
                last_lesson = enrollment.get("lastAccessedLessonId")
                lessons = await self.db.lessons.find(
                    {"courseId": enrollment["courseId"], "isPublished": True}
                ).sort("order", 1).to_list(50)

                completed_ids = {
                    doc["lessonId"]
                    async for doc in self.db.progress.find(
                        {
                            "studentId": student["id"],
                            "courseId": enrollment["courseId"],
                            "isCompleted": True,
                        }
                    )
                }

                next_lesson = next((l for l in lessons if str(l["_id"]) not in completed_ids), None)
                if next_lesson:
                    items.append(
                        RecommendationItem(
                            type="NEXT_LESSON",
                            title=next_lesson.get("title", "Next lesson"),
                            reason=f"Continue {course.get('title')} ({progress}% complete).",
                            courseId=enrollment["courseId"],
                            lessonId=str(next_lesson["_id"]),
                            actionUrl=f"/student/courses/{enrollment['courseId']}/learn?lessonId={next_lesson['_id']}",
                        )
                    )
                elif progress < 100:
                    items.append(
                        RecommendationItem(
                            type="REVISION",
                            title=f"Review {course.get('title')}",
                            reason="Most lessons are done — review weak spots before finishing.",
                            courseId=enrollment["courseId"],
                            actionUrl=f"/student/courses/{enrollment['courseId']}",
                        )
                    )
                else:
                    items.append(
                        RecommendationItem(
                            type="COURSE",
                            title="Explore another course",
                            reason=f"You completed {course.get('title')}. Browse the catalog for the next topic.",
                            actionUrl="/student/courses",
                        )
                    )

                if last_lesson and progress < 100:
                    items.append(
                        RecommendationItem(
                            type="REVISION",
                            title="Resume where you left off",
                            reason="Jump back into your last accessed lesson.",
                            courseId=enrollment["courseId"],
                            lessonId=last_lesson,
                            actionUrl=f"/student/courses/{enrollment['courseId']}/learn?lessonId={last_lesson}",
                        )
                    )

            summary = (
                "Personalized suggestions based on your enrollments and lesson completion. "
                "Add GEMINI_API_KEY for richer AI-written study plans."
            )

        # Optional Gemini rewrite of summary
        used_ai = False
        if items and is_gemini_configured():
            bullet = "\n".join(f"- {i.title}: {i.reason}" for i in items[:6])
            ai_summary = await generate_text(
                f"Write a short encouraging study plan summary for a student based on:\n{bullet}",
                system="You are an educational coach. Keep it under 80 words.",
            )
            if ai_summary:
                summary = ai_summary
                used_ai = True

        # de-dupe by title
        unique: List[RecommendationItem] = []
        seen = set()
        for item in items:
            key = (item.type, item.title, item.courseId)
            if key in seen:
                continue
            seen.add(key)
            unique.append(item)

        return RecommendationsResponse(summary=summary, items=unique[:8], usedAiModel=used_ai)
