"""
Remedies router — standalone remedy lookup by disease class.
"""

from fastapi import APIRouter
from app.services.remedy_service import get_remedy

router = APIRouter()


@router.get("/remedies/{disease_class}")
async def lookup_remedy(disease_class: str):
    """Return remedy info for a given disease class name."""
    return get_remedy(disease_class)
