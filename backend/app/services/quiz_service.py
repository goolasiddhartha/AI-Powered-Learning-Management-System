"""Quiz authoring, student access, and attempt scoring."""

from datetime import datetime, timezone
from typing import Any, Dict, List
from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.models.enums import CourseStatus, EnrollmentStatus, UserRole
from app.schemas.quiz import (
    QuizAdminOut,
    QuizAttemptOut,
    QuizAttemptSubmit,
    QuizCreate,
    QuizQuestionAdmin,
    QuizQuestionInput,
    QuizQuestionPublic,
    QuizStudentOut,
    QuizUpdate,
)
from app.utils.helpers import parse_object_id
from app.utils.responses import ApiError


def _questions_for_storage(questions: List[QuizQuestionInput]) -> List[dict]:
    return [
        {
            **question.model_dump(),
            "id": question.id or str(uuid4()),
            "type": question.type.value,
        }
        for question in questions
    ]


def _serialize_quiz(doc: dict) -> QuizAdminOut:
    return QuizAdminOut(
        id=str(doc["_id"]),
        courseId=doc["courseId"],
        lessonId=doc.get("lessonId"),
        title=doc["title"],
        description=doc.get("description", ""),
        questions=doc.get("questions", []),
        timeLimit=doc.get("timeLimit", 0),
        passingScore=doc.get("passingScore", 70),
        maxAttempts=doc.get("maxAttempts", 1),
        required=doc.get("required", True),
        createdBy=doc["createdBy"],
        createdAt=doc["createdAt"],
        updatedAt=doc["updatedAt"],
    )


def score_answers(questions: List[dict], answers: Dict[str, str], passing_score: float) -> dict:
    """Calculate an attempt score and per-question result from server-owned answers."""
    earned_marks = 0.0
    total_marks = 0.0
    results = []
    for question in questions:
        marks = float(question.get("marks", 1))
        selected = answers.get(question["id"])
        correct = selected == question["correctAnswer"]
        earned = marks if correct else 0.0
        total_marks += marks
        earned_marks += earned
        results.append(
            {
                "questionId": question["id"],
                "question": question["question"],
                "selectedAnswer": selected,
                "correctAnswer": question["correctAnswer"],
                "explanation": question.get("explanation", ""),
                "earnedMarks": earned,
                "totalMarks": marks,
            }
        )
    score = round(earned_marks / total_marks * 100, 2) if total_marks else 0.0
    return {
        "answers": answers,
        "score": score,
        "earnedMarks": earned_marks,
        "totalMarks": total_marks,
        "passingScore": passing_score,
        "passed": score >= passing_score,
        "results": results,
    }


def _serialize_attempt(doc: dict) -> QuizAttemptOut:
    return QuizAttemptOut(
        id=str(doc["_id"]),
        quizId=doc["quizId"],
        studentId=doc["studentId"],
        attemptNumber=doc["attemptNumber"],
        answers=doc.get("answers", {}),
        score=doc["score"],
        earnedMarks=doc["earnedMarks"],
        totalMarks=doc["totalMarks"],
        passingScore=doc["passingScore"],
        passed=doc["passed"],
        results=doc["results"],
        submittedAt=doc["submittedAt"],
    )


class QuizService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def _get_course(self, course_id: str) -> dict:
        course = await self.db.courses.find_one(
            {"_id": parse_object_id(course_id, "course id")}
        )
        if not course:
            raise ApiError("Course not found", status_code=404)
        return course

    async def _require_course_owner(self, course_id: str, user: dict) -> dict:
        course = await self._get_course(course_id)
        if user.get("role") != UserRole.ADMIN.value and course.get("instructorId") != user["id"]:
            raise ApiError("You are not authorized to manage quizzes for this course", status_code=403)
        return course

    async def _validate_lesson(self, course_id: str, lesson_id: str | None) -> None:
        if lesson_id is None:
            return
        lesson = await self.db.lessons.find_one(
            {"_id": parse_object_id(lesson_id, "lesson id"), "courseId": course_id}
        )
        if not lesson:
            raise ApiError("Lesson not found for this course", status_code=422)

    async def _get_quiz(self, quiz_id: str) -> dict:
        quiz = await self.db.quizzes.find_one(
            {"_id": parse_object_id(quiz_id, "quiz id")}
        )
        if not quiz:
            raise ApiError("Quiz not found", status_code=404)
        return quiz

    async def _require_quiz_owner(self, quiz: dict, user: dict) -> None:
        await self._require_course_owner(quiz["courseId"], user)

    async def create(self, course_id: str, payload: QuizCreate, user: dict) -> QuizAdminOut:
        await self._require_course_owner(course_id, user)
        await self._validate_lesson(course_id, payload.lessonId)
        now = datetime.now(timezone.utc)
        doc = {
            "courseId": course_id,
            "lessonId": payload.lessonId,
            "title": payload.title,
            "description": payload.description,
            "questions": _questions_for_storage(payload.questions),
            "timeLimit": payload.timeLimit,
            "passingScore": payload.passingScore,
            "maxAttempts": payload.maxAttempts,
            "required": payload.required,
            "createdBy": user["id"],
            "createdAt": now,
            "updatedAt": now,
        }
        result = await self.db.quizzes.insert_one(doc)
        doc["_id"] = result.inserted_id
        return _serialize_quiz(doc)

    async def list_for_course(self, course_id: str, user: dict) -> List[QuizAdminOut]:
        await self._require_course_owner(course_id, user)
        cursor = self.db.quizzes.find({"courseId": course_id}).sort(
            [("createdAt", -1), ("_id", 1)]
        )
        return [_serialize_quiz(doc) async for doc in cursor]

    async def update(self, quiz_id: str, payload: QuizUpdate, user: dict) -> QuizAdminOut:
        quiz = await self._get_quiz(quiz_id)
        await self._require_quiz_owner(quiz, user)
        updates: Dict[str, Any] = payload.model_dump(exclude_unset=True)
        if "lessonId" in updates:
            await self._validate_lesson(quiz["courseId"], updates["lessonId"])
        if "questions" in updates and updates["questions"] is not None:
            updates["questions"] = _questions_for_storage(payload.questions or [])
        if not updates:
            return _serialize_quiz(quiz)

        updates["updatedAt"] = datetime.now(timezone.utc)
        await self.db.quizzes.update_one({"_id": quiz["_id"]}, {"$set": updates})
        refreshed = await self.db.quizzes.find_one({"_id": quiz["_id"]})
        return _serialize_quiz(refreshed)

    async def delete(self, quiz_id: str, user: dict) -> None:
        quiz = await self._get_quiz(quiz_id)
        await self._require_quiz_owner(quiz, user)
        await self.db.quizzes.delete_one({"_id": quiz["_id"]})
        await self.db.quiz_attempts.delete_many({"quizId": quiz_id})
        await self.db.quiz_attempt_counters.delete_many({"quizId": quiz_id})

    async def get_for_student(self, quiz_id: str, student: dict) -> QuizStudentOut:
        quiz = await self._get_quiz(quiz_id)
        course = await self._get_course(quiz["courseId"])
        if course.get("status") != CourseStatus.PUBLISHED.value:
            raise ApiError("Quiz not found", status_code=404)

        enrollment = await self.db.enrollments.find_one(
            {"studentId": student["id"], "courseId": quiz["courseId"]}
        )
        if not enrollment or enrollment.get("status") == EnrollmentStatus.DROPPED.value:
            raise ApiError("You must be enrolled in this course to take its quizzes", status_code=403)
        if quiz.get("lessonId"):
            lesson = await self.db.lessons.find_one(
                {"_id": parse_object_id(quiz["lessonId"], "lesson id"), "isPublished": True}
            )
            if not lesson:
                raise ApiError("Quiz not found", status_code=404)

        quiz_id_str = str(quiz["_id"])
        counter = await self.db.quiz_attempt_counters.find_one(
            {"quizId": quiz_id_str, "studentId": student["id"]}
        )
        attempts_used = int(counter.get("attemptCount", 0)) if counter else 0
        attempts_used = max(
            attempts_used,
            await self.db.quiz_attempts.count_documents(
                {"quizId": quiz_id_str, "studentId": student["id"]}
            ),
        )
        return QuizStudentOut(
            id=quiz_id_str,
            courseId=quiz["courseId"],
            lessonId=quiz.get("lessonId"),
            title=quiz["title"],
            description=quiz.get("description", ""),
            questions=[
                QuizQuestionPublic(
                    id=question["id"],
                    question=question["question"],
                    type=question["type"],
                    options=question["options"],
                    marks=question.get("marks", 1),
                )
                for question in quiz.get("questions", [])
            ],
            timeLimit=quiz.get("timeLimit", 0),
            passingScore=quiz.get("passingScore", 70),
            maxAttempts=quiz.get("maxAttempts", 1),
            createdBy=quiz["createdBy"],
            createdAt=quiz["createdAt"],
            updatedAt=quiz["updatedAt"],
            attemptsUsed=attempts_used,
            attemptsRemaining=max(0, quiz.get("maxAttempts", 1) - attempts_used),
        )

    async def list_for_student(self, course_id: str, student: dict) -> List[QuizStudentOut]:
        course = await self._get_course(course_id)
        if course.get("status") != CourseStatus.PUBLISHED.value:
            raise ApiError("Course not found", status_code=404)
        enrollment = await self.db.enrollments.find_one(
            {"studentId": student["id"], "courseId": course_id}
        )
        if not enrollment or enrollment.get("status") == EnrollmentStatus.DROPPED.value:
            raise ApiError("You must be enrolled in this course to view its quizzes", status_code=403)

        cursor = self.db.quizzes.find({"courseId": course_id}).sort(
            [("createdAt", -1), ("_id", 1)]
        )
        quizzes = []
        async for quiz in cursor:
            if quiz.get("lessonId"):
                lesson = await self.db.lessons.find_one(
                    {
                        "_id": parse_object_id(quiz["lessonId"], "lesson id"),
                        "isPublished": True,
                    }
                )
                if not lesson:
                    continue
            quizzes.append(await self.get_for_student(str(quiz["_id"]), student))
        return quizzes

    async def submit(
        self, quiz_id: str, payload: QuizAttemptSubmit, student: dict
    ) -> QuizAttemptOut:
        quiz = await self._get_quiz(quiz_id)
        await self.get_for_student(quiz_id, student)
        question_ids = {question["id"] for question in quiz.get("questions", [])}
        if not payload.answers.keys() <= question_ids:
            raise ApiError("Answers contain a question that does not belong to this quiz", status_code=422)
        options_by_id = {
            question["id"]: question["options"] for question in quiz.get("questions", [])
        }
        if any(answer not in options_by_id[question_id] for question_id, answer in payload.answers.items()):
            raise ApiError("An answer is not a valid option for its question", status_code=422)

        quiz_id_str = str(quiz["_id"])
        counter_query = {"quizId": quiz_id_str, "studentId": student["id"]}
        attempts_already_saved = await self.db.quiz_attempts.count_documents(counter_query)
        try:
            await self.db.quiz_attempt_counters.update_one(
                counter_query,
                {"$setOnInsert": {"attemptCount": attempts_already_saved}},
                upsert=True,
            )
        except DuplicateKeyError:
            pass

        counter = await self.db.quiz_attempt_counters.find_one_and_update(
            {
                **counter_query,
                "attemptCount": {"$lt": quiz.get("maxAttempts", 1)},
            },
            {"$inc": {"attemptCount": 1}},
            return_document=ReturnDocument.AFTER,
        )
        if counter is None:
            raise ApiError("You have used all attempts allowed for this quiz", status_code=409)

        result = score_answers(
            quiz.get("questions", []),
            payload.answers,
            quiz.get("passingScore", 70),
        )
        doc = {
            "quizId": quiz_id_str,
            "studentId": student["id"],
            "attemptNumber": counter["attemptCount"],
            **result,
            "submittedAt": datetime.now(timezone.utc),
        }
        inserted = await self.db.quiz_attempts.insert_one(doc)
        doc["_id"] = inserted.inserted_id
        from app.services.progress_service import ProgressService
        from app.services.certificate_service import CertificateService

        await ProgressService(self.db)._recalculate_enrollment(student["id"], quiz["courseId"])
        await CertificateService(self.db).issue_if_completed(student["id"], quiz["courseId"])
        return _serialize_attempt(doc)

    async def list_attempts(self, quiz_id: str, student: dict) -> List[QuizAttemptOut]:
        await self.get_for_student(quiz_id, student)
        cursor = self.db.quiz_attempts.find(
            {"quizId": quiz_id, "studentId": student["id"]}
        ).sort("attemptNumber", 1)
        return [_serialize_attempt(doc) async for doc in cursor]
