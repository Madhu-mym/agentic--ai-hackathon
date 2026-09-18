import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.models.schemas import HealthResponse
from app.api.routes_chat import router as chat_router
from app.api.routes_tasks import router as tasks_router
from app.api.routes_users import router as users_router
from app.api.routes_requests import router as requests_router

# Load environment variables
load_dotenv()

# Initialize FastAPI application
app = FastAPI(
    title="Future-Ready Onboarding API",
    description="Backend service providing onboarding task management, company policy RAG search, and AI assistant support.",
    version="0.1.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Simple liveness and readiness probe for the backend API.
    """
    return HealthResponse(
        status="ok",
        app="future-ready-onboarding"
    )

# Register API routers
app.include_router(chat_router)
app.include_router(tasks_router)
app.include_router(users_router)
app.include_router(requests_router)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
