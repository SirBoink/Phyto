# 🌿 PlantGuard — AI Plant Disease Diagnosis

A full-stack plant-disease diagnosis system that uses computer vision and deep learning to identify diseases from leaf images and suggest remedies.

> **Version 0.5.0** — 50% Milestone Demo

---

## Tech Stack

| Layer     | Technology                     |
| --------- | ------------------------------ |
| Backend   | Python 3.13 · FastAPI · PyTorch · OpenCV |
| Frontend  | Vite · React 19 · Tailwind CSS 4         |
| Database  | Supabase (PostgreSQL) — skeleton          |

---

## Project Structure

```
plant-guard/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── config.py          # Centralized config + Supabase client
│   │   ├── routers/
│   │   │   ├── diagnosis.py       # POST /api/predict
│   │   │   ├── remedies.py        # GET  /api/remedies/{class}
│   │   │   └── auth.py            # Placeholder auth stubs
│   │   └── services/
│   │       ├── ml_service.py      # PyTorch model manager
│   │       ├── vision_service.py  # OpenCV severity analysis
│   │       └── remedy_service.py  # JSON remedy lookup
│   ├── data/
│   │   └── remedies.json
│   ├── models/                    # Place .pth files here
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/            # UploadCard, ModelSelector, ResultsPanel, ErrorBoundary
│   │   ├── hooks/                 # usePrediction custom hook
│   │   ├── services/              # api.js fetch wrapper
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── README.md
└── PROJECT_DETAILS.md
```

---

## Setup

### Prerequisites

- **Python 3.13+**
- **Node.js 18+** & npm

---

### Backend

```bash
cd plant-guard/backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env       # then edit .env with your Supabase keys

# (Optional) Place your trained model file at:
#   models/plant_disease_model.pth
# The server runs in demo mode without it.

# Start dev server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API docs will be available at **http://127.0.0.1:8000/docs**

---

### Frontend

```bash
cd plant-guard/frontend

# Install dependencies
npm install

# Start dev server (proxies /api → backend)
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Usage

1. Open the frontend in your browser.
2. Drag & drop (or browse) a leaf image (JPG/PNG, max 5 MB).
3. Select a model from the dropdown (General is the only active model for now).
4. Click **Diagnose**.
5. View the results: disease name, confidence, severity bar, and remedy details.

---

## API Endpoints

| Method | Endpoint                     | Description                      |
| ------ | ---------------------------- | -------------------------------- |
| POST   | `/api/predict`               | Upload image → diagnosis + remedy |
| GET    | `/api/remedies/{class}`      | Lookup remedy by disease class   |
| POST   | `/api/auth/login`            | Stub — coming soon               |
| POST   | `/api/auth/register`         | Stub — coming soon               |
| GET    | `/`                          | Health check                     |
