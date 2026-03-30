"""
Service to fetch real-time crop market prices from Agmarknet via data.gov.in API.
"""

import httpx
from app.core.config import AGMARKNET_API_KEY

# Mappings from our model labels to Agmarknet commodity names
COMMODITY_MAP = {
    "Apple": "Apple",
    "Blueberry": "Blueberry",
    "Cherry": "Cherry",
    "Corn": "Maize",
    "Grape": "Grapes",
    "Orange": "Orange",
    "Peach": "Peach",
    "Pepper": "Capsicum",
    "Potato": "Potato",
    "Raspberry": "Raspberry",
    "Soybean": "Soyabean",
    "Squash": "Squash",
    "Strawberry": "Strawberry",
    "Tomato": "Tomato",
}

# Add default realistic fallback data so UI demo always works
MOCK_DATA = {
    "Apple": {"min_price": 4000, "max_price": 6000, "modal_price": 5000, "unit": "Quintal", "market": "Shimla"},
    "Maize": {"min_price": 1800, "max_price": 2200, "modal_price": 2000, "unit": "Quintal", "market": "Indore"},
    "Grapes": {"min_price": 3000, "max_price": 5000, "modal_price": 4000, "unit": "Quintal", "market": "Nashik"},
    "Tomato": {"min_price": 1500, "max_price": 2500, "modal_price": 2000, "unit": "Quintal", "market": "Kolar"},
    "Potato": {"min_price": 1000, "max_price": 1800, "modal_price": 1400, "unit": "Quintal", "market": "Agra"},
    "Capsicum": {"min_price": 2500, "max_price": 4000, "modal_price": 3000, "unit": "Quintal", "market": "Pune"},
    "Orange": {"min_price": 2000, "max_price": 4000, "modal_price": 3000, "unit": "Quintal", "market": "Nagpur"},
    "Soyabean": {"min_price": 4000, "max_price": 5000, "modal_price": 4500, "unit": "Quintal", "market": "Ujjain"},
}

def clean_crop_name(disease_string: str) -> str:
    """Extracts base crop name from model prediction format, e.g., 'Apple___Apple_scab' -> 'Apple'"""
    if "___" in disease_string:
        crop_base = disease_string.split("___")[0].split("_")[0] # e.g. "Pepper,_bell" -> "Pepper"
        return COMMODITY_MAP.get(crop_base, crop_base)
    return disease_string

async def get_crop_pricing(disease_string: str) -> dict:
    """
    Fetches the latest pricing data for the given crop.
    Uses realistic mock data if the API key is missing or the external API times out/fails.
    """
    commodity = clean_crop_name(disease_string)
    
    # Generic fallback default if commodity not in mock
    fallback = MOCK_DATA.get(commodity, {"min_price": 1000, "max_price": 3000, "modal_price": 2000, "unit": "Quintal", "market": "Local Mandi"})
    
    if not AGMARKNET_API_KEY:
        print(f"[agmarknet] MOCK: No API key, using mock data for {commodity}")
        return {
            "commodity": commodity,
            "status": "mock",
            **fallback
        }

    # dataset ID for current daily market prices
    url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    params = {
        "api-key": AGMARKNET_API_KEY,
        "format": "json",
        "limit": 1,
        "filters[commodity]": commodity
    }
    
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            records = data.get("records", [])
            if not records:
                print(f"[agmarknet] No records found for {commodity}, using mock fallback.")
                return {"commodity": commodity, "status": "mock", **fallback}
                
            record = records[0]
            # data.gov.in returns strings for prices usually
            return {
                "commodity": commodity,
                "status": "live",
                "min_price": float(record.get("min_price", fallback["min_price"]) or fallback["min_price"]),
                "max_price": float(record.get("max_price", fallback["max_price"]) or fallback["max_price"]),
                "modal_price": float(record.get("modal_price", fallback["modal_price"]) or fallback["modal_price"]),
                "unit": "Quintal",
                "market": record.get("market", fallback["market"]),
                "state": record.get("state", "Unknown")
            }
            
    except Exception as e:
        print(f"[agmarknet] API Error fetching {commodity}: {e}. Using mock fallback.")
        return {
            "commodity": commodity,
            "status": "mock",
            **fallback
        }
