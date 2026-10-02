"""Health and readiness endpoints."""

from fastapi import APIRouter

from app.core.database import get_database
from app.utils.responses import success

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health():
    return success(data={"status": "ok"}, message="Service is healthy")


@router.get("/ready")
async def ready():
    db = get_database()
    await db.command("ping")
    return success(data={"status": "ready", "database": "ok"}, message="Service is ready")
