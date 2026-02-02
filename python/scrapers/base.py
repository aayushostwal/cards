"""
Base scraper class for credit card data extraction.
All bank-specific scrapers should inherit from this class.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
import requests
from bs4 import BeautifulSoup
import time
import random

from models import RawCardData


@dataclass
class ScraperConfig:
    """Configuration for scraper behavior."""
    
    # Request settings
    timeout: int = 30
    max_retries: int = 3
    retry_delay: float = 2.0
    
    # Rate limiting
    min_delay: float = 1.0
    max_delay: float = 3.0
    
    # User agent rotation
    user_agents: list[str] = None
    
    def __post_init__(self):
        if self.user_agents is None:
            self.user_agents = [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
            ]


class BaseScraper(ABC):
    """
    Abstract base class for bank credit card scrapers.
    
    Each bank scraper must implement:
    - get_card_urls(): Returns list of URLs for individual card pages
    - scrape_card_page(): Extracts raw data from a card page
    - get_issuer_name(): Returns the bank/issuer name
    """
    
    def __init__(self, config: Optional[ScraperConfig] = None):
        self.config = config or ScraperConfig()
        self.session = self._create_session()
    
    def _create_session(self) -> requests.Session:
        """Create a requests session with default headers."""
        session = requests.Session()
        session.headers.update({
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        })
        return session
    
    def _get_random_user_agent(self) -> str:
        """Get a random user agent from the configured list."""
        return random.choice(self.config.user_agents)
    
    def _rate_limit(self):
        """Apply rate limiting between requests."""
        delay = random.uniform(self.config.min_delay, self.config.max_delay)
        time.sleep(delay)
    
    def fetch_page(self, url: str) -> Optional[str]:
        """
        Fetch a page with retries and rate limiting.
        
        Args:
            url: The URL to fetch
            
        Returns:
            HTML content as string, or None if failed
        """
        for attempt in range(self.config.max_retries):
            try:
                self._rate_limit()
                
                headers = {"User-Agent": self._get_random_user_agent()}
                response = self.session.get(
                    url,
                    headers=headers,
                    timeout=self.config.timeout
                )
                response.raise_for_status()
                return response.text
                
            except requests.RequestException as e:
                print(f"Attempt {attempt + 1} failed for {url}: {e}")
                if attempt < self.config.max_retries - 1:
                    time.sleep(self.config.retry_delay * (attempt + 1))
                    
        return None
    
    def parse_html(self, html: str) -> BeautifulSoup:
        """Parse HTML content into BeautifulSoup object."""
        return BeautifulSoup(html, "lxml")
    
    def extract_text_content(self, soup: BeautifulSoup) -> str:
        """
        Extract clean text content from parsed HTML.
        Removes scripts, styles, and normalizes whitespace.
        """
        # Remove script and style elements
        for element in soup(["script", "style", "nav", "footer", "header"]):
            element.decompose()
        
        # Get text and normalize whitespace
        text = soup.get_text(separator="\n", strip=True)
        
        # Remove excessive whitespace
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        return "\n".join(lines)
    
    @abstractmethod
    def get_issuer_name(self) -> str:
        """Return the bank/issuer name."""
        pass
    
    @abstractmethod
    def get_card_urls(self) -> list[str]:
        """
        Get list of URLs for all credit card detail pages.
        
        Returns:
            List of absolute URLs to card detail pages
        """
        pass
    
    @abstractmethod
    def scrape_card_page(self, url: str) -> Optional[RawCardData]:
        """
        Scrape a single card detail page.
        
        Args:
            url: URL of the card detail page
            
        Returns:
            RawCardData object with extracted content, or None if failed
        """
        pass
    
    def scrape_all_cards(self) -> list[RawCardData]:
        """
        Scrape all credit cards from this issuer.
        
        Returns:
            List of RawCardData objects
        """
        print(f"Starting scrape for {self.get_issuer_name()}...")
        
        urls = self.get_card_urls()
        print(f"Found {len(urls)} card URLs")
        
        raw_cards = []
        for i, url in enumerate(urls, 1):
            print(f"Scraping card {i}/{len(urls)}: {url}")
            
            raw_data = self.scrape_card_page(url)
            if raw_data:
                raw_cards.append(raw_data)
                print(f"  ✓ Scraped: {raw_data.page_title}")
            else:
                print(f"  ✗ Failed to scrape")
        
        print(f"Completed: {len(raw_cards)}/{len(urls)} cards scraped")
        return raw_cards
