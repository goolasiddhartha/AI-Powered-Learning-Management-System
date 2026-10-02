"""Course and lesson Pydantic schemas."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.enums import CourseDifficulty, CourseStatus


class CourseCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = ""
    shortDescription: str = Field(default="", max_length=300)
    thumbnail: str = ""
    category: str = ""
    difficulty: CourseDifficulty = CourseDifficulty.BEGINNER
    duration: str = ""
    language: str = "English"
    prerequisites: List[str] = Field(default_factory=list)
    learningObjectives: List[str] = Field(default_factory=list)


class CourseUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=200)
    description: Optional[str] = None
    shortDescription: Optional[str] = Field(default=None, max_length=300)
    thumbnail: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[CourseDifficulty] = None
    duration: Optional[str] = None
    language: Optional[str] = None
    prerequisites: Optional[List[str]] = None
    learningObjectives: Optional[List[str]] = None
    status: Optional[CourseStatus] = None


class CourseOut(BaseModel):
    id: str
    title: str
    description: str
    shortDescription: str
    thumbnail: str
    category: str
    instructorId: str
    instructorName: str
    difficulty: CourseDifficulty
    duration: str
    language: str
    prerequisites: List[str]
    learningObjectives: List[str]
    status: CourseStatus
    enrollmentCount: int
    lessonCount: int = 0
    createdAt: datetime
    updatedAt: datetime


class LessonCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: str = ""
    order: int = Field(default=1, ge=1)
    content: str = ""
    videoUrl: str = ""
    resources: List[str] = Field(default_factory=list)
    estimatedMinutes: int = Field(default=10, ge=1, le=600)
    isPublished: bool = False


class LessonUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    description: Optional[str] = None
    order: Optional[int] = Field(default=None, ge=1)
    content: Optional[str] = None
    videoUrl: Optional[str] = None
    resources: Optional[List[str]] = None
    estimatedMinutes: Optional[int] = Field(default=None, ge=1, le=600)
    isPublished: Optional[bool] = None


class LessonOut(BaseModel):
    id: str
    courseId: str
    title: str
    description: str
    order: int
    content: str
    videoUrl: str
    resources: List[str]
    estimatedMinutes: int
    isPublished: bool
    createdAt: datetime
    updatedAt: datetime
