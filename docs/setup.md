# Developer Setup Guide

This guide walks you through setting up and running **Future-Ready Onboarding** locally.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or later (`node -v`)
- **npm**: `v10.x` or later (`npm -v`)
- **Python**: `3.9+` (`python3 --version`)
- **Git**

---

## 2. Clone & Environment Setup

1. Copy the environment variable template:
   ```bash
   cp .env.example .env
   ```
2. Update the environment variables in `.env` if you have Supabase credentials and an OpenAI API key (not required for running the basic skeleton).

---

## 3. Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
5. Verify the backend is running:
   - Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
   - Interactive Swagger API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 4. Frontend Setup (Next.js)

1. Open a separate terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## 5. Running with Docker Compose (Alternative)

To launch both frontend and backend in isolated containers:
```bash
docker compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)
