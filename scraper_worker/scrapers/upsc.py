"""
UPSC (Union Public Service Commission) Official Portal Scraper
Monitors active exams and latest circulars.
"""

from typing import List
from urllib.parse import urljoin
from bs4 import BeautifulSoup

from .base import BaseScraper, ScrapedItem


class UPSCScraper(BaseScraper):
    source_slug = "upsc"
    source_name = "Union Public Service Commission"
    base_url = "https://upsc.gov.in"
    check_url = "https://upsc.gov.in/examinations/active-exams"

    def scrape(self) -> List[ScrapedItem]:
        items: List[ScrapedItem] = []
        try:
            resp = self.fetch_url(self.check_url)
            soup = BeautifulSoup(resp.content, "lxml")

            # UPSC Active Exams are structured in a table inside .view-active-exams or .views-table
            tables = soup.find_all("table")
            for table in tables:
                rows = table.find_all("tr")
                for row in rows[1:]:  # skip header
                    cols = row.find_all("td")
                    if len(cols) >= 3:
                        title_col = cols[0]
                        title = title_col.get_text(strip=True)
                        if not title:
                            continue

                        # Extract link
                        link_tag = title_col.find("a")
                        relative_url = link_tag.get("href") if link_tag else None
                        item_url = urljoin(self.base_url, relative_url) if relative_url else self.check_url

                        # Dates
                        pub_date = cols[1].get_text(strip=True) if len(cols) > 1 else None
                        deadline = cols[2].get_text(strip=True) if len(cols) > 2 else None

                        # Check for PDF links
                        pdf_urls = []
                        for a in row.find_all("a", href=True):
                            href = a["href"]
                            if ".pdf" in href.lower():
                                pdf_urls.append(urljoin(self.base_url, href))

                        category = "exam"
                        if "recruitment" in title.lower():
                            category = "recruitment"
                        elif "result" in title.lower():
                            category = "result"
                        elif "admit card" in title.lower():
                            category = "admit_card"

                        item = ScrapedItem(
                            title=title,
                            source_url=item_url,
                            category=category,
                            organisation="UPSC",
                            publication_date=pub_date,
                            deadline=deadline,
                            summary=f"Official UPSC notification: {title}. Verified directly from Union Public Service Commission active examinations portal.",
                            pdf_urls=pdf_urls,
                            raw_html=str(row),
                        )
                        items.append(item)

        except Exception as e:
            # Re-raise so runner records error in scrape_logs
            raise RuntimeError(f"Error scraping UPSC portal ({self.check_url}): {e}") from e

        return items
