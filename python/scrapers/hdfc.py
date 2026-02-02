"""
HDFC Bank credit card scraper.
Extracts credit card data from HDFC Bank's website.
"""

from typing import Optional
from urllib.parse import urljoin
from datetime import datetime

from .base import BaseScraper, ScraperConfig
from models import RawCardData


class HDFCScraper(BaseScraper):
    """Scraper for HDFC Bank credit cards."""
    
    BASE_URL = "https://www.hdfcbank.com"
    CARDS_LIST_URL = "https://www.hdfcbank.com/personal/pay/cards/credit-cards"
    
    # Known card page URL patterns for HDFC
    KNOWN_CARD_URLS = [
        "/personal/pay/cards/credit-cards/regalia-gold-credit-card",
        "/personal/pay/cards/credit-cards/regalia-credit-card",
        "/personal/pay/cards/credit-cards/infinia-credit-card",
        "/personal/pay/cards/credit-cards/diners-club-black",
        "/personal/pay/cards/credit-cards/hdfc-bank-millennia-credit-card",
        "/personal/pay/cards/credit-cards/moneyback-credit-card",
        "/personal/pay/cards/credit-cards/moneyback-plus-credit-card",
        "/personal/pay/cards/credit-cards/freedom-credit-card",
        "/personal/pay/cards/credit-cards/bharat-credit-card",
        "/personal/pay/cards/credit-cards/swiggy-hdfc-bank-credit-card",
        "/personal/pay/cards/credit-cards/tata-neu-hdfc-bank-credit-card",
        "/personal/pay/cards/credit-cards/marriott-bonvoy-hdfc-bank-credit-card",
    ]
    
    def __init__(self, config: Optional[ScraperConfig] = None):
        super().__init__(config)
    
    def get_issuer_name(self) -> str:
        return "HDFC Bank"
    
    def get_card_urls(self) -> list[str]:
        """
        Get list of HDFC credit card URLs.
        
        First tries to scrape from the cards listing page,
        falls back to known URLs if scraping fails.
        """
        urls = []
        
        # Try to scrape the cards listing page
        html = self.fetch_page(self.CARDS_LIST_URL)
        if html:
            soup = self.parse_html(html)
            
            # Look for card links in the page
            # HDFC typically uses specific CSS classes for card links
            card_links = soup.find_all("a", href=True)
            
            for link in card_links:
                href = link.get("href", "")
                # Filter for credit card detail pages
                if "/credit-cards/" in href and "credit-card" in href.lower():
                    # Skip listing pages and apply pages
                    if href.endswith("credit-cards") or "apply" in href.lower():
                        continue
                    
                    full_url = urljoin(self.BASE_URL, href)
                    if full_url not in urls:
                        urls.append(full_url)
        
        # If no URLs found, use known URLs
        if not urls:
            print("Using fallback known card URLs")
            urls = [urljoin(self.BASE_URL, path) for path in self.KNOWN_CARD_URLS]
        
        return urls
    
    def scrape_card_page(self, url: str) -> Optional[RawCardData]:
        """
        Scrape a single HDFC card detail page.
        
        Extracts the main content areas that typically contain:
        - Card name and description
        - Features and benefits
        - Fees and charges
        - Eligibility criteria
        - Reward points details
        """
        html = self.fetch_page(url)
        if not html:
            return None
        
        soup = self.parse_html(html)
        
        # Get page title
        title_tag = soup.find("title")
        page_title = title_tag.get_text(strip=True) if title_tag else "Unknown Card"
        
        # Clean up title (remove " - HDFC Bank" suffix)
        if " - " in page_title:
            page_title = page_title.split(" - ")[0].strip()
        
        # Extract main content
        # HDFC uses various containers for card details
        content_selectors = [
            "main",
            ".main-content",
            "#main-content",
            ".card-details",
            ".product-details",
            "article",
        ]
        
        main_content = None
        for selector in content_selectors:
            if selector.startswith("."):
                main_content = soup.find(class_=selector[1:])
            elif selector.startswith("#"):
                main_content = soup.find(id=selector[1:])
            else:
                main_content = soup.find(selector)
            
            if main_content:
                break
        
        # If no specific content area found, use body
        if not main_content:
            main_content = soup.find("body") or soup
        
        # Extract text content
        text_content = self.extract_text_content(main_content)
        
        # Also try to extract specific sections
        sections = self._extract_hdfc_sections(soup)
        if sections:
            text_content = f"{text_content}\n\n--- STRUCTURED SECTIONS ---\n{sections}"
        
        return RawCardData(
            url=url,
            html_content=str(main_content),
            text_content=text_content,
            page_title=page_title,
            issuer=self.get_issuer_name(),
            scraped_at=datetime.now()
        )
    
    def _extract_hdfc_sections(self, soup) -> str:
        """
        Extract specific sections from HDFC card pages.
        HDFC often uses accordion/tab structures for different sections.
        """
        sections = []
        
        # Look for common section patterns
        section_headers = [
            "Features & Benefits",
            "Fees & Charges", 
            "Eligibility",
            "Reward Points",
            "Interest Rates",
            "Key Features",
            "Card Benefits",
        ]
        
        for header_text in section_headers:
            # Find headers containing this text
            headers = soup.find_all(
                ["h1", "h2", "h3", "h4", "div", "span"],
                string=lambda t: t and header_text.lower() in t.lower()
            )
            
            for header in headers:
                # Get the next sibling or parent's content
                content = ""
                
                # Try to get content from next sibling
                next_elem = header.find_next_sibling()
                if next_elem:
                    content = next_elem.get_text(separator="\n", strip=True)
                
                # Or from parent container
                if not content:
                    parent = header.find_parent(["div", "section"])
                    if parent:
                        content = parent.get_text(separator="\n", strip=True)
                
                if content and len(content) > 50:  # Only include substantial content
                    sections.append(f"## {header_text}\n{content}")
                    break
        
        return "\n\n".join(sections)


# Example usage
if __name__ == "__main__":
    scraper = HDFCScraper()
    cards = scraper.scrape_all_cards()
    
    for card in cards:
        print(f"\n{'='*60}")
        print(f"Card: {card.page_title}")
        print(f"URL: {card.url}")
        print(f"Content length: {len(card.text_content)} chars")
        print(f"Scraped at: {card.scraped_at}")
