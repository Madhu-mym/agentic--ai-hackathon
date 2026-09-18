# Architecture: Future-Ready Onboarding

This document provides a high-level overview of the system architecture for **Future-Ready Onboarding**, an AI-powered onboarding platform.

---

## 1. System Overview

```
                               ┌─────────────────────────┐
                               │       Web Browser       │
                               │  (New Hire / Employee)  │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │   Next.js (Frontend)    │
                               │ TypeScript / App Router │
                               │       Tailwind CSS      │
                               └───────┬─────────┬───────┘
                                       │         │
                 Direct Auth / Session │         │ REST API Requests
                                       ▼         ▼
        ┌────────────────────────────────┐     ┌────────────────────────┐
        │        Supabase Auth           │     │    FastAPI (Backend)   │
        │  (User identity & tokens)      │     │  Python REST API       │
        └────────────────────────────────┘     └───────────┬────────────┘
                                                           │
                                        ┌──────────────────┴──────────────────┐
                                        │                                     │
                                        ▼                                     ▼
                        ┌──────────────────────────────┐       ┌──────────────────────────────┐
                        │      Supabase Database       │       │        AI / RAG Engine       │
                        │  - Onboarding Tasks          │       │  - Policy Document Parser    │
                        │  - Equipment Requests        │       │  - Vector Embeddings Store   │
                        │  - Employee Directory        │       │  - Conversational Agent      │
                        └──────────────────────────────┘       └──────────────────────────────┘
```

---

## 2. Component Breakdown

### A. User Interface (Next.js Frontend)
- **Role**: Delivers the user-facing web dashboard, chat interface, policy viewer, and request submission forms.
- **Tech Stack**: Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Key Modules**:
  - `src/app/page.tsx`: Central onboarding dashboard showing checklists and key contacts.
  - `src/app/chat/page.tsx`: Conversational AI assistant for company and policy Q&A.
  - `src/app/policies/page.tsx`: Directory of centralized company guidelines.
  - `src/app/requests/page.tsx`: Form for requesting hardware, software, and permissions.
  - `src/lib/supabase.ts`: Supabase browser client for authentication.
  - `src/lib/api.ts`: Typed REST client communicating with the backend.

### B. Application Server (FastAPI Backend)
- **Role**: Coordinates business logic, manages task completion, processes requests, and exposes REST endpoints.
- **Tech Stack**: FastAPI, Pydantic, Uvicorn, Python 3.9+.
- **Endpoints**:
  - `/health`: Liveness & health probe.
  - `/api/chat`: Chat interaction & RAG orchestration.
  - `/api/tasks`: Onboarding checklist retrieval & task updates.
  - `/api/users`: Peer & team directory retrieval.
  - `/api/requests`: Access & equipment ticket creation.

### C. Database & Authentication (Supabase)
- **Role**: Centralized PostgreSQL database with Row Level Security (RLS) and managed user authentication.
- **Data Entities**:
  - User Profiles (name, department, role, mentor).
  - Tasks (title, description, status, due date, category).
  - Requests (item type, reason, approval status, priority).
  - Documents & Embeddings (for vector similarity search).

### D. AI & RAG Engine
- **Role**: Answers new hire questions grounded in real company documentation.
- **Key Pipeline**:
  - `document_parser.py`: Ingests company handbooks, benefit guides, and setup manuals.
  - `rag_engine.py`: Performs semantic similarity search against document chunks.
  - `agent.py`: Formulates grounded, helpful responses and orchestrates multi-step actions.
