"""
NotifyGov Scraper Worker Configuration
"""

import os
from typing import Dict
from dotenv import load_dotenv

load_dotenv()

# Supabase Credentials
SUPABASE_URL: str = os.getenv("SUPABASE_URL", os.getenv("NEXT_PUBLIC_SUPABASE_URL", ""))
SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Request Settings
DEFAULT_TIMEOUT: int = int(os.getenv("SCRAPER_TIMEOUT", "30"))
MAX_RETRIES: int = 3
BACKOFF_FACTOR: float = 0.5

# Browser-mimicking HTTP headers to avoid anti-bot blocks on government portals
BROWSER_HEADERS: Dict[str, str] = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en-IN;q=0.9,en;q=0.8,hi;q=0.7,ml;q=0.6",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
}
