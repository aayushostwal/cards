# Credit Card Data Pipeline

Python pipeline for scraping credit card data from Indian bank websites and converting it to structured JSON using local LLM processing.

## Setup

### 1. Install Dependencies

```bash
cd python
pip install -r requirements.txt
```

### 2. Install Ollama

Download and install Ollama from [ollama.ai](https://ollama.ai), then pull a model:

```bash
ollama pull llama3.2
```

## Usage

### Pipeline Overview

```
Bank Website → Scraper → Raw Text → Ollama LLM → Structured JSON → React App
```

### Commands

#### 1. Scrape Bank Data

Scrape credit card pages from a specific bank:

```bash
python main.py scrape --bank hdfc --output raw_hdfc.json
```

Scrape all supported banks:

```bash
python main.py scrape --bank all --output raw_all.json
```

#### 2. Process with LLM

Convert raw scraped data to structured JSON using Ollama:

```bash
python main.py process --input raw_hdfc.json --output cards.json
```

Use a specific model:

```bash
python main.py process --input raw_hdfc.json --output cards.json --model llama3.1
```

#### 3. Validate Data

Check the output for schema compliance and data quality:

```bash
python main.py validate --input cards.json
```

#### 4. Export to React App

Copy the processed data to the frontend:

```bash
python main.py export --input cards.json --output src/data/cards.json
```

## Project Structure

```
python/
├── main.py                     # CLI entry point
├── requirements.txt            # Python dependencies
├── README.md                   # This file
├── models/
│   ├── __init__.py
│   └── card_schema.py          # Pydantic models matching frontend types
├── scrapers/
│   ├── __init__.py
│   ├── base.py                 # Abstract base scraper class
│   └── hdfc.py                 # HDFC Bank scraper
├── processors/
│   ├── __init__.py
│   ├── ollama_processor.py     # LLM-based data extraction
│   └── schema_validator.py     # Schema validation
└── output/                     # Generated files
    ├── raw_hdfc.json           # Raw scraped data
    └── cards.json              # Processed card data
```

## Adding a New Bank Scraper

1. Create a new file in `scrapers/` (e.g., `icici.py`)
2. Inherit from `BaseScraper`
3. Implement required methods:
   - `get_issuer_name()`: Return bank name
   - `get_card_urls()`: Return list of card page URLs
   - `scrape_card_page()`: Extract raw data from a page

```python
from .base import BaseScraper, RawCardData

class ICICIScraper(BaseScraper):
    BASE_URL = "https://www.icicibank.com"
    
    def get_issuer_name(self) -> str:
        return "ICICI Bank"
    
    def get_card_urls(self) -> list[str]:
        # Return list of card detail page URLs
        ...
    
    def scrape_card_page(self, url: str) -> RawCardData:
        # Extract content from the page
        ...
```

4. Register in `main.py`:

```python
BANK_SCRAPERS = {
    "hdfc": HDFCScraper,
    "icici": ICICIScraper,  # Add here
}
```

## JSON Schema

The output JSON follows this structure (35+ parameters):

```json
{
  "version": "1.0",
  "lastUpdated": "2026-02-02",
  "cards": [
    {
      "id": "hdfc-regalia-gold",
      "basicInfo": { "name", "issuer", "network", "cardType", ... },
      "fees": { "joiningFee", "annualFee", "waivers", ... },
      "eligibility": { "minSalary", "minCibil", "employmentType", ... },
      "rewards": { "rewardRate", "acceleratedCategories", "welcomeBonus", ... },
      "loungeAccess": { "domestic", "international", "railwayLounge" },
      "discountsAndOffers": { "platforms", "categories" },
      "charges": { "interestRate", "foreignTxnFee", "lateFee", ... },
      "features": { "contactless", "concierge", "insurance", ... },
      "metadata": { "sourceUrl", "scrapedAt", "confidence" }
    }
  ]
}
```

## Supported Banks

| Bank | Scraper | Status |
|------|---------|--------|
| HDFC Bank | `HDFCScraper` | ✓ Implemented |
| ICICI Bank | `ICICIScraper` | Planned |
| SBI Card | `SBIScraper` | Planned |
| Axis Bank | `AxisScraper` | Planned |
| Kotak Bank | `KotakScraper` | Planned |
| American Express | `AmexScraper` | Planned |

## Tips

1. **Rate Limiting**: The scrapers have built-in rate limiting. Don't remove it or you may get blocked.

2. **LLM Quality**: Lower confidence scores mean manual review is recommended. Check the `metadata.confidence` field.

3. **Validation**: Always validate before exporting to the React app. The validator checks for data quality issues.

4. **Updates**: Bank websites change frequently. You may need to update scraper selectors.

## Troubleshooting

### Ollama not found

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.2
```

### Scraper returning empty results

1. Check if the bank website is accessible
2. Website structure may have changed - update selectors
3. Try with a different user agent

### Low confidence extractions

1. The source page may not have complete information
2. Try a larger/better LLM model
3. Flag for manual review and fill in missing data
