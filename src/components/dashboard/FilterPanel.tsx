import type { CardFilters, CardNetwork, CardType } from '../../types/card';
import { Gift, CreditCard as CreditCardIcon, BadgeCheck, Sparkles, RotateCcw, Check } from 'lucide-react';

interface FilterPanelProps {
  filters: CardFilters;
  onFiltersChange: (filters: CardFilters) => void;
  isMobile?: boolean;
}

// Custom Checkbox Component for better touch support
function FilterCheckbox({ 
  checked, 
  onChange, 
  label 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void; 
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-full py-2.5 px-1 -mx-1 rounded-lg active:bg-[hsl(var(--secondary))] transition-colors touch-manipulation"
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked 
          ? 'bg-blue-600 border-blue-600' 
          : 'bg-[hsl(var(--secondary))] border-[hsl(var(--border-light))]'
      }`}>
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      <span className={`text-sm transition-colors ${
        checked ? 'text-white' : 'text-[hsl(var(--muted-foreground))]'
      }`}>
        {label}
      </span>
    </button>
  );
}

// Custom Radio Component for better touch support
function FilterRadio({ 
  checked, 
  onChange, 
  label,
}: { 
  checked: boolean; 
  onChange: () => void; 
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-3 w-full py-2.5 px-1 -mx-1 rounded-lg active:bg-[hsl(var(--secondary))] transition-colors touch-manipulation"
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked 
          ? 'border-blue-600' 
          : 'bg-[hsl(var(--secondary))] border-[hsl(var(--border-light))]'
      }`}>
        {checked && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
      </div>
      <span className={`text-sm transition-colors ${
        checked ? 'text-white' : 'text-[hsl(var(--muted-foreground))]'
      }`}>
        {label}
      </span>
    </button>
  );
}

export function FilterPanel({ filters, onFiltersChange, isMobile }: FilterPanelProps) {
  // Get unique values from cards
  const networks: CardNetwork[] = ['Visa', 'Mastercard', 'RuPay', 'Amex'];

  const toggleArrayFilter = <T extends string>(
    key: keyof CardFilters,
    value: T,
    currentValues?: T[]
  ) => {
    const current = currentValues || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({
      ...filters,
      [key]: updated.length > 0 ? updated : undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => 
    v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  );

  const activeFilterCount = Object.values(filters).filter(v => 
    v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  const clearFilters = () => onFiltersChange({});

  // Credit score / Card type mapping
  const creditScoreOptions = [
    { type: 'Super Premium' as CardType, label: 'Excellent (740-850)', desc: 'Super Premium cards' },
    { type: 'Premium' as CardType, label: 'Good (670-739)', desc: 'Premium cards' },
    { type: 'Entry Level' as CardType, label: 'Fair (580-669)', desc: 'Entry Level cards' },
  ];

  return (
    <div className={`${isMobile ? '' : 'bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]'}`}>
      {/* Header - Only show on desktop */}
      {!isMobile && (
        <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Filters</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">35+ parameters</p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1.5 font-medium transition-colors"
            >
              Reset All
            </button>
          )}
        </div>
      )}

      {/* Clear button for mobile */}
      {isMobile && hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full mb-4 text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center gap-2 py-3 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--secondary))] active:bg-[hsl(var(--background-tertiary))] touch-manipulation"
        >
          <RotateCcw className="w-4 h-4" />
          Clear all filters ({activeFilterCount})
        </button>
      )}

      <div className={`space-y-6 ${isMobile ? '' : 'p-4 max-h-[calc(100vh-200px)] overflow-y-auto'}`}>
        
        {/* Reward Categories */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Reward Categories</h3>
          </div>
          <div className="space-y-0.5">
            <FilterCheckbox
              checked={filters.minRewardRate !== undefined && filters.minRewardRate >= 1}
              onChange={(checked) => onFiltersChange({
                ...filters,
                minRewardRate: checked ? 1 : undefined,
              })}
              label="High Cashback (1%+)"
            />
            <FilterCheckbox
              checked={filters.hasTravelRewards || false}
              onChange={(checked) => onFiltersChange({
                ...filters,
                hasTravelRewards: checked || undefined,
              })}
              label="Travel & Miles"
            />
            <FilterCheckbox
              checked={filters.hasDiningRewards || false}
              onChange={(checked) => onFiltersChange({
                ...filters,
                hasDiningRewards: checked || undefined,
              })}
              label="Dining & Entertainment"
            />
            <FilterCheckbox
              checked={filters.hasGroceryRewards || false}
              onChange={(checked) => onFiltersChange({
                ...filters,
                hasGroceryRewards: checked || undefined,
              })}
              label="Grocery & Shopping"
            />
            <FilterCheckbox
              checked={filters.hasFuelSurchargeWaiver || false}
              onChange={(checked) => onFiltersChange({
                ...filters,
                hasFuelSurchargeWaiver: checked || undefined,
              })}
              label="Fuel Surcharge Waiver"
            />
          </div>
        </div>

        {/* Annual Fee */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CreditCardIcon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Annual Fee</h3>
          </div>
          <div className="space-y-0.5">
            <FilterRadio
              checked={filters.maxAnnualFee === 0}
              onChange={() => onFiltersChange({ ...filters, maxAnnualFee: 0 })}
              label="₹0 (No Fee)"
            />
            <FilterRadio
              checked={filters.maxAnnualFee === 500}
              onChange={() => onFiltersChange({ ...filters, maxAnnualFee: 500 })}
              label="Under ₹500"
            />
            <FilterRadio
              checked={filters.maxAnnualFee === 2500}
              onChange={() => onFiltersChange({ ...filters, maxAnnualFee: 2500 })}
              label="Under ₹2,500"
            />
            <FilterRadio
              checked={filters.maxAnnualFee === 10000}
              onChange={() => onFiltersChange({ ...filters, maxAnnualFee: 10000 })}
              label="Premium (₹5,000+)"
            />
          </div>
        </div>

        {/* Credit Score / Card Type */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BadgeCheck className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Credit Score</h3>
          </div>
          <div className="space-y-0.5">
            {creditScoreOptions.map((option) => (
              <FilterCheckbox
                key={option.type}
                checked={filters.cardType?.includes(option.type) || false}
                onChange={() => toggleArrayFilter('cardType', option.type, filters.cardType)}
                label={option.label}
              />
            ))}
          </div>
        </div>

        {/* Key Perks */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Key Perks</h3>
          </div>
          <div className="space-y-0.5">
            <FilterCheckbox
              checked={filters.noForeignFees || false}
              onChange={(checked) => onFiltersChange({
                ...filters,
                noForeignFees: checked || undefined,
              })}
              label="No Foreign Transaction Fees"
            />
            <FilterCheckbox
              checked={filters.hasDomesticLounge || false}
              onChange={(checked) => onFiltersChange({
                ...filters,
                hasDomesticLounge: checked || undefined,
              })}
              label="Airport Lounge Access"
            />
            <FilterCheckbox
              checked={filters.hasPurchaseProtection || false}
              onChange={(checked) => onFiltersChange({
                ...filters,
                hasPurchaseProtection: checked || undefined,
              })}
              label="Purchase Protection"
            />
            <FilterCheckbox
              checked={filters.hasWelcomeBonus || false}
              onChange={(checked) => onFiltersChange({
                ...filters,
                hasWelcomeBonus: checked || undefined,
              })}
              label="Welcome Bonus"
            />
          </div>
        </div>

        {/* Card Network */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Card Network</h3>
          <div className="flex flex-wrap gap-2">
            {networks.map(network => (
              <button
                key={network}
                type="button"
                onClick={() => toggleArrayFilter('network', network, filters.network)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all touch-manipulation active:scale-95 ${
                  filters.network?.includes(network)
                    ? 'bg-blue-600 text-white border border-blue-500'
                    : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--border-light))] hover:text-white'
                }`}
              >
                {network}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
