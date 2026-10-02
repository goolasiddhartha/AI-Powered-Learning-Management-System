"""Quiz and quiz-attempt API schemas."""

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.enums import QuestionType


class QuizQuestionInput(BaseModel):
    id: Optional[str] = None
    question: str = Field(min_length=1, max_length=2000)
    type: QuestionType = QuestionType.MCQ
    options: List[str] = Field(min_length=2, max_length=8)
    correctAnswer: str = Field(min_length=1, max_length=500)
    explanation: str = Field(default="", max_length=2000)
    marks: float = Field(default=1, gt=0, le=100)

    @field_validator("question", "correctAnswer")
    @classmethod
    def trim_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value

    @field_validator("options")
    @classmethod
    def validate_options(cls, options: List[str]) -> List[str]:
        trimmed = [option.strip() for option in options]
        if any(not option for option in trimmed):
            raise ValueError("options must not be blank")
        if len({option.casefold() for option in trimmed}) != len(trimmed):
            raise ValueError("options must be unique")
        return trimmed

    @model_validator(mode="after")
    def validate_correct_answer(self):
        if self.correctAnswer not in self.options:
            raise ValueError("correctAnswer must match one of the options")
        if self.type == QuestionType.TRUE_FALSE and {
            option.casefold() for option in self.options
        } != {"true", "false"}:
            raise ValueError("TRUE_FALSE questions must have True and False options")
        return self


class QuizCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: str = Field(default="", max_length=2000)
    lessonId: Optional[str] = None
    questions: List[QuizQuestionInput] = Field(min_length=1, max_length=100)
    timeLimit: int = Field(default=0, ge=0, le=600)
    passingScore: float = Field(default=70, ge=0, le=100)
    maxAttempts: int = Field(default=1, ge=1, le=100)
    required: bool = True

    @field_validator("title")
    @classmethod
    def trim_title(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("title must not be blank")
        return value

    @model_validator(mode="after")
    def validate_question_ids(self):
        ids = [question.id for question in self.questions if question.id]
        if len(ids) != len(set(ids)):
            raise ValueError("question ids must be unique")
        return self


class QuizUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    lessonId: Optional[str] = None
    questions: Optional[List[QuizQuestionInput]] = Field(default=None, min_length=1, max_length=100)
    timeLimit: Optional[int] = Field(default=None, ge=0, le=600)
    passingScore: Optional[float] = Field(default=None, ge=0, le=100)
    maxAttempts: Optional[int] = Field(default=None, ge=1, le=100)
    required: Optional[bool] = None

    @field_validator("title")
    @classmethod
    def trim_title(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("title must not be blank")
        return value

    @model_validator(mode="after")
    def validate_question_ids(self):
        if self.questions is not None:
            ids = [question.id for question in self.questions if question.id]
            if len(ids) != len(set(ids)):
                raise ValueError("question ids must be unique")
        return self


class QuizQuestionPublic(BaseModel):
    id: str
    question: str
    type: QuestionType
    options: List[str]
    marks: float


class QuizQuestionAdmin(QuizQuestionPublic):
    correctAnswer: str
    explanation: str


class QuizOut(BaseModel):
    id: str
    courseId: str
    lessonId: Optional[str]
    title: str
    description: str
    timeLimit: int
    passingScore: float
    maxAttempts: int
    required: bool = True
    createdBy: str
    createdAt: datetime
    updatedAt: datetime


class QuizAdminOut(QuizOut):
    questions: List[QuizQuestionAdmin]


class QuizStudentOut(QuizOut):
    questions: List[QuizQuestionPublic]
    attemptsUsed: int
    attemptsRemaining: int


class QuizAttemptSubmit(BaseModel):
    answers: Dict[str, str] = Field(max_length=100)


class QuizAttemptQuestionResult(BaseModel):
    questionId: str
    question: str
    selectedAnswer: Optional[str]
    correctAnswer: str
    explanation: str
    earnedMarks: float
    totalMarks: float


class QuizAttemptOut(BaseModel):
    id: str
    quizId: str
    studentId: str
    attemptNumber: int
    answers: Dict[str, str]
    score: float
    earnedMarks: float
    totalMarks: float
    passingScore: float
    passed: bool
    results: List[QuizAttemptQuestionResult]
    submittedAt: datetime
