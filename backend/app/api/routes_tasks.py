from typing import List
from fastapi import APIRouter, Depends
from app.models.schemas import TaskResponse
from app.utils.auth import get_current_user_id

router = APIRouter(prefix="/api/tasks", tags=["Onboarding Tasks"])

# Mock initial tasks for testing skeleton endpoints
MOCK_TASKS = [
    TaskResponse(
        id="task-1",
        title="Complete HR & Payroll Paperwork",
        description="Fill out emergency contact information and bank direct deposit forms.",
        category="hr_paperwork",
        is_completed=True,
        due_date="Day 1"
    ),
    TaskResponse(
        id="task-2",
        title="Configure 2FA & IT Security Setup",
        description="Set up Okta authenticator and 1Password vault on work laptop.",
        category="it_setup",
        is_completed=False,
        due_date="Day 1"
    ),
    TaskResponse(
        id="task-3",
        title="Meet with Onboarding Buddy / Mentor",
        description="Schedule a 30-minute introductory coffee chat with your assigned buddy.",
        category="team_intro",
        is_completed=False,
        due_date="Week 1"
    ),
    TaskResponse(
        id="task-4",
        title="Review Employee Handbook & Code of Conduct",
        description="Read company policies regarding working hours, expenses, and security.",
        category="general",
        is_completed=False,
        due_date="Week 1"
    )
]


@router.get("/", response_model=List[TaskResponse])
async def get_tasks(user_id: str = Depends(get_current_user_id)):
    """Retrieve onboarding checklist tasks for current user."""
    return MOCK_TASKS


@router.post("/{task_id}/toggle")
async def toggle_task_status(task_id: str, user_id: str = Depends(get_current_user_id)):
    """Toggle completion status of a task."""
    for task in MOCK_TASKS:
        if task.id == task_id:
            task.is_completed = not task.is_completed
            return {"message": "Task status updated", "task": task}
    return {"error": "Task not found"}
