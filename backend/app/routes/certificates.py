"""Certificate routes."""

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_db, require_role
from app.models.enums import UserRole
from app.services.certificate_service import CertificateService
from app.utils.responses import success

router = APIRouter(prefix="/certificates", tags=["Certificates"])


@router.get("")
async def list_certificates(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.STUDENT.value)),
):
    items = await CertificateService(db).list_for_student(current_user["id"])
    return success(data=[item.model_dump(mode="json") for item in items], message="Certificates retrieved")


@router.get("/verify/{certificate_id}")
async def verify_certificate(certificate_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    item = await CertificateService(db).verify(certificate_id)
    return success(data=item.model_dump(mode="json"), message="Certificate verified")


@router.get("/{certificate_id}/download")
async def download_certificate(
    certificate_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.STUDENT.value)),
):
    item = await CertificateService(db).get_for_student(certificate_id, current_user["id"])
    return Response(
        content=CertificateService.render_pdf(item),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{item.certificateId}.pdf"'},
    )


@router.get("/{certificate_id}")
async def get_certificate(
    certificate_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(require_role(UserRole.STUDENT.value)),
):
    item = await CertificateService(db).get_for_student(certificate_id, current_user["id"])
    return success(data=item.model_dump(mode="json"), message="Certificate retrieved")
