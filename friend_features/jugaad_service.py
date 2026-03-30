"""
Jugaad remedy service — loads zero-cost organic remedies
from jugaad_remedies.json (Kabaad-se-Jugaad module).
"""

import json
from app.core.config import JUGAAD_REMEDIES_PATH

_jugaad_remedies: dict = {}

# Default fallback — Neem Kadha
_DEFAULT_REMEDY = [
    {
        "name": "Neem Leaf Extract (Neem Kadha)",
        "ingredients": "2kg fresh neem leaves + 10L water, boiled and cooled",
        "mechanism": "Azadirachtin disrupts fungal sporulation and insect molting cycles. Validated biopesticide under PPQ&S India.",
        "application": "Filter and spray 3% solution weekly. Most effective at early infection stage.",
        "source": "PPQ&S Biopesticides Portal, ICAR 2022",
    }
]


def _load_jugaad_remedies():
    """Load jugaad remedy data from disk once."""
    global _jugaad_remedies
    try:
        with open(JUGAAD_REMEDIES_PATH, "r", encoding="utf-8") as f:
            _jugaad_remedies = json.load(f)
        print(f"[jugaad_service] Loaded jugaad remedies for {len(_jugaad_remedies)} disease classes.")
    except FileNotFoundError:
        print(f"[jugaad_service] {JUGAAD_REMEDIES_PATH} not found — using defaults.")
    except Exception as e:
        print(f"[jugaad_service] Error loading jugaad remedies: {e}")


# Load at import time
_load_jugaad_remedies()


def get_jugaad_remedies(disease_class: str) -> list[dict]:
    """
    Return list of jugaad remedy dicts for the given disease class.
    Falls back to Neem Kadha if the class is not found.
    """
    entry = _jugaad_remedies.get(disease_class)
    if entry and "remedies" in entry:
        return entry["remedies"]
    return list(_DEFAULT_REMEDY)
