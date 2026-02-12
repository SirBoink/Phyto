"""
Phyto — ML inference service.

Loads the PlantCNN model that was trained in the companion notebook
(PlantVillage augmented dataset, 38 classes, 128x128 input, no ImageNet
normalisation).  Supports model switching for future specialist models.
"""

import io
import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms

from app.core.config import MODEL_PATH, IMAGE_SIZE, NUM_CLASSES, CLASS_LABELS


# ── PlantCNN architecture (must match training code exactly) ──────
class PlantCNN(nn.Module):
    def __init__(self, num_classes: int):
        super().__init__()

        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1), nn.ReLU(),
            nn.Conv2d(32, 32, 3),           nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(32, 64, 3, padding=1),  nn.ReLU(),
            nn.Conv2d(64, 64, 3),             nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(64, 128, 3, padding=1), nn.ReLU(),
            nn.Conv2d(128, 128, 3),           nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(128, 256, 3, padding=1), nn.ReLU(),
            nn.Conv2d(256, 256, 3),            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(256, 512, 3, padding=1), nn.ReLU(),
            nn.Conv2d(512, 512, 3),            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Dropout(0.25),
        )

        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(512 * 2 * 2, 1500),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(1500, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x


# ── Model manager ───────────────────────────────────────────────
class ModelManager:
    def __init__(self):
        self.model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.current_model_key = "general"
        self.demo_mode = False

        # Transforms — exactly match training: Resize + ToTensor only
        self.transform = transforms.Compose([
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.ToTensor(),
        ])

        self._load_model()

    # ── internal: load model weights ────────────────────────────
    def _load_model(self):
        try:
            self.model = PlantCNN(NUM_CLASSES).to(self.device)
            state_dict = torch.load(
                str(MODEL_PATH),
                map_location=self.device,
                weights_only=True,
            )
            self.model.load_state_dict(state_dict)
            self.model.eval()
            self.demo_mode = False
            print(f"[ml_service] Model loaded from {MODEL_PATH}")
        except FileNotFoundError:
            print(f"[ml_service] {MODEL_PATH} not found — running in DEMO mode")
            self.model = None
            self.demo_mode = True
        except Exception as e:
            print(f"[ml_service] Error loading model: {e} — running in DEMO mode")
            self.model = None
            self.demo_mode = True

    # ── public: run prediction on raw image bytes ───────────────
    def predict(self, image_bytes: bytes, model_key: str = "general"):
        self.current_model_key = model_key

        # Placeholder models return a mock response
        if model_key in ("soynet", "fivecrop"):
            return {
                "status": f"{model_key} model coming soon — stay tuned.",
                "model_used": model_key,
            }

        # Demo mode — return a realistic-looking mock
        if self.demo_mode:
            return {
                "disease": "Tomato___Late_blight",
                "confidence": 0.87,
                "model_used": "general (demo)",
            }

        # Real inference
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)

        class_idx = predicted.item()
        label = CLASS_LABELS[class_idx] if class_idx < len(CLASS_LABELS) else f"class_{class_idx}"

        return {
            "disease": label,
            "confidence": round(confidence.item(), 4),
            "model_used": model_key,
        }


# Singleton
model_manager = ModelManager()
