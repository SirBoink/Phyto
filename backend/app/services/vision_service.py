"""
Visual severity estimation using OpenCV.
Segments green (healthy) vs. diseased tissue via HSV masking.
"""

import cv2
import numpy as np


def calculate_severity(image_bytes: bytes) -> float:
    """
    Estimate disease severity as a percentage (0-100).

    Approach: convert to HSV, isolate green pixels (healthy leaf tissue),
    and treat remaining leaf area as potentially diseased.
    """
    try:
        arr = np.frombuffer(image_bytes, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)

        if img is None:
            return 0.0

        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        # Green range — healthy leaf tissue
        green_lower = np.array([25, 40, 40])
        green_upper = np.array([90, 255, 255])
        green_mask = cv2.inRange(hsv, green_lower, green_upper)

        # Brown/yellow range — diseased tissue
        disease_lower = np.array([5, 50, 50])
        disease_upper = np.array([25, 255, 255])
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
