from fastapi import APIRouter, Depends
from app.models.schemas import ChatRequest, ChatResponse
from app.services.agent import OnboardingAgent
from app.utils.auth import get_current_user_id

router = APIRouter(prefix="/api/chat", tags=["Chat & AI Assistant"])
agent = OnboardingAgent()


@router.get("/")
async def chat_status():
    """Liveness probe for chat service."""
    return {"status": "chat service ready", "model": "placeholder-rag-agent"}


@router.post("/", response_model=ChatResponse)
async def post_chat_message(
    payload: ChatRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Handle user chat messages and trigger onboarding agent/RAG reasoning.
    """
    result = await agent.run(user_message=payload.message, user_id=user_id, session_id=payload.session_id)
    return ChatResponse(
        response=result["answer"],
        sources=result.get("sources", []),
        session_id=result.get("session_id")
    )
