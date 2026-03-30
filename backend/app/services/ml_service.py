"""
Phyto — ML inference service.

Loads the PlantCNN generic model, as well as specialised models (Soybean, Wheat, Chili)
using standard PyTorch architectures. Implements lazy-loading to keep memory light.
"""

import io
import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms, models

from app.core.config import (
    MODEL_PATH_GENERIC, MODEL_PATH_SOYBEAN, MODEL_PATH_WHEAT, MODEL_PATH_CHILI,
    IMAGE_SIZE_GENERIC, NUM_CLASSES_GENERIC, CLASS_LABELS_GENERIC,
    IMAGE_SIZE_CUSTOM, IMAGENET_MEAN, IMAGENET_STD,
    CLASS_LABELS_SOYBEAN, CLASS_LABELS_WHEAT, CLASS_LABELS_CHILI
)

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
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.current_model_key = None
        self.model = None
        self.demo_mode = False

        # Transform generic
        self.transform_generic = transforms.Compose([
            transforms.Resize((IMAGE_SIZE_GENERIC, IMAGE_SIZE_GENERIC)),
            transforms.ToTensor(),
        ])

        # Transform custom models
        self.transform_custom = transforms.Compose([
            transforms.Resize((IMAGE_SIZE_CUSTOM, IMAGE_SIZE_CUSTOM)),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ])
        
        # Load generic model first to be ready since it's the default
        self._set_model("general")
    
    def _build_model_architecture(self, model_key):
        if model_key == "general":
            model = PlantCNN(NUM_CLASSES_GENERIC)
            return model, MODEL_PATH_GENERIC, CLASS_LABELS_GENERIC, self.transform_generic
        elif model_key == "soybean":
            model = models.resnet50(weights=None)
            num_features = model.fc.in_features
            model.fc = nn.Linear(num_features, len(CLASS_LABELS_SOYBEAN))
            return model, MODEL_PATH_SOYBEAN, CLASS_LABELS_SOYBEAN, self.transform_custom
        elif model_key == "wheat":
            model = models.efficientnet_b0(weights=None)
            num_features = model.classifier[1].in_features
            model.classifier[1] = nn.Linear(num_features, len(CLASS_LABELS_WHEAT))
            return model, MODEL_PATH_WHEAT, CLASS_LABELS_WHEAT, self.transform_custom
        elif model_key == "chili":
            model = models.vgg16(weights=None)
            # VGG classifier[6] is usually the final layer, let's verify if that matches standard PyTorch behavior
            num_features = model.classifier[6].in_features
            model.classifier[6] = nn.Linear(num_features, len(CLASS_LABELS_CHILI))
            return model, MODEL_PATH_CHILI, CLASS_LABELS_CHILI, self.transform_custom
        else:
            raise ValueError(f"Unknown model key {model_key}")

    def _set_model(self, model_key):
        if self.current_model_key == model_key and self.model is not None:
            return  # Already loaded
            
        print(f"[ml_service] Requested model '{model_key}'. Unloading previous model and loading new one...")
        
        # Free memory of previous model
        if self.model is not None:
            del self.model
            self.model = None
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                
        self.current_model_key = model_key
        
        try:
            model, path, labels, transform = self._build_model_architecture(model_key)
            model = model.to(self.device)
            # weights_only=False because standard PyTorch load often needs it for some types
            state_dict = torch.load(str(path), map_location=self.device, weights_only=False)
            model.load_state_dict(state_dict)
            model.eval()
            self.model = model
            self.current_labels = labels
            self.current_transform = transform
            self.demo_mode = False
            print(f"[ml_service] Model '{model_key}' loaded successfully from {path}")
        except FileNotFoundError:
            print(f"[ml_service] {path} not found — running in DEMO mode")
            self.model = None
            self.current_labels = CLASS_LABELS_GENERIC
            self.demo_mode = True
        except Exception as e:
            print(f"[ml_service] Error loading model: {e} — running in DEMO mode")
            self.model = None
            self.current_labels = CLASS_LABELS_GENERIC
            self.demo_mode = True

    # ── public: run prediction on raw image bytes ───────────────
    def predict(self, image_bytes: bytes, model_key: str = "general"):
        if model_key not in ["general", "soybean", "wheat", "chili"]:
            model_key = "general"
            
        self._set_model(model_key)

        # Demo mode — return a realistic-looking mock
        if self.demo_mode:
            return {
                "disease": self.current_labels[0] if hasattr(self, 'current_labels') else "Tomato___Late_blight",
                "confidence": 0.87,
                "model_used": f"{model_key} (demo)",
            }

        # Real inference
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = self.current_transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)

        class_idx = predicted.item()
        labels = self.current_labels
        label = labels[class_idx] if class_idx < len(labels) else f"class_{class_idx}"

        return {
            "disease": label,
            "confidence": round(confidence.item(), 4),
            "model_used": model_key,
        }


# Singleton
model_manager = ModelManager()
