"""
Document Processor Service.

Handles reading local documents, classifying sensitivity, redacting sensitive entities,
and safely saving redacted copies while guaranteeing the original file is never overwritten.
"""

from pathlib import Path
from typing import Optional, Union
from pydantic import BaseModel, Field

from app.services.classifier import DocumentClassifier, ClassificationResult
from app.services.redactor import DocumentRedactor, RedactionResult


class SecurityError(Exception):
    """Raised when an operation would violate document security constraints."""
    pass


class ProcessedDocument(BaseModel):
    input_path: str = Field(..., description="Path to the original document")
    output_path: str = Field(..., description="Path where the redacted document was saved")
    classification: ClassificationResult = Field(..., description="Document sensitivity classification result")
    redaction: RedactionResult = Field(..., description="Redaction details including detected entities")
    before_content: str = Field(..., description="Original raw document content")
    after_content: str = Field(..., description="Redacted document content")


class DocumentProcessor:
    """
    Coordinates local document security pipeline:
    1. Read input document
    2. Detect sensitive entities and redact
    3. Classify document sensitivity
    4. Save redacted copy to a separate, non-colliding location
    """

    def __init__(
        self,
        classifier: Optional[DocumentClassifier] = None,
        redactor: Optional[DocumentRedactor] = None,
        default_redacted_dir: str = "data/redacted"
    ):
        self.classifier = classifier or DocumentClassifier()
        self.redactor = redactor or DocumentRedactor()
        self.default_redacted_dir = Path(default_redacted_dir)

    def process_file(
        self,
        file_path: Union[str, Path],
        output_path: Optional[Union[str, Path]] = None
    ) -> ProcessedDocument:
        """
        Process a document from disk, producing a classified and redacted copy.

        Security invariant: The original file will never be modified or overwritten.
        """
        src_path = Path(file_path).resolve()

        if not src_path.exists():
            raise FileNotFoundError(f"Document not found at path: {file_path}")
        if not src_path.is_file():
            raise ValueError(f"Path is not a regular file: {file_path}")

        # Read original document (read-only)
        with open(src_path, "r", encoding="utf-8") as f:
            raw_content = f.read()

        # Perform entity detection and redaction
        redaction_result = self.redactor.redact(raw_content)

        # Perform sensitivity classification
        classification_result = self.classifier.classify(
            text=raw_content,
            detected_entity_types=redaction_result.detected_entity_types
        )

        # Determine target output path
        if output_path is not None:
            dest_path = Path(output_path).resolve()
        else:
            # Generate default safe path: data/redacted/<stem>_redacted<suffix>
            base_dir = self.default_redacted_dir
            if not base_dir.is_absolute():
                # Prefer relative to workspace/backend if in backend or root
                base_dir = Path.cwd() / self.default_redacted_dir
            dest_filename = f"{src_path.stem}_redacted{src_path.suffix}"
            dest_path = (base_dir / dest_filename).resolve()

        # Strict Security Invariant: Original document must NEVER be overwritten
        if dest_path == src_path:
            raise SecurityError(
                f"Security Violation: Target output path '{dest_path}' is identical to the input path. "
                "Original documents must never be overwritten."
            )

        # Write redacted document to distinct target directory
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        with open(dest_path, "w", encoding="utf-8") as f:
            f.write(redaction_result.redacted_text)

        return ProcessedDocument(
            input_path=str(src_path),
            output_path=str(dest_path),
            classification=classification_result,
            redaction=redaction_result,
            before_content=raw_content,
            after_content=redaction_result.redacted_text
        )

    def inspect_file(self, file_path: Union[str, Path]) -> ProcessedDocument:
        """
        Read, classify, and inspect sensitive entities without writing an output file.
        """
        src_path = Path(file_path).resolve()

        if not src_path.exists():
            raise FileNotFoundError(f"Document not found at path: {file_path}")

        with open(src_path, "r", encoding="utf-8") as f:
            raw_content = f.read()

        redaction_result = self.redactor.redact(raw_content)
        classification_result = self.classifier.classify(
            text=raw_content,
            detected_entity_types=redaction_result.detected_entity_types
        )

        return ProcessedDocument(
            input_path=str(src_path),
            output_path="",
            classification=classification_result,
            redaction=redaction_result,
            before_content=raw_content,
            after_content=redaction_result.redacted_text
        )
