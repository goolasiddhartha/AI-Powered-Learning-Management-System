"""Gemini LLM helper with safe offline fallback."""

from __future__ import annotations

import logging
from typing import Optional

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Prefer configured model, then current Google AI Studio defaults.
_FALLBACK_MODELS = (
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
)


def is_gemini_configured() -> bool:
    return bool(get_settings().gemini_api_key.strip().strip("'\""))


def _api_key() -> str:
    return get_settings().gemini_api_key.strip().strip("'\"")


def _candidate_models() -> list[str]:
    primary = get_settings().llm_model.strip()
    models: list[str] = []
    for name in (primary, *_FALLBACK_MODELS):
        clean = name.removeprefix("models/")
        if clean and clean not in models:
            models.append(clean)
    return models


async def generate_text(prompt: str, system: Optional[str] = None) -> Optional[str]:
    """Return Gemini text, or None if unavailable so callers can fall back."""
    if not is_gemini_configured():
        return None

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage, SystemMessage
    except Exception as exc:  # noqa: BLE001
        logger.warning("LangChain Gemini import failed: %s", exc)
        return None

    messages = []
    if system:
        messages.append(SystemMessage(content=system))
    messages.append(HumanMessage(content=prompt))

    last_error: Exception | None = None
    for model_name in _candidate_models():
        try:
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=_api_key(),
                temperature=0.3,
            )
            result = await llm.ainvoke(messages)
            content = getattr(result, "content", None)
            if isinstance(content, list):
                content = " ".join(str(part) for part in content)
            text = str(content).strip() if content else None
            if text:
                logger.info("Gemini response generated with model=%s", model_name)
                return text
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            logger.warning("Gemini model %s failed: %s", model_name, exc)

    if last_error:
        logger.warning("All Gemini models failed. Last error: %s", last_error)
    return None
