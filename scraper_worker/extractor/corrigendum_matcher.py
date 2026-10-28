"""
NotifyGov Corrigendum & Amendment Matcher
Detects revisions to existing recruitment notices, links them to the original,
and flags them for high-priority applicant alerts.
"""

import logging
import re
from typing import Any, Dict, List, Optional

logger = logging.getLogger("NotifyGov.CorrigendumMatcher")


class CorrigendumMatcher:
    """Matches and links amendments/corrigenda to parent notifications."""

    def __init__(self, supabase_client: Any):
        self.supabase = supabase_client

    @staticmethod
    def is_corrigendum(title: str, text: str = "") -> bool:
        """Determines if a document is an amendment, corrigendum, or cancellation notice."""
        patterns = [
            r"\bcorrigendum\b",
            r"\bamendment\b",
            r"\baddendum\b",
            r"\brevised\b",
            r"\bextension of date\b",
            r"\bdate extended\b",
            r"\bcancellation notice\b",
            r"\bpostponed\b",
        ]
        combined = f"{title} {text[:500]}".lower()
        return any(re.search(p, combined) for p in patterns)

    def find_parent_notification(
        self, source_id: str, title: str, extracted_exam_name: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Searches the database for the original notification this amendment refers to.
        """
        if not self.supabase:
            return None

        search_query = extracted_exam_name or title
        # Clean title of "Corrigendum to", "Notice for", etc.
        cleaned_query = re.sub(
            r"^(corrigendum|amendment|notice|addendum|extension)\s*(to|regarding|for)?\s*",
            "",
            search_query,
            flags=re.IGNORECASE,
        ).strip()

        if len(cleaned_query) < 4:
            return None

        try:
            # Query active notifications under the same source
            res = (
                self.supabase.table("notifications")
                .select("id, title, category, published_at, deadline")
                .eq("source_id", source_id)
                .ilike("title", f"%{cleaned_query[:40]}%")
                .order("published_at", desc=True)
                .limit(1)
                .execute()
            )

            if res.data and len(res.data) > 0:
                logger.info(f"Matched corrigendum '{title[:50]}' -> Parent: '{res.data[0]['title'][:50]}'")
                return res.data[0]

        except Exception as e:
            logger.warning(f"Error querying parent notification: {e}")

        return None

    def record_revision(
        self,
        parent_notification_id: str,
        corrigendum_notification_id: str,
        change_summary: str,
        version_number: int = 2,
    ) -> bool:
        """
        Creates an entry in notification_versions and links the corrigendum to its parent.
        """
        if not self.supabase:
            return False

        try:
            payload = {
                "notification_id": parent_notification_id,
                "version_number": version_number,
                "change_summary": change_summary,
                "raw_text": change_summary,
            }
            self.supabase.table("notification_versions").insert(payload).execute()
            logger.info(f"Recorded revision for parent notification ID {parent_notification_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to record revision: {e}")
            return False
