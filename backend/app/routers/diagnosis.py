"""
Diagnosis router — handles image upload and prediction.
"""

from fastapi import APIRouter, UploadFile, File, Form
from app.services.ml_service import model_manager
from app.services.vision_service import calculate_severity
from app.services.remedy_service import get_remedy

router = APIRouter()


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    model_key: str = Form("general"),
):
    """
    Accept a leaf image, run ML prediction + severity analysis,
    and return diagnosis with a matching remedy.
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

    return {
        **prediction,
        "severity": severity,
        "remedy": remedy,
    }
