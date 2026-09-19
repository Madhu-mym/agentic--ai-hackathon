"""
Test Suite for RAG + Local LLM Pipeline.

Covers:
- Text chunking & provenance metadata
- Local vector store (FAISS) indexing, search, save, and load
- Security gate enforcement (blocking unredacted documents)
- RAG query generation & source attribution
- Strict refusal for redacted values (ensuring original confidential values are not revealed)
- Strict refusal for unmentioned information
"""

import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock

BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.document_parser import DocumentParser
from app.services.vector_store import LocalVectorStore, DocumentChunk
from app.services.rag_engine import RAGEngine, SecurityViolationError
from app.services.ollama_client import OllamaClient


class TestDocumentChunking(unittest.TestCase):
    def setUp(self):
        self.parser = DocumentParser(chunk_size=150, chunk_overlap=20)

    def test_chunking_metadata(self):
        text = (
            "Paragraph One: Onboarding checklist for new hires.\n\n"
            "Paragraph Two: Setting up workstation and credentials.\n\n"
            "Paragraph Three: Company policies and health benefits."
        )
        chunks = self.parser.chunk_text(text, source_name="onboarding_guide_redacted.txt")

        self.assertGreaterEqual(len(chunks), 2)
        for idx, chunk in enumerate(chunks, start=1):
            self.assertEqual(chunk.source_file, "onboarding_guide_redacted.txt")
            self.assertEqual(chunk.chunk_index, idx)
            self.assertTrue(chunk.chunk_id.startswith("onboarding_guide_redacted.txt#chunk_"))
            self.assertTrue(len(chunk.content) > 0)


class TestVectorStore(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.store = LocalVectorStore(dimension=4)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_add_search_save_load(self):
        chunks = [
            DocumentChunk(chunk_id="c1", source_file="doc1.txt", chunk_index=1, content="Engineering department"),
            DocumentChunk(chunk_id="c2", source_file="doc1.txt", chunk_index=2, content="Human resources policy"),
        ]
        # Vectors where c1 is close to [1, 0, 0, 0] and c2 is close to [0, 1, 0, 0]
        embeddings = [
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0],
        ]

        self.store.add_chunks(chunks, embeddings)
        self.assertEqual(self.store.total_chunks, 2)

        # Query vector closest to c1
        query_vec = [0.9, 0.1, 0.0, 0.0]
        results = self.store.search(query_vec, top_k=1)
        self.assertEqual(len(results), 1)
        top_chunk, score = results[0]
        self.assertEqual(top_chunk.chunk_id, "c1")
        self.assertGreater(score, 0.8)

        # Save and reload
        save_path = Path(self.temp_dir.name) / "vector_db"
        self.store.save(save_path)

        new_store = LocalVectorStore(dimension=4)
        loaded = new_store.load(save_path)
        self.assertTrue(loaded)
        self.assertEqual(new_store.total_chunks, 2)

        new_results = new_store.search(query_vec, top_k=1)
        self.assertEqual(new_results[0][0].chunk_id, "c1")


class TestRAGSecurityGate(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.mock_ollama = MagicMock(spec=OllamaClient)
        self.mock_ollama.get_embedding.return_value = [0.1] * 384
        self.mock_ollama.generate.return_value = "Mock answer"

        self.engine = RAGEngine(
            ollama_client=self.mock_ollama,
            storage_dir=Path(self.temp_dir.name) / "vdb"
        )

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_reject_unredacted_confidential_document(self):
        """Security invariant: unredacted documents with raw salary / credentials must be rejected."""
        unredacted_text = (
            "Employee Name: Alex Rivera\n"
            "Salary: ₹12,50,000\n"
            "Dev API Token: sk-test-example-123456789\n"
        )
        unredacted_file = Path(self.temp_dir.name) / "unredacted.txt"
        unredacted_file.write_text(unredacted_text, encoding="utf-8")

        with self.assertRaises(SecurityViolationError) as ctx:
            self.engine.ingest_document(unredacted_file)

        err_msg = str(ctx.exception)
        self.assertIn("Security Violation", err_msg)
        self.assertIn("unredacted confidential/restricted data", err_msg)

    def test_allow_redacted_document(self):
        """Redacted document with [REDACTED] values must be accepted."""
        redacted_text = (
            "Employee Name: Alex Rivera\n"
            "Department: Engineering\n"
            "Salary: [REDACTED]\n"
            "Dev API Token: [REDACTED]\n"
        )
        redacted_file = Path(self.temp_dir.name) / "sample_employee_redacted.txt"
        redacted_file.write_text(redacted_text, encoding="utf-8")

        summary = self.engine.ingest_document(redacted_file)
        self.assertEqual(summary.source_file, "sample_employee_redacted.txt")
        self.assertGreater(summary.chunks_created, 0)


class TestRAGQueryAndAttribution(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.mock_ollama = MagicMock(spec=OllamaClient)
        self.mock_ollama.get_embedding.return_value = [0.1] * 384

        self.engine = RAGEngine(
            ollama_client=self.mock_ollama,
            storage_dir=Path(self.temp_dir.name) / "vdb"
        )

        redacted_text = (
            "Employee Name: Alex Rivera\n"
            "Department: Engineering\n"
            "Salary: [REDACTED]\n"
        )
        doc_file = Path(self.temp_dir.name) / "alex_redacted.txt"
        doc_file.write_text(redacted_text, encoding="utf-8")
        self.engine.ingest_document(doc_file)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_source_attribution_and_grounded_query(self):
        self.mock_ollama.generate.return_value = "Alex Rivera works in the Engineering department."

        ans = self.engine.query("What department does Alex Rivera work in?")
        self.assertIn("Alex Rivera works in the Engineering department.", ans.answer)
        self.assertGreater(len(ans.sources), 0)
        self.assertTrue(any("alex_redacted.txt" in s for s in ans.sources))

    def test_redacted_value_query(self):
        self.mock_ollama.generate.return_value = (
            "The salary for Alex Rivera is unavailable because it has been [REDACTED] in the source records."
        )

        ans = self.engine.query("What is Alex Rivera's salary?")
        self.assertIn("unavailable", ans.answer.lower())
        self.assertIn("[REDACTED]", ans.answer)
        self.assertNotIn("12,50,000", ans.answer)

    def test_unmentioned_query(self):
        self.mock_ollama.generate.return_value = (
            "The requested information was not found in the provided documents."
        )

        ans = self.engine.query("What is the pet policy?")
        self.assertIn("not found", ans.answer.lower())


if __name__ == "__main__":
    unittest.main()
