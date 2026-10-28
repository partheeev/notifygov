"""
RRB (Railway Recruitment Boards / Indian Railways) Scraper
Monitors Centralized Employment Notifications (CEN) and railway job circulars.
"""

from typing import List
from urllib.parse import urljoin
from bs4 import BeautifulSoup

from .base import BaseScraper, ScrapedItem


class RRBScraper(BaseScraper):
    source_slug = "rrb"
    source_name = "Railway Recruitment Boards"
    base_url = "https://indianrailways.gov.in"
    check_url = "https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,4,1244"

    def scrape(self) -> List[ScrapedItem]:
        items: List[ScrapedItem] = []
        try:
            resp = self.fetch_url(self.check_url)
            soup = BeautifulSoup(resp.content, "lxml")

            # Look for recruitment links and notice tables
            links = soup.find_all("a", href=True)
            for a in links:
                text = a.get_text(strip=True)
                if not text or len(text) < 10:
                    continue

                t_lower = text.lower()
                # Check for railway recruitment indicators (CEN, Notification, Recruitment, Exam)
                if any(k in t_lower for k in ["cen", "recruitment", "junior engineer", "technician", "alp", "ntpc", "rrb"]):
                    item_url = urljoin(self.base_url, a["href"])
                    pdf_urls = [item_url] if ".pdf" in item_url.lower() else []

                    category = "recruitment"
                    if "result" in t_lower:
                        category = "result"
                    elif "admit card" in t_lower or "call letter" in t_lower:
                        category = "admit_card"
                    elif "corrigendum" in t_lower:
                        category = "corrigendum"
                    elif "exam" in t_lower:
                        category = "exam"

                    items.append(
                        ScrapedItem(
                            title=text,
                            source_url=item_url,
                            category=category,
                            organisation="RRB",
                            summary=f"Railway Recruitment Board announcement: {text}. Verified from Ministry of Railways portal.",
                            pdf_urls=pdf_urls,
                            raw_html=str(a),
                        )
                    )

        except Exception as e:
            raise RuntimeError(f"Error scraping RRB announcements ({self.check_url}): {e}") from e

        return items
