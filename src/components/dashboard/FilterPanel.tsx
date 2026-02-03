import type { CardFilters, CardNetwork, CardType } from '../../types/card';
import { Gift, CreditCard as CreditCardIcon, BadgeCheck, Sparkles, RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  filters: CardFilters;
  onFiltersChange: (filters: CardFilters) => void;
  isMobile?: boolean;
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
          className="w-full mb-4 text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center gap-2 py-2.5 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--secondary))]"
        >
          <RotateCcw className="w-4 h-4" />
          Clear all filters ({activeFilterCount})
        </button>
      )}

      <div className={`space-y-6 ${isMobile ? '' : 'p-4 max-h-[calc(100vh-200px)] overflow-y-auto'}`}>
        
        {/* Reward Type */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Reward Type</h3>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.minRewardRate !== undefined && filters.minRewardRate >= 1}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  minRewardRate: e.target.checked ? 1 : undefined,
                })}
                className="w-4 h-4 rounded border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-blue-500 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-[hsl(var(--background))]"
              />
              <span className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-white transition-colors">Cash Back</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.hasDomesticLounge || filters.hasInternationalLounge || false}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  hasDomesticLounge: e.target.checked || undefined,
                  hasInternationalLounge: e.target.checked || undefined,
                })}
                className="w-4 h-4 rounded border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-white transition-colors">Travel & Miles</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={false}
                onChange={() => {}}
                className="w-4 h-4 rounded border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-white transition-colors">Gas & Groceries</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={false}
                onChange={() => {}}
                className="w-4 h-4 rounded border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-white transition-colors">Dining & Entertainment</span>
            </label>
          </div>
        </div>

        {/* Annual Fee */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CreditCardIcon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Annual Fee</h3>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="annualFee"
                checked={filters.maxAnnualFee === 0}
                onChange={() => onFiltersChange({ ...filters, maxAnnualFee: 0 })}
                className="w-4 h-4 border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-white transition-colors">$0 (No Fee)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="annualFee"
                checked={filters.maxAnnualFee === 500}
                onChange={() => onFiltersChange({ ...filters, maxAnnualFee: 500 })}
                className="w-4 h-4 border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-white transition-colors">Under ₹500</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="annualFee"
                checked={filters.maxAnnualFee === 2500}
                onChange={() => onFiltersChange({ ...filters, maxAnnualFee: 2500 })}
                className="w-4 h-4 border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-white transition-colors">Under ₹2,500</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="annualFee"
                checked={filters.maxAnnualFee === undefined && !hasActiveFilters}
                onChange={() => onFiltersChange({ ...filters, maxAnnualFee: undefined })}
                className="w-4 h-4 border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-white transition-colors">Premium (₹5,000+)</span>
            </label>
          </div>
        </div>

        {/* Credit Score / Card Type */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BadgeCheck className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Credit Score</h3>
          </div>
          <div className="space-y-2">
            {creditScoreOptions.map((option) => (
              <label key={option.type} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.cardType?.includes(option.type) || false}
                  onChange={() => toggleArrayFilter('cardType', option.type, filters.cardType)}
                  className="w-4 h-4 rounded border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-white transition-colors">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Key Perks */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Key Perks</h3>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={false}
                onChange={() => {}}
                className="w-4 h-4 rounded border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-white transition-colors">No Foreign Fees</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.hasDomesticLounge || false}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  hasDomesticLounge: e.target.checked || undefined,
                })}
                className="w-4 h-4 rounded border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-white transition-colors">Lounge Access</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={false}
                onChange={() => {}}
                className="w-4 h-4 rounded border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-white transition-colors">Cell Phone Protection</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.hasWelcomeBonus || false}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  hasWelcomeBonus: e.target.checked || undefined,
                })}
                className="w-4 h-4 rounded border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-white transition-colors">Welcome Bonus</span>
            </label>
          </div>
        </div>

        {/* Card Network */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Card Network</h3>
          <div className="flex flex-wrap gap-2">
            {networks.map(network => (
              <button
                key={network}
                onClick={() => toggleArrayFilter('network', network, filters.network)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

      {/* Apply button for mobile */}
      {isMobile && (
        <div className="mt-6 pt-4 border-t border-[hsl(var(--border))]">
          <button
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}
