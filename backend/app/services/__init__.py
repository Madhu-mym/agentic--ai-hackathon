"""
Backend Services Package.
Includes security classification, entity detection, redaction, and document processing.
"""

from app.services.classifier import DocumentClassifier, SensitivityLevel, ClassificationResult
from app.services.redactor import DocumentRedactor, DetectedEntity
from app.services.document_processor import DocumentProcessor, ProcessedDocument
from app.services.vector_store import LocalVectorStore, DocumentChunk
from app.services.document_parser import DocumentParser
from app.services.ollama_client import OllamaClient, OllamaServiceError
from app.services.rag_engine import RAGEngine, RAGAnswer, SecurityViolationError, IngestionSummary
from app.services.access_request_service import AccessRequestService
from app.services.agent_orchestrator import AgentOrchestrator, AgentAction, AgentResult

__all__ = [
    "DocumentClassifier",
    "SensitivityLevel",
    "ClassificationResult",
    "DocumentRedactor",
    "DetectedEntity",
    "DocumentProcessor",
    "ProcessedDocument",
    "LocalVectorStore",
    "DocumentChunk",
    "DocumentParser",
    "OllamaClient",
    "OllamaServiceError",
    "RAGEngine",
    "RAGAnswer",
    "SecurityViolationError",
    "IngestionSummary",
    "AccessRequestService",
    "AgentOrchestrator",
    "AgentAction",
    "AgentResult",
]
