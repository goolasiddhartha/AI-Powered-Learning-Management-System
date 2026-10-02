"""Enrollment and progress schemas."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.enums import EnrollmentStatus
from app.schemas.course import CourseOut, LessonOut


class EnrollmentOut(BaseModel):
    id: str
    studentId: str
    courseId: str
    enrolledAt: datetime
    completedAt: Optional[datetime] = None
    status: EnrollmentStatus
    progressPercentage: int
    lastAccessedLessonId: Optional[str] = None
    course: Optional[CourseOut] = None


class LessonProgressOut(BaseModel):
    id: str
    studentId: str
    courseId: str
    lessonId: str
    isCompleted: bool
    completedAt: Optional[datetime] = None
    accessedAt: datetime
    lessonTitle: Optional[str] = None
    lessonOrder: Optional[int] = None


class CourseProgressOut(BaseModel):
    courseId: str
    courseTitle: str
    enrollmentStatus: EnrollmentStatus
    progressPercentage: int
    totalLessons: int
    completedLessons: int
    lastAccessedLessonId: Optional[str] = None
    lessons: List[LessonProgressOut] = Field(default_factory=list)


class StudentProgressSummary(BaseModel):
    enrolledCourses: int
    completedCourses: int
    totalLessonsCompleted: int
    overallProgress: int
    courses: List[CourseProgressOut] = Field(default_factory=list)


class AccessLessonResponse(BaseModel):
    lesson: LessonOut
    progress: LessonProgressOut
    previousLessonId: Optional[str] = None
    nextLessonId: Optional[str] = None
