"""Certificate issuance, retrieval, verification, and PDF rendering."""

from datetime import datetime, timezone
from io import BytesIO
from secrets import token_hex

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from reportlab.lib.pagesizes import landscape, letter
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

from app.models.enums import EnrollmentStatus
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
        }
        existing = await self.db.certificates.find_one_and_update(
            {"studentId": student_id, "courseId": course_id},
            {"$setOnInsert": doc, "$set": {"updatedAt": now}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
        return _serialize(existing)

    async def list_for_student(self, student_id: str) -> list[CertificateOut]:
        existing = await self.db.certificates.find({"studentId": student_id}).to_list(length=None)
        certified_courses = {item["courseId"] for item in existing}
        enrollments = self.db.enrollments.find(
            {"studentId": student_id, "status": EnrollmentStatus.COMPLETED.value}
        )
        async for enrollment in enrollments:
            if enrollment["courseId"] not in certified_courses:
                await self.issue_if_completed(student_id, enrollment["courseId"])

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
        gold = (0.77, 0.57, 0.20)
        ink = (0.20, 0.20, 0.20)
        muted = (0.38, 0.38, 0.38)
        center_x = width / 2

        pdf.setFillColorRGB(1, 1, 1)
        pdf.rect(0, 0, width, height, fill=1, stroke=0)
        pdf.setStrokeColorRGB(*gold)
        pdf.setLineWidth(2.2)
        pdf.rect(30, 28, width - 60, height - 56, fill=0, stroke=1)
        pdf.setLineWidth(0.8)
        pdf.rect(36, 34, width - 72, height - 68, fill=0, stroke=1)
        pdf.setStrokeColorRGB(0.88, 0.87, 0.84)
        pdf.setLineWidth(3)
        pdf.rect(43, 41, width - 86, height - 82, fill=0, stroke=1)

        def centered_spaced(text: str, y: float, font: str, size: float, spacing: float) -> None:
            text_width = stringWidth(text, font, size) + max(0, len(text) - 1) * spacing
            text_object = pdf.beginText((width - text_width) / 2, y)
            text_object.setFont(font, size)
            text_object.setCharSpace(spacing)
            text_object.textOut(text)
            pdf.drawText(text_object)

        def centered_fit(
            text: str,
            y: float,
            font: str,
            size: float,
            max_width: float,
            x: float = center_x,
        ) -> None:
            fitted_size = size
            while fitted_size > 6 and stringWidth(text, font, fitted_size) > max_width:
                fitted_size -= 1
            pdf.setFont(font, fitted_size)
            pdf.drawCentredString(x, y, text)

        pdf.setFillColorRGB(*ink)
        centered_spaced("CERTIFICATE", height - 140, "Times-Roman", 34, 5)
        pdf.setFont("Helvetica-Bold", 9)
        pdf.drawCentredString(center_x, height - 163, "O F   C O M P L E T I O N")

        pdf.setFillColorRGB(*muted)
        pdf.setFont("Helvetica", 11)
        pdf.drawCentredString(center_x, height - 201, "This certificate is awarded to")
        pdf.setFillColorRGB(*ink)
        centered_fit(certificate.studentName, height - 255, "Times-Italic", 30, width - 150)
        pdf.setStrokeColorRGB(*gold)
        pdf.setLineWidth(0.9)
        pdf.line(center_x - 145, height - 264, center_x + 145, height - 264)

        pdf.setFillColorRGB(*muted)
        pdf.setFont("Helvetica", 10)
        pdf.drawCentredString(center_x, height - 286, "for successfully completing")
        pdf.setFillColorRGB(*ink)
        centered_fit(certificate.courseTitle, height - 310, "Times-Bold", 18, width - 140)
        pdf.setFillColorRGB(*muted)
        pdf.setFont("Helvetica", 9)
        pdf.drawCentredString(
            center_x,
            height - 330,
            f"at LearnAI on {certificate.completionDate:%B %d, %Y}",
        )

        # Gold completion seal.
        seal_y = 125
        pdf.setStrokeColorRGB(*gold)
        pdf.setLineWidth(1)
        pdf.circle(center_x, seal_y, 31, fill=0, stroke=1)
        pdf.setFillColorRGB(0.97, 0.91, 0.73)
        pdf.circle(center_x, seal_y, 25, fill=1, stroke=0)
        pdf.setFillColorRGB(*gold)
        pdf.circle(center_x, seal_y, 19, fill=1, stroke=0)
        pdf.setFillColorRGB(1, 1, 1)
        pdf.setFont("Helvetica-Bold", 7)
        pdf.drawCentredString(center_x, seal_y - 2, "LEARN")
        pdf.drawCentredString(center_x, seal_y - 10, "AI")

        signature_y = 112
        pdf.setStrokeColorRGB(*gold)
        pdf.setLineWidth(0.7)
        pdf.line(102, signature_y, 275, signature_y)
        pdf.line(width - 275, signature_y, width - 102, signature_y)
        pdf.setFillColorRGB(*ink)
        centered_fit(certificate.issuer, 96, "Helvetica-Bold", 8, 165, x=188.5)
        pdf.setFillColorRGB(*muted)
        pdf.setFont("Helvetica", 7)
        pdf.drawCentredString(188.5, 84, "ISSUED BY")
        pdf.setFillColorRGB(*ink)
        centered_fit(certificate.instructorName, 96, "Helvetica-Bold", 8, 165, x=width - 188.5)
        pdf.setFillColorRGB(*muted)
        pdf.setFont("Helvetica", 7)
        pdf.drawCentredString(width - 188.5, 84, "COURSE INSTRUCTOR")

        pdf.setFillColorRGB(*muted)
        pdf.setFont("Helvetica", 7)
        pdf.drawCentredString(center_x, 58, f"Certificate ID: {certificate.certificateId}")
        pdf.showPage()
        pdf.save()
        return output.getvalue()
