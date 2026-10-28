from .base import BaseScraper, ScrapedItem
from .upsc import UPSCScraper
from .ssc import SSCScraper
from .rrb import RRBScraper

SCRAPER_REGISTRY = {
    "upsc": UPSCScraper,
    "ssc": SSCScraper,
    "rrb": RRBScraper,
}

__all__ = ["BaseScraper", "ScrapedItem", "UPSCScraper", "SSCScraper", "RRBScraper", "SCRAPER_REGISTRY"]
