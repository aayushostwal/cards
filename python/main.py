#!/usr/bin/env python3
"""
Credit Card Data Pipeline - Main CLI Entry Point

Usage:
    python main.py scrape --bank hdfc
    python main.py scrape --bank all
    python main.py process --input raw_data.json --output cards.json
    python main.py validate --input cards.json
    python main.py export --output ../src/data/cards.json
"""

import sys
from pathlib import Path

# Add python directory to path for proper module resolution
PYTHON_DIR = Path(__file__).parent
sys.path.insert(0, str(PYTHON_DIR))

import json
import argparse
from datetime import datetime
from typing import Optional

from models import CardsData, CreditCard, RawCardData
from scrapers import HDFCScraper, BaseScraper
from processors import OllamaProcessor, SchemaValidator


# Bank scraper registry
BANK_SCRAPERS = {
    "hdfc": HDFCScraper,
    # Add more banks here:
    # "icici": ICICIScraper,
    # "sbi": SBIScraper,
    # "axis": AxisScraper,
    # "kotak": KotakScraper,
    # "amex": AmexScraper,
}


def get_output_dir() -> Path:
    """Get the output directory path."""
    output_dir = Path(__file__).parent / "output"
    output_dir.mkdir(exist_ok=True)
    return output_dir


def scrape_bank(bank: str, output_file: Optional[str] = None) -> list[RawCardData]:
    """
    Scrape credit card data from a specific bank.
    
    Args:
        bank: Bank identifier (e.g., 'hdfc', 'icici')
        output_file: Optional file to save raw data
        
    Returns:
        List of RawCardData objects
    """
    if bank not in BANK_SCRAPERS:
        available = ", ".join(BANK_SCRAPERS.keys())
        raise ValueError(f"Unknown bank '{bank}'. Available: {available}")
    
    scraper_class = BANK_SCRAPERS[bank]
    scraper = scraper_class()
    
    print(f"\n{'='*60}")
    print(f"Scraping {scraper.get_issuer_name()}")
    print(f"{'='*60}\n")
    
    raw_cards = scraper.scrape_all_cards()
    
    # Save raw data if output file specified
    if output_file:
        output_path = get_output_dir() / output_file
        raw_data_json = [
            {
                "url": card.url,
                "text_content": card.text_content,
                "page_title": card.page_title,
                "issuer": card.issuer,
                "scraped_at": card.scraped_at.isoformat(),
            }
            for card in raw_cards
        ]
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(raw_data_json, f, indent=2, ensure_ascii=False)
        print(f"\nRaw data saved to: {output_path}")
    
    return raw_cards


def scrape_all_banks(output_file: Optional[str] = None) -> list[RawCardData]:
    """Scrape all supported banks."""
    all_raw_cards = []
    
    for bank in BANK_SCRAPERS:
        try:
            raw_cards = scrape_bank(bank)
            all_raw_cards.extend(raw_cards)
        except Exception as e:
            print(f"Error scraping {bank}: {e}")
    
    if output_file:
        output_path = get_output_dir() / output_file
        raw_data_json = [
            {
                "url": card.url,
                "text_content": card.text_content,
                "page_title": card.page_title,
                "issuer": card.issuer,
                "scraped_at": card.scraped_at.isoformat(),
            }
            for card in all_raw_cards
        ]
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(raw_data_json, f, indent=2, ensure_ascii=False)
        print(f"\nAll raw data saved to: {output_path}")
    
    return all_raw_cards


def process_raw_data(input_file: str, output_file: str, model: Optional[str] = None):
    """
    Process raw scraped data with Ollama LLM.
    
    Args:
        input_file: Path to raw data JSON file
        output_file: Path to save processed cards JSON
        model: Ollama model to use (optional)
    """
    input_path = get_output_dir() / input_file
    output_path = get_output_dir() / output_file
    
    # Load raw data
    with open(input_path, "r", encoding="utf-8") as f:
        raw_data_json = json.load(f)
    
    raw_cards = [
        RawCardData(
            url=item["url"],
            text_content=item["text_content"],
            page_title=item["page_title"],
            issuer=item["issuer"],
            scraped_at=datetime.fromisoformat(item["scraped_at"]),
        )
        for item in raw_data_json
    ]
    
    print(f"\nLoaded {len(raw_cards)} raw card records")
    
    # Process with Ollama
    processor = OllamaProcessor(model=model)
    cards = processor.process_batch(raw_cards)
    
    print(f"\nSuccessfully processed {len(cards)} cards")
    
    # Create CardsData
    cards_data = CardsData(
        version="1.0",
        last_updated=datetime.now().strftime("%Y-%m-%d"),
        cards=cards,
    )
    
    # Save to file
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(cards_data.to_frontend_json(), f, indent=2, ensure_ascii=False)
    
    print(f"\nProcessed data saved to: {output_path}")
    
    # Validate
    validate_file(output_file)


def validate_file(input_file: str):
    """
    Validate a cards JSON file.
    
    Args:
        input_file: Path to cards JSON file
    """
    input_path = get_output_dir() / input_file
    
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    validator = SchemaValidator()
    
    # Schema validation
    result = validator.validate_json(data)
    
    print(f"\n{'='*60}")
    print("VALIDATION RESULTS")
    print(f"{'='*60}")
    
    if result.is_valid:
        print("✓ Schema validation: PASSED")
    else:
        print("✗ Schema validation: FAILED")
        for error in result.errors:
            print(f"  - {error}")
    
    # Per-card validation
    if result.is_valid:
        try:
            cards_data = CardsData(**data)
            card_results = validator.validate_cards_data(cards_data)
            
            print(f"\nValidated {len(card_results)} cards:")
            
            for card_id, card_result in card_results.items():
                status = "✓" if card_result.is_valid else "✗"
                print(f"\n  {status} {card_id}")
                
                if card_result.errors:
                    for error in card_result.errors:
                        print(f"      ERROR: {error}")
                
                if card_result.warnings:
                    for warning in card_result.warnings:
                        print(f"      WARN: {warning}")
                        
        except Exception as e:
            print(f"Error during card validation: {e}")


def export_to_frontend(input_file: str, output_path: str):
    """
    Export processed cards to the React app's data directory.
    
    Args:
        input_file: Source cards JSON file
        output_path: Destination path (relative to project root)
    """
    input_path = get_output_dir() / input_file
    
    # Resolve output path relative to project root
    project_root = Path(__file__).parent.parent
    dest_path = project_root / output_path
    
    # Ensure destination directory exists
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Read source and validate
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    validator = SchemaValidator()
    result = validator.validate_json(data)
    
    if not result.is_valid:
        print("Cannot export invalid data. Please fix validation errors first.")
        for error in result.errors:
            print(f"  - {error}")
        return
    
    # Write to destination
    with open(dest_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Exported to: {dest_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Credit Card Data Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py scrape --bank hdfc
  python main.py scrape --bank all --output raw_all.json
  python main.py process --input raw_hdfc.json --output cards.json
  python main.py process --input raw_hdfc.json --output cards.json --model llama3.2
  python main.py validate --input cards.json
  python main.py export --input cards.json --output src/data/cards.json
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Scrape command
    scrape_parser = subparsers.add_parser("scrape", help="Scrape credit card data from banks")
    scrape_parser.add_argument(
        "--bank",
        required=True,
        choices=list(BANK_SCRAPERS.keys()) + ["all"],
        help="Bank to scrape (or 'all' for all banks)"
    )
    scrape_parser.add_argument(
        "--output",
        help="Output file name for raw data (saved in output/)"
    )
    
    # Process command
    process_parser = subparsers.add_parser("process", help="Process raw data with Ollama")
    process_parser.add_argument(
        "--input",
        required=True,
        help="Input raw data JSON file"
    )
    process_parser.add_argument(
        "--output",
        required=True,
        help="Output processed cards JSON file"
    )
    process_parser.add_argument(
        "--model",
        help="Ollama model to use (default: llama3.2)"
    )
    
    # Validate command
    validate_parser = subparsers.add_parser("validate", help="Validate cards JSON file")
    validate_parser.add_argument(
        "--input",
        required=True,
        help="Cards JSON file to validate"
    )
    
    # Export command
    export_parser = subparsers.add_parser("export", help="Export to React app")
    export_parser.add_argument(
        "--input",
        default="cards.json",
        help="Source cards JSON file (in output/)"
    )
    export_parser.add_argument(
        "--output",
        default="src/data/cards.json",
        help="Destination path relative to project root"
    )
    
    args = parser.parse_args()
    
    if args.command == "scrape":
        if args.bank == "all":
            scrape_all_banks(args.output or "raw_all.json")
        else:
            output_file = args.output or f"raw_{args.bank}.json"
            scrape_bank(args.bank, output_file)
    
    elif args.command == "process":
        process_raw_data(args.input, args.output, args.model)
    
    elif args.command == "validate":
        validate_file(args.input)
    
    elif args.command == "export":
        export_to_frontend(args.input, args.output)
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
