"""
Auth router — placeholder for future Supabase-based authentication.
"""

from fastapi import APIRouter

router = APIRouter()


@router.post("/login")
async def login():
    """Stub — Supabase auth integration planned for v1.0."""
    return {"status": "coming_soon", "message": "Authentication is under development."}


@router.post("/register")
async def register():
    """Stub — Supabase auth integration planned for v1.0."""
    return {"status": "coming_soon", "message": "Registration is under development."}
