"""Certificate API schemas."""

from datetime import datetime

from pydantic import BaseModel


class CertificateOut(BaseModel):
    id: str
    certificateId: str
    studentId: str
    studentName: str
    courseId: str
    courseTitle: str
    instructorName: str
    completionDate: datetime
    issuer: str
    createdAt: datetime
    updatedAt: datetime


class CertificateVerificationOut(BaseModel):
    certificateId: str
    studentName: str
    courseTitle: str
    instructorName: str
    completionDate: datetime
    issuer: str
