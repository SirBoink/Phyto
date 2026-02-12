"""
Phyto — Gemini LLM advisory service.

Generates bilingual (English + Hindi) plant disease advisories
with commercial and traditional remedies.

Updated to use the new `google-genai` SDK (v1.0+).
"""

import json
from google import genai
from google.genai import types

from app.core.config import GEMINI_API_KEY

# Initialize client
client = genai.Client(api_key=GEMINI_API_KEY)

SYSTEM_INSTRUCTION = """You are Phyto AI, an empathetic and knowledgeable agricultural expert.
A farmer has uploaded a photo of a diseased plant leaf. You receive the ML diagnosis results
and must provide helpful, actionable advice.

ALWAYS respond in valid JSON with this exact structure:
{
  "english": {
    "summary": "2-3 sentence explanation of the disease, its cause, and impact on yield",
    "commercial_remedy": {
      "product": "specific product/chemical name",
      "dosage": "exact dosage instructions",
      "frequency": "application schedule",
      "notes": "safety precautions or tips"
    },
    "traditional_remedy": {
      "recipe": "step-by-step traditional/organic remedy",
      "frequency": "application schedule",
      "notes": "effectiveness notes or tips"
    }
  },
  "hindi": {
    "summary": "same summary in Hindi",
    "commercial_remedy": {
      "product": "same in Hindi",
      "dosage": "same in Hindi",
      "frequency": "same in Hindi",
      "notes": "same in Hindi"
    },
    "traditional_remedy": {
      "recipe": "same in Hindi",
      "frequency": "same in Hindi",
      "notes": "same in Hindi"
    }
  }
}

Be specific with product names and dosages. For traditional remedies, prefer well-known
organic solutions (neem oil, baking soda sprays, garlic-chili sprays, etc.).
Do NOT wrap the JSON in markdown code fences. Return ONLY the JSON object."""

FOLLOWUP_INSTRUCTION = """You are Phyto AI, continuing a conversation about a plant disease diagnosis.
The farmer is asking a follow-up question. Answer helpfully and concisely.

Respond in valid JSON:
{
  "english": "your answer in English",
  "hindi": "your answer in Hindi"
}

Do NOT wrap the JSON in markdown code fences. Return ONLY the JSON object."""


def generate_advisory(disease: str, confidence: float, severity: float) -> dict:
    """Generate initial bilingual advisory from diagnosis results."""
    prompt = (
        f"Disease detected: {disease}\n"
        f"Confidence: {confidence * 100:.1f}%\n"
        f"Severity: {severity:.1f}% of leaf area affected\n\n"
        "Provide your advisory."
    )

    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",  # Force JSON mode
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"[llm_service] Gemini error: {e}")
        return _fallback_response(disease)


def follow_up(history: list[dict], question: str) -> dict:
    """Handle a follow-up question with conversation context."""
    # Convert history to SDK format
    # The new SDK uses 'user' and 'model' roles, similar to the old one but strict on structure
    sdk_history = []
    for msg in history:
        sdk_history.append(
            types.Content(
                role=msg["role"],
                parts=[types.Part.from_text(text=msg["content"])]
            )
        )

    try:
        chat = client.chats.create(
            model="gemini-3-flash-preview",
            config=types.GenerateContentConfig(
                system_instruction=FOLLOWUP_INSTRUCTION,
                response_mime_type="application/json",
            ),
            history=sdk_history,
        )
        
        response = chat.send_message(question)
        return json.loads(response.text)
    except Exception as e:
        print(f"[llm_service] Gemini follow-up error: {e}")
        return {
            "english": "Sorry, I couldn't process your question. Please try again.",
            "hindi": "क्षमा करें, मैं आपके प्रश्न को संसाधित नहीं कर सका। कृपया पुनः प्रयास करें।",
        }


def _fallback_response(disease: str) -> dict:
    """Return a safe fallback if the LLM call fails."""
    name = disease.replace("___", " — ").replace("_", " ")
    return {
        "english": {
            "summary": f"{name} was detected. Please consult a local agricultural extension officer for specific treatment advice.",
            "commercial_remedy": {
                "product": "Consult local agri-store",
                "dosage": "As per product label",
                "frequency": "As recommended",
                "notes": "LLM service temporarily unavailable."
            },
            "traditional_remedy": {
                "recipe": "Apply neem oil spray (5ml per litre of water) as a general organic treatment.",
                "frequency": "Every 7 days",
                "notes": "LLM service temporarily unavailable."
            }
        },
        "hindi": {
            "summary": f"{name} का पता चला है। विशिष्ट उपचार सलाह के लिए कृपया स्थानीय कृषि विस्तार अधिकारी से परामर्श करें।",
            "commercial_remedy": {
                "product": "स्थानीय कृषि दुकान से परामर्श करें",
                "dosage": "उत्पाद लेबल के अनुसार",
                "frequency": "सिफारिश के अनुसार",
                "notes": "LLM सेवा अस्थायी रूप से अनुपलब्ध है।"
            },
            "traditional_remedy": {
                "recipe": "एक सामान्य जैविक उपचार के रूप में नीम तेल स्प्रे (5ml प्रति लीटर पानी) लगाएं।",
                "frequency": "हर 7 दिन",
                "notes": "LLM सेवा अस्थायी रूप से अनुपलब्ध है।"
            }
        }
    }
