"""
Generate visualization images for Section 5.4 (Severity Estimation).
Usage: python "generate images.py"
Requires: image.png in the same directory.
"""

import cv2
import numpy as np
import os

def generate_visuals(image_path="image.png", output_dir="visuals"):
    if not os.path.exists(image_path):
        print(f"Error: {image_path} not found. Please provide an input image.")
        return

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # 1. Load Original Image
    img = cv2.imread(image_path)
    if img is None:
        print("Error: Could not decode image.")
        return
    
    cv2.imwrite(os.path.join(output_dir, "1_original.jpg"), img)
    print("Saved 1_original.jpg")

    # 2. Convert to HSV
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    cv2.imwrite(os.path.join(output_dir, "2_hsv.jpg"), hsv)
    print("Saved 2_hsv.jpg")

    # 3. Create Green Mask (Healthy)
    # Range from vision_service.py: [25, 40, 40] to [90, 255, 255]
    green_lower = np.array([25, 40, 40])
    green_upper = np.array([90, 255, 255])
    green_mask = cv2.inRange(hsv, green_lower, green_upper)
    cv2.imwrite(os.path.join(output_dir, "3_green_mask.jpg"), green_mask)
    print("Saved 3_green_mask.jpg")

    # 4. Create Disease Mask
    # Range from vision_service.py: [5, 50, 50] to [25, 255, 255]
    disease_lower = np.array([5, 50, 50])
    disease_upper = np.array([25, 255, 255])
    disease_mask = cv2.inRange(hsv, disease_lower, disease_upper)
    cv2.imwrite(os.path.join(output_dir, "4_disease_mask.jpg"), disease_mask)
    print("Saved 4_disease_mask.jpg")

    # 5. Final Result with Contours
    # Find contours on the disease mask
    contours, _ = cv2.findContours(disease_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    result_img = img.copy()
    # Draw red contours around diseased areas
    cv2.drawContours(result_img, contours, -1, (0, 0, 255), 2)
    
    # Calculate severity to print on image
    green_pixels = cv2.countNonZero(green_mask)
    disease_pixels = cv2.countNonZero(disease_mask)
    total_leaf = green_pixels + disease_pixels
    
    if total_leaf > 0:
        severity = (disease_pixels / total_leaf) * 100
        text = f"Severity: {severity:.2f}%"
        cv2.putText(result_img, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    
    cv2.imwrite(os.path.join(output_dir, "5_final_result.jpg"), result_img)
    print(f"Saved 5_final_result.jpg (Severity: {severity:.2f}%)")

if __name__ == "__main__":
    generate_visuals()
