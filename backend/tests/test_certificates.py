from bson import ObjectId
import pytest
from types import SimpleNamespace

from app.services.certificate_service import CertificateService
from app.services.progress_service import ProgressService


class FakeCursor:
    def __init__(self, documents):
        self.documents = documents

    def sort(self, *_args):
        return self

    async def to_list(self, length=None):
        return self.documents

    def __aiter__(self):
        self._iterator = iter(self.documents)
        return self

    async def __anext__(self):
        try:
            return next(self._iterator)
        except StopIteration:
            raise StopAsyncIteration


class FakeCollection:
    def __init__(self, documents=None):
        self.documents = documents or {}
        self.update = None

    async def find_one(self, query, projection=None):
        return self.documents.get(query["_id"])

    async def find_one_and_update(self, query, update, **kwargs):
        self.update = update
        document = {**update["$setOnInsert"], **update["$set"], "_id": ObjectId()}
        return document


class FakeDatabase:
    def __init__(self, student_id, course_id, instructor_id):
        self.users = FakeCollection(
            {
                student_id: {"firstName": "Alex", "lastName": "Learner"},
                instructor_id: {"firstName": "Taylor", "lastName": "Teacher"},
            }
        )
        self.courses = FakeCollection(
            {course_id: {"instructorId": str(instructor_id), "title": "Course"}}
        )
        self.certificates = FakeCollection()


@pytest.mark.asyncio
async def test_certificate_upsert_sets_updated_at_without_conflicting_operators(monkeypatch):
    student_id = ObjectId()
    course_id = ObjectId()
    instructor_id = ObjectId()
    db = FakeDatabase(student_id, course_id, instructor_id)

    async def course_is_complete(self, _student_id, _course_id):
        return True

    monkeypatch.setattr(ProgressService, "check_course_completion", course_is_complete)

    certificate = await CertificateService(db).issue_if_completed(
        str(student_id), str(course_id)
    )

    assert certificate is not None
    assert certificate.studentName == "Alex Learner"
    assert certificate.updatedAt is not None
    assert "updatedAt" not in db.certificates.update["$setOnInsert"]
    assert "updatedAt" in db.certificates.update["$set"]

    pdf = CertificateService.render_pdf(certificate)
    assert pdf.startswith(b"%PDF-")


@pytest.mark.asyncio
async def test_certificate_list_issues_missing_certificates_for_completed_courses(monkeypatch):
    completed_course_id = "completed-course"
    student_id = "student"
    calls = []
    enrollment_documents = [
        {
            "studentId": student_id,
            "courseId": completed_course_id,
            "status": "COMPLETED",
        },
        {"studentId": student_id, "courseId": "active-course", "status": "ACTIVE"},
    ]
    db = SimpleNamespace(
        certificates=SimpleNamespace(
            find=lambda _query: FakeCursor([])
        ),
        enrollments=SimpleNamespace(
            find=lambda query: FakeCursor([
                document
                for document in enrollment_documents
                if all(document.get(key) == value for key, value in query.items())
            ])
        ),
    )

    async def issue_if_completed(self, requested_student_id, course_id):
        calls.append((requested_student_id, course_id))

    monkeypatch.setattr(CertificateService, "issue_if_completed", issue_if_completed)

    certificates = await CertificateService(db).list_for_student(student_id)

    assert certificates == []
    assert calls == [(student_id, completed_course_id)]
