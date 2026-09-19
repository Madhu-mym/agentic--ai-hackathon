"""
Access Request Service.

Handles creating and managing access and equipment requests initiated through
the Agentic AI orchestrator. Integrates cleanly with existing request schemas
and in-memory request store.
"""

import re
import uuid
from typing import Optional, List
from app.models.schemas import RequestItemCreate, RequestItemResponse
from app.api.routes_requests import MOCK_REQUESTS


class AccessRequestService:
    """
    Manages software access, permissions, and hardware requests.
    """

    def __init__(self, request_store: Optional[List[RequestItemResponse]] = None):
        self.request_store = request_store if request_store is not None else MOCK_REQUESTS

    def extract_resource_name(self, text: str) -> str:
        """
        Extract the requested resource or tool name from user's request.
        Example: "I need access to the HR portal." -> "HR portal"
        """
        patterns = [
            r"(?i)(?:need\s+access\s+to|request\s+access\s+to|grant\s+(?:me\s+)?access\s+to|permission\s+(?:for|to)|access\s+(?:to|for)|account\s+(?:for|on))\s+(?:the\s+)?([A-Za-z0-9\s\-_/]+?)(?:\.|\?|!|$|,\s*please|\s+please)",
            r"(?i)(?:need|request|want)\s+(?:a\s+|an\s+)?([A-Za-z0-9\s\-_/]+?)(?:\s+access|\s+permission)(?:\.|\?|!|$|,\s*please|\s+please)",
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                resource = match.group(1).strip()
                # Clean up any trailing words like 'please', 'today'
                resource = re.sub(r"(?i)\s+(?:please|asap|today|now)$", "", resource)
                if resource:
                    return resource

        # Fallback heuristic
        cleaned = text.strip().rstrip(".?!")
        for prefix in ["i need access to", "i need", "request access to", "give me access to"]:
            if cleaned.lower().startswith(prefix):
                res = cleaned[len(prefix):].strip()
                if res.lower().startswith("the "):
                    res = res[4:].strip()
                if res:
                    return res

        return "Requested Resource"

    def create_access_request(
        self,
        prompt: str,
        resource: Optional[str] = None,
        request_type: str = "software_access",
        priority: str = "medium"
    ) -> RequestItemResponse:
        """
        Create a new access request record and append to request store.
        """
        target_resource = resource or self.extract_resource_name(prompt)
        request_id = f"req-{uuid.uuid4().hex[:6]}"

        req = RequestItemResponse(
            id=request_id,
            request_type=request_type,
            title=f"Access Request: {target_resource}",
            details=f"Automated access request created via AI Agent from user prompt: '{prompt}'",
            priority=priority,
            status="pending"
        )
        self.request_store.append(req)
        return req
