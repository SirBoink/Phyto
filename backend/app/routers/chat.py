"""
Chat router — LLM-powered advisory and follow-up endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.llm_service import generate_advisory, follow_up

router = APIRouter()

MAX_FOLLOWUPS = 2


class AdvisoryRequest(BaseModel):
    disease: str
    confidence: float
    severity: float


class FollowUpMessage(BaseModel):
    role: str      # "user" or "model"
    content: str


class FollowUpRequest(BaseModel):
    history: list[FollowUpMessage]
    question: str


@router.post("/chat/advisory")
async def get_advisory(req: AdvisoryRequest):
    """Generate an initial bilingual advisory from diagnosis results."""
    result = generate_advisory(req.disease, req.confidence, req.severity)
    return result


@router.post("/chat/followup")
async def get_followup(req: FollowUpRequest):
    """Handle a follow-up question (max 2 allowed)."""
    # Count user messages in history to enforce the limit.
    # The first user message is the initial diagnosis context (seeded by the frontend),
    # not a real follow-up, so skip it when counting.
    user_msgs = sum(1 for m in req.history if m.role == "user") - 1
    if user_msgs >= MAX_FOLLOWUPS:
        raise HTTPException(
            status_code=429,
            detail="Follow-up limit reached. You can ask up to 2 follow-up questions per diagnosis.",
        )

    result = follow_up(
        [{"role": m.role, "content": m.content} for m in req.history],
        req.question,
    )
    return result
