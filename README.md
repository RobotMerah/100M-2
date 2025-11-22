
# Ultimate Multimodal IDX AI (Prototype)

A continuously-learning, multimodal investment assistant for the Indonesia Stock Exchange (IDX). This system is designed to help retail investors grow small capital by providing high-accuracy daily Buy/Sell recommendations backed by deep technical and semantic analysis.

## ⚠️ Disclaimer
**FOR EDUCATIONAL AND RESEARCH PURPOSES ONLY.** 
This software does not constitute financial advice. All trading involves risk. The "Paper Trade" / "Manual Log" features are for simulation and data labeling purposes.

## System Architecture

The system consists of two main parts:
1. **Frontend (React + Tailwind)**: Dashboard for viewing signals, explanations, and logging trades.
2. **Backend (Python/FastAPI)**: Heavy lifting for ingestion, model inference, and backtesting.

### Folder Structure
```
/
├── backend/               # Python Microservices
│   ├── api/main.py        # FastAPI Entry Point
│   ├── ingestion.py       # Whisper/PDF/News pipelines
│   ├── models.py          # LightGBM + Transformer Ensemble
│   └── backtester.py      # IDX-specific simulation engine
├── src/                   # React Frontend (root directory in this proto)
│   ├── components/
│   ├── pages/
│   └── services/
└── README.md
```

## Setup Instructions

### 1. Frontend
Install dependencies and run the React app:
```bash
npm install
npm start
```

### 2. Backend (Python)
Create a virtual environment and install requirements:
```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install fastapi uvicorn pandas numpy torch lightgbm google-generativeai pymilvus
```

Run the API server:
```bash
uvicorn backend.main:app --reload --port 8000
```

## Core Features

### Multimodal Ingestion
- **News**: RSS scrapers for Bisnis.com, Kontan.
- **Video**: Uses OpenAI Whisper to transcribe YouTube earnings calls.
- **PDF**: Extracts text from IDX corporate disclosures.

### Ensemble Modeling
The final confidence score is a weighted average of:
1. **LightGBM**: Trained on 50+ technical indicators (tabular).
2. **Transformer**: Time-series forecasting on price action sequences.
3. **FinBERT**: Sentiment analysis of the day's ingested news/video.

### Active Learning
Every time you log a manual trade in the UI (`SignalDetail` page), the data is sent to the backend to label the specific timeframe. The model retrains nightly using these verified labels to correct its biases.

## Data & APIs
- **Market Data**: Connect to GoAPI or Yahoo Finance (unofficial) for free prototyping.
- **LLM**: Requires Google Gemini API Key (`GOOGLE_API_KEY`) for RAG explanations.
- **Vector DB**: Uses Milvus (local Docker container recommended) for storing embeddings.

