"""
Comprehensive Test Suite for Document Security Pipeline.

Covers:
- Classification (PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED)
- Entity detection and redaction for:
  - Email
  - Phone
  - Employee ID
  - Salary
  - Bank Account
  - API Token
  - Password
  - Aadhaar
  - PAN
- Security invariants:
  - Original file is never modified (content & hash verified)
  - Attempting to overwrite original file raises SecurityError
  - Redacted output contains [REDACTED] and omits sensitive values
- CLI command executions
"""

import os
import sys
import hashlib
import tempfile
import unittest
from pathlib import Path
from io import StringIO
from unittest.mock import patch

# Ensure backend root is on Python path
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.classifier import DocumentClassifier, SensitivityLevel
from app.services.redactor import DocumentRedactor, REDACTED_TOKEN
from app.services.document_processor import DocumentProcessor, SecurityError
from app.cli import cmd_classify, cmd_redact, cmd_inspect
import argparse


class TestSensitivityClassifier(unittest.TestCase):
    def setUp(self):
        self.classifier = DocumentClassifier()

    def test_classification_public(self):
        text = "Welcome to Acme Corp! We are excited to share our public open source handbook."
        result = self.classifier.classify(text, detected_entity_types=[])
        self.assertEqual(result.level, SensitivityLevel.PUBLIC)

    def test_classification_internal(self):
        text = "Please reach out to your team lead via Slack."
        result = self.classifier.classify(text, detected_entity_types=["EMAIL", "EMPLOYEE_ID"])
        self.assertEqual(result.level, SensitivityLevel.INTERNAL)

    def test_classification_confidential(self):
        text = "Employee quarterly bonus details and payroll distribution."
        result = self.classifier.classify(text, detected_entity_types=["SALARY", "BANK_ACCOUNT"])
        self.assertEqual(result.level, SensitivityLevel.CONFIDENTIAL)

    def test_classification_restricted(self):
        text = "Production environment secrets and developer tokens."
        result = self.classifier.classify(text, detected_entity_types=["API_KEY", "PASSWORD"])
        self.assertEqual(result.level, SensitivityLevel.RESTRICTED)

    def test_classification_keyword_escalation(self):
        text = "TOP SECRET - Executive Strategy Roadmap"
        result = self.classifier.classify(text, detected_entity_types=[])
        self.assertEqual(result.level, SensitivityLevel.RESTRICTED)


class TestEntityDetectionAndRedaction(unittest.TestCase):
    def setUp(self):
        self.redactor = DocumentRedactor()

    def test_email_detection_and_redaction(self):
        text = "Contact: alex.rivera@example.com or support@acme.org for help."
        res = self.redactor.redact(text)
        self.assertIn("EMAIL", res.detected_entity_types)
        self.assertNotIn("alex.rivera@example.com", res.redacted_text)
        self.assertNotIn("support@acme.org", res.redacted_text)
        self.assertIn(REDACTED_TOKEN, res.redacted_text)

    def test_phone_detection_and_redaction(self):
        text = "Phone: +1-555-0199 and mobile 9876543210"
        res = self.redactor.redact(text)
        self.assertIn("PHONE", res.detected_entity_types)
        self.assertNotIn("+1-555-0199", res.redacted_text)
        self.assertNotIn("9876543210", res.redacted_text)
        self.assertIn(REDACTED_TOKEN, res.redacted_text)

    def test_employee_id_detection_and_redaction(self):
        text = "Employee ID: EMP-48291 is assigned to project."
        res = self.redactor.redact(text)
        self.assertIn("EMPLOYEE_ID", res.detected_entity_types)
        self.assertNotIn("EMP-48291", res.redacted_text)
        self.assertEqual(res.redacted_text, f"Employee ID: {REDACTED_TOKEN} is assigned to project.")

    def test_salary_detection_and_redaction(self):
        text = "Salary: ₹12,50,000 per annum with standard benefits."
        res = self.redactor.redact(text)
        self.assertIn("SALARY", res.detected_entity_types)
        self.assertNotIn("₹12,50,000", res.redacted_text)
        self.assertIn(f"Salary: {REDACTED_TOKEN}", res.redacted_text)

    def test_bank_account_detection_and_redaction(self):
        text = "Bank Account: 123456789012 at National Reserve Bank."
        res = self.redactor.redact(text)
        self.assertIn("BANK_ACCOUNT", res.detected_entity_types)
        self.assertNotIn("123456789012", res.redacted_text)
        self.assertIn(f"Bank Account: {REDACTED_TOKEN}", res.redacted_text)

    def test_api_token_detection_and_redaction(self):
        text = "Dev API Token: sk-test-example-123456789"
        res = self.redactor.redact(text)
        self.assertIn("API_KEY", res.detected_entity_types)
        self.assertNotIn("sk-test-example-123456789", res.redacted_text)
        self.assertIn(f"Dev API Token: {REDACTED_TOKEN}", res.redacted_text)

    def test_password_detection_and_redaction(self):
        text = "Initial Password: SecretPassword123!"
        res = self.redactor.redact(text)
        self.assertIn("PASSWORD", res.detected_entity_types)
        self.assertNotIn("SecretPassword123!", res.redacted_text)
        self.assertIn(f"Initial Password: {REDACTED_TOKEN}", res.redacted_text)

    def test_aadhaar_detection_and_redaction(self):
        text = "Aadhaar: 2345 6789 0123"
        res = self.redactor.redact(text)
        self.assertIn("AADHAAR", res.detected_entity_types)
        self.assertNotIn("2345 6789 0123", res.redacted_text)
        self.assertIn(f"Aadhaar: {REDACTED_TOKEN}", res.redacted_text)

    def test_pan_detection_and_redaction(self):
        text = "PAN: ABCDE1234F"
        res = self.redactor.redact(text)
        self.assertIn("PAN", res.detected_entity_types)
        self.assertNotIn("ABCDE1234F", res.redacted_text)
        self.assertIn(f"PAN: {REDACTED_TOKEN}", res.redacted_text)


class TestDocumentProcessorSecurity(unittest.TestCase):
    def setUp(self):
        self.processor = DocumentProcessor()
        self.temp_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_original_file_not_modified(self):
        """Verify original file content and hash remain strictly unchanged after redaction."""
        original_content = (
            "Employee Name: Alex Rivera\n"
            "Employee ID: EMP-48291\n"
            "Email: alex.rivera@acme.com\n"
            "Salary: ₹12,50,000\n"
            "Dev API Token: sk-test-example-123456789\n"
        )
        input_file = Path(self.temp_dir.name) / "test_employee.txt"
        with open(input_file, "w", encoding="utf-8") as f:
            f.write(original_content)

        initial_hash = hashlib.sha256(input_file.read_bytes()).hexdigest()
        initial_mtime = input_file.stat().st_mtime

        output_file = Path(self.temp_dir.name) / "test_employee_redacted.txt"
        res = self.processor.process_file(input_file, output_path=output_file)

        # 1. Output file must exist and be different from input
        self.assertTrue(output_file.exists())
        self.assertNotEqual(str(input_file.resolve()), str(output_file.resolve()))

        # 2. Original file must be bit-for-bit identical
        post_content = input_file.read_text(encoding="utf-8")
        post_hash = hashlib.sha256(input_file.read_bytes()).hexdigest()
        post_mtime = input_file.stat().st_mtime

        self.assertEqual(original_content, post_content)
        self.assertEqual(initial_hash, post_hash)
        self.assertEqual(initial_mtime, post_mtime)

        # 3. Redacted output must contain [REDACTED] and none of the sensitive values
        redacted_content = output_file.read_text(encoding="utf-8")
        self.assertIn("[REDACTED]", redacted_content)
        self.assertNotIn("EMP-48291", redacted_content)
        self.assertNotIn("alex.rivera@acme.com", redacted_content)
        self.assertNotIn("₹12,50,000", redacted_content)
        self.assertNotIn("sk-test-example-123456789", redacted_content)

        # Non-sensitive text should still be preserved
        self.assertIn("Employee Name: Alex Rivera", redacted_content)

    def test_security_violation_when_overwriting_original_file(self):
        """Processor must raise SecurityError if output path matches input path."""
        input_file = Path(self.temp_dir.name) / "doc.txt"
        input_file.write_text("Salary: $100,000", encoding="utf-8")

        with self.assertRaises(SecurityError):
            self.processor.process_file(input_file, output_path=input_file)


class TestCLICommands(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.test_file = Path(self.temp_dir.name) / "employee.txt"
        self.test_file.write_text(
            "Employee ID: EMP-48291\n"
            "Email: alex.rivera@acme.com\n"
            "Salary: ₹12,50,000\n"
            "Dev API Token: sk-test-example-123456789\n",
            encoding="utf-8"
        )

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_cli_classify(self):
        args = argparse.Namespace(file=str(self.test_file))
        with patch("sys.stdout", new_callable=StringIO) as mock_stdout:
            exit_code = cmd_classify(args)
            output = mock_stdout.getvalue()

        self.assertEqual(exit_code, 0)
        self.assertIn("Classification: RESTRICTED", output)
        self.assertIn("API_KEY", output)

    def test_cli_redact(self):
        output_file = Path(self.temp_dir.name) / "out_redacted.txt"
        args = argparse.Namespace(file=str(self.test_file), output=str(output_file))
        with patch("sys.stdout", new_callable=StringIO) as mock_stdout:
            exit_code = cmd_redact(args)
            output = mock_stdout.getvalue()

        self.assertEqual(exit_code, 0)
        self.assertIn("Classification: RESTRICTED", output)
        self.assertIn("BEFORE:", output)
        self.assertIn("AFTER:", output)
        self.assertIn("Redacted file saved to:", output)
        self.assertTrue(output_file.exists())

    def test_cli_inspect(self):
        args = argparse.Namespace(file=str(self.test_file))
        with patch("sys.stdout", new_callable=StringIO) as mock_stdout:
            exit_code = cmd_inspect(args)
            output = mock_stdout.getvalue()

        self.assertEqual(exit_code, 0)
        self.assertIn("Classification: RESTRICTED", output)
        self.assertIn("Detected Entities", output)


if __name__ == "__main__":
    unittest.main()
