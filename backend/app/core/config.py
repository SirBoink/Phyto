"""
Phyto — centralised configuration.
All Supabase keys, model paths, and CORS origins live here.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent   # backend/
load_dotenv(BASE_DIR / ".env")

MODEL_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"
MODEL_PATH = MODEL_DIR / "plant_disease_model.pth"
REMEDIES_PATH = DATA_DIR / "remedies.json"

# ── Gemini LLM ─────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
print(f"[config] Loaded Gemini API key: {'YES' if GEMINI_API_KEY else 'NO'}")

# ── Supabase (skeleton — not wired yet) ────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

_supabase_client = None

def get_supabase():
    global _supabase_client
    if _supabase_client is None:
        from supabase import create_client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase_client

# ── CORS ───────────────────────────────────────────────
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# ── ML Constants ───────────────────────────────────────
IMAGE_SIZE = 128      # PlantCNN was trained on 128x128 images
NUM_CLASSES = 38      # PlantVillage augmented dataset — 38 classes

# The training notebook uses ONLY Resize + ToTensor.
# NO ImageNet normalisation was applied during training,
# so we must NOT normalise during inference either.

# PlantVillage 38 classes — alphabetical folder order from ImageFolder
CLASS_LABELS = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]
