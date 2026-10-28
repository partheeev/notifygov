"""
NotifyGov Gemini AI Notification Extractor
Transforms raw government notification text/PDF content into verified structured JSON.
"""

import json
import logging
import os
from typing import Any, Dict, Optional

try:
    import google.generativeai as genai
except ImportError:
    genai = None

logger = logging.getLogger("NotifyGov.GeminiExtractor")

EXTRACTION_SYSTEM_PROMPT = """
You are NotifyGov's automated government circular intelligence analyzer.
Your task is to read the raw text of an Indian central or state government recruitment or exam notification, and extract verified structured facts into valid JSON.

CRITICAL INSTRUCTIONS:
1. STRICT ACCURACY: Never hallucinate missing data. If an age limit, deadline, or fee is not explicitly stated in the text, use null.
2. DATES: Format all dates as ISO 8601 strings (YYYY-MM-DD) if identifiable, otherwise null.
3. VACANCIES: Extract exact total vacancies as an integer if mentioned.
4. CORRIGENDUM: Flag `is_corrigendum` as true if this document modifies, postpones, or amends a previous notification.
5. CONFIDENCE SCORE: Rate your extraction confidence from 0.0 to 1.0 based on how clear and complete the original text was.

Respond ONLY with a JSON object adhering to this exact schema:
{
  "post_name": "string or null",
  "organisation": "string or null",
  "category": "exam | recruitment | result | admit_card | corrigendum",
  "total_vacancies": integer or null,
  "eligibility_qualifications": ["list", "of", "degrees"],
  "disciplines": ["list", "of", "fields", "or", "subjects"],
  "age_limit": {
    "min_age": integer or null,
    "max_age": integer or null,
    "relaxation_notes": "string or null"
  },
  "important_dates": {
    "notification_date": "YYYY-MM-DD or null",
    "application_start": "YYYY-MM-DD or null",
    "application_end": "YYYY-MM-DD or null",
    "exam_date": "YYYY-MM-DD or null"
  },
  "application_fee": {
    "general": integer or null,
    "reserved": integer or null,
    "female": integer or null
  },
  "apply_url": "string or null (direct candidate application portal link if mentioned in text, e.g. upsconline.nic.in, ssc.gov.in/login, rrbapply.gov.in)",
  "is_corrigendum": boolean,
  "corrigendum_summary": "string or null",
  "plain_english_summary": "2-3 concise paragraphs summarizing what candidates need to know in simple words.",
  "confidence_score": float
}
"""


class GeminiExtractor:
    """Uses Google Gemini 1.5 Flash to extract structured recruitment metadata."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.client_ready = False

        if not self.api_key:
            logger.warning("GEMINI_API_KEY not configured. Extraction will operate in fallback mode.")
            return

        if not genai:
            logger.warning("google-generativeai package not installed.")
            return

        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                generation_config={"response_mime_type": "application/json", "temperature": 0.1},
                system_instruction=EXTRACTION_SYSTEM_PROMPT,
            )
            self.client_ready = True
        except Exception as e:
            logger.error(f"Failed to initialize Gemini GenerativeModel: {e}")

    def extract(self, document_text: str, title: str = "") -> Dict[str, Any]:
        """
        Processes document text and produces structured JSON metadata.
        """
        # If client not ready, return fallback extraction
        if not self.client_ready:
            return self._fallback_extract(title, document_text)

        # Truncate text if excessively long (Gemini 1.5 has 1M context, but 20k chars is plenty for notices)
        truncated_text = document_text[:35000] if len(document_text) > 35000 else document_text

        prompt = f"Notification Title: {title}\n\nDocument Text Content:\n{truncated_text}"

        try:
            response = self.model.generate_content(prompt)
            result_json = json.loads(response.text)
            return result_json
        except Exception as e:
            logger.error(f"Gemini API extraction error: {e}")
            return self._fallback_extract(title, document_text, error=str(e))

    def _fallback_extract(self, title: str, text: str, error: Optional[str] = None) -> Dict[str, Any]:
        """Rule-based fallback when Gemini API is unavailable or offline."""
        category = "recruitment"
        t_low = title.lower()
        if "exam" in t_low:
            category = "exam"
        elif "result" in t_low:
            category = "result"
        elif "admit card" in t_low:
            category = "admit_card"
        elif "corrigendum" in t_low:
            category = "corrigendum"

        return {
            "post_name": title,
            "organisation": None,
            "category": category,
            "total_vacancies": None,
            "eligibility_qualifications": [],
            "disciplines": [],
            "age_limit": {"min_age": None, "max_age": None, "relaxation_notes": None},
            "important_dates": {
                "notification_date": None,
                "application_start": None,
                "application_end": None,
                "exam_date": None,
            },
            "application_fee": {"general": None, "reserved": None, "female": None},
            "is_corrigendum": "corrigendum" in t_low,
            "corrigendum_summary": None,
            "plain_english_summary": f"Notification titled '{title}'. Detailed structured data will be extracted upon AI queue processing.",
            "confidence_score": 0.5,
            "fallback": True,
            "error": error,
        }
