"""
Document Sensitivity Classifier.

Provides deterministic, rule-based classification of documents into:
- PUBLIC: General information, publicly sharable, no PII or sensitive credentials.
- INTERNAL: Organizational data containing internal contacts, employee IDs, or internal docs.
- CONFIDENTIAL: Financial, compensation, or tax information (salaries, bank accounts, PAN).
- RESTRICTED: Highly sensitive credentials and national identities (passwords, API tokens, Aadhaar).
"""

import re
from enum import Enum
from typing import List, Optional, Set
from pydantic import BaseModel, Field


class SensitivityLevel(str, Enum):
    PUBLIC = "PUBLIC"
    INTERNAL = "INTERNAL"
    CONFIDENTIAL = "CONFIDENTIAL"
    RESTRICTED = "RESTRICTED"


LEVEL_HIERARCHY = {
    SensitivityLevel.PUBLIC: 1,
    SensitivityLevel.INTERNAL: 2,
    SensitivityLevel.CONFIDENTIAL: 3,
    SensitivityLevel.RESTRICTED: 4,
}


class ClassificationResult(BaseModel):
    level: SensitivityLevel = Field(..., description="Determined sensitivity classification level")
    reasons: List[str] = Field(default_factory=list, description="List of rule/entity justifications for the classification")
    detected_entity_types: List[str] = Field(default_factory=list, description="Unique sensitive entity types found")


class DocumentClassifier:
    """
    Deterministic rule-based sensitivity classifier.
    Evaluates both explicit classification keywords and detected sensitive entities.
    """

    KEYWORD_PATTERNS = {
        SensitivityLevel.RESTRICTED: [
            r"\bRESTRICTED\b",
            r"\bTOP\s+SECRET\b",
            r"\bHIGHLY\s+(?:CONFIDENTIAL|SENSITIVE)\b",
            r"\bSTRICTLY\s+(?:RESTRICTED|CONFIDENTIAL)\b",
        ],
        SensitivityLevel.CONFIDENTIAL: [
            r"\bCONFIDENTIAL\b",
            r"\bSTRICTLY\s+PRIVATE\b",
            r"\bPRIVATE\s*&\s*CONFIDENTIAL\b",
        ],
        SensitivityLevel.INTERNAL: [
            r"\bINTERNAL\s+ONLY\b",
            r"\bFOR\s+INTERNAL\s+USE\b",
            r"\bINTERNAL\b",
            r"\bPROPRIETARY\b",
        ],
    }

    ENTITY_SENSITIVITY_MAP = {
        "API_KEY": SensitivityLevel.RESTRICTED,
        "PASSWORD": SensitivityLevel.RESTRICTED,
        "AADHAAR": SensitivityLevel.RESTRICTED,
        "BANK_ACCOUNT": SensitivityLevel.CONFIDENTIAL,
        "SALARY": SensitivityLevel.CONFIDENTIAL,
        "PAN": SensitivityLevel.CONFIDENTIAL,
        "EMPLOYEE_ID": SensitivityLevel.INTERNAL,
        "EMAIL": SensitivityLevel.INTERNAL,
        "PHONE": SensitivityLevel.INTERNAL,
    }

    def classify(
        self,
        text: str,
        detected_entity_types: Optional[List[str]] = None
    ) -> ClassificationResult:
        """
        Classify document text based on deterministic keyword matching and detected sensitive entity types.
        """
        entity_types = detected_entity_types or []
        highest_level = SensitivityLevel.PUBLIC
        reasons: List[str] = []

        # 1. Check for entity-driven classification
        restricted_entities = [t for t in entity_types if self.ENTITY_SENSITIVITY_MAP.get(t) == SensitivityLevel.RESTRICTED]
        confidential_entities = [t for t in entity_types if self.ENTITY_SENSITIVITY_MAP.get(t) == SensitivityLevel.CONFIDENTIAL]
        internal_entities = [t for t in entity_types if self.ENTITY_SENSITIVITY_MAP.get(t) == SensitivityLevel.INTERNAL]

        if restricted_entities:
            highest_level = SensitivityLevel.RESTRICTED
            reasons.append(f"Contains restricted credentials/identity: {', '.join(sorted(restricted_entities))}")
        elif confidential_entities:
            highest_level = SensitivityLevel.CONFIDENTIAL
            reasons.append(f"Contains confidential financial/tax information: {', '.join(sorted(confidential_entities))}")
        elif internal_entities:
            highest_level = SensitivityLevel.INTERNAL
            reasons.append(f"Contains internal employee contact/ID details: {', '.join(sorted(internal_entities))}")

        # 2. Check for explicit keyword/header markers
        for level in [SensitivityLevel.RESTRICTED, SensitivityLevel.CONFIDENTIAL, SensitivityLevel.INTERNAL]:
            patterns = self.KEYWORD_PATTERNS.get(level, [])
            for pattern in patterns:
                if re.search(pattern, text, flags=re.IGNORECASE):
                    reasons.append(f"Contains {level.value} marker matching pattern '{pattern}'")
                    if LEVEL_HIERARCHY[level] > LEVEL_HIERARCHY[highest_level]:
                        highest_level = level
                    break

        if highest_level == SensitivityLevel.PUBLIC and not reasons:
            reasons.append("No internal, confidential, or restricted indicators detected.")

        return ClassificationResult(
            level=highest_level,
            reasons=reasons,
            detected_entity_types=sorted(list(set(entity_types)))
        )
