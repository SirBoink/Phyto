"""
FastAPI entry point — mounts routers and CORS middleware.
""" 


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS
from app.routers import diagnosis, remedies, auth, chat

app = FastAPI(
    title="PlantGuard API",
    description="Plant disease diagnosis backend — 50% milestone demo.",
    version="0.5.0",
)

# ── CORS (allow Vite dev server) ────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────
app.include_router(diagnosis.router, prefix="/api", tags=["Diagnosis"])
app.include_router(remedies.router, prefix="/api", tags=["Remedies"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])


@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "ok", "version": "0.5.0"}
