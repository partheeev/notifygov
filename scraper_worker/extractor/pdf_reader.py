"""
NotifyGov PDF Document Text Extractor
Extracts selectable text and detects scanned/image-only PDFs.
"""

import io
import logging
from typing import Dict, Optional, Tuple
import requests

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

logger = logging.getLogger("NotifyGov.PDFReader")


class PDFReader:
    """Extracts text streams and metadata from government circular PDFs."""

    def __init__(self, timeout: int = 30):
        self.timeout = timeout

    def download_pdf(self, pdf_url: str) -> Optional[bytes]:
        """Downloads PDF from the official portal with stream handling."""
        try:
            resp = requests.get(pdf_url, timeout=self.timeout, stream=True)
            resp.raise_for_status()
            content = resp.content
            if len(content) < 500:
                logger.warning(f"Downloaded file too small to be a valid PDF: {pdf_url}")
                return None
            return content
        except Exception as e:
            logger.error(f"Failed to download PDF ({pdf_url}): {e}")
            return None

    def extract_text(self, pdf_bytes: bytes) -> Tuple[str, Dict[str, any]]:
        """
        Extracts plain text from PDF bytes.
        Returns: (extracted_text, metadata_dict)
        """
        if not fitz:
            logger.warning("PyMuPDF (fitz) is not installed. Text extraction skipped.")
            return "", {"pages": 0, "is_scanned": False, "word_count": 0}

        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            page_count = len(doc)
            text_chunks = []

            for page_num in range(page_count):
                page = doc.load_page(page_num)
                page_text = page.get_text("text")
                if page_text:
                    text_chunks.append(page_text.strip())

            full_text = "\n\n".join(text_chunks)
            words = full_text.split()
            word_count = len(words)

            # Heuristic for scanned documents:
            # If a document has 2+ pages but fewer than 60 words, it's very likely a scanned image PDF.
            is_scanned = page_count >= 1 and (word_count / max(1, page_count)) < 25

            metadata = {
                "pages": page_count,
                "is_scanned": is_scanned,
                "word_count": word_count,
                "format": doc.metadata.get("format", "PDF"),
                "author": doc.metadata.get("author", ""),
                "title": doc.metadata.get("title", ""),
            }

            return full_text, metadata

        except Exception as e:
            logger.error(f"Error parsing PDF document bytes: {e}")
            return "", {"pages": 0, "is_scanned": False, "word_count": 0, "error": str(e)}
