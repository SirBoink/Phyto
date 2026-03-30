"""
Diagnosis router — handles image upload and prediction.
"""

from fastapi import APIRouter, UploadFile, File, Form, Query
from app.services.ml_service import model_manager
from app.services.vision_service import calculate_severity
from app.services.remedy_service import get_remedy
from app.services.jugaad_service import get_jugaad_remedies
from app.services.isro_service import get_environmental_context
from app.services.agmarknet_service import get_crop_pricing
import asyncio

router = APIRouter()

# Default coordinates — Bhopal city center
DEFAULT_LAT = 23.2599
DEFAULT_LON = 77.4126


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    model_key: str = Form("general"),
    lat: float = Query(None, description="Latitude (defaults to Bhopal center)"),
    lon: float = Query(None, description="Longitude (defaults to Bhopal center)"),
):
    """
    Accept a leaf image, run ML prediction + severity analysis,
    and return diagnosis with remedy, jugaad remedies, and environmental context.
    """
    image_bytes = await file.read()

    # ML prediction
    prediction = model_manager.predict(image_bytes, model_key)

    # Skip severity + remedy for placeholder models
    if "disease" not in prediction:
        return prediction

    # Visual severity via OpenCV
    severity = calculate_severity(image_bytes)

    # Remedy lookup
    remedy = get_remedy(prediction["disease"])

    # Jugaad remedies (Kabaad-se-Jugaad module)
    jugaad = get_jugaad_remedies(prediction["disease"])

    # Environmental context (ISRO Bhuvan + Bhoonidhi) & Market Pricing (Agmarknet)
    use_lat = lat if lat is not None else DEFAULT_LAT
    use_lon = lon if lon is not None else DEFAULT_LON
    
    env_task = get_environmental_context(use_lat, use_lon)
    market_task = get_crop_pricing(prediction["disease"])
    
    env_context, market_data = await asyncio.gather(env_task, market_task)

    return {
        **prediction,
        "severity": severity,
        "remedy": remedy,
        "jugaad_remedies": jugaad,
        "environmental_context": env_context,
        "market_data": market_data,
    }
