"""AI request/response schemas."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class TutorRequest(BaseModel):
    courseId: str = Field(min_length=1)
    lessonId: Optional[str] = None
    question: str = Field(min_length=1, max_length=2000)
    conversationId: Optional[str] = None

    @field_validator("lessonId", "conversationId", mode="before")
    @classmethod
    def empty_to_none(cls, value):
        if value in ("", "null", "undefined"):
            return None
        return value

    @field_validator("question", mode="before")
    @classmethod
    def strip_question(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class ChatMessageOut(BaseModel):
    role: str
    content: str
    timestamp: datetime


class TutorResponse(BaseModel):
    conversationId: str
    answer: str
    sources: List[str] = Field(default_factory=list)
    usedAiModel: bool = False
    messages: List[ChatMessageOut] = Field(default_factory=list)


class RecommendationItem(BaseModel):
    type: str
    title: str
    reason: str
    courseId: Optional[str] = None
    lessonId: Optional[str] = None
    actionUrl: Optional[str] = None


class RecommendationsResponse(BaseModel):
    summary: str
    items: List[RecommendationItem]
    usedAiModel: bool = False
