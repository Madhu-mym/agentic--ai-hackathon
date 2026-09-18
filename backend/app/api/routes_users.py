from typing import List
from fastapi import APIRouter, Depends
from app.models.schemas import UserProfileResponse
from app.utils.auth import get_current_user_id

router = APIRouter(prefix="/api/users", tags=["Users & Team Directory"])

# Mock directory contacts for testing skeleton
MOCK_DIRECTORY = [
    UserProfileResponse(
        id="user-1",
        name="Sarah Chen",
        email="sarah.chen@company.com",
        role="Engineering Manager",
        department="Engineering",
        is_mentor=False
    ),
    UserProfileResponse(
        id="user-2",
        name="Alex Rivera",
        email="alex.rivera@company.com",
        role="Senior Full-Stack Engineer",
        department="Engineering",
        is_mentor=True
    ),
    UserProfileResponse(
        id="user-3",
        name="Emily Taylor",
        email="emily.taylor@company.com",
        role="People Operations Specialist",
        department="Human Resources",
        is_mentor=False
    ),
    UserProfileResponse(
        id="user-4",
        name="Marcus Johnson",
        email="marcus.j@company.com",
        role="IT Systems Administrator",
        department="Information Technology",
        is_mentor=False
    )
]


@router.get("/", response_model=List[UserProfileResponse])
async def get_team_directory(user_id: str = Depends(get_current_user_id)):
    """Retrieve list of team members, mentors, and departmental contacts."""
    return MOCK_DIRECTORY


@router.get("/me")
async def get_current_user(user_id: str = Depends(get_current_user_id)):
    """Retrieve profile of the currently authenticated user."""
    return {
        "id": user_id,
        "name": "New Hire Employee",
        "email": "new.hire@company.com",
        "role": "Software Engineer",
        "department": "Engineering",
        "start_date": "Today",
        "assigned_buddy": "Alex Rivera"
    }
