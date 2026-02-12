"""
Remedy lookup service — loads remedies from a JSON file
and returns matching entries or a sensible fallback.
"""

import json
from app.core.config import REMEDIES_PATH

_remedies: dict = {}


def _load_remedies():
    """Load remedy data from disk once."""
    global _remedies
    try:
        with open(REMEDIES_PATH, "r", encoding="utf-8") as f:
            _remedies = json.load(f)
        print(f"[remedy_service] Loaded {len(_remedies)} remedies.")
    except FileNotFoundError:
        print(f"[remedy_service] {REMEDIES_PATH} not found — using empty set.")
    except Exception as e:
        print(f"[remedy_service] Error loading remedies: {e}")


# Load at import time
_load_remedies()

# Default response when disease isn't in the database yet
_DEFAULT_REMEDY = {
    "disease": "Unknown",
    "commercial": {
        "product": "Consult a local agricultural extension office.",
        "dosage": "N/A",
        "notes": "No specific remedy found for this diagnosis.",
    },
    "jugaad": {
        "recipe": "Neem oil spray — mix 5ml neem oil in 1L water, spray on affected leaves.",
        "frequency": "Every 5-7 days",
        "notes": "General-purpose organic treatment.",
    },
}


def get_remedy(disease_class: str) -> dict:
    """Return remedy details for a disease class, or a default fallback."""
    if disease_class in _remedies:
        return _remedies[disease_class]
    return {**_DEFAULT_REMEDY, "disease": disease_class}
