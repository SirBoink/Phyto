# Phyto — Smart Plant Health & Market Intelligence

Phyto is a comprehensive agritech platform designed for the Bhopal–Sehore region (Madhya Pradesh). It combines deep learning for plant disease diagnosis with real-time environmental data (ISRO) and market intelligence (Agmarknet) to provide farmers with actionable insights.

## Core Features

### 1. Multi-Model Disease Diagnosis
- **General Model** — PlantCNN architecture (38 classes) based on the PlantVillage dataset.
- **Crop-Specific Models** — Specialized high-accuracy models for regional crops:
  - **Soybean** (ResNet-50)
  - **Wheat** (EfficientNet-B0)
  - **Chili** (VGG-16)
- **Visual Severity Analysis** — Dynamic HSV-based estimation of leaf damage, utilizing localized threshold mappings for specific crop-disease pairs.

### 2. Environmental Intelligence (ISRO Integration)
- **Bhuvan WFS Integration** — Automated wetland proximity alerts (Bhoj Wetland/Upper Lake) to identify zones at high risk for fungal infections due to ambient humidity.
- **Bhoonidhi STAC Integration** — Real-time Soil Wetness Index (SWI) from EOS-04 satellite data to assess root-rot risk and irrigation needs.
- **Bayesian Risk Assessment** — Combined environmental context note generated for every diagnosis.

### 3. Market Intelligence
- **Agmarknet Integration** — Real-time live market pricing (Min, Max, Modal) from the **data.gov.in** API, specifically targeting regional markets like Kothri Kalan and Bhopal.

### 4. Remedy Hub
- **Scientific Remedies** — Standard chemical and biological treatment options.
- **Kabaad-se-Jugaad** — Traditional, low-cost, and organic "Jugaad" remedies using locally available materials (e.g., buttermilk, neem, wood ash).

### 5. Bilingual AI Advisory & TTS
- **Gemini 3.5 Powered** — Context-aware advisory in both **English and Hindi**.
- **Interactive Chat** — Multi-turn follow-up capabilities for clarifying treatment dosages and organic alternatives.
- **Narrative Text-to-Speech** — Integrated browser-native TTS for accessibility:
  - **Hindi Default** — Prioritized voice playback for local farmers.
  - **Compressed Treatment Summaries** — Summarizes remedies in a single spoken sentence (e.g., *"[dosage] of [product] at [frequency]"*).

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Python 3.11, FastAPI, PyTorch, OpenCV, Shapely |
| **Frontend** | React 19, Vite, Tailwind CSS 4, Framer Motion |
| **LLM** | Google Gemini (via `google-genai` SDK) |
| **Intelligence** | ISRO Bhuvan (WFS), ISRO Bhoonidhi (STAC), Agmarknet API |
| **Database** | Supabase (PostgreSQL) |

---

## Project Structure

```text
Phyto/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── config.py              # Centralised config & API keys
│   │   ├── routers/
│   │   │   ├── diagnosis.py           # Multi-model prediction & context merge
│   │   │   └── chat.py                # Bilingual AI Advisory
│   │   └── services/
│   │       ├── ml_service.py          # Lazy-loading for 4 PyTorch models
│   │       ├── vision_service.py      # HSV Severity Analysis (CSV-mapped)
│   │       ├── isro_service.py        # Bhuvan & Bhoonidhi integrations
│   │       ├── agmarknet_service.py   # Live market price fetching
│   │       └── llm_service.py         # Gemini advisory engine
│   ├── data/
│   │   ├── remedies.json              # Scientific remedy database
│   │   ├── jugaad_remedies.json       # Traditional remedy database
│   │   └── hsv_new_value.csv          # Calibrated HSV bounds for severity
│   ├── models/                        # Pre-trained .pth weights
│   │   ├── generic/
│   │   ├── soybean/
│   │   ├── wheat/
│   │   └── chili/
│   └── .env                           # Environment secrets
├── frontend/
│   └── ...                            # React source and assets
└── README.md
```

---

## Setup & Installation

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Activate venv: venv\Scripts\activate (Win) or source venv/bin/activate (Unix)
pip install -r requirements.txt
```

**Environment Configuration (`.env`):**
Create a `.env` file in the `backend/` directory with the following keys:
```ini
# Core
GEMINI_API_KEY=your_google_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# External Intelligence
BHUVAN_API_KEY=your_isro_bhuvan_key
BHOONIDHI_API_KEY=your_isro_bhoonidhi_key
AGMARKNET_API_KEY=your_data_gov_in_key
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/predict` | Upload leaf + get Multi-Model Diagnosis + ISRO Context + Market Data |
| **POST** | `/api/chat/advisory` | Generate bilingual treatment plan using Gemini |
| **POST** | `/api/chat/followup` | Multi-turn chat with diagnosis history |

---

## License & Credits
Built as part of the **EPICS (Engineering Projects in Community Service)** program.
Special thanks to **ISRO NRSC** for providing access to Bhuvan and Bhoonidhi APIs for educational purposes.
