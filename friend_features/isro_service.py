"""
Phyto — ISRO Environmental Intelligence service.

Integrates with Bhuvan WFS (wetland boundary) and Bhoonidhi STAC API
(EOS-04 soil moisture) to provide environmental disease risk context
for the Bhopal–Sehore region.
"""

import asyncio
from datetime import datetime, timedelta

import httpx

try:
    from shapely.geometry import shape, Point
    SHAPELY_AVAILABLE = True
except ImportError:
    SHAPELY_AVAILABLE = False
    print("[isro_service] shapely not installed — wetland proximity check disabled.")

from app.core.config import BHUVAN_API_KEY, BHOONIDHI_API_KEY

# ── Constants ──────────────────────────────────────────────
BHUVAN_WFS_URL = (
    "https://bhuvan-app3.nrsc.gov.in/bhuvan/wfs"
    "?service=WFS&version=1.0.0"
    "&request=GetFeature"
    "&typeName=waterbody:india_waterbody"
    "&outputFormat=application/json"
)

BHOONIDHI_STAC_BASE = "https://bhoonidhi.nrsc.gov.in/bhoonidhi-api/stac/v1"

# Bhopal Bhojtal bounding box for initial WFS filter
BHOJTAL_BBOX = "77.35,23.22,77.45,23.28"

BUFFER_KM = 2.0
BUFFER_DEG = BUFFER_KM / 111.0  # ~0.018 degrees


# ── Bhuvan Wetland Alert ───────────────────────────────────
async def get_bhuvan_wetland_alert(lat: float, lon: float) -> dict:
    """
    Check if coordinates fall within 2km of the Bhoj Wetland
    (Upper Lake / Lower Lake, Bhopal) using Bhuvan WFS.
    """
    default = {
        "in_wetland_zone": False,
        "high_fungal_risk": False,
        "zone_name": None,
    }

    if not SHAPELY_AVAILABLE:
        return default

    try:
        headers = {}
        if BHUVAN_API_KEY:
            headers["Authorization"] = f"Bearer {BHUVAN_API_KEY}"

        url = f"{BHUVAN_WFS_URL}&bbox={BHOJTAL_BBOX}"

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            data = resp.json()

        point = Point(lon, lat)
        features = data.get("features", [])

        for feature in features:
            geom = shape(feature["geometry"])
            buffered = geom.buffer(BUFFER_DEG)

            if buffered.contains(point):
                name = (
                    feature.get("properties", {}).get("name")
                    or feature.get("properties", {}).get("NAME")
                    or "Bhoj Wetland (Bhojtal)"
                )
                return {
                    "in_wetland_zone": True,
                    "high_fungal_risk": True,
                    "zone_name": name,
                }

        return default

    except Exception as e:
        print(f"[isro_service] Bhuvan WFS error: {e}")
        return default


# ── Bhoonidhi Soil Moisture ────────────────────────────────
async def get_bhoonidhi_soil_moisture(lat: float, lon: float) -> dict:
    """
    Retrieve EOS-04 derived Soil Wetness Index (SWI)
    for the nearest 500m cell from Bhoonidhi STAC API.
    """
    default = {
        "swi_value": None,
        "saturation_level": "UNKNOWN",
        "risk_amplifier": 1.0,
    }

    try:
        bbox = f"{lon - 0.005},{lat - 0.005},{lon + 0.005},{lat + 0.005}"
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        dt_range = f"{start_date.strftime('%Y-%m-%dT00:00:00Z')}/{end_date.strftime('%Y-%m-%dT23:59:59Z')}"

        url = f"{BHOONIDHI_STAC_BASE}/collections/EOS04_SWI/items"
        params = {
            "bbox": bbox,
            "datetime": dt_range,
            "limit": 5,
        }

        headers = {}
        if BHOONIDHI_API_KEY:
            headers["Authorization"] = f"Bearer {BHOONIDHI_API_KEY}"

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()

        features = data.get("features", [])
        if not features:
            return default

        # Get most recent item
        latest = max(
            features,
            key=lambda f: f.get("properties", {}).get("datetime", ""),
        )

        swi = latest.get("properties", {}).get("swi")
        if swi is None:
            # Try alternative property names
            swi = latest.get("properties", {}).get("SWI")
        if swi is None:
            swi = latest.get("properties", {}).get("soil_wetness_index")

        if swi is not None:
            swi = float(swi)
            if swi < 0.3:
                return {"swi_value": swi, "saturation_level": "LOW", "risk_amplifier": 1.0}
            elif swi <= 0.6:
                return {"swi_value": swi, "saturation_level": "MODERATE", "risk_amplifier": 1.3}
            else:
                return {"swi_value": swi, "saturation_level": "HIGH", "risk_amplifier": 1.6}

        return default

    except Exception as e:
        print(f"[isro_service] Bhoonidhi STAC error: {e}")
        return default


# ── Combined Environmental Context ────────────────────────
async def get_environmental_context(lat: float, lon: float) -> dict:
    """
    Fetch both Bhuvan wetland and Bhoonidhi soil moisture data
    concurrently, then merge into a single environmental context dict.
    """
    wetland, soil = await asyncio.gather(
        get_bhuvan_wetland_alert(lat, lon),
        get_bhoonidhi_soil_moisture(lat, lon),
    )

    # Build a plain-English risk note
    risk_note = _build_risk_note(wetland, soil)

    return {
        **wetland,
        **soil,
        "bayesian_disease_risk_note": risk_note,
    }


def _build_risk_note(wetland: dict, soil: dict) -> str:
    """Generate a human-readable risk assessment from environmental data."""
    parts = []

    sat_level = soil.get("saturation_level", "UNKNOWN")
    in_zone = wetland.get("in_wetland_zone", False)
    zone_name = wetland.get("zone_name")

    if sat_level == "HIGH":
        parts.append(
            "High soil saturation detected — elevated risk of root rot, "
            "damping off, and foliar fungal spread."
        )
    elif sat_level == "MODERATE":
        parts.append(
            "Moderate soil moisture levels — some predisposition to fungal diseases. "
            "Monitor closely."
        )
    elif sat_level == "LOW":
        parts.append(
            "Low soil moisture — reduced fungal risk but watch for drought-stress "
            "related diseases."
        )

    if in_zone and zone_name:
        parts.append(
            f"Farm is within 2 km of {zone_name} — high ambient humidity "
            "increases risk of foliar fungal and bacterial infections. "
            "Apply preventative organic fungicides."
        )

    if sat_level == "HIGH" and in_zone:
        parts.append(
            "⚠ Combined wetland proximity and high soil saturation significantly "
            "elevate disease risk. Immediate preventative treatment recommended."
        )

    if not parts:
        parts.append(
            "Environmental data is inconclusive or unavailable. "
            "Proceed with standard treatment recommendations."
        )

    return " ".join(parts)
