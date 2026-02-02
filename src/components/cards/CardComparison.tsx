import type { CreditCard } from '../../types/card';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { X, Plus, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface CardComparisonProps {
  cards: CreditCard[];
  allCards: CreditCard[];
  onRemoveCard: (cardId: string) => void;
  onAddCard: (cardId: string) => void;
}

type ComparisonCategory = 'fees' | 'rewards' | 'lounge' | 'charges' | 'eligibility' | 'features';

export function CardComparison({ cards, allCards, onRemoveCard, onAddCard }: CardComparisonProps) {
  const [activeCategory, setActiveCategory] = useState<ComparisonCategory>('fees');
  const [showAddCard, setShowAddCard] = useState(false);

  const categories: { id: ComparisonCategory; label: string }[] = [
    { id: 'fees', label: 'Fees' },
    { id: 'rewards', label: 'Rewards' },
    { id: 'lounge', label: 'Lounge' },
    { id: 'charges', label: 'Charges' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'features', label: 'Features' },
  ];

  const availableCards = allCards.filter(c => !cards.some(sc => sc.id === c.id));

  if (cards.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="bg-slate-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">No cards selected</h2>
        <p className="text-sm sm:text-base text-slate-600 mb-6 px-4">Go to "Browse" and select up to 4 cards to compare</p>
        <button
          onClick={() => setShowAddCard(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Add Cards
        </button>
      </div>
    );
  }

  const renderComparisonRow = (label: string, getValue: (card: CreditCard) => React.ReactNode, highlight?: 'lower' | 'higher') => {
    const values = cards.map(card => {
      const value = getValue(card);
      return { card, value };
    });

    let bestIndex = -1;
    if (highlight) {
      const numericValues = values.map(v => {
        if (typeof v.value === 'number') return v.value;
        if (typeof v.value === 'string' && v.value.includes('₹')) {
          return parseFloat(v.value.replace(/[₹,]/g, ''));
        }
        return null;
      });
      
      const validValues = numericValues.filter(v => v !== null) as number[];
      if (validValues.length > 0) {
        const bestValue = highlight === 'lower' 
          ? Math.min(...validValues)
          : Math.max(...validValues);
        bestIndex = numericValues.findIndex(v => v === bestValue);
      }
    }

    return (
      <tr className="border-b border-slate-100">
        <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-600 bg-slate-50 sticky left-0 min-w-[120px] sm:min-w-[150px]">
          {label}
        </td>
        {values.map((v, idx) => (
          <td 
            key={v.card.id} 
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-center min-w-[120px] sm:min-w-[150px] ${
              bestIndex === idx ? 'bg-green-50 text-green-700 font-semibold' : 'text-slate-900'
            }`}
          >
            {v.value}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Selected Cards Header */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {cards.map(card => (
          <div key={card.id} className="bg-white rounded-lg border border-slate-200 p-3 min-w-[140px] sm:min-w-[180px] shrink-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-slate-500 truncate">{card.basicInfo.issuer}</p>
                <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2">{card.basicInfo.name}</h3>
              </div>
              <button
                onClick={() => onRemoveCard(card.id)}
                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {cards.length < 4 && (
          <button
            onClick={() => setShowAddCard(true)}
            className="min-w-[140px] sm:min-w-[180px] h-[72px] border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors shrink-0"
          >
            <Plus className="w-5 h-5 mr-1" />
            <span className="text-sm">Add</span>
          </button>
        )}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Category Tabs */}
        <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {activeCategory === 'fees' && (
                <>
                  {renderComparisonRow('Joining Fee', c => 
                    c.fees.joiningFee === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatCurrency(c.fees.joiningFee),
                    'lower'
                  )}
                  {renderComparisonRow('Joining Waiver', c => c.fees.joiningFeeWaiver || 'None')}
                  {renderComparisonRow('Annual Fee', c => 
                    c.fees.annualFee === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatCurrency(c.fees.annualFee),
                    'lower'
                  )}
                  {renderComparisonRow('Annual Waiver', c => c.fees.annualFeeWaiver || 'None')}
                  {renderComparisonRow('Fuel Surcharge', c => 
                    c.fees.fuelSurchargeWaiver.enabled 
                      ? `₹${c.fees.fuelSurchargeWaiver.maxPerMonth || 0}/mo`
                      : 'No'
                  )}
                </>
              )}

              {activeCategory === 'rewards' && (
                <>
                  {renderComparisonRow('Base Rate', c => `${c.rewards.rewardRate}%`, 'higher')}
                  {renderComparisonRow('Type', c => c.rewards.rewardUnit)}
                  {renderComparisonRow('Point Value', c => `₹${c.rewards.pointValue}`)}
                  {renderComparisonRow('Welcome Bonus', c => 
                    c.rewards.welcomeBonus 
                      ? c.rewards.welcomeBonus.value 
                        ? formatCurrency(c.rewards.welcomeBonus.value)
                        : `${c.rewards.welcomeBonus.points} pts`
                      : 'None'
                  )}
                  {renderComparisonRow('Best Category', c => {
                    const maxRate = Math.max(...c.rewards.acceleratedCategories.map(cat => cat.rate), c.rewards.rewardRate);
                    const bestCat = c.rewards.acceleratedCategories.find(cat => cat.rate === maxRate);
                    return bestCat ? `${bestCat.rate}%` : `${c.rewards.rewardRate}%`;
                  }, 'higher')}
                </>
              )}

              {activeCategory === 'lounge' && (
                <>
                  {renderComparisonRow('Domestic', c => 
                    c.loungeAccess.domestic 
                      ? `${c.loungeAccess.domestic.freeVisits}/yr`
                      : <span className="text-red-500">No</span>,
                    'higher'
                  )}
                  {renderComparisonRow('International', c => 
                    c.loungeAccess.international 
                      ? `${c.loungeAccess.international.freeVisits}/yr`
                      : <span className="text-red-500">No</span>,
                    'higher'
                  )}
                  {renderComparisonRow('Program', c => c.loungeAccess.domestic?.program || c.loungeAccess.international?.program || 'N/A')}
                  {renderComparisonRow('Guest', c => 
                    c.loungeAccess.domestic?.guestAccess || c.loungeAccess.international?.guestAccess
                      ? <span className="text-green-600">Yes</span>
                      : 'No'
                  )}
                </>
              )}

              {activeCategory === 'charges' && (
                <>
                  {renderComparisonRow('APR', c => formatPercent(c.charges.interestRate.annual), 'lower')}
                  {renderComparisonRow('Foreign Txn', c => formatPercent(c.charges.foreignTxnFee), 'lower')}
                  {renderComparisonRow('Late Fee', c => formatCurrency(c.charges.lateFee), 'lower')}
                  {renderComparisonRow('Cash Advance', c => `${c.charges.cashAdvanceFee.percent}%`)}
                  {renderComparisonRow('EMI Fee', c => `${c.charges.emiFee.processingPercent}%`)}
                </>
              )}

              {activeCategory === 'eligibility' && (
                <>
                  {renderComparisonRow('Min Salary', c => 
                    c.eligibility.minSalary 
                      ? `₹${Math.round(c.eligibility.minSalary/1000)}k`
                      : <span className="text-green-600">None</span>,
                    'lower'
                  )}
                  {renderComparisonRow('Min ITR', c => 
                    c.eligibility.minITR 
                      ? `₹${Math.round(c.eligibility.minITR/100000)}L`
                      : <span className="text-green-600">None</span>,
                    'lower'
                  )}
                  {renderComparisonRow('Min CIBIL', c => c.eligibility.minCibilScore || 'N/A', 'lower')}
                  {renderComparisonRow('Age', c => `${c.eligibility.minAge}-${c.eligibility.maxAge}`)}
                </>
              )}

              {activeCategory === 'features' && (
                <>
                  {renderComparisonRow('Contactless', c => 
                    c.features.contactless ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-red-400 mx-auto" />
                  )}
                  {renderComparisonRow('Virtual Card', c => 
                    c.features.virtualCard ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-red-400 mx-auto" />
                  )}
                  {renderComparisonRow('Instant Issue', c => 
                    c.features.instantIssuance ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-red-400 mx-auto" />
                  )}
                  {renderComparisonRow('Concierge', c => 
                    c.features.concierge ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-red-400 mx-auto" />
                  )}
                  {renderComparisonRow('Insurance', c => 
                    c.features.insuranceCover.airAccident 
                      ? `₹${Math.round(c.features.insuranceCover.airAccident/100000)}L`
                      : 'None'
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setShowAddCard(false)}>
          <div 
            className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md max-h-[80vh] overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Add Card to Compare</h3>
              <button onClick={() => setShowAddCard(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {availableCards.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No more cards available</p>
              ) : (
                availableCards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => {
                      onAddCard(card.id);
                      setShowAddCard(false);
                    }}
                    className="w-full text-left p-3 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs text-slate-500">{card.basicInfo.issuer}</p>
                      <p className="font-medium text-slate-900 text-sm">{card.basicInfo.name}</p>
                    </div>
                    <Plus className="w-5 h-5 text-slate-400" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
