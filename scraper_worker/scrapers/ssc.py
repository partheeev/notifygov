"""
SSC (Staff Selection Commission) Official Portal Scraper
Monitors notices and latest examination alerts.
"""

from typing import List
from urllib.parse import urljoin
from bs4 import BeautifulSoup

from .base import BaseScraper, ScrapedItem


class SSCScraper(BaseScraper):
    source_slug = "ssc"
    source_name = "Staff Selection Commission"
    base_url = "https://ssc.gov.in"
    check_url = "https://ssc.gov.in/notices"

    def scrape(self) -> List[ScrapedItem]:
        items: List[ScrapedItem] = []
        try:
            resp = self.fetch_url(self.check_url)
            soup = BeautifulSoup(resp.content, "lxml")

            # SSC notices list rows or list items
            rows = soup.find_all(["tr", "li", "div"], class_=lambda c: c and any(k in str(c).lower() for k in ["notice", "item", "row"]))
            
            for row in rows:
                link_tag = row.find("a", href=True)
                if not link_tag:
                    continue

                title = link_tag.get_text(strip=True)
                if len(title) < 8 or "view all" in title.lower() or "read more" in title.lower():
                    continue

                item_url = urljoin(self.base_url, link_tag["href"])
                
                # Extract date if present
                date_tag = row.find(["span", "time", "td"], class_=lambda c: c and "date" in str(c).lower())
                pub_date = date_tag.get_text(strip=True) if date_tag else None

                # PDF attachment
                pdf_urls = []
                if ".pdf" in item_url.lower():
                    pdf_urls.append(item_url)
                else:
                    for a in row.find_all("a", href=True):
                        if ".pdf" in a["href"].lower():
                            pdf_urls.append(urljoin(self.base_url, a["href"]))

                # Determine category
                t_lower = title.lower()
                category = "recruitment"
                if "result" in t_lower or "cutoff" in t_lower:
                    category = "result"
                elif "admit card" in t_lower or "hall ticket" in t_lower:
                    category = "admit_card"
                elif "corrigendum" in t_lower or "amendment" in t_lower or "notice - cancellation" in t_lower:
                    category = "corrigendum"
                elif "exam" in t_lower or "schedule" in t_lower:
                    category = "exam"

                items.append(
                    ScrapedItem(
                        title=title,
                        source_url=item_url,
                        apply_url="https://ssc.gov.in/login",
                        category=category,
                        organisation="SSC",
                        publication_date=pub_date,
                        summary=f"Official Staff Selection Commission (SSC) release: {title}.",
                        pdf_urls=pdf_urls,
                        raw_html=str(row),
                    )
                )

        except Exception as e:
            raise RuntimeError(f"Error scraping SSC notices ({self.check_url}): {e}") from e

        return items
