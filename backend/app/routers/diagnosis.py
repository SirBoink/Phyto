from fastapi import APIRouter, UploadFile, File, Form, Query
import asyncio
from app.services.ml_service import model_manager
from app.services.vision_service import calculate_severity
from app.services.remedy_service import get_remedy
from app.services.jugaad_service import get_jugaad_remedies
from app.services.isro_service import get_environmental_context
from app.services.agmarknet_service import get_crop_pricing
from app.services.weather_service import get_weather_data

router = APIRouter()

# Default coordinates — Bhopal city center
DEFAULT_LAT = 23.2599
DEFAULT_LON = 77.4126

# Nuance: How much does leaf severity impact overall harvestable yield?
# 1.0 means 20% severity = 20% loss. 0.5 means 20% severity = 10% loss.
CROP_YIELD_SENSITIVITY = {
    "Tomato": 0.85,
    "Potato": 0.70,
    "Maize": 0.60,
    "Apple": 0.50,
    "Grapes": 0.75,
    "Orange": 0.40,
    "Peach": 0.50,
    "Capsicum": 0.90,
    "Soyabean": 0.65,
    "Squash": 0.95,
    "Strawberry": 0.80,
    "Raspberry": 0.80,
    "Blueberry": 0.75,
    "Cherry": 0.60,
}

@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    model_key: str = Form("general"),
    lat: float = Query(None, description="Latitude"),
    lon: float = Query(None, description="Longitude"),
):
    """
    Accept a leaf image, run ML prediction + severity analysis,
    and return diagnosis with remedies, environmental context, and market metrics.
    """
    image_bytes = await file.read()

    # ML prediction
    prediction = model_manager.predict(image_bytes, model_key)
    if "disease" not in prediction:
        return prediction

    # Visual severity via OpenCV
    crop_context = model_key
    disease_context = prediction.get("disease", "")

    if model_key == "general" and "___" in disease_context:
        parts = disease_context.split("___")
        crop_context = parts[0]
        disease_context = parts[1]

    severity = calculate_severity(image_bytes, crop=crop_context, disease=disease_context)

    # Remedy lookup (Synchronous)
    remedy = get_remedy(prediction["disease"])
    jugaad = get_jugaad_remedies(prediction["disease"])

    # Parallel data fetching (The "Intelligent Layer") - Asynchronous
    use_lat = lat if lat is not None else DEFAULT_LAT
    use_lon = lon if lon is not None else DEFAULT_LON
    
    tasks = [
        get_environmental_context(use_lat, use_lon),
        get_crop_pricing(prediction["disease"]),
        get_weather_data(use_lat, use_lon)
    ]
    
    env_context, market_data, weather = await asyncio.gather(*tasks)


    # ── Nuanced Financial Loss Calculation ──────────────────
    commodity = market_data["commodity"]
    sensitivity = CROP_YIELD_SENSITIVITY.get(commodity, 0.75)
    
    # Loss percentage = severity * sensitivity
    # We cap it to avoid looking unrealistic at very high severities
    impact_pct = min(severity * sensitivity, 95.0) 
    
    modal_price = market_data["modal_price"]
    
    # Financial loss per Quintal
    loss_per_unit = (impact_pct / 100.0) * modal_price
    
    market_loss_data = {
        "impact_percentage": round(impact_pct, 1),
        "loss_per_unit": round(loss_per_unit, 0),
        "currency": "INR",
        "sensitivity_factor": sensitivity,
        "recommendation": "High Priority" if impact_pct > 25 else "Monitor"
    }

    return {
        **prediction,
        "severity": severity,
        "remedy": remedy,
        "jugaad_remedies": jugaad,
        "environmental_context": env_context,
        "market_data": market_data,
        "market_loss_data": market_loss_data,
        "weather": weather
    }

