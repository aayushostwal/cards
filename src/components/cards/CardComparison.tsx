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
    { id: 'lounge', label: 'Lounge Access' },
    { id: 'charges', label: 'Hidden Charges' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'features', label: 'Features' },
  ];

  const availableCards = allCards.filter(c => !cards.some(sc => sc.id === c.id));

  if (cards.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">No cards selected</h2>
        <p className="text-slate-600 mb-6">Go to "Browse Cards" and select up to 4 cards to compare</p>
      </div>
    );
  }

  const renderComparisonRow = (label: string, getValue: (card: CreditCard) => React.ReactNode, highlight?: 'lower' | 'higher') => {
    const values = cards.map(card => {
      const value = getValue(card);
      return { card, value };
    });

    // Find best value for highlighting
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
        <td className="py-3 px-4 text-sm font-medium text-slate-600 bg-slate-50 w-48">
          {label}
        </td>
        {values.map((v, idx) => (
          <td 
            key={v.card.id} 
            className={`py-3 px-4 text-sm text-center ${
              bestIndex === idx ? 'bg-green-50 text-green-700 font-semibold' : 'text-slate-900'
            }`}
          >
            {v.value}
          </td>
        ))}
        {cards.length < 4 && <td className="py-3 px-4"></td>}
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with selected cards */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(200px,1fr))] border-b border-slate-200">
          <div className="p-4 bg-slate-50 font-semibold text-slate-700">
            Compare Cards
          </div>
          {cards.map(card => (
            <div key={card.id} className="p-4 border-l border-slate-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-500">{card.basicInfo.issuer}</p>
                  <h3 className="font-semibold text-slate-900">{card.basicInfo.name}</h3>
                </div>
                <button
                  onClick={() => onRemoveCard(card.id)}
                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {cards.length < 4 && (
            <div className="p-4 border-l border-slate-200">
              <button
                onClick={() => setShowAddCard(true)}
                className="w-full h-full min-h-[60px] border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                <Plus className="w-5 h-5 mr-1" />
                Add Card
              </button>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        <table className="w-full">
          <tbody>
            {activeCategory === 'fees' && (
              <>
                {renderComparisonRow('Joining Fee', c => 
                  c.fees.joiningFee === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatCurrency(c.fees.joiningFee),
                  'lower'
                )}
                {renderComparisonRow('Joining Fee Waiver', c => c.fees.joiningFeeWaiver || 'None')}
                {renderComparisonRow('Annual Fee', c => 
                  c.fees.annualFee === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatCurrency(c.fees.annualFee),
                  'lower'
                )}
                {renderComparisonRow('Annual Fee Waiver', c => c.fees.annualFeeWaiver || 'None')}
                {renderComparisonRow('Renewal Fee', c => 
                  c.fees.renewalFee === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatCurrency(c.fees.renewalFee),
                  'lower'
                )}
                {renderComparisonRow('Add-on Card Fee', c => 
                  c.fees.addOnCardFee === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatCurrency(c.fees.addOnCardFee),
                  'lower'
                )}
                {renderComparisonRow('Fuel Surcharge Waiver', c => 
                  c.fees.fuelSurchargeWaiver.enabled 
                    ? `Yes (up to ${formatCurrency(c.fees.fuelSurchargeWaiver.maxPerMonth || 0)}/mo)`
                    : 'No'
                )}
              </>
            )}

            {activeCategory === 'rewards' && (
              <>
                {renderComparisonRow('Base Reward Rate', c => `${c.rewards.rewardRate}%`, 'higher')}
                {renderComparisonRow('Reward Type', c => c.rewards.rewardUnit)}
                {renderComparisonRow('Point Value', c => `₹${c.rewards.pointValue}/point`)}
                {renderComparisonRow('Welcome Bonus', c => 
                  c.rewards.welcomeBonus 
                    ? c.rewards.welcomeBonus.value 
                      ? formatCurrency(c.rewards.welcomeBonus.value)
                      : `${c.rewards.welcomeBonus.points} points`
                    : 'None'
                )}
                {renderComparisonRow('Best Category Rate', c => {
                  const maxRate = Math.max(...c.rewards.acceleratedCategories.map(cat => cat.rate), c.rewards.rewardRate);
                  const bestCat = c.rewards.acceleratedCategories.find(cat => cat.rate === maxRate);
                  return bestCat ? `${bestCat.rate}% on ${bestCat.category}` : `${c.rewards.rewardRate}%`;
                }, 'higher')}
                {renderComparisonRow('Milestone Rewards', c => 
                  c.rewards.milestoneRewards.length > 0 
                    ? `${c.rewards.milestoneRewards.length} tier(s)`
                    : 'None'
                )}
              </>
            )}

            {activeCategory === 'lounge' && (
              <>
                {renderComparisonRow('Domestic Lounge', c => 
                  c.loungeAccess.domestic 
                    ? `${c.loungeAccess.domestic.freeVisits}/year`
                    : <span className="text-red-500">No</span>,
                  'higher'
                )}
                {renderComparisonRow('Domestic Program', c => c.loungeAccess.domestic?.program || 'N/A')}
                {renderComparisonRow('International Lounge', c => 
                  c.loungeAccess.international 
                    ? `${c.loungeAccess.international.freeVisits}/year`
                    : <span className="text-red-500">No</span>,
                  'higher'
                )}
                {renderComparisonRow('International Program', c => c.loungeAccess.international?.program || 'N/A')}
                {renderComparisonRow('Guest Access', c => 
                  c.loungeAccess.domestic?.guestAccess || c.loungeAccess.international?.guestAccess
                    ? <span className="text-green-600">Yes</span>
                    : 'No'
                )}
                {renderComparisonRow('Railway Lounge', c => 
                  c.loungeAccess.railwayLounge?.enabled 
                    ? `${c.loungeAccess.railwayLounge.visits}/year`
                    : 'No'
                )}
              </>
            )}

            {activeCategory === 'charges' && (
              <>
                {renderComparisonRow('Interest Rate (APR)', c => formatPercent(c.charges.interestRate.annual), 'lower')}
                {renderComparisonRow('Foreign Txn Fee', c => formatPercent(c.charges.foreignTxnFee), 'lower')}
                {renderComparisonRow('Late Payment Fee', c => formatCurrency(c.charges.lateFee), 'lower')}
                {renderComparisonRow('Over Limit Fee', c => formatCurrency(c.charges.overLimitFee), 'lower')}
                {renderComparisonRow('Cash Advance Fee', c => `${c.charges.cashAdvanceFee.percent}% (min ${formatCurrency(c.charges.cashAdvanceFee.min)})`)}
                {renderComparisonRow('EMI Processing Fee', c => `${c.charges.emiFee.processingPercent}%`)}
                {renderComparisonRow('Card Replacement', c => 
                  c.charges.cardReplacementFee === 0 
                    ? <span className="text-green-600">FREE</span>
                    : formatCurrency(c.charges.cardReplacementFee),
                  'lower'
                )}
              </>
            )}

            {activeCategory === 'eligibility' && (
              <>
                {renderComparisonRow('Min. Monthly Salary', c => 
                  c.eligibility.minSalary 
                    ? formatCurrency(c.eligibility.minSalary)
                    : <span className="text-green-600">No minimum</span>,
                  'lower'
                )}
                {renderComparisonRow('Min. Annual Income (ITR)', c => 
                  c.eligibility.minITR 
                    ? formatCurrency(c.eligibility.minITR)
                    : <span className="text-green-600">No minimum</span>,
                  'lower'
                )}
                {renderComparisonRow('Min. CIBIL Score', c => c.eligibility.minCibilScore || 'N/A', 'lower')}
                {renderComparisonRow('Employment Type', c => c.eligibility.employmentType.join(', '))}
                {renderComparisonRow('Age Range', c => `${c.eligibility.minAge} - ${c.eligibility.maxAge} years`)}
                {renderComparisonRow('Existing Relationship', c => 
                  c.eligibility.existingRelationship 
                    ? <span className="text-amber-600">Required</span>
                    : <span className="text-green-600">Not required</span>
                )}
              </>
            )}

            {activeCategory === 'features' && (
              <>
                {renderComparisonRow('Contactless', c => 
                  c.features.contactless ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
                )}
                {renderComparisonRow('Virtual Card', c => 
                  c.features.virtualCard ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
                )}
                {renderComparisonRow('Instant Issuance', c => 
                  c.features.instantIssuance ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
                )}
                {renderComparisonRow('Concierge Service', c => 
                  c.features.concierge ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
                )}
                {renderComparisonRow('Golf Access', c => 
                  c.features.golfAccess?.enabled 
                    ? `${c.features.golfAccess.freeGames} games`
                    : 'No'
                )}
                {renderComparisonRow('Add-on Cards', c => c.features.addOnCards)}
                {renderComparisonRow('Air Accident Cover', c => 
                  c.features.insuranceCover.airAccident 
                    ? formatCurrency(c.features.insuranceCover.airAccident)
                    : 'None'
                )}
                {renderComparisonRow('Zero Liability', c => 
                  c.features.zeroLiability ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddCard(false)}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Add Card to Compare</h3>
              <button onClick={() => setShowAddCard(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {availableCards.map(card => (
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
                    <p className="font-medium text-slate-900">{card.basicInfo.name}</p>
                  </div>
                  <Plus className="w-5 h-5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
