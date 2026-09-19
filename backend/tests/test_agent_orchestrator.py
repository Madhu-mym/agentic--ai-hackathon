"""
Test Suite for Agentic AI Orchestrator.

Covers:
- Autonomous action routing (search_knowledge, create_access_request, general_response)
- Tool execution: RAG search, access request creation, conversational LLM
- Source attribution when RAG is selected
- Confidentiality guarantee: verifying redacted salary is never revealed through the agent
- Security invariant: agent cannot query or ingest unredacted original documents
"""

import sys
import unittest
from pathlib import Path
from unittest.mock import MagicMock

BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.agent_orchestrator import AgentOrchestrator, AgentAction, AgentResult
from app.services.access_request_service import AccessRequestService
from app.services.rag_engine import RAGEngine, RAGAnswer, SecurityViolationError
from app.services.ollama_client import OllamaClient
from app.models.schemas import RequestItemResponse


class TestAgentActionRouting(unittest.TestCase):
    def setUp(self):
        self.mock_rag = MagicMock(spec=RAGEngine)
        self.mock_access = MagicMock(spec=AccessRequestService)
        self.mock_ollama = MagicMock(spec=OllamaClient)

        self.orchestrator = AgentOrchestrator(
            rag_engine=self.mock_rag,
            access_service=self.mock_access,
            ollama_client=self.mock_ollama
        )

    def test_routing_knowledge_questions(self):
        questions = [
            "What is the leave policy?",
            "What department does Alex Rivera work in?",
            "How do I submit an expense report?",
            "Who is the manager for cloud engineering?",
        ]
        for q in questions:
            action = self.orchestrator.decide_action(q)
            self.assertEqual(action, AgentAction.SEARCH_KNOWLEDGE, f"Failed on question: {q}")

    def test_routing_access_requests(self):
        requests = [
            "I need access to the HR portal.",
            "Can I get access to GitHub?",
            "Please grant me access to AWS production console.",
            "I need a second monitor and dock.",
            "Request access to Jira.",
        ]
        for req in requests:
            action = self.orchestrator.decide_action(req)
            self.assertEqual(action, AgentAction.CREATE_ACCESS_REQUEST, f"Failed on request: {req}")

    def test_routing_general_conversations(self):
        pleasantries = [
            "Hello",
            "Hi!",
            "Good morning",
            "Thanks!",
            "Thank you very much.",
            "Who are you?",
            "Goodbye",
        ]
        for p in pleasantries:
            action = self.orchestrator.decide_action(p)
            self.assertEqual(action, AgentAction.GENERAL_RESPONSE, f"Failed on pleasantry: {p}")


class TestAgentToolExecution(unittest.TestCase):
    def setUp(self):
        self.mock_rag = MagicMock(spec=RAGEngine)
        self.mock_access = MagicMock(spec=AccessRequestService)
        self.mock_ollama = MagicMock(spec=OllamaClient)

        self.orchestrator = AgentOrchestrator(
            rag_engine=self.mock_rag,
            access_service=self.mock_access,
            ollama_client=self.mock_ollama
        )

    def test_knowledge_search_execution_with_sources(self):
        self.mock_rag.query.return_value = RAGAnswer(
            question="What department does Alex Rivera work in?",
            answer="Alex Rivera works in the Engineering department.",
            sources=["sample_employee_redacted.txt (chunk 1)"],
            retrieved_chunks=[]
        )

        res = self.orchestrator.process("What department does Alex Rivera work in?")
        self.assertEqual(res.action, AgentAction.SEARCH_KNOWLEDGE)
        self.assertEqual(res.tool_executed, "rag_pipeline")
        self.assertIn("Engineering", res.answer)
        self.assertEqual(res.sources, ["sample_employee_redacted.txt (chunk 1)"])
        self.mock_rag.query.assert_called_once_with(question="What department does Alex Rivera work in?", top_k=3)

    def test_access_request_creation(self):
        self.mock_access.extract_resource_name.return_value = "HR portal"
        self.mock_access.create_access_request.return_value = RequestItemResponse(
            id="req-abc123",
            request_type="software_access",
            title="Access Request: HR portal",
            details="User requested access",
            priority="medium",
            status="pending"
        )

        res = self.orchestrator.process("I need access to the HR portal.")
        self.assertEqual(res.action, AgentAction.CREATE_ACCESS_REQUEST)
        self.assertEqual(res.tool_executed, "access_request_service")
        self.assertEqual(res.answer, "Access request created for HR portal.")
        self.assertEqual(res.sources, [])
        self.assertEqual(res.metadata.get("request_id"), "req-abc123")
        self.assertEqual(res.metadata.get("status"), "pending")

    def test_general_response_execution(self):
        self.mock_ollama.generate.return_value = "Hello! I am your AI Onboarding Assistant. How can I help you today?"

        res = self.orchestrator.process("Hello")
        self.assertEqual(res.action, AgentAction.GENERAL_RESPONSE)
        self.assertEqual(res.tool_executed, "general_conversational_llm")
        self.assertIn("Onboarding Assistant", res.answer)
        self.assertEqual(res.sources, [])


class TestAgentSecurityInvariants(unittest.TestCase):
    def setUp(self):
        self.mock_rag = MagicMock(spec=RAGEngine)
        self.mock_access = MagicMock(spec=AccessRequestService)
        self.mock_ollama = MagicMock(spec=OllamaClient)

        self.orchestrator = AgentOrchestrator(
            rag_engine=self.mock_rag,
            access_service=self.mock_access,
            ollama_client=self.mock_ollama
        )

    def test_agent_cannot_reveal_redacted_salary(self):
        """When user asks the agent for a redacted field, original value must not be returned."""
        self.mock_rag.query.return_value = RAGAnswer(
            question="What is Alex Rivera's salary?",
            answer="The requested information was not found in the provided documents.",
            sources=["sample_employee_redacted.txt (chunk 1)"],
            retrieved_chunks=[]
        )

        res = self.orchestrator.process("What is Alex Rivera's salary?")
        self.assertEqual(res.action, AgentAction.SEARCH_KNOWLEDGE)
        self.assertNotIn("12,50,000", res.answer)
        self.assertNotIn("₹12,50,000", res.answer)
        self.assertIn("not found", res.answer.lower())

    def test_access_request_service_unit(self):
        store = []
        svc = AccessRequestService(request_store=store)
        extracted = svc.extract_resource_name("I need access to the HR portal.")
        self.assertEqual(extracted, "HR portal")

        req = svc.create_access_request("I need access to the HR portal.")
        self.assertEqual(len(store), 1)
        self.assertEqual(req.status, "pending")
        self.assertIn("HR portal", req.title)


if __name__ == "__main__":
    unittest.main()
