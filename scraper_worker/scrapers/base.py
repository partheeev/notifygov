"""
NotifyGov Base Scraper Class
Handles HTTP retries, content hashing, deduplication checking, and standardized output.
"""

import abc
import hashlib
import time
from typing import Any, Dict, List, Optional
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from ..config import BROWSER_HEADERS, DEFAULT_TIMEOUT, MAX_RETRIES, BACKOFF_FACTOR


class ScrapedItem:
    """Standardized scraped notification representation."""

    def __init__(
        self,
        title: str,
        source_url: str,
        category: str = "recruitment",
        organisation: str = "",
        external_id: Optional[str] = None,
        publication_date: Optional[str] = None,
        deadline: Optional[str] = None,
        summary: Optional[str] = None,
        pdf_urls: Optional[List[str]] = None,
        raw_html: Optional[str] = None,
    ):
        self.title = title.strip()
        self.source_url = source_url.strip()
        self.category = category.lower().strip()
        self.organisation = organisation.strip()
        self.external_id = external_id
        self.publication_date = publication_date
        self.deadline = deadline
        self.summary = summary
        self.pdf_urls = pdf_urls or []
        self.raw_html = raw_html

    def to_dict(self) -> Dict[str, Any]:
        return {
            "title": self.title,
            "source_url": self.source_url,
            "category": self.category,
            "organisation": self.organisation,
            "external_id": self.external_id,
            "publication_date": self.publication_date,
            "deadline": self.deadline,
            "summary": self.summary,
            "pdf_urls": self.pdf_urls,
            "raw_html": self.raw_html,
        }


class BaseScraper(abc.ABC):
    """Abstract Base Scraper for all official portals."""

    source_slug: str = ""
    source_name: str = ""
    base_url: str = ""
    check_url: str = ""

    def __init__(self, timeout: int = DEFAULT_TIMEOUT):
        self.timeout = timeout
        self.session = self._create_resilient_session()

    def _create_resilient_session(self) -> requests.Session:
        """Configures requests Session with automatic exponential backoff retry."""
        session = requests.Session()
        retry_strategy = Retry(
            total=MAX_RETRIES,
            backoff_factor=BACKOFF_FACTOR,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "OPTIONS"],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        session.headers.update(BROWSER_HEADERS)
        return session

    def fetch_url(self, url: str) -> requests.Response:
        """Fetches a URL with resilience headers and configured timeout."""
        response = self.session.get(url, timeout=self.timeout)
        response.raise_for_status()
        return response

    @staticmethod
    def compute_hash(data: bytes) -> str:
        """Generates SHA-256 hash for content-level deduplication."""
        return hashlib.sha256(data).hexdigest()

    @abc.abstractmethod
    def scrape(self) -> List[ScrapedItem]:
        """
        Executes the scraping process.
        Returns a list of ScrapedItem objects.
        """
        pass
