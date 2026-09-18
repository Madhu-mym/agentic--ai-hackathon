"""
Document Parser Service (Placeholder)

Responsibilities for future implementation:
- Ingest company onboarding documents (PDF, Markdown, plain text, DOCX) from data/documents/.
- Clean and normalize document text (strip boilerplate, headers/footers).
- Split documents into semantically coherent chunks using recursive character / token splitters.
- Extract metadata such as document title, section heading, last modified date, and category.
- Pass chunks to embedding pipeline for storage in vector database.
"""

from typing import List, Dict, Any


class DocumentParser:
    def __init__(self, document_directory: str = "data/documents"):
        self.document_directory = document_directory

    def load_documents(self) -> List[Dict[str, Any]]:
        """
        TODO:
        1. Iterate through files in self.document_directory.
        2. Detect file format (.pdf, .md, .txt) and apply appropriate parser.
        3. Extract raw text and document metadata.
        """
        return []

    def chunk_document(self, text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
        """
        TODO:
        1. Apply token or character splitting with overlap to preserve context across boundaries.
        2. Filter out empty or low-information chunks.
        """
        return [text] if text else []
