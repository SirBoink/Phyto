import cv2
import numpy as np
import csv
import ast
from pathlib import Path
from app.core.config import HSV_VALUES_PATH

# Cache for HSV values: (crop, disease) -> (lower_np_array, upper_np_array)
HSV_DATA = {}

def load_hsv_data():
    """Load HSV bounds from the CSV file."""
    if not HSV_DATA and Path(HSV_VALUES_PATH).exists():
        try:
            with open(HSV_VALUES_PATH, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    crop = row['Crop'].strip().lower()
                    disease = row['Disease / Pest'].strip().lower()
                    
                    # Convert "[10, 50, 20]" string to list/np.array
                    lower = np.array(ast.literal_eval(row['HSV Lower Bound']))
                    upper = np.array(ast.literal_eval(row['HSV Upper Bound']))
                    
                    HSV_DATA[(crop, disease)] = (lower, upper)
            print(f"[vision_service] Loaded {len(HSV_DATA)} HSV mapping entries.")
        except Exception as e:
            print(f"[vision_service] Error loading HSV CSV: {e}")

# Initial load
load_hsv_data()

def calculate_severity(image_bytes: bytes, crop: str = None, disease: str = None) -> float:
    """
    Estimate disease severity as a percentage (0-100).
    Uses crop/disease specific HSV bounds from CSV if available.
    """
    try:
        arr = np.frombuffer(image_bytes, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)

        if img is None:
            return 0.0

        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        # 1. Green range — healthy leaf tissue (standard default)
        green_lower = np.array([25, 40, 40])
        green_upper = np.array([90, 255, 255])
        green_mask = cv2.inRange(hsv, green_lower, green_upper)

        # 2. Disease range — Lookup from CSV or use default brown/yellow
        disease_lower = np.array([5, 50, 50])    # Default
        disease_upper = np.array([25, 255, 255])  # Default

        if crop and disease:
            crop_key = crop.strip().lower()
            disease_key = disease.strip().lower()
            
            # Simple normalization for matching (e.g., 'mites_and_trips' -> 'mites and trips')
            disease_key = disease_key.replace('_', ' ')
            
            # Try direct match
            found_bounds = HSV_DATA.get((crop_key, disease_key))
            
            if not found_bounds:
                # Fuzzy match: check if the predicted disease string is contained in any CSV disease string
                for (c, d), (l, u) in HSV_DATA.items():
                    if c == crop_key and (disease_key in d or d in disease_key):
                        found_bounds = (l, u)
                        break
            
            if found_bounds:
                disease_lower, disease_upper = found_bounds
                # print(f"[vision_service] Using custom HSV bounds for {crop}/{disease}")

        disease_mask = cv2.inRange(hsv, disease_lower, disease_upper)

        green_pixels = cv2.countNonZero(green_mask)
        disease_pixels = cv2.countNonZero(disease_mask)
        total_leaf = green_pixels + disease_pixels

        if total_leaf == 0:
            return 0.0

        severity = (disease_pixels / total_leaf) * 100
        return round(severity, 2)

    except Exception as e:
        print(f"[vision_service] Severity calculation error: {e}")
        return 0.0
