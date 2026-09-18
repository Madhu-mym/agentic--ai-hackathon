import uuid
from typing import List
from fastapi import APIRouter, Depends
from app.models.schemas import RequestItemCreate, RequestItemResponse
from app.utils.auth import get_current_user_id

router = APIRouter(prefix="/api/requests", tags=["Access & Equipment Requests"])

# In-memory mock requests
MOCK_REQUESTS: List[RequestItemResponse] = [
    RequestItemResponse(
        id="req-1",
        request_type="software_access",
        title="GitHub Organization & Repository Access",
        details="Access to frontend and backend repositories for future-ready-onboarding.",
        priority="high",
        status="approved"
    ),
    RequestItemResponse(
        id="req-2",
        request_type="hardware",
        title="Second 4K Monitor & USB-C Dock",
        details="Home office setup hardware.",
        priority="medium",
        status="pending"
    )
]


@router.get("/", response_model=List[RequestItemResponse])
async def list_requests(user_id: str = Depends(get_current_user_id)):
    """List all submitted equipment and software access requests."""
    return MOCK_REQUESTS


@router.post("/", response_model=RequestItemResponse)
async def create_request(payload: RequestItemCreate, user_id: str = Depends(get_current_user_id)):
    """Submit a new request for hardware or software permission."""
    new_request = RequestItemResponse(
        id=f"req-{uuid.uuid4().hex[:6]}",
        request_type=payload.request_type,
        title=payload.title,
        details=payload.details,
        priority=payload.priority,
        status="pending"
    )
    MOCK_REQUESTS.append(new_request)
    return new_request
