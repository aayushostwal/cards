"""
Schema validator for credit card data.
Validates extracted data against the Pydantic schema and checks data quality.
"""

from typing import Optional
from pydantic import ValidationError

from models import CreditCard, CardsData


class ValidationResult:
    """Result of validation with details."""
    
    def __init__(self):
        self.is_valid: bool = True
        self.errors: list[str] = []
        self.warnings: list[str] = []
    
    def add_error(self, message: str):
        self.is_valid = False
        self.errors.append(message)
    
    def add_warning(self, message: str):
        self.warnings.append(message)
    
    def __repr__(self):
        status = "VALID" if self.is_valid else "INVALID"
        return f"ValidationResult({status}, errors={len(self.errors)}, warnings={len(self.warnings)})"


class SchemaValidator:
    """
    Validates credit card data for schema compliance and data quality.
    """
    
    def __init__(self):
        # Reasonable ranges for validation
        self.fee_range = (0, 100000)  # ₹0 to ₹1L
        self.salary_range = (10000, 10000000)  # ₹10K to ₹1Cr
        self.reward_rate_range = (0, 50)  # 0% to 50%
        self.interest_rate_range = (0, 100)  # 0% to 100%
        self.cibil_range = (300, 900)  # Standard CIBIL range
    
    def validate_card(self, card: CreditCard) -> ValidationResult:
        """
        Validate a single CreditCard object.
        
        Args:
            card: CreditCard object to validate
            
        Returns:
            ValidationResult with errors and warnings
        """
        result = ValidationResult()
        
        # Basic info validation
        self._validate_basic_info(card, result)
        
        # Fees validation
        self._validate_fees(card, result)
        
        # Eligibility validation
        self._validate_eligibility(card, result)
        
        # Rewards validation
        self._validate_rewards(card, result)
        
        # Charges validation
        self._validate_charges(card, result)
        
        # Data quality checks
        self._check_data_quality(card, result)
        
        return result
    
    def _validate_basic_info(self, card: CreditCard, result: ValidationResult):
        """Validate basic card information."""
        info = card.basicInfo
        
        if not info.name or len(info.name) < 3:
            result.add_error("Card name is too short or missing")
        
        if not info.issuer:
            result.add_error("Issuer is missing")
        
        if not info.network:
            result.add_error("Card network is missing")
        
        if not info.applyUrl:
            result.add_warning("Apply URL is missing")
    
    def _validate_fees(self, card: CreditCard, result: ValidationResult):
        """Validate fee information."""
        fees = card.fees
        
        # Check joining fee is in reasonable range
        if not self.fee_range[0] <= fees.joiningFee <= self.fee_range[1]:
            result.add_warning(f"Joining fee {fees.joiningFee} seems unusual")
        
        # Check annual fee
        if not self.fee_range[0] <= fees.annualFee <= self.fee_range[1]:
            result.add_warning(f"Annual fee {fees.annualFee} seems unusual")
        
        # If there's a fee waiver condition, it should be descriptive
        if fees.annualFeeWaiver and len(fees.annualFeeWaiver) < 5:
            result.add_warning("Annual fee waiver condition is too short")
    
    def _validate_eligibility(self, card: CreditCard, result: ValidationResult):
        """Validate eligibility criteria."""
        elig = card.eligibility
        
        # Min salary check
        if elig.minSalary is not None:
            if not self.salary_range[0] <= elig.minSalary <= self.salary_range[1]:
                result.add_warning(f"Min salary {elig.minSalary} seems unusual")
        
        # CIBIL score check
        if elig.minCibilScore is not None:
            if not self.cibil_range[0] <= elig.minCibilScore <= self.cibil_range[1]:
                result.add_error(f"CIBIL score {elig.minCibilScore} is out of valid range")
        
        # Age range check
        if elig.minAge >= elig.maxAge:
            result.add_error("Min age should be less than max age")
        
        if elig.minAge < 18:
            result.add_error("Min age cannot be less than 18")
        
        if not elig.employmentType:
            result.add_warning("Employment type is not specified")
    
    def _validate_rewards(self, card: CreditCard, result: ValidationResult):
        """Validate rewards information."""
        rewards = card.rewards
        
        # Reward rate check
        if not self.reward_rate_range[0] <= rewards.rewardRate <= self.reward_rate_range[1]:
            result.add_warning(f"Reward rate {rewards.rewardRate}% seems unusual")
        
        # Point value check
        if rewards.pointValue < 0 or rewards.pointValue > 10:
            result.add_warning(f"Point value {rewards.pointValue} seems unusual")
        
        # Accelerated categories check
        for cat in rewards.acceleratedCategories:
            if cat.rate < rewards.rewardRate:
                result.add_warning(f"Accelerated rate for {cat.category} is less than base rate")
    
    def _validate_charges(self, card: CreditCard, result: ValidationResult):
        """Validate charges information."""
        charges = card.charges
        
        # Interest rate check
        if not self.interest_rate_range[0] <= charges.interestRate.annual <= self.interest_rate_range[1]:
            result.add_warning(f"Annual interest rate {charges.interestRate.annual}% seems unusual")
        
        # Foreign transaction fee check
        if charges.foreignTxnFee < 0 or charges.foreignTxnFee > 10:
            result.add_warning(f"Foreign txn fee {charges.foreignTxnFee}% seems unusual")
    
    def _check_data_quality(self, card: CreditCard, result: ValidationResult):
        """Check overall data quality."""
        # Check confidence level
        if card.metadata.confidence < 0.5:
            result.add_warning("Low confidence extraction - needs manual review")
        
        # Check for missing key data
        missing_count = 0
        
        if card.eligibility.minSalary is None and card.eligibility.minITR is None:
            missing_count += 1
            result.add_warning("Both salary and ITR requirements are missing")
        
        if not card.rewards.acceleratedCategories:
            missing_count += 1
            result.add_warning("No accelerated reward categories found")
        
        if not card.loungeAccess.domestic and not card.loungeAccess.international:
            # This is okay for entry-level cards
            pass
        
        if missing_count >= 3:
            result.add_warning("Multiple key data points are missing - manual review recommended")
    
    def validate_cards_data(self, cards_data: CardsData) -> dict[str, ValidationResult]:
        """
        Validate a complete CardsData object.
        
        Args:
            cards_data: CardsData containing multiple cards
            
        Returns:
            Dictionary mapping card IDs to ValidationResults
        """
        results = {}
        
        for card in cards_data.cards:
            results[card.id] = self.validate_card(card)
        
        return results
    
    def validate_json(self, json_data: dict) -> ValidationResult:
        """
        Validate JSON data against the schema.
        
        Args:
            json_data: Dictionary to validate
            
        Returns:
            ValidationResult
        """
        result = ValidationResult()
        
        try:
            CardsData(**json_data)
        except ValidationError as e:
            result.is_valid = False
            for error in e.errors():
                loc = " -> ".join(str(x) for x in error["loc"])
                result.add_error(f"{loc}: {error['msg']}")
        
        return result


# Example usage
if __name__ == "__main__":
    import json
    
    # Test with sample data
    sample_json = {
        "version": "1.0",
        "lastUpdated": "2026-02-02",
        "cards": []
    }
    
    validator = SchemaValidator()
    result = validator.validate_json(sample_json)
    print(f"Validation result: {result}")
    print(f"Errors: {result.errors}")
    print(f"Warnings: {result.warnings}")
