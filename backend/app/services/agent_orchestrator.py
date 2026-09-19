"""
Agent Orchestrator Service.

Autonomous, deterministic agent layer that receives user queries, determines
the appropriate action/intent, executes the corresponding tool or service,
and returns structured, grounded results.

Actions Supported:
1. search_knowledge: Queries company onboarding records & policies via RAG.
2. create_access_request: Provisions access/equipment requests.
3. general_response: Handles conversational pleasantries and greetings via local LLM.

Security Guarantee:
The agent strictly delegates knowledge queries to RAGEngine which operates exclusively
on sanitized, redacted documents. Original confidential content is never accessible.
"""

import re
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from app.services.rag_engine import RAGEngine
from app.services.ollama_client import OllamaClient
from app.services.access_request_service import AccessRequestService


class AgentAction(str, Enum):
    SEARCH_KNOWLEDGE = "search_knowledge"
    CREATE_ACCESS_REQUEST = "create_access_request"
    GENERAL_RESPONSE = "general_response"


class AgentResult(BaseModel):
    question: str = Field(..., description="User's original question")
    action: AgentAction = Field(..., description="Selected agent action")
    tool_executed: str = Field(..., description="Internal service or tool executed")
    answer: str = Field(..., description="Final grounded answer or action result")
    sources: List[str] = Field(default_factory=list, description="Referenced document sources if RAG was used")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Action execution details")


class AgentOrchestrator:
    """
    Coordinates intent detection and tool execution for employee onboarding queries.
    """

    GENERAL_SYSTEM_PROMPT = (
        "You are an AI Onboarding Assistant for company employees.\n"
        "Be friendly, professional, and helpful.\n"
        "For greetings and general questions about yourself, respond politely.\n"
        "Do NOT invent or fabricate company-specific policies, internal contacts, or secrets.\n"
        "If asked for company-specific information that you do not possess, direct the user to search company documents."
    )

    def __init__(
        self,
        rag_engine: Optional[RAGEngine] = None,
        access_service: Optional[AccessRequestService] = None,
        ollama_client: Optional[OllamaClient] = None
    ):
        self.rag_engine = rag_engine or RAGEngine()
        self.access_service = access_service or AccessRequestService()
        self.ollama_client = ollama_client or OllamaClient()

    def decide_action(self, user_message: str) -> AgentAction:
        """
        Deterministically determine the appropriate agent action for a user query.
        """
        msg = user_message.strip().lower()

        # 1. Access request intent pattern
        access_patterns = [
            r"\b(?:need|request|grant|give\s+me|get|want)\s+access\b",
            r"\bpermission\s+(?:to|for)\b",
            r"\baccess\s+to\s+(?:the\s+)?[a-z0-9\s\-_/]+",
            r"\b(?:need|request|want)\s+(?:a\s+|an\s+|some\s+|new\s+|second\s+)*(?:equipment|hardware|laptop|monitor|dock|keyboard|mouse|headset|account|permission|software|license)\b",
            r"\brequest\s+(?:equipment|hardware|laptop|monitor|dock|account)\b",
        ]
        for pattern in access_patterns:
            if re.search(pattern, msg):
                return AgentAction.CREATE_ACCESS_REQUEST

        # 2. General conversational / greeting intent pattern
        conversational_pattern = (
            r"^(?:hi|hello|hey|greetings|good\s+(?:morning|afternoon|evening)|"
            r"thanks(?:\s+a\s+lot|\s+so\s+much)?|thank\s+you(?:\s+very\s+much|\s+so\s+much)?|thankyou|"
            r"bye|goodbye|see\s+ya|who\s+are\s+you|"
            r"what\s+can\s+you\s+do|help)[\s!.,?]*$"
        )
        if re.match(conversational_pattern, msg):
            return AgentAction.GENERAL_RESPONSE

        # 3. Default for onboarding, company, policy, role, and factual questions
        return AgentAction.SEARCH_KNOWLEDGE

    def process(self, question: str, top_k: int = 3) -> AgentResult:
        """
        Execute agent decision-making loop:
        1. Classify intent / select action
        2. Execute tool
        3. Formulate structured response
        """
        action = self.decide_action(question)

        if action == AgentAction.CREATE_ACCESS_REQUEST:
            resource = self.access_service.extract_resource_name(question)
            req = self.access_service.create_access_request(prompt=question, resource=resource)
            return AgentResult(
                question=question,
                action=action,
                tool_executed="access_request_service",
                answer=f"Access request created for {resource}.",
                sources=[],
                metadata={
                    "request_id": req.id,
                    "resource": resource,
                    "status": req.status,
                    "priority": req.priority
                }
            )

        elif action == AgentAction.SEARCH_KNOWLEDGE:
            # Route to existing RAG service
            rag_ans = self.rag_engine.query(question=question, top_k=top_k)
            return AgentResult(
                question=question,
                action=action,
                tool_executed="rag_pipeline",
                answer=rag_ans.answer,
                sources=rag_ans.sources,
                metadata={
                    "retrieved_chunks_count": len(rag_ans.retrieved_chunks)
                }
            )

        else:  # GENERAL_RESPONSE
            # Use local Ollama for conversational reply
            try:
                reply = self.ollama_client.generate(
                    prompt=question,
                    system=self.GENERAL_SYSTEM_PROMPT
                )
                if not reply:
                    reply = "Hello! I'm your AI Onboarding Assistant. How can I help you today?"
            except Exception:
                reply = "Hello! I'm your AI Onboarding Assistant. How can I help you today?"

            return AgentResult(
                question=question,
                action=AgentAction.GENERAL_RESPONSE,
                tool_executed="general_conversational_llm",
                answer=reply,
                sources=[],
                metadata={}
            )
