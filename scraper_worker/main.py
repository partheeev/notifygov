"""
NotifyGov Monitoring & Scraping Engine Runner
Coordinates portal scrapers, PDF text extraction, Gemini AI structured extraction,
deduplication, corrigendum tracking, and Supabase persistence.
"""

import logging
import os
import sys
import time
from datetime import datetime
from typing import Dict, List, Optional

try:
    from supabase import Client, create_client
except ImportError:
    Client = None
    create_client = None

from config import SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL
from extractor import CorrigendumMatcher, GeminiExtractor, PDFReader
from scrapers import SCRAPER_REGISTRY, BaseScraper, ScrapedItem

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("NotifyGov.Worker")


def get_supabase_client() -> Optional[Client]:
    """Initializes Supabase Client with service role permissions."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        logger.warning("Supabase credentials not configured. Running in DRY-RUN mode.")
        return None
    if not create_client:
        logger.warning("Supabase python package not installed. Running in DRY-RUN mode.")
        return None
    try:
        return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    except Exception as e:
        logger.error(f"Failed to connect to Supabase: {e}")
        return None


def run_scraper_job():
    """Main execution loop for all active scrapers."""
    logger.info("Starting NotifyGov portal monitoring & intelligence cycle...")
    supabase = get_supabase_client()
    pdf_reader = PDFReader()
    ai_extractor = GeminiExtractor()
    corrigendum_matcher = CorrigendumMatcher(supabase)

    # Fetch active sources if connected, else run default registry
    sources_to_run = list(SCRAPER_REGISTRY.keys())
    sources_meta: Dict[str, dict] = {}

    if supabase:
        try:
            res = (
                supabase.table("sources")
                .select("id, name, slug, check_interval_minutes, is_active")
                .eq("is_active", True)
                .execute()
            )
            if res.data:
                for row in res.data:
                    slug = row["slug"]
                    sources_meta[slug] = row
                # Filter down to scrapers we have code for
                sources_to_run = [s for s in sources_meta.keys() if s in SCRAPER_REGISTRY]
        except Exception as e:
            logger.warning(f"Could not load sources from DB: {e}. Falling back to default list.")

    logger.info(f"Portals queued for check ({len(sources_to_run)}): {', '.join(sources_to_run)}")

    total_scraped = 0
    total_new = 0

    for slug in sources_to_run:
        scraper_cls = SCRAPER_REGISTRY[slug]
        scraper: BaseScraper = scraper_cls()
        start_time = time.time()
        source_id = sources_meta.get(slug, {}).get("id")

        logger.info(f"Checking {scraper.source_name} ({slug})...")
        items_found: List[ScrapedItem] = []
        new_count = 0
        error_msg: Optional[str] = None
        status = "success"

        try:
            items_found = scraper.scrape()
            total_scraped += len(items_found)
            logger.info(f"[{slug}] Found {len(items_found)} items from official portal.")

            # Process items
            for item in items_found:
                if supabase and source_id:
                    # Check for duplicate
                    existing = (
                        supabase.table("notifications")
                        .select("id")
                        .eq("source_id", source_id)
                        .eq("source_url", item.source_url)
                        .limit(1)
                        .execute()
                    )

                    if not existing.data:
                        # 1. Text & PDF extraction
                        extracted_text = item.summary or ""
                        doc_id = None

                        if item.pdf_urls:
                            pdf_url = item.pdf_urls[0]
                            pdf_bytes = pdf_reader.download_pdf(pdf_url)
                            if pdf_bytes:
                                pdf_text, pdf_meta = pdf_reader.extract_text(pdf_bytes)
                                if pdf_text:
                                    extracted_text = pdf_text

                                # Record in documents table
                                doc_payload = {
                                    "original_url": pdf_url,
                                    "file_hash": scraper.compute_hash(pdf_bytes),
                                    "file_size_bytes": len(pdf_bytes),
                                    "mime_type": "application/pdf",
                                    "extracted_text": pdf_text[:50000] if pdf_text else None,
                                    "is_scanned": pdf_meta.get("is_scanned", False),
                                    "page_count": pdf_meta.get("pages", 1),
                                }
                                try:
                                    doc_res = supabase.table("documents").insert(doc_payload).execute()
                                    if doc_res.data:
                                        doc_id = doc_res.data[0]["id"]
                                except Exception as de:
                                    logger.warning(f"Could not record document: {de}")

                        # 2. AI Structured Extraction
                        ai_result = ai_extractor.extract(extracted_text, title=item.title)
                        confidence = float(ai_result.get("confidence_score", 0.8))
                        notif_status = "published" if confidence >= 0.70 else "needs_review"

                        # 3. Content hash for notification
                        content_hash = scraper.compute_hash(
                            (item.title + item.source_url).encode("utf-8")
                        )

                        # 4. Insert notification
                        apply_target = getattr(item, "apply_url", None) or ai_result.get("apply_url")
                        notif_payload = {
                            "source_id": source_id,
                            "document_id": doc_id,
                            "title": item.title,
                            "summary": ai_result.get("plain_english_summary") or item.summary,
                            "category": ai_result.get("category") or item.category,
                            "source_url": item.source_url,
                            "official_url": item.source_url,
                            "apply_url": apply_target,
                            "content_hash": content_hash,
                            "is_verified": True,
                            "status": notif_status,
                            "published_at": item.publication_date or datetime.utcnow().isoformat(),
                            "deadline": ai_result.get("important_dates", {}).get("application_end") or item.deadline,
                        }

                        notif_res = supabase.table("notifications").insert(notif_payload).execute()
                        if notif_res.data:
                            new_notif_id = notif_res.data[0]["id"]
                            new_count += 1
                            logger.info(f"[{slug}] ✨ NEW NOTIFICATION ({notif_status}): {item.title[:60]}...")

                            # 5. Insert recruitment_details if recruitment/exam
                            age_info = ai_result.get("age_limit", {})
                            dates_info = ai_result.get("important_dates", {})
                            rec_payload = {
                                "notification_id": new_notif_id,
                                "post_name": ai_result.get("post_name") or item.title,
                                "total_vacancies": ai_result.get("total_vacancies"),
                                "qualifications": ai_result.get("eligibility_qualifications") or [],
                                "disciplines": ai_result.get("disciplines") or [],
                                "min_age": age_info.get("min_age"),
                                "max_age": age_info.get("max_age"),
                                "age_relaxation_rules": {"notes": age_info.get("relaxation_notes")} if age_info.get("relaxation_notes") else None,
                                "application_start": dates_info.get("application_start"),
                                "application_end": dates_info.get("application_end"),
                                "exam_date": dates_info.get("exam_date"),
                                "application_fee": ai_result.get("application_fee"),
                            }
                            try:
                                supabase.table("recruitment_details").insert(rec_payload).execute()
                            except Exception as re:
                                logger.warning(f"Could not record recruitment details: {re}")

                            # 6. Corrigendum detection & version linking
                            if ai_result.get("is_corrigendum") or CorrigendumMatcher.is_corrigendum(item.title):
                                parent = corrigendum_matcher.find_parent_notification(
                                    source_id, item.title, ai_result.get("post_name")
                                )
                                if parent:
                                    corrigendum_matcher.record_revision(
                                        parent_notification_id=parent["id"],
                                        corrigendum_notification_id=new_notif_id,
                                        change_summary=ai_result.get("corrigendum_summary") or item.title,
                                    )
                else:
                    # In dry-run preview mode
                    new_count += 1

            total_new += new_count

        except Exception as e:
            status = "error"
            error_msg = str(e)
            logger.error(f"[{slug}] Scraping failed: {e}")

        duration_ms = int((time.time() - start_time) * 1000)

        # Record scrape log in database
        if supabase and source_id:
            try:
                log_data = {
                    "source_id": source_id,
                    "status": status,
                    "items_found": len(items_found),
                    "items_new": new_count,
                    "duration_ms": duration_ms,
                    "error_message": error_msg,
                }
                supabase.table("scrape_logs").insert(log_data).execute()

                # Update source health status and last_scraped_at
                health = "healthy" if status == "success" else "error"
                supabase.table("sources").update(
                    {
                        "health_status": health,
                        "last_scraped_at": datetime.utcnow().isoformat(),
                        "consecutive_failures": 0 if status == "success" else 1,
                    }
                ).eq("id", source_id).execute()

            except Exception as log_err:
                logger.warning(f"Could not write scrape log for {slug}: {log_err}")

        logger.info(f"[{slug}] Done in {duration_ms}ms (Found: {len(items_found)}, New: {new_count})")

    logger.info(f"🏁 Scrape cycle finished. Total processed: {total_scraped}, Total new: {total_new}")


if __name__ == "__main__":
    run_scraper_job()
