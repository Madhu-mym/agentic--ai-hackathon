"""
Local Ollama API Client.

Interfaces with the local Ollama instance running on localhost:11434.
- Embeddings: 'all-minilm' (384-dimensional dense vectors)
- LLM Generation: 'qwen2.5:3b'
No external API keys, tokens, or network requests are used.
"""

import os
import json
import urllib.request
import urllib.error
from typing import List, Optional, Dict, Any


class OllamaServiceError(Exception):
    """Raised when communication with local Ollama service fails."""
    pass


class OllamaClient:
    """Client for local Ollama REST endpoints."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        llm_model: str = "qwen2.5:3b",
        embedding_model: str = "all-minilm",
        timeout: int = 60
    ):
        self.base_url = (base_url or os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")).rstrip("/")
        self.llm_model = llm_model
        self.embedding_model = embedding_model
        self.timeout = timeout

    def is_available(self) -> bool:
        """Check if local Ollama daemon is reachable."""
        try:
            url = f"{self.base_url}/api/tags"
            req = urllib.request.Request(url, headers={"User-Agent": "FutureReadyOnboarding/1.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                return resp.status == 200
        except Exception:
            return False

    def get_embedding(self, text: str) -> List[float]:
        """
        Generate dense vector embedding for input text using local all-minilm.
        """
        url = f"{self.base_url}/api/embeddings"
        payload = {
            "model": self.embedding_model,
            "prompt": text,
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json", "User-Agent": "FutureReadyOnboarding/1.0"}
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                embedding = result.get("embedding")
                if not embedding or not isinstance(embedding, list):
                    raise OllamaServiceError(f"Invalid embedding response from Ollama: {result}")
                return embedding
        except urllib.error.URLError as e:
            raise OllamaServiceError(
                f"Failed to connect to local Ollama at {self.base_url}. Ensure Ollama is running: {e}"
            ) from e
        except Exception as e:
            raise OllamaServiceError(f"Error generating embedding via Ollama: {e}") from e

    def generate(self, prompt: str, system: Optional[str] = None) -> str:
        """
        Generate completion using local qwen2.5:3b model.
        """
        url = f"{self.base_url}/api/generate"
        payload: Dict[str, Any] = {
            "model": self.llm_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,  # Low temperature for deterministic, fact-grounded responses
            }
        }
        if system:
            payload["system"] = system

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json", "User-Agent": "FutureReadyOnboarding/1.0"}
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                response_text = result.get("response", "").strip()
                return response_text
        except urllib.error.URLError as e:
            raise OllamaServiceError(
                f"Failed to connect to local Ollama at {self.base_url}. Ensure Ollama is running: {e}"
            ) from e
        except Exception as e:
            raise OllamaServiceError(f"Error generating response via Ollama: {e}") from e
