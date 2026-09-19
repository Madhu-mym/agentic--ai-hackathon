"""
Document Redactor Service.

Detects sensitive information using deterministic regex patterns and redacts values with [REDACTED].

Entity Types Detected:
- EMAIL: Email addresses
- PHONE: Phone and mobile numbers (Indian, international, US)
- BANK_ACCOUNT: Bank account numbers and IBAN
- EMPLOYEE_ID: Employee identification numbers (EMP-xxx, etc.)
- SALARY: Compensation, pay, salary amounts and currency notations
- API_KEY: API keys, bearer tokens, secret tokens
- PASSWORD: Password and secret credential fields
- AADHAAR: 12-digit Indian national identity numbers
- PAN: 10-character Permanent Account Numbers
"""

import re
from typing import List, NamedTuple, Tuple, Set
from pydantic import BaseModel, Field


REDACTED_TOKEN = "[REDACTED]"


class DetectedEntity(BaseModel):
    entity_type: str = Field(..., description="Type of sensitive entity detected")
    value: str = Field(..., description="Raw sensitive value detected")
    start: int = Field(..., description="Starting character index in original document")
    end: int = Field(..., description="Ending character index in original document")


class RedactionResult(BaseModel):
    redacted_text: str = Field(..., description="Document content with sensitive values replaced by [REDACTED]")
    detected_entities: List[DetectedEntity] = Field(default_factory=list, description="All detected sensitive entity instances")
    detected_entity_types: List[str] = Field(default_factory=list, description="Unique entity types detected in document")


class _RuleMatch(NamedTuple):
    start: int
    end: int
    entity_type: str
    value: str


class DocumentRedactor:
    """
    Detects and redacts sensitive data using deterministic regex rules.
    Preserves labels and structure while safely replacing sensitive values.
    """

    def __init__(self):
        # Compiled patterns: Tuple of (Entity Type, Pattern, group_index_to_redact)
        # If group_index_to_redact is 0, the full match is the sensitive value.
        # If group_index_to_redact is 1, group 1 is the sensitive value (preserves label/prefix).
        self.rules: List[Tuple[str, re.Pattern, int]] = [
            # 1. API Keys and Tokens (High priority: check first to prevent partial token matches)
            (
                "API_KEY",
                re.compile(
                    r"(?i)(?:API[_\s]*Key|API[_\s]*Token|Secret[_\s]*Key|Bearer|Access[_\s]*Token|Auth[_\s]*Token|Dev[_\s]*API[_\s]*Token)[ \t]*[:=][ \t]*([A-Za-z0-9_\-\.]{12,})"
                ),
                1
            ),
            (
                "API_KEY",
                re.compile(r"\b(?:sk-[a-zA-Z0-9_\-]{12,}|ghp_[a-zA-Z0-9]{20,}|gho_[a-zA-Z0-9]{20,}|eyJ[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]+)\b"),
                0
            ),

            # 2. Passwords
            (
                "PASSWORD",
                re.compile(
                    r"(?i)(?:Initial\s*Password|Password|Passwd|Pwd|Secret(?:\s*Code)?)[ \t]*[:=][ \t]*([^\s\r\n]{4,})"
                ),
                1
            ),

            # 3. Aadhaar Number (12-digit Indian ID)
            (
                "AADHAAR",
                re.compile(
                    r"(?i)(?:Aadhaar(?:\s*(?:Number|No))?|UIDAI|Aadhar(?:\s*(?:Number|No))?)[ \t]*[:=][ \t]*([2-9]\d{3}[ \t\-]?[0-9]{4}[ \t\-]?[0-9]{4})"
                ),
                1
            ),
            (
                "AADHAAR",
                re.compile(r"\b[2-9]\d{3}[ \t\-][0-9]{4}[ \t\-][0-9]{4}\b"),
                0
            ),

            # 4. PAN Number (Indian 10-char alphanumeric: 5 letters, 4 digits, 1 letter)
            (
                "PAN",
                re.compile(
                    r"(?i)(?:PAN(?:\s*(?:Card|Number|No))?|Permanent\s*Account\s*Number)[ \t]*[:=][ \t]*([A-Z]{5}[0-9]{4}[A-Z])"
                ),
                1
            ),
            (
                "PAN",
                re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"),
                0
            ),

            # 5. Bank Account Numbers
            (
                "BANK_ACCOUNT",
                re.compile(
                    r"(?i)(?:Bank\s*Account(?:\s*(?:Number|No|#))?|Account\s*Number|Acc\s*No|A/C\s*(?:No|Number)?|IBAN)[ \t]*[:=][ \t]*([A-Za-z0-9 \t\-]{8,24})"
                ),
                1
            ),

            # 6. Salary & Pay Information
            (
                "SALARY",
                re.compile(
                    r"(?i)(?:Salary|Pay|Compensation|CTC|Stipend|Gross\s*Pay|Net\s*Pay|Annual\s*Compensation|Monthly\s*Wage)[ \t]*[:=][ \t]*((?:[₹$€£]|INR|USD|EUR|GBP)?[ \t]*[\d,]+(?:\.\d{1,2})?(?:[ \t]*(?:LPA|PA|per\s*(?:annum|month|year)|/-))?)",
                ),
                1
            ),
            (
                "SALARY",
                re.compile(
                    r"(?:[₹$€£]|INR|USD)[ \t]*[\d,]+(?:\.\d{1,2})?(?:[ \t]*(?:LPA|PA|per\s*(?:annum|month|year)|/-))?"
                ),
                0
            ),

            # 7. Employee IDs
            (
                "EMPLOYEE_ID",
                re.compile(
                    r"(?i)(?:Employee\s*ID|Emp\s*ID|Staff\s*ID|Worker\s*ID)[ \t]*[:=][ \t]*([A-Za-z0-9\-_]+)"
                ),
                1
            ),
            (
                "EMPLOYEE_ID",
                re.compile(r"\b(?:EMP|EID|STAFF|ACME)[-_][0-9]{3,8}\b"),
                0
            ),

            # 8. Email Addresses
            (
                "EMAIL",
                re.compile(
                    r"(?i)(?:Email(?:\s*Address)?|E-mail)[ \t]*[:=][ \t]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})"
                ),
                1
            ),
            (
                "EMAIL",
                re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
                0
            ),

            # 9. Phone Numbers
            (
                "PHONE",
                re.compile(
                    r"(?i)(?:Phone(?:\s*(?:Number|No))?|Mobile(?:\s*No)?|Cell|Tel|Contact(?:\s*No)?)[ \t]*[:=][ \t]*(\+?[\d \t\-\(\)\.]{7,20})"
                ),
                1
            ),
            (
                "PHONE",
                re.compile(r"(?:\+91[\-\s]?)?[6-9]\d{9}\b"),
                0
            ),
            (
                "PHONE",
                re.compile(r"\b(?:\+?1[\s\.\-]?)?\(?\d{3}\)?[\s\.\-]\d{3}[\s\.\-]\d{4}\b"),
                0
            ),
            (
                "PHONE",
                re.compile(r"\+\d{1,3}[\s\.\-]\d{3,4}[\s\.\-]\d{3,4}\b"),
                0
            ),
        ]

    def redact(self, text: str) -> RedactionResult:
        """
        Detect sensitive entities and replace them with [REDACTED].
        Resolves overlapping entity spans safely.
        """
        raw_matches: List[_RuleMatch] = []

        for entity_type, pattern, group_idx in self.rules:
            for match in pattern.finditer(text):
                if group_idx <= match.lastindex if match.lastindex else (group_idx == 0):
                    start, end = match.span(group_idx)
                    value = match.group(group_idx).strip()
                    # Adjust start/end if whitespace was stripped
                    orig_matched = match.group(group_idx)
                    lead_spaces = len(orig_matched) - len(orig_matched.lstrip())
                    trail_spaces = len(orig_matched) - len(orig_matched.rstrip())
                    adj_start = start + lead_spaces
                    adj_end = end - trail_spaces
                    if adj_start < adj_end and value:
                        raw_matches.append(_RuleMatch(adj_start, adj_end, entity_type, value))

        # Merge overlapping/redundant spans
        merged_matches = self._resolve_spans(raw_matches)

        # Build detected entities list (sorted by start index in document)
        detected_entities: List[DetectedEntity] = [
            DetectedEntity(
                entity_type=m.entity_type,
                value=m.value,
                start=m.start,
                end=m.end
            )
            for m in merged_matches
        ]

        # Redact text from back to front so indices remain valid
        redacted_text = text
        for m in sorted(merged_matches, key=lambda x: x.start, reverse=True):
            redacted_text = redacted_text[:m.start] + REDACTED_TOKEN + redacted_text[m.end:]

        unique_types = sorted(list({e.entity_type for e in detected_entities}))

        return RedactionResult(
            redacted_text=redacted_text,
            detected_entities=detected_entities,
            detected_entity_types=unique_types
        )

    def _resolve_spans(self, matches: List[_RuleMatch]) -> List[_RuleMatch]:
        """
        Sort and filter overlapping spans.
        Prioritizes longer spans and higher-priority entity classifications.
        """
        if not matches:
            return []

        # Sort primarily by start ascending, then by span length descending
        sorted_matches = sorted(matches, key=lambda m: (m.start, -(m.end - m.start)))

        resolved: List[_RuleMatch] = []
        for current in sorted_matches:
            if not resolved:
                resolved.append(current)
                continue

            last = resolved[-1]

            # Case 1: No overlap
            if current.start >= last.end:
                resolved.append(current)
            # Case 2: Subsumed completely inside the last match
            elif current.end <= last.end:
                continue
            # Case 3: Partial overlap (extend span if needed, keeping earlier/dominant type)
            else:
                # Merge into a broader span if overlapping significantly
                extended_val = current.value
                resolved[-1] = _RuleMatch(last.start, current.end, last.entity_type, extended_val)

        return resolved
