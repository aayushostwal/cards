"""
Pydantic models for Credit Card data schema.
These models match the TypeScript types in the React frontend.
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, Literal
from datetime import datetime
from enum import Enum


class CardNetwork(str, Enum):
    VISA = "Visa"
    MASTERCARD = "Mastercard"
    RUPAY = "RuPay"
    AMEX = "Amex"
    DINERS = "Diners"


class CardType(str, Enum):
    ENTRY_LEVEL = "Entry Level"
    PREMIUM = "Premium"
    SUPER_PREMIUM = "Super Premium"
    ULTRA_PREMIUM = "Ultra Premium"
    BUSINESS = "Business"


class EmploymentType(str, Enum):
    SALARIED = "Salaried"
    SELF_EMPLOYED = "Self-Employed"
    BUSINESS_OWNER = "Business Owner"


class RewardUnit(str, Enum):
    POINTS = "points"
    CASHBACK = "cashback"
    MILES = "miles"


class Period(str, Enum):
    YEARLY = "yearly"
    QUARTERLY = "quarterly"
    MONTHLY = "monthly"


class Frequency(str, Enum):
    PER_TRANSACTION = "per transaction"
    PER_MONTH = "per month"
    PER_QUARTER = "per quarter"


# Sub-models for nested structures

class FuelSurchargeWaiver(BaseModel):
    enabled: bool
    maxPerMonth: Optional[int] = Field(None, alias="max_per_month")
    minTransaction: Optional[int] = Field(None, alias="min_transaction")
    maxTransaction: Optional[int] = Field(None, alias="max_transaction")

    class Config:
        populate_by_name = True


class CardFees(BaseModel):
    joiningFee: int = Field(..., alias="joining_fee")
    joiningFeeWaiver: Optional[str] = Field(None, alias="joining_fee_waiver")
    annualFee: int = Field(..., alias="annual_fee")
    annualFeeWaiver: Optional[str] = Field(None, alias="annual_fee_waiver")
    renewalFee: int = Field(..., alias="renewal_fee")
    addOnCardFee: int = Field(0, alias="add_on_card_fee")
    fuelSurchargeWaiver: FuelSurchargeWaiver = Field(..., alias="fuel_surcharge_waiver")

    class Config:
        populate_by_name = True


class CardEligibility(BaseModel):
    minSalary: Optional[int] = Field(None, alias="min_salary")
    minITR: Optional[int] = Field(None, alias="min_itr")
    minCibilScore: Optional[int] = Field(None, alias="min_cibil_score")
    employmentType: list[EmploymentType] = Field(..., alias="employment_type")
    minAge: int = Field(21, alias="min_age")
    maxAge: int = Field(60, alias="max_age")
    existingRelationship: bool = Field(False, alias="existing_relationship")
    otherRequirements: Optional[list[str]] = Field(None, alias="other_requirements")

    class Config:
        populate_by_name = True


class AcceleratedCategory(BaseModel):
    category: str
    rate: float
    cap: Optional[int] = None
    unit: Optional[str] = None


class WelcomeBonus(BaseModel):
    points: Optional[int] = None
    value: Optional[int] = None
    condition: str


class MilestoneReward(BaseModel):
    spend: int
    reward: str
    period: Optional[Period] = None


class CardRewards(BaseModel):
    rewardRate: float = Field(..., alias="reward_rate")
    rewardUnit: RewardUnit = Field(..., alias="reward_unit")
    pointValue: float = Field(..., alias="point_value")
    acceleratedCategories: list[AcceleratedCategory] = Field(
        default_factory=list, alias="accelerated_categories"
    )
    welcomeBonus: Optional[WelcomeBonus] = Field(None, alias="welcome_bonus")
    milestoneRewards: list[MilestoneReward] = Field(
        default_factory=list, alias="milestone_rewards"
    )
    redemptionOptions: Optional[list[str]] = Field(None, alias="redemption_options")

    class Config:
        populate_by_name = True


class LoungeAccessTier(BaseModel):
    freeVisits: int = Field(..., alias="free_visits")
    perQuarter: Optional[bool] = Field(None, alias="per_quarter")
    perYear: Optional[bool] = Field(None, alias="per_year")
    program: str
    guestAccess: Optional[bool] = Field(None, alias="guest_access")
    guestFee: Optional[int] = Field(None, alias="guest_fee")

    class Config:
        populate_by_name = True


class RailwayLounge(BaseModel):
    enabled: bool
    visits: int


class CardLoungeAccess(BaseModel):
    domestic: Optional[LoungeAccessTier] = None
    international: Optional[LoungeAccessTier] = None
    railwayLounge: Optional[RailwayLounge] = Field(None, alias="railway_lounge")

    class Config:
        populate_by_name = True


class PlatformDiscount(BaseModel):
    name: str
    discount: str
    cap: Optional[int] = None
    minSpend: Optional[int] = Field(None, alias="min_spend")
    frequency: Optional[Frequency] = None

    class Config:
        populate_by_name = True


class CategoryOffer(BaseModel):
    category: str
    partner: str
    offer: str
    validTill: Optional[str] = Field(None, alias="valid_till")

    class Config:
        populate_by_name = True


class CardDiscountsAndOffers(BaseModel):
    platforms: list[PlatformDiscount] = Field(default_factory=list)
    categories: list[CategoryOffer] = Field(default_factory=list)


class InterestRate(BaseModel):
    monthly: float
    annual: float


class FeeWithMin(BaseModel):
    percent: float
    min: int


class EMIFee(BaseModel):
    processingPercent: float = Field(..., alias="processing_percent")
    minAmount: int = Field(..., alias="min_amount")

    class Config:
        populate_by_name = True


class CardCharges(BaseModel):
    interestRate: InterestRate = Field(..., alias="interest_rate")
    cashAdvanceFee: FeeWithMin = Field(..., alias="cash_advance_fee")
    foreignTxnFee: float = Field(..., alias="foreign_txn_fee")
    lateFee: int = Field(..., alias="late_fee")
    overLimitFee: int = Field(..., alias="over_limit_fee")
    emiFee: EMIFee = Field(..., alias="emi_fee")
    cardReplacementFee: int = Field(..., alias="card_replacement_fee")
    statementFee: int = Field(..., alias="statement_fee")
    chequeReturnFee: Optional[int] = Field(None, alias="cheque_return_fee")
    outstandingBalanceFee: Optional[int] = Field(None, alias="outstanding_balance_fee")

    class Config:
        populate_by_name = True


class InsuranceCover(BaseModel):
    airAccident: Optional[int] = Field(None, alias="air_accident")
    lostCard: Optional[int] = Field(None, alias="lost_card")
    purchaseProtection: Optional[int] = Field(None, alias="purchase_protection")
    travelInsurance: Optional[int] = Field(None, alias="travel_insurance")
    medicalEmergency: Optional[int] = Field(None, alias="medical_emergency")

    class Config:
        populate_by_name = True


class GolfAccess(BaseModel):
    enabled: bool
    freeGames: int = Field(..., alias="free_games")
    courses: Optional[list[str]] = None

    class Config:
        populate_by_name = True


class CardFeatures(BaseModel):
    contactless: bool = True
    virtualCard: bool = Field(False, alias="virtual_card")
    addOnCards: int = Field(0, alias="add_on_cards")
    insuranceCover: InsuranceCover = Field(..., alias="insurance_cover")
    concierge: bool = False
    golfAccess: Optional[GolfAccess] = Field(None, alias="golf_access")
    zeroLiability: bool = Field(True, alias="zero_liability")
    instantIssuance: bool = Field(False, alias="instant_issuance")
    emiConversion: bool = Field(False, alias="emi_conversion")
    rewardTransfer: Optional[bool] = Field(None, alias="reward_transfer")
    spendAnalytics: Optional[bool] = Field(None, alias="spend_analytics")

    class Config:
        populate_by_name = True


class BasicInfo(BaseModel):
    name: str
    issuer: str
    network: list[CardNetwork]
    cardType: CardType = Field(..., alias="card_type")
    imageUrl: str = Field(..., alias="image_url")
    applyUrl: str = Field(..., alias="apply_url")
    description: Optional[str] = None

    class Config:
        populate_by_name = True


class CardMetadata(BaseModel):
    sourceUrl: str = Field(..., alias="source_url")
    scrapedAt: str = Field(..., alias="scraped_at")
    confidence: float = Field(0.0, ge=0.0, le=1.0)
    manualReview: bool = Field(False, alias="manual_review")
    lastVerified: Optional[str] = Field(None, alias="last_verified")

    class Config:
        populate_by_name = True


# Main Credit Card model
class CreditCard(BaseModel):
    """Complete Credit Card model with all attributes."""
    
    id: str
    basicInfo: BasicInfo = Field(..., alias="basic_info")
    fees: CardFees
    eligibility: CardEligibility
    rewards: CardRewards
    loungeAccess: CardLoungeAccess = Field(..., alias="lounge_access")
    discountsAndOffers: CardDiscountsAndOffers = Field(..., alias="discounts_and_offers")
    charges: CardCharges
    features: CardFeatures
    metadata: CardMetadata

    class Config:
        populate_by_name = True

    def to_frontend_json(self) -> dict:
        """Convert to frontend-compatible JSON with camelCase keys."""
        return self.model_dump(by_alias=False, exclude_none=False)


# Container for multiple cards
class CardsData(BaseModel):
    """Container for the complete cards.json file."""
    
    version: str = "1.0"
    lastUpdated: str = Field(..., alias="last_updated")
    cards: list[CreditCard]

    class Config:
        populate_by_name = True

    def to_frontend_json(self) -> dict:
        """Export in frontend-compatible format."""
        return {
            "version": self.version,
            "lastUpdated": self.lastUpdated,
            "cards": [card.to_frontend_json() for card in self.cards]
        }


# Raw data model for scraper output (before LLM processing)
class RawCardData(BaseModel):
    """Raw scraped data before LLM processing."""
    
    url: str
    html_content: Optional[str] = None
    text_content: str
    page_title: str
    issuer: str
    scraped_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        populate_by_name = True
