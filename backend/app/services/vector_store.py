"""
Local Vector Store Service using FAISS.

Stores document chunk embeddings locally in binary FAISS index and metadata in JSON.
Does not require external vector databases or cloud connections.
"""

import json
from pathlib import Path
from typing import List, Tuple, Union, Optional
import numpy as np
import faiss
from pydantic import BaseModel, Field


class DocumentChunk(BaseModel):
    chunk_id: str = Field(..., description="Unique chunk identifier")
    source_file: str = Field(..., description="Name or relative path of source document")
    chunk_index: int = Field(..., description="0-indexed position within document")
    content: str = Field(..., description="Text content of the chunk")


class LocalVectorStore:
    """
    FAISS-backed local vector index for storing and retrieving document chunks.
    """

    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.index: faiss.Index = faiss.IndexFlatIP(dimension)  # Inner product for normalized cosine similarity
        self.chunks: List[DocumentChunk] = []

    def _normalize(self, vectors: np.ndarray) -> np.ndarray:
        """L2 normalize vectors for cosine similarity computation."""
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return (vectors / norms).astype(np.float32)

    def add_chunks(self, chunks: List[DocumentChunk], embeddings: List[List[float]]) -> None:
        """Add chunks and their embeddings to the FAISS index."""
        if not chunks:
            return

        if len(chunks) != len(embeddings):
            raise ValueError(f"Number of chunks ({len(chunks)}) != number of embeddings ({len(embeddings)})")

        emb_array = np.array(embeddings, dtype=np.float32)
        if emb_array.shape[1] != self.dimension:
            # Dynamically re-initialize index if dimension differs
            self.dimension = emb_array.shape[1]
            self.index = faiss.IndexFlatIP(self.dimension)
            self.chunks = []

        norm_embeddings = self._normalize(emb_array)
        self.index.add(norm_embeddings)
        self.chunks.extend(chunks)

    def search(self, query_embedding: List[float], top_k: int = 3) -> List[Tuple[DocumentChunk, float]]:
        """
        Retrieve top_k most similar chunks for a given query embedding.
        Returns list of (DocumentChunk, similarity_score) sorted by relevance.
        """
        if self.index.ntotal == 0 or not self.chunks:
            return []

        q_vec = np.array([query_embedding], dtype=np.float32)
        q_norm = self._normalize(q_vec)

        k = min(top_k, self.index.ntotal)
        scores, indices = self.index.search(q_norm, k)

        results: List[Tuple[DocumentChunk, float]] = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1 and idx < len(self.chunks):
                results.append((self.chunks[idx], float(score)))

        return results

    def save(self, storage_dir: Union[str, Path]) -> None:
        """Persist index and metadata to local disk."""
        target = Path(storage_dir)
        target.mkdir(parents=True, exist_ok=True)

        index_file = target / "index.faiss"
        meta_file = target / "chunks.json"

        faiss.write_index(self.index, str(index_file))

        metadata = [chunk.model_dump() for chunk in self.chunks]
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

    def load(self, storage_dir: Union[str, Path]) -> bool:
        """Load index and metadata from local disk. Returns True if successfully loaded."""
        target = Path(storage_dir)
        index_file = target / "index.faiss"
        meta_file = target / "chunks.json"

        if not index_file.exists() or not meta_file.exists():
            return False

        try:
            self.index = faiss.read_index(str(index_file))
            self.dimension = self.index.d

            with open(meta_file, "r", encoding="utf-8") as f:
                raw_meta = json.load(f)

            self.chunks = [DocumentChunk(**item) for item in raw_meta]
            return True
        except Exception:
            return False

    def clear(self) -> None:
        """Reset the index and stored chunks."""
        self.index = faiss.IndexFlatIP(self.dimension)
        self.chunks = []

    @property
    def total_chunks(self) -> int:
        return len(self.chunks)
