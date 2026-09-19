"""
Document Parser Service.

Responsible for ingesting text documents and segmenting them into semantically
coherent chunks for embedding generation and vector store indexing.
"""

from pathlib import Path
from typing import List, Union
from app.services.vector_store import DocumentChunk


class DocumentParser:
    """
    Parses and chunks documents into structured chunks with provenance metadata.
    """

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_text(self, text: str, source_name: str) -> List[DocumentChunk]:
        """
        Segment plain text into structured chunks.
        Splits preferentially by paragraphs (double newlines) or lines to preserve context.
        """
        if not text or not text.strip():
            return []

        # Split into paragraphs or logical blocks
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

        chunks: List[str] = []
        current_chunk = ""

        for p in paragraphs:
            if not current_chunk:
                current_chunk = p
            elif len(current_chunk) + len(p) + 2 <= self.chunk_size:
                current_chunk += "\n\n" + p
            else:
                chunks.append(current_chunk)
                # If paragraph itself is larger than chunk_size, split by lines/sliding window
                if len(p) > self.chunk_size:
                    lines = p.split("\n")
                    sub_chunk = ""
                    for line in lines:
                        if not sub_chunk:
                            sub_chunk = line
                        elif len(sub_chunk) + len(line) + 1 <= self.chunk_size:
                            sub_chunk += "\n" + line
                        else:
                            chunks.append(sub_chunk)
                            sub_chunk = line
                    current_chunk = sub_chunk
                else:
                    current_chunk = p

        if current_chunk and current_chunk.strip():
            chunks.append(current_chunk.strip())

        # Wrap in DocumentChunk objects
        doc_chunks: List[DocumentChunk] = []
        clean_source = Path(source_name).name
        for idx, content in enumerate(chunks, start=1):
            doc_chunks.append(
                DocumentChunk(
                    chunk_id=f"{clean_source}#chunk_{idx}",
                    source_file=clean_source,
                    chunk_index=idx,
                    content=content
                )
            )

        return doc_chunks

    def parse_file(self, file_path: Union[str, Path]) -> List[DocumentChunk]:
        """Read a file from disk and return chunked DocumentChunks."""
        p = Path(file_path)
        if not p.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        text = p.read_text(encoding="utf-8")
        return self.chunk_text(text, source_name=p.name)
