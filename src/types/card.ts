// Credit Card TypeScript Types - Matching JSON Schema

export type CardNetwork = 'Visa' | 'Mastercard' | 'RuPay' | 'Amex' | 'Diners';
export type CardType = 'Entry Level' | 'Premium' | 'Super Premium' | 'Ultra Premium' | 'Business';
export type EmploymentType = 'Salaried' | 'Self-Employed' | 'Business Owner';

export interface FuelSurchargeWaiver {
  enabled: boolean;
  maxPerMonth: number | null;
  minTransaction?: number;
  maxTransaction?: number;
}

export interface CardFees {
  joiningFee: number;
  joiningFeeWaiver: string | null;
  annualFee: number;
  annualFeeWaiver: string | null;
  renewalFee: number;
  addOnCardFee: number;
  fuelSurchargeWaiver: FuelSurchargeWaiver;
}

export interface CardEligibility {
  minSalary: number | null;
  minITR: number | null;
  minCibilScore: number | null;
  employmentType: EmploymentType[];
  minAge: number;
  maxAge: number;
  existingRelationship: boolean;
  otherRequirements?: string[];
}

export interface AcceleratedCategory {
  category: string;
  rate: number;
  cap: number | null;
  unit?: string;
}

export interface WelcomeBonus {
  points: number | null;
  value: number | null;
  condition: string;
}

export interface MilestoneReward {
  spend: number;
  reward: string;
  period?: 'yearly' | 'quarterly' | 'monthly';
}

export interface CardRewards {
  rewardRate: number;
  rewardUnit: 'points' | 'cashback' | 'miles';
  pointValue: number;
  acceleratedCategories: AcceleratedCategory[];
  welcomeBonus: WelcomeBonus | null;
  milestoneRewards: MilestoneReward[];
  redemptionOptions?: string[];
}

export interface LoungeSpendRequirement {
  amount: number;           // Amount to spend (e.g., 10000)
  period: 'monthly' | 'quarterly' | 'yearly';
  visitsUnlocked: number;   // Number of visits unlocked per spend
}

export interface LoungeAccessTier {
  freeVisits: number;
  perQuarter?: boolean;
  perYear?: boolean;
  program: string;
  guestAccess?: boolean;
  guestFee?: number;
  spendRequired?: LoungeSpendRequirement;  // Spend to unlock lounge access
}

export interface CardLoungeAccess {
  domestic: LoungeAccessTier | null;
  international: LoungeAccessTier | null;
  railwayLounge: {
    enabled: boolean;
    visits: number;
  } | null;
}

export interface PlatformDiscount {
  name: string;
  discount: string;
  cap: number | null;
  minSpend: number | null;
  frequency?: 'per transaction' | 'per month' | 'per quarter';
}

export interface CategoryOffer {
  category: string;
  partner: string;
  offer: string;
  validTill?: string;
}

export interface CardDiscountsAndOffers {
  platforms: PlatformDiscount[];
  categories: CategoryOffer[];
}

export interface InterestRate {
  monthly: number;
  annual: number;
}

export interface FeeWithMin {
  percent: number;
  min: number;
}

export interface EMIFee {
  processingPercent: number;
  minAmount: number;
}

export interface CardCharges {
  interestRate: InterestRate;
  cashAdvanceFee: FeeWithMin;
  foreignTxnFee: number;
  lateFee: number;
  overLimitFee: number;
  emiFee: EMIFee;
  cardReplacementFee: number;
  statementFee: number;
  chequeReturnFee?: number;
  outstandingBalanceFee?: number;
}

export interface InsuranceCover {
  airAccident: number | null;
  lostCard: number | null;
  purchaseProtection: number | null;
  travelInsurance?: number | null;
  medicalEmergency?: number | null;
}

export interface GolfAccess {
  enabled: boolean;
  freeGames: number;
  courses?: string[];
}

export interface CardFeatures {
  contactless: boolean;
  virtualCard: boolean;
  addOnCards: number;
  insuranceCover: InsuranceCover;
  concierge: boolean;
  golfAccess: GolfAccess | null;
  zeroLiability: boolean;
  instantIssuance: boolean;
  emiConversion: boolean;
  rewardTransfer?: boolean;
  spendAnalytics?: boolean;
}

export interface BasicInfo {
  name: string;
  issuer: string;
  network: CardNetwork[];
  cardType: CardType;
  imageUrl: string;
  applyUrl: string;
  description?: string;
}

export interface CardMetadata {
  sourceUrl: string;
  scrapedAt: string;
  confidence: number;
  manualReview: boolean;
  lastVerified?: string;
}

export interface CreditCard {
  id: string;
  basicInfo: BasicInfo;
  fees: CardFees;
  eligibility: CardEligibility;
  rewards: CardRewards;
  loungeAccess: CardLoungeAccess;
  discountsAndOffers: CardDiscountsAndOffers;
  charges: CardCharges;
  features: CardFeatures;
  metadata: CardMetadata;
}

export interface CardsData {
  version: string;
  lastUpdated: string;
  cards: CreditCard[];
}

// Utility types for filtering
export interface CardFilters {
  issuer?: string[];
  network?: CardNetwork[];
  cardType?: CardType[];
  maxJoiningFee?: number;
  maxAnnualFee?: number;
  minRewardRate?: number;
  hasDomesticLounge?: boolean;
  hasInternationalLounge?: boolean;
  maxMinSalary?: number;
  hasWelcomeBonus?: boolean;
  categories?: string[];
}

// Type for comparison table columns
export type ComparisonColumn = 
  | 'name'
  | 'issuer'
  | 'joiningFee'
  | 'annualFee'
  | 'rewardRate'
  | 'pointValue'
  | 'domesticLounge'
  | 'internationalLounge'
  | 'minSalary'
  | 'foreignTxnFee'
  | 'fuelSurcharge'
  | 'welcomeBonus';
