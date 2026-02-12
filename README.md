# Phyto — Plant Disease Diagnosis System

Phyto is a full-stack web application that identifies plant diseases from leaf images using deep learning. It provides disease classification, severity analysis, remedy suggestions, and AI-powered advisory through a conversational interface.

## Features

- **Disease Classification** — Upload a leaf image and get a diagnosis powered by a ResNet-9 model trained on the PlantVillage dataset (38 disease classes).
- **Severity Analysis** — OpenCV-based image processing estimates the percentage of leaf area affected.
- **Remedy Lookup** — Returns commercial and traditional treatment options for the detected disease.
- **AI Advisory** — Gemini-powered bilingual (English/Hindi) advisory with specific product recommendations, dosages, and organic alternatives.
- **Follow-up Chat** — Ask up to 2 follow-up questions per diagnosis for clarification or additional guidance.

## Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Backend  | Python, FastAPI, PyTorch, OpenCV        |
| Frontend | React 19, Vite, Tailwind CSS 4         |
| LLM      | Google Gemini (via `google-genai` SDK)  |
| Database | Supabase (PostgreSQL)                   |

## Project Structure

```
Phyto/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── config.py              # Environment config, Supabase client
│   │   ├── routers/
│   │   │   ├── diagnosis.py           # POST /api/predict
│   │   │   ├── remedies.py            # GET  /api/remedies/{class}
│   │   │   ├── chat.py                # POST /api/chat/advisory, /api/chat/followup
│   │   │   └── auth.py                # Auth endpoints
│   │   └── services/
│   │       ├── ml_service.py          # PyTorch model loading and inference
│   │       ├── vision_service.py      # OpenCV severity estimation
│   │       ├── remedy_service.py      # JSON remedy lookup
│   │       └── llm_service.py         # Gemini advisory and follow-up
│   ├── data/
│   │   └── remedies.json              # Remedy database
│   ├── models/                        # Trained .pth model files
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadCard.jsx         # Drag-and-drop image upload
│   │   │   ├── ModelSelector.jsx      # Model selection dropdown
│   │   │   ├── ResultsPanel.jsx       # Diagnosis results display
│   │   │   ├── AiAdvisory.jsx         # LLM advisory and follow-up chat
│   │   │   └── ErrorBoundary.jsx      # Error handling wrapper
│   │   ├── hooks/
│   │   │   └── usePrediction.js       # Prediction state management
│   │   ├── services/
│   │   │   └── api.js                 # API client
│   │   ├── App.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm

### Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env         # then fill in your keys
```

The `.env` file requires the following:

```
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_KEY=<your-supabase-anon-key>
MODEL_PATH=models/plant_disease_model.pth
GEMINI_API_KEY=<your-gemini-api-key>
```

Place your trained model file at `models/plant_disease_model.pth`. Start the server:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

API documentation is available at `http://127.0.0.1:8000/docs`.

### Frontend

```bash
cd frontend

npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies API requests to the backend.

## API Endpoints

| Method | Endpoint               | Description                                    |
| ------ | ---------------------- | ---------------------------------------------- |
| POST   | `/api/predict`         | Upload a leaf image for diagnosis              |
| GET    | `/api/remedies/{class}`| Look up remedy by disease class                |
| POST   | `/api/chat/advisory`   | Generate bilingual AI advisory from diagnosis  |
| POST   | `/api/chat/followup`   | Send a follow-up question with chat history    |
| GET    | `/`                    | Health check                                   |

## Usage

1. Open the application in a browser.
2. Upload a leaf image (JPG or PNG, max 5 MB) using drag-and-drop or the file browser.
3. Select a model and click Diagnose.
4. View the results: disease name, confidence score, severity percentage, and recommended remedies.
5. Read the AI advisory for detailed treatment guidance in English or Hindi.
6. Ask follow-up questions about the diagnosis if needed.

## License

This project was built as part of the EPICS (Engineering Projects in Community Service) program.
