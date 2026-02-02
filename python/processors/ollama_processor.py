"""
Ollama LLM processor for converting raw scraped data to structured JSON.
Uses local Ollama models to extract credit card details from unstructured text.
"""

import json
import re
from typing import Optional
from datetime import datetime

try:
    import ollama
except ImportError:
    ollama = None

from ..models import (
    CreditCard,
    RawCardData,
    BasicInfo,
    CardFees,
    CardEligibility,
    CardRewards,
    CardLoungeAccess,
    CardDiscountsAndOffers,
    CardCharges,
    CardFeatures,
    CardMetadata,
    CardNetwork,
    CardType,
    EmploymentType,
    RewardUnit,
    FuelSurchargeWaiver,
    InterestRate,
    FeeWithMin,
    EMIFee,
    InsuranceCover,
)


# JSON Schema for LLM extraction (simplified for prompt)
EXTRACTION_SCHEMA = """
{
  "name": "string - Full card name",
  "cardType": "Entry Level | Premium | Super Premium | Ultra Premium",
  "network": ["Visa", "Mastercard", "RuPay", "Amex"],
  "fees": {
    "joiningFee": "number in INR",
    "joiningFeeWaiver": "string condition or null",
    "annualFee": "number in INR",
    "annualFeeWaiver": "string condition or null"
  },
  "eligibility": {
    "minSalary": "number monthly salary in INR or null",
    "minITR": "number annual income in INR or null",
    "minCibilScore": "number or null",
    "employmentType": ["Salaried", "Self-Employed"]
  },
  "rewards": {
    "rewardRate": "number - base reward percentage",
    "rewardUnit": "points | cashback | miles",
    "pointValue": "number - INR value per point",
    "acceleratedCategories": [
      {"category": "string", "rate": "number", "cap": "number or null"}
    ],
    "welcomeBonus": {"points": "number", "value": "number INR", "condition": "string"} or null
  },
  "loungeAccess": {
    "domestic": {"freeVisits": "number per year", "program": "string"} or null,
    "international": {"freeVisits": "number per year", "program": "string"} or null
  },
  "charges": {
    "interestRateAnnual": "number percentage",
    "foreignTxnFee": "number percentage",
    "lateFee": "number INR",
    "cashAdvanceFeePercent": "number",
    "cashAdvanceFeeMin": "number INR"
  },
  "features": {
    "contactless": "boolean",
    "concierge": "boolean",
    "airAccidentCover": "number INR or null",
    "lostCardCover": "number INR or null"
  }
}
"""

EXTRACTION_PROMPT = """You are a data extraction expert. Extract credit card details from the following text into a structured JSON format.

IMPORTANT RULES:
1. Extract ONLY information explicitly mentioned in the text
2. Use null for any field not found in the text
3. Convert all fees/amounts to numbers (remove ₹, Rs., commas)
4. For percentages, use the number only (e.g., 3.5 not "3.5%")
5. Be precise with numbers - don't guess or estimate
6. For eligibility, extract minimum salary/income requirements
7. For rewards, identify the base reward rate and any accelerated categories

OUTPUT JSON SCHEMA:
{schema}

TEXT TO EXTRACT FROM:
{text}

CARD NAME HINT: {card_name}
ISSUER: {issuer}

Respond with ONLY valid JSON, no explanations or markdown. Start with {{ and end with }}"""


class OllamaProcessor:
    """
    Processes raw scraped data using local Ollama LLM.
    Converts unstructured text to structured CreditCard objects.
    """
    
    DEFAULT_MODEL = "llama3.2"  # Good balance of speed and quality
    FALLBACK_MODELS = ["llama3.1", "mistral", "mixtral"]
    
    def __init__(self, model: Optional[str] = None):
        """
        Initialize the Ollama processor.
        
        Args:
            model: Ollama model name to use (default: llama3.2)
        """
        if ollama is None:
            raise ImportError(
                "ollama package not installed. "
                "Install with: pip install ollama"
            )
        
        self.model = model or self.DEFAULT_MODEL
        self._verify_model()
    
    def _verify_model(self):
        """Verify the model is available, try fallbacks if not."""
        try:
            # Check if model exists
            ollama.show(self.model)
            print(f"Using Ollama model: {self.model}")
        except Exception:
            print(f"Model {self.model} not found, trying fallbacks...")
            
            for fallback in self.FALLBACK_MODELS:
                try:
                    ollama.show(fallback)
                    self.model = fallback
                    print(f"Using fallback model: {self.model}")
                    return
                except Exception:
                    continue
            
            print(f"No models found. Please pull a model with: ollama pull {self.DEFAULT_MODEL}")
    
    def _extract_json_from_response(self, response: str) -> Optional[dict]:
        """Extract JSON from LLM response, handling various formats."""
        # Try direct JSON parse first
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            pass
        
        # Try to find JSON in markdown code blocks
        json_patterns = [
            r"```json\s*([\s\S]*?)\s*```",
            r"```\s*([\s\S]*?)\s*```",
            r"\{[\s\S]*\}",
        ]
        
        for pattern in json_patterns:
            matches = re.findall(pattern, response)
            for match in matches:
                try:
                    return json.loads(match)
                except json.JSONDecodeError:
                    continue
        
        return None
    
    def _call_ollama(self, prompt: str) -> str:
        """Make a call to Ollama API."""
        response = ollama.chat(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            options={
                "temperature": 0.1,  # Low temperature for consistent extraction
                "num_predict": 2048,
            }
        )
        return response["message"]["content"]
    
    def process_raw_data(self, raw_data: RawCardData) -> Optional[CreditCard]:
        """
        Process raw scraped data and convert to CreditCard object.
        
        Args:
            raw_data: RawCardData from scraper
            
        Returns:
            CreditCard object or None if extraction failed
        """
        # Truncate text if too long (LLM context limits)
        text = raw_data.text_content[:8000]
        
        prompt = EXTRACTION_PROMPT.format(
            schema=EXTRACTION_SCHEMA,
            text=text,
            card_name=raw_data.page_title,
            issuer=raw_data.issuer
        )
        
        try:
            response = self._call_ollama(prompt)
            extracted = self._extract_json_from_response(response)
            
            if not extracted:
                print(f"Failed to extract JSON for {raw_data.page_title}")
                return None
            
            # Convert extracted data to CreditCard model
            card = self._build_credit_card(extracted, raw_data)
            return card
            
        except Exception as e:
            print(f"Error processing {raw_data.page_title}: {e}")
            return None
    
    def _build_credit_card(self, data: dict, raw_data: RawCardData) -> CreditCard:
        """Build a CreditCard object from extracted data."""
        
        # Generate ID from name
        card_id = self._generate_id(data.get("name", raw_data.page_title), raw_data.issuer)
        
        # Parse network
        networks = []
        raw_networks = data.get("network", [])
        if isinstance(raw_networks, str):
            raw_networks = [raw_networks]
        for net in raw_networks:
            try:
                networks.append(CardNetwork(net))
            except ValueError:
                pass
        if not networks:
            networks = [CardNetwork.VISA]  # Default
        
        # Parse card type
        try:
            card_type = CardType(data.get("cardType", "Entry Level"))
        except ValueError:
            card_type = CardType.ENTRY_LEVEL
        
        # Build sub-models
        fees_data = data.get("fees", {})
        eligibility_data = data.get("eligibility", {})
        rewards_data = data.get("rewards", {})
        lounge_data = data.get("loungeAccess", {})
        charges_data = data.get("charges", {})
        features_data = data.get("features", {})
        
        return CreditCard(
            id=card_id,
            basic_info=BasicInfo(
                name=data.get("name", raw_data.page_title),
                issuer=raw_data.issuer,
                network=networks,
                card_type=card_type,
                image_url="",  # Would need separate image scraping
                apply_url=raw_data.url,
                description=data.get("description"),
            ),
            fees=CardFees(
                joining_fee=self._safe_int(fees_data.get("joiningFee"), 0),
                joining_fee_waiver=fees_data.get("joiningFeeWaiver"),
                annual_fee=self._safe_int(fees_data.get("annualFee"), 0),
                annual_fee_waiver=fees_data.get("annualFeeWaiver"),
                renewal_fee=self._safe_int(fees_data.get("renewalFee", fees_data.get("annualFee")), 0),
                add_on_card_fee=self._safe_int(fees_data.get("addOnCardFee"), 0),
                fuel_surcharge_waiver=FuelSurchargeWaiver(
                    enabled=fees_data.get("fuelSurchargeWaiver", {}).get("enabled", True),
                    max_per_month=self._safe_int(fees_data.get("fuelSurchargeWaiver", {}).get("maxPerMonth")),
                ),
            ),
            eligibility=CardEligibility(
                min_salary=self._safe_int(eligibility_data.get("minSalary")),
                min_itr=self._safe_int(eligibility_data.get("minITR")),
                min_cibil_score=self._safe_int(eligibility_data.get("minCibilScore")),
                employment_type=self._parse_employment_types(eligibility_data.get("employmentType", [])),
                min_age=self._safe_int(eligibility_data.get("minAge"), 21),
                max_age=self._safe_int(eligibility_data.get("maxAge"), 60),
                existing_relationship=eligibility_data.get("existingRelationship", False),
            ),
            rewards=CardRewards(
                reward_rate=self._safe_float(rewards_data.get("rewardRate"), 1.0),
                reward_unit=self._parse_reward_unit(rewards_data.get("rewardUnit", "points")),
                point_value=self._safe_float(rewards_data.get("pointValue"), 0.25),
                accelerated_categories=self._parse_accelerated_categories(rewards_data.get("acceleratedCategories", [])),
                welcome_bonus=self._parse_welcome_bonus(rewards_data.get("welcomeBonus")),
                milestone_rewards=[],
            ),
            lounge_access=CardLoungeAccess(
                domestic=self._parse_lounge_tier(lounge_data.get("domestic")),
                international=self._parse_lounge_tier(lounge_data.get("international")),
                railway_lounge=None,
            ),
            discounts_and_offers=CardDiscountsAndOffers(
                platforms=[],
                categories=[],
            ),
            charges=CardCharges(
                interest_rate=InterestRate(
                    monthly=self._safe_float(charges_data.get("interestRateAnnual"), 42.0) / 12,
                    annual=self._safe_float(charges_data.get("interestRateAnnual"), 42.0),
                ),
                cash_advance_fee=FeeWithMin(
                    percent=self._safe_float(charges_data.get("cashAdvanceFeePercent"), 2.5),
                    min=self._safe_int(charges_data.get("cashAdvanceFeeMin"), 500),
                ),
                foreign_txn_fee=self._safe_float(charges_data.get("foreignTxnFee"), 3.5),
                late_fee=self._safe_int(charges_data.get("lateFee"), 750),
                over_limit_fee=self._safe_int(charges_data.get("overLimitFee"), 500),
                emi_fee=EMIFee(
                    processing_percent=self._safe_float(charges_data.get("emiFeePercent"), 1.0),
                    min_amount=self._safe_int(charges_data.get("emiFeeMin"), 199),
                ),
                card_replacement_fee=self._safe_int(charges_data.get("cardReplacementFee"), 200),
                statement_fee=self._safe_int(charges_data.get("statementFee"), 50),
            ),
            features=CardFeatures(
                contactless=features_data.get("contactless", True),
                virtual_card=features_data.get("virtualCard", False),
                add_on_cards=self._safe_int(features_data.get("addOnCards"), 2),
                insurance_cover=InsuranceCover(
                    air_accident=self._safe_int(features_data.get("airAccidentCover")),
                    lost_card=self._safe_int(features_data.get("lostCardCover")),
                    purchase_protection=self._safe_int(features_data.get("purchaseProtection")),
                ),
                concierge=features_data.get("concierge", False),
                golf_access=None,
                zero_liability=features_data.get("zeroLiability", True),
                instant_issuance=features_data.get("instantIssuance", False),
                emi_conversion=features_data.get("emiConversion", True),
            ),
            metadata=CardMetadata(
                source_url=raw_data.url,
                scraped_at=raw_data.scraped_at.isoformat(),
                confidence=0.7,  # Default confidence for LLM extraction
                manual_review=True,  # Flag for manual verification
            ),
        )
    
    def _generate_id(self, name: str, issuer: str) -> str:
        """Generate a URL-friendly ID from card name and issuer."""
        # Take first word of issuer
        issuer_short = issuer.lower().split()[0]
        # Clean and slugify name
        name_slug = re.sub(r"[^a-z0-9]+", "-", name.lower())
        name_slug = name_slug.strip("-")
        return f"{issuer_short}-{name_slug}"
    
    def _safe_int(self, value, default: Optional[int] = None) -> Optional[int]:
        """Safely convert to int."""
        if value is None:
            return default
        try:
            # Handle strings with commas or currency symbols
            if isinstance(value, str):
                value = re.sub(r"[₹,Rs.\s]", "", value)
            return int(float(value))
        except (ValueError, TypeError):
            return default
    
    def _safe_float(self, value, default: float = 0.0) -> float:
        """Safely convert to float."""
        if value is None:
            return default
        try:
            if isinstance(value, str):
                value = re.sub(r"[₹,%Rs.\s]", "", value)
            return float(value)
        except (ValueError, TypeError):
            return default
    
    def _parse_employment_types(self, types: list) -> list[EmploymentType]:
        """Parse employment types list."""
        result = []
        for t in types:
            try:
                result.append(EmploymentType(t))
            except ValueError:
                pass
        return result or [EmploymentType.SALARIED, EmploymentType.SELF_EMPLOYED]
    
    def _parse_reward_unit(self, unit: str) -> RewardUnit:
        """Parse reward unit."""
        try:
            return RewardUnit(unit.lower())
        except ValueError:
            return RewardUnit.POINTS
    
    def _parse_accelerated_categories(self, categories: list) -> list:
        """Parse accelerated reward categories."""
        from ..models.card_schema import AcceleratedCategory
        
        result = []
        for cat in categories:
            if isinstance(cat, dict):
                result.append(AcceleratedCategory(
                    category=cat.get("category", ""),
                    rate=self._safe_float(cat.get("rate"), 1.0),
                    cap=self._safe_int(cat.get("cap")),
                ))
        return result
    
    def _parse_welcome_bonus(self, bonus: Optional[dict]):
        """Parse welcome bonus."""
        if not bonus:
            return None
        
        from ..models.card_schema import WelcomeBonus
        
        return WelcomeBonus(
            points=self._safe_int(bonus.get("points")),
            value=self._safe_int(bonus.get("value")),
            condition=bonus.get("condition", ""),
        )
    
    def _parse_lounge_tier(self, tier: Optional[dict]):
        """Parse lounge access tier."""
        if not tier:
            return None
        
        from ..models.card_schema import LoungeAccessTier
        
        return LoungeAccessTier(
            free_visits=self._safe_int(tier.get("freeVisits"), 0),
            per_year=True,
            program=tier.get("program", ""),
        )
    
    def process_batch(self, raw_data_list: list[RawCardData]) -> list[CreditCard]:
        """
        Process a batch of raw data.
        
        Args:
            raw_data_list: List of RawCardData objects
            
        Returns:
            List of successfully processed CreditCard objects
        """
        cards = []
        for i, raw_data in enumerate(raw_data_list, 1):
            print(f"Processing {i}/{len(raw_data_list)}: {raw_data.page_title}")
            
            card = self.process_raw_data(raw_data)
            if card:
                cards.append(card)
                print(f"  ✓ Extracted: {card.basicInfo.name}")
            else:
                print(f"  ✗ Failed to extract")
        
        return cards
