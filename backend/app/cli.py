"""
Document Security CLI.

Provides command-line tools to classify document sensitivity, inspect detected sensitive entities,
and safely redact sensitive information into a separate output directory.

Usage:
    python -m app.cli classify <file>
    python -m app.cli redact <file> [--output <dest>]
    python -m app.cli inspect <file>
"""

import sys
import argparse
from pathlib import Path

# Ensure UTF-8 output encoding across all operating systems (especially Windows cp1252 consoles)
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from app.services.classifier import DocumentClassifier
from app.services.redactor import DocumentRedactor
from app.services.document_processor import DocumentProcessor, SecurityError
from app.services.rag_engine import RAGEngine, SecurityViolationError


def _format_display_path(path_str: str) -> str:
    """Format path for user-friendly display, preferring relative to cwd."""
    p = Path(path_str)
    try:
        rel = p.relative_to(Path.cwd())
        return str(rel).replace("\\", "/")
    except ValueError:
        return str(p).replace("\\", "/")


def cmd_classify(args: argparse.Namespace) -> int:
    """Execute classification command."""
    processor = DocumentProcessor()
    try:
        result = processor.inspect_file(args.file)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    print(f"File: {_format_display_path(result.input_path)}")
    print(f"Classification: {result.classification.level.value}")
    if result.classification.reasons:
        print("\nReasons:")
        for r in result.classification.reasons:
            print(f"- {r}")

    if result.redaction.detected_entity_types:
        print("\nDetected Sensitive Entity Types:")
        for t in result.redaction.detected_entity_types:
            print(f"- {t}")
    else:
        print("\nNo sensitive entity types detected.")

    return 0


def cmd_redact(args: argparse.Namespace) -> int:
    """Execute redact command with BEFORE and AFTER views."""
    processor = DocumentProcessor()
    try:
        result = processor.process_file(args.file, output_path=args.output)
    except SecurityError as se:
        print(f"Security Error: {se}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    print(f"Classification: {result.classification.level.value}\n")

    print("Detected:")
    if result.redaction.detected_entity_types:
        for t in result.redaction.detected_entity_types:
            print(f"- {t}")
    else:
        print("- (None)")

    print("\nBEFORE:")
    print(result.before_content.strip())

    print("\nAFTER:")
    print(result.after_content.strip())

    display_output = _format_display_path(result.output_path)
    print(f"\nRedacted file saved to:\n{display_output}")
    return 0


def cmd_inspect(args: argparse.Namespace) -> int:
    """Execute security inspection command with detailed entity positions."""
    processor = DocumentProcessor()
    try:
        result = processor.inspect_file(args.file)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    print(f"File: {_format_display_path(result.input_path)}")
    print(f"Classification: {result.classification.level.value}")

    entities = result.redaction.detected_entities
    print(f"\nDetected Entities ({len(entities)} found):")
    if not entities:
        print("  None. Document appears safe for public distribution.")
    else:
        for ent in entities:
            # Mask partially for safe terminal display in inspection
            val = ent.value
            masked_val = val[:3] + "..." if len(val) > 4 else "***"
            print(f"- [{ent.entity_type}] offset {ent.start}-{ent.end}: {masked_val}")

    print("\nSecurity Audit Summary:")
    if result.classification.level.value in ["RESTRICTED", "CONFIDENTIAL"]:
        print(f"  WARNING: Document is classified as {result.classification.level.value}.")
        print("  Original document MUST NOT be ingested into external models or unredacted vectors.")
        print("  Use 'python -m app.cli redact' to produce a sanitized copy.")
    else:
        print(f"  Document classification: {result.classification.level.value}.")

    return 0


def cmd_ingest(args: argparse.Namespace) -> int:
    """Execute document ingestion into the local RAG vector store."""
    engine = RAGEngine()
    try:
        summary = engine.ingest_document(args.file)
    except SecurityViolationError as sve:
        print(f"\nSECURITY VIOLATION:\n{sve}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"Error during ingestion: {e}", file=sys.stderr)
        return 1

    print(f"Document ingested: {summary.source_file}")
    print(f"Chunks created: {summary.chunks_created}")
    print(f"Total indexed chunks: {summary.total_indexed_chunks}")
    print("Vector index updated successfully.")
    return 0


def cmd_ask(args: argparse.Namespace) -> int:
    """Execute RAG question-answering with local Ollama qwen2.5:3b."""
    engine = RAGEngine()
    try:
        res = engine.query(args.question, top_k=args.top_k)
    except Exception as e:
        print(f"Error generating answer: {e}", file=sys.stderr)
        return 1

    print("Question:")
    print(res.question)

    print("\nAnswer:")
    print(res.answer)

    print("\nSources:")
    if res.sources:
        for s in res.sources:
            print(f"- {s}")
    else:
        print("- (None)")

    return 0


def main():
    parser = argparse.ArgumentParser(
        prog="python -m app.cli",
        description="Document Security & RAG Pipeline CLI: Classify, redact, inspect, ingest, and ask questions."
    )
    subparsers = parser.add_subparsers(dest="command", required=True, help="Command to run")

    # classify
    parser_classify = subparsers.add_parser("classify", help="Classify document sensitivity level")
    parser_classify.add_argument("file", help="Path to document file to classify")

    # redact
    parser_redact = subparsers.add_parser("redact", help="Detect, redact sensitive data, and save separate output")
    parser_redact.add_argument("file", help="Path to document file to redact")
    parser_redact.add_argument("--output", "-o", help="Optional destination path for redacted document", default=None)

    # inspect
    parser_inspect = subparsers.add_parser("inspect", help="Inspect document for sensitive entities without writing")
    parser_inspect.add_argument("file", help="Path to document file to inspect")

    # ingest
    parser_ingest = subparsers.add_parser("ingest", help="Ingest a redacted document into the local RAG vector store")
    parser_ingest.add_argument("file", help="Path to redacted document file to ingest")

    # ask
    parser_ask = subparsers.add_parser("ask", help="Ask a question grounded in ingested redacted documents")
    parser_ask.add_argument("question", help="The question to ask")
    parser_ask.add_argument("--top-k", "-k", type=int, default=3, help="Number of context chunks to retrieve (default: 3)")

    args = parser.parse_args()

    if args.command == "classify":
        sys.exit(cmd_classify(args))
    elif args.command == "redact":
        sys.exit(cmd_redact(args))
    elif args.command == "inspect":
        sys.exit(cmd_inspect(args))
    elif args.command == "ingest":
        sys.exit(cmd_ingest(args))
    elif args.command == "ask":
        sys.exit(cmd_ask(args))
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()

