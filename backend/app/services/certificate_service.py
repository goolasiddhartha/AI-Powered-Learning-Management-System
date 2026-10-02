"""Certificate issuance, retrieval, verification, and PDF rendering."""

from datetime import datetime, timezone
from io import BytesIO
from secrets import token_hex

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from reportlab.lib.pagesizes import landscape, letter
from reportlab.pdfgen import canvas

from app.schemas.certificate import CertificateOut, CertificateVerificationOut
from app.utils.helpers import parse_object_id
from app.utils.responses import ApiError


def _certificate_id() -> str:
    return f"CERT-{datetime.now(timezone.utc):%Y%m%d}-{token_hex(4).upper()}"


def _serialize(doc: dict) -> CertificateOut:
    return CertificateOut(
        id=str(doc["_id"]),
        certificateId=doc["certificateId"],
        studentId=doc["studentId"],
        studentName=doc["studentName"],
        courseId=doc["courseId"],
        courseTitle=doc["courseTitle"],
        instructorName=doc["instructorName"],
        completionDate=doc["completionDate"],
        issuer=doc["issuer"],
        createdAt=doc["createdAt"],
        updatedAt=doc["updatedAt"],
    )


class CertificateService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def issue_if_completed(self, student_id: str, course_id: str) -> CertificateOut | None:
        from app.services.progress_service import ProgressService

        if not await ProgressService(self.db).check_course_completion(student_id, course_id):
            return None

        student = await self.db.users.find_one({"_id": parse_object_id(student_id, "student id")})
        course = await self.db.courses.find_one({"_id": parse_object_id(course_id, "course id")})
        if not student or not course:
            return None
        instructor = await self.db.users.find_one({"_id": parse_object_id(course["instructorId"], "instructor id")})
        now = datetime.now(timezone.utc)
        student_name = f"{student.get('firstName', '')} {student.get('lastName', '')}".strip()
        instructor_name = (
            f"{instructor.get('firstName', '')} {instructor.get('lastName', '')}".strip()
            if instructor
            else "Course instructor"
        )
        doc = {
            "studentId": student_id,
            "courseId": course_id,
            "certificateId": _certificate_id(),
            "studentName": student_name,
            "courseTitle": course.get("title", ""),
            "instructorName": instructor_name,
            "completionDate": now,
            "issuer": "AI-Powered Learning Management System",
            "createdAt": now,
            "updatedAt": now,
        }
        existing = await self.db.certificates.find_one_and_update(
            {"studentId": student_id, "courseId": course_id},
            {"$setOnInsert": doc, "$set": {"updatedAt": now}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
        return _serialize(existing)

    async def list_for_student(self, student_id: str) -> list[CertificateOut]:
        cursor = self.db.certificates.find({"studentId": student_id}).sort("completionDate", -1)
        return [_serialize(doc) async for doc in cursor]

    async def get_for_student(self, certificate_id: str, student_id: str) -> CertificateOut:
        doc = await self.db.certificates.find_one(
            {"_id": parse_object_id(certificate_id, "certificate id"), "studentId": student_id}
        )
        if not doc:
            raise ApiError("Certificate not found", status_code=404)
        return _serialize(doc)

    async def verify(self, certificate_id: str) -> CertificateVerificationOut:
        doc = await self.db.certificates.find_one({"certificateId": certificate_id})
        if not doc:
            raise ApiError("Certificate not found", status_code=404)
        return CertificateVerificationOut(
            certificateId=doc["certificateId"],
            studentName=doc["studentName"],
            courseTitle=doc["courseTitle"],
            instructorName=doc["instructorName"],
            completionDate=doc["completionDate"],
            issuer=doc["issuer"],
        )

    @staticmethod
    def render_pdf(certificate: CertificateOut) -> bytes:
        output = BytesIO()
        page = landscape(letter)
        pdf = canvas.Canvas(output, pagesize=page)
        width, height = page
        pdf.setStrokeColorRGB(0.12, 0.32, 0.56)
        pdf.setLineWidth(3)
        pdf.rect(30, 30, width - 60, height - 60)
        pdf.setFillColorRGB(0.12, 0.32, 0.56)
        pdf.setFont("Helvetica-Bold", 28)
        pdf.drawCentredString(width / 2, height - 120, "Certificate of Completion")
        pdf.setFillColorRGB(0.15, 0.15, 0.15)
        pdf.setFont("Helvetica", 14)
        pdf.drawCentredString(width / 2, height - 165, "This certifies that")
        pdf.setFont("Helvetica-Bold", 24)
        pdf.drawCentredString(width / 2, height - 205, certificate.studentName)
        pdf.setFont("Helvetica", 14)
        pdf.drawCentredString(width / 2, height - 245, "has successfully completed")
        pdf.setFont("Helvetica-Bold", 20)
        pdf.drawCentredString(width / 2, height - 280, certificate.courseTitle)
        pdf.setFont("Helvetica", 10)
        pdf.drawString(60, 62, f"Certificate ID: {certificate.certificateId}")
        pdf.drawRightString(width - 60, 62, f"Completed: {certificate.completionDate:%Y-%m-%d} | Issued by {certificate.issuer}")
        pdf.showPage()
        pdf.save()
        return output.getvalue()
