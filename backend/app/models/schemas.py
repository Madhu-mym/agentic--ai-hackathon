from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Health Schema
# ---------------------------------------------------------------------------
class HealthResponse(BaseModel):
    status: str = Field(default="ok", description="Liveness status of the backend API")
    app: str = Field(default="future-ready-onboarding", description="Application identifier")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Server UTC timestamp")


# ---------------------------------------------------------------------------
# Chat Schemas
# ---------------------------------------------------------------------------
class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the sender: 'user' or 'assistant'")
    content: str = Field(..., description="Message text content")
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Question or prompt from employee")
    session_id: Optional[str] = Field(None, description="Optional conversation session ID")


class ChatResponse(BaseModel):
    response: str = Field(..., description="Generated answer from onboarding assistant")
    sources: List[str] = Field(default_factory=list, description="Referenced policy or handbook source documents")
    session_id: Optional[str] = None


# ---------------------------------------------------------------------------
# Task Schemas
# ---------------------------------------------------------------------------
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = Field(default="general", description="e.g. 'it_setup', 'hr_paperwork', 'team_intro'")
    is_completed: bool = False
    due_date: Optional[str] = None


class TaskResponse(TaskBase):
    id: str
    created_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# User Schemas
# ---------------------------------------------------------------------------
class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: str
    avatar_url: Optional[str] = None
    is_mentor: bool = False


# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------
class RequestItemCreate(BaseModel):
    request_type: str = Field(..., description="'hardware', 'software_access', or 'general'")
    title: str = Field(..., min_length=2)
    details: Optional[str] = None
    priority: str = Field(default="medium", description="'low', 'medium', 'high'")


class RequestItemResponse(RequestItemCreate):
    id: str
    status: str = Field(default="pending", description="'pending', 'approved', 'rejected'")
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
