# Future-Ready Onboarding

An AI-powered employee onboarding platform designed to streamline new-hire experiences through interactive task checklists, centralized policy search, standardized IT requests, peer directory, and conversational RAG assistance.

---

## 🚀 Key Features (Roadmap)

1. **First-Day Progress & Task Checklist**: Track onboarding steps, IT setups, and orientation milestones.
2. **Conversational AI Q&A**: Ask questions about company policies, holidays, benefits, and workflows.
3. **Centralized Policies & Guidelines**: Easily browse and search company documentation.
4. **Standardized Requests**: Submit and track access/hardware requests with automated routing.
5. **Peer & Team Directory**: Find colleagues and buddies based on department, role, or interests.
6. **RAG Knowledge Base**: Accurate answers retrieved directly from indexed company documentation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.9+, FastAPI, Pydantic, Uvicorn |
| **Database & Auth** | Supabase (PostgreSQL, Row Level Security, Auth) |
| **AI / RAG** | Python (Embeddings, Document Chunking, Semantic Search) |
| **Containerization** | Docker, Docker Compose |
| **API** | RESTful JSON API |

---

## 📁 Project Structure

```text
future-ready-onboarding/
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Dashboard page
│   │   │   ├── layout.tsx        # Root layout with navigation
│   │   │   ├── globals.css       # Tailwind CSS directives
│   │   │   ├── chat/             # AI Assistant chat page
│   │   │   ├── policies/         # Company policies viewer
│   │   │   └── requests/         # Equipment & access requests
│   │   ├── components/
│   │   │   ├── ChatBot.tsx       # Chat interface component
│   │   │   ├── TaskChecklist.tsx # Interactive onboarding checklist
│   │   │   ├── ContactDirectory.tsx # Team contacts directory
│   │   │   ├── Navbar.tsx        # Top navigation header
│   │   │   └── Sidebar.tsx       # Sidebar navigation
│   │   └── lib/
│   │       ├── api.ts            # Typed REST API client
│   │       └── supabase.ts       # Supabase client wrapper
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── Dockerfile
│
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint and routes
│   │   ├── api/
│   │   │   ├── routes_chat.py    # Chat API endpoints
│   │   │   ├── routes_tasks.py   # Task management endpoints
│   │   │   ├── routes_users.py   # User directory endpoints
│   │   │   └── routes_requests.py# Request management endpoints
│   │   ├── services/
│   │   │   ├── rag_engine.py     # RAG pipeline blueprint
│   │   │   ├── document_parser.py# Document ingestion blueprint
│   │   │   └── agent.py          # Onboarding agent blueprint
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic schemas
│   │   └── utils/
│   │       └── auth.py           # Authentication helper
│   ├── data/
│   │   └── documents/            # Policy documents storage
│   ├── requirements.txt
│   └── Dockerfile
│
├── docs/
│   ├── architecture.md           # High-level architecture documentation
│   └── setup.md                  # Detailed local setup instructions
│
├── .env.example                  # Environment variables template
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## ⚙️ Environment Variables

Copy the template file to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xyzcompany.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous API key | Public client key |
| `NEXT_PUBLIC_API_URL` | URL of the FastAPI backend | `http://localhost:8000` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret service role key | Secret server key |
| `OPENAI_API_KEY` | API key for OpenAI (for RAG/embeddings) | `sk-...` |
| `PORT` | Backend port | `8000` |

---

## 🏃 Local Setup & Development Commands

### Backend (FastAPI)

```bash
# Navigate to backend
cd backend

# Create virtual environment & activate
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Health Check: `http://127.0.0.1:8000/health`
- Swagger Docs: `http://127.0.0.1:8000/docs`

### Frontend (Next.js)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run frontend development server
npm run dev
```
- Dashboard: `http://localhost:3000`
- Chat: `http://localhost:3000/chat`
- Policies: `http://localhost:3000/policies`
- Requests: `http://localhost:3000/requests`

### Docker Compose

```bash
docker compose up --build
```

---

## 🔒 Document Security Pipeline (Classification + Redaction CLI)

A local, deterministic document security pipeline that classifies document sensitivity, detects sensitive PII/credentials, and generates sanitized copies with `[REDACTED]` values before documents enter the RAG pipeline.

### Key Security Invariants
- **Zero External AI/API Calls**: Classification and redaction are 100% local, rule-based, and deterministic.
- **Original Document Immutability**: The original document is opened read-only and is strictly protected against overwriting.
- **Separate Output Storage**: Sanitized copies are saved to a separate directory (`data/redacted/`) for downstream RAG ingestion.

### Classification Levels
- **PUBLIC**: General public information with no sensitive entities.
- **INTERNAL**: Internal organizational data (Employee IDs, internal emails, phone numbers).
- **CONFIDENTIAL**: Financial and tax information (Salaries, bank accounts, PAN).
- **RESTRICTED**: High-risk credentials and national identity data (API tokens, passwords, Aadhaar).

### CLI Commands

From the `backend/` directory:

```bash
cd backend
```

1. **Classify sensitivity**:
   ```bash
   python -m app.cli classify data/input/sample_employee.txt
   ```

2. **Inspect sensitive entities (Audit)**:
   ```bash
   python -m app.cli inspect data/input/sample_employee.txt
   ```

3. **Redact document (Generates sanitized copy)**:
   ```bash
   python -m app.cli redact data/input/sample_employee.txt
   ```
   *(Use `--output <path>` to specify a custom destination.)*

### Running Automated Tests

```bash
cd backend
python -m unittest discover tests
```
