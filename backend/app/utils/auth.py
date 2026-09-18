"""
Authentication Utilities (Supabase Auth Integration)

This module will handle validating incoming Supabase JWT tokens passed
in the Authorization header from the Next.js frontend.
"""

from typing import Optional
from fastapi import Header, HTTPException, status


async def get_current_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Validate Supabase JWT and extract the user's UUID.

    TODO (Phase 2):
    1. Parse Bearer token from the Authorization header.
    2. Validate JWT signature against Supabase JWT secret or JWKS.
    3. Extract 'sub' claim (user UUID).
    4. Return user UUID or raise 401 Unauthorized.
    """
    if not authorization:
        # Hackathon placeholder: allow unauthenticated requests during skeleton phase
        return "placeholder-user-id"

    # Minimal header parsing
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
        # In future phases, verify with Supabase SDK / PyJWT
        return f"user-from-token-{token[:8]}"

    return "placeholder-user-id"
