"""Reusable input validators (file types, sizes, etc.)."""

from pathlib import Path

ALLOWED_MATERIAL_EXTENSIONS = {".pdf", ".txt", ".docx", ".md", ".markdown"}


def is_allowed_material(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_MATERIAL_EXTENSIONS
