import type { CreditCard, CardFilters, CardNetwork, CardType } from '../../types/card';
import { Filter, X } from 'lucide-react';

interface FilterPanelProps {
  filters: CardFilters;
  onFiltersChange: (filters: CardFilters) => void;
  cards: CreditCard[];
}

export function FilterPanel({ filters, onFiltersChange, cards }: FilterPanelProps) {
  // Get unique values from cards
  const issuers = [...new Set(cards.map(c => c.basicInfo.issuer))].sort();
  const networks: CardNetwork[] = ['Visa', 'Mastercard', 'RuPay', 'Amex'];
  const cardTypes: CardType[] = ['Entry Level', 'Premium', 'Super Premium'];

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

  const clearFilters = () => onFiltersChange({});

  return (
    <div className="bg-white rounded-xl border border-slate-200 sticky top-24">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-600" />
          <h2 className="font-semibold text-slate-900">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      <div className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Issuer */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">Bank / Issuer</h3>
          <div className="space-y-2">
            {issuers.map(issuer => (
              <label key={issuer} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.issuer?.includes(issuer) || false}
                  onChange={() => toggleArrayFilter('issuer', issuer, filters.issuer)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{issuer}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Card Network */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">Card Network</h3>
          <div className="flex flex-wrap gap-2">
            {networks.map(network => (
              <button
                key={network}
                onClick={() => toggleArrayFilter('network', network, filters.network)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filters.network?.includes(network)
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {network}
              </button>
            ))}
          </div>
        </div>

        {/* Card Type */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">Card Type</h3>
          <div className="space-y-2">
            {cardTypes.map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.cardType?.includes(type) || false}
                  onChange={() => toggleArrayFilter('cardType', type, filters.cardType)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Joining Fee */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">Max Joining Fee</h3>
          <select
            value={filters.maxJoiningFee ?? ''}
            onChange={(e) => onFiltersChange({
              ...filters,
              maxJoiningFee: e.target.value ? Number(e.target.value) : undefined,
            })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any</option>
            <option value="0">Free only</option>
            <option value="500">Up to ₹500</option>
            <option value="1000">Up to ₹1,000</option>
            <option value="2500">Up to ₹2,500</option>
            <option value="5000">Up to ₹5,000</option>
          </select>
        </div>

        {/* Annual Fee */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">Max Annual Fee</h3>
          <select
            value={filters.maxAnnualFee ?? ''}
            onChange={(e) => onFiltersChange({
              ...filters,
              maxAnnualFee: e.target.value ? Number(e.target.value) : undefined,
            })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any</option>
            <option value="0">Free only</option>
            <option value="500">Up to ₹500</option>
            <option value="1000">Up to ₹1,000</option>
            <option value="2500">Up to ₹2,500</option>
            <option value="5000">Up to ₹5,000</option>
          </select>
        </div>

        {/* Min Reward Rate */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">Min Reward Rate</h3>
          <select
            value={filters.minRewardRate ?? ''}
            onChange={(e) => onFiltersChange({
              ...filters,
              minRewardRate: e.target.value ? Number(e.target.value) : undefined,
            })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any</option>
            <option value="1">At least 1%</option>
            <option value="2">At least 2%</option>
            <option value="3">At least 3%</option>
            <option value="5">At least 5%</option>
          </select>
        </div>

        {/* Max Salary Requirement */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">My Salary (Monthly)</h3>
          <select
            value={filters.maxMinSalary ?? ''}
            onChange={(e) => onFiltersChange({
              ...filters,
              maxMinSalary: e.target.value ? Number(e.target.value) : undefined,
            })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any</option>
            <option value="25000">₹25,000</option>
            <option value="50000">₹50,000</option>
            <option value="75000">₹75,000</option>
            <option value="100000">₹1,00,000</option>
            <option value="200000">₹2,00,000+</option>
          </select>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">Features</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasDomesticLounge || false}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  hasDomesticLounge: e.target.checked || undefined,
                })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Domestic Lounge Access</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasInternationalLounge || false}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  hasInternationalLounge: e.target.checked || undefined,
                })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">International Lounge Access</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasWelcomeBonus || false}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  hasWelcomeBonus: e.target.checked || undefined,
                })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Welcome Bonus</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
