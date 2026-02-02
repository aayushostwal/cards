import type { CreditCard } from '../../types/card';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { X, Plus, Check, AlertCircle, Info } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Feature descriptions for info tooltips
const featureDescriptions: Record<string, string> = {
  // Fees
  'Joining Fee': 'One-time fee charged when you first get the card. Some cards waive this based on spending.',
  'Joining Waiver': 'Conditions under which the joining fee can be waived, usually based on initial spending.',
  'Annual Fee': 'Yearly fee charged to maintain the card. Premium cards typically have higher fees.',
  'Annual Waiver': 'Conditions to waive the annual fee, typically based on yearly spending thresholds.',
  'Fuel Surcharge': 'Maximum monthly savings on fuel surcharge waiver. Banks waive the 1-2.5% surcharge at fuel stations.',
  
  // Rewards
  'Base Rate': 'Standard reward rate on all purchases. Higher is better for regular spending.',
  'Type': 'The reward currency - Points (redeemable for products/travel), Cashback (direct credit), or Miles (air miles).',
  'Point Value': 'Monetary value of each reward point when redeemed. Actual value may vary by redemption method.',
  'Welcome Bonus': 'One-time bonus rewards given when you meet initial spending requirements after card approval.',
  'Best Category': 'Highest reward rate available on any spending category for this card.',
  
  // Lounge
  'Domestic': 'Number of domestic airport lounge visits per year included with the card.',
  'Dom. Spend Req': 'Minimum spend required to unlock domestic lounge visits. "Free" means complimentary without any spend requirement.',
  'International': 'Number of international airport lounge visits per year included with the card.',
  'Intl. Spend Req': 'Minimum spend required to unlock international lounge visits. "Free" means complimentary without any spend requirement.',
  'Program': 'Lounge access network - Priority Pass, Dreamfolks, or bank-specific programs.',
  'Guest': 'Whether you can bring guests to the lounge (may have additional charges).',
  
  // Charges
  'APR': 'Annual Percentage Rate - interest charged on unpaid balances. Lower is better. Avoid carrying balances.',
  'Foreign Txn': 'Fee charged on international transactions or purchases in foreign currency. Lower is better for travelers.',
  'Late Fee': 'Penalty charged if you miss the payment due date. Always pay at least minimum due on time.',
  'Cash Advance': 'Fee for withdrawing cash using your credit card. Avoid cash advances - they also have higher interest.',
  'EMI Fee': 'Processing fee charged when converting purchases to EMI. Usually 1-2% of the transaction amount.',
  
  // Eligibility
  'Min Salary': 'Minimum monthly income required for salaried individuals to apply for this card.',
  'Min ITR': 'Minimum annual income tax return required for self-employed individuals.',
  'Min CIBIL': 'Minimum credit score required. 750+ is considered good. Higher scores get better approval odds.',
  'Age': 'Eligible age range for primary cardholders.',
  
  // Features
  'Contactless': 'Tap-to-pay feature for quick transactions under ₹5,000 without entering PIN.',
  'Virtual Card': 'Instant digital card for online shopping before physical card arrives.',
  'Instant Issue': 'Get a working card number instantly after approval, without waiting for physical delivery.',
  'Concierge': '24/7 personal assistance for travel bookings, restaurant reservations, and lifestyle services.',
  'Insurance': 'Complimentary air accident insurance cover provided with the card.',
};

interface CardComparisonProps {
  cards: CreditCard[];
  allCards: CreditCard[];
  onRemoveCard: (cardId: string) => void;
  onAddCard: (cardId: string) => void;
}

type ComparisonCategory = 'fees' | 'rewards' | 'lounge' | 'charges' | 'eligibility' | 'features';

// Tooltip component that renders via portal
function InfoTooltip({ 
  label, 
  description, 
  buttonRef, 
  onClose 
}: { 
  label: string; 
  description: string; 
  buttonRef: React.RefObject<HTMLButtonElement | null>; 
  onClose: () => void;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
    }
  }, [buttonRef]);

  return createPortal(
    <div 
      className="fixed z-[9999] w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-2xl leading-relaxed"
      style={{ 
        top: position.top, 
        left: position.left,
        transform: 'translateY(-50%)',
      }}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={onClose}
    >
      <div className="font-semibold mb-1 text-sm">{label}</div>
      <div className="text-slate-200">{description}</div>
      <div 
        className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-slate-800 rotate-45"
      />
    </div>,
    document.body
  );
}

export function CardComparison({ cards, allCards, onRemoveCard, onAddCard }: CardComparisonProps) {
  const [activeCategory, setActiveCategory] = useState<ComparisonCategory>('fees');
  const [showAddCard, setShowAddCard] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const tooltipButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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

  // Color palette for card columns
  const cardColors = [
    { bg: 'bg-blue-50', header: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-900' },
    { bg: 'bg-purple-50', header: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-900' },
    { bg: 'bg-amber-50', header: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-900' },
    { bg: 'bg-emerald-50', header: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-900' },
  ];

  const renderTableHeader = () => (
    <thead className="sticky top-0 z-10">
      <tr>
        <th className="py-3 sm:py-4 px-3 sm:px-4 text-left text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 sticky left-0 z-20 min-w-[120px] sm:min-w-[150px] border-b-2 border-slate-200">
          Feature
        </th>
        {cards.map((card, idx) => (
          <th 
            key={card.id}
            className={`py-3 sm:py-4 px-3 sm:px-4 text-center min-w-[140px] sm:min-w-[180px] border-b-2 ${cardColors[idx % cardColors.length].header} ${cardColors[idx % cardColors.length].border} ${cardColors[idx % cardColors.length].text}`}
          >
            <div className="font-semibold text-xs sm:text-sm leading-tight">{card.basicInfo.name}</div>
            <div className="text-[10px] sm:text-xs opacity-75 mt-0.5">{card.basicInfo.issuer}</div>
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderComparisonRow = (label: string, getValue: (card: CreditCard) => React.ReactNode, highlight?: 'lower' | 'higher', isLast?: boolean) => {
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
        if (typeof v.value === 'string' && v.value.includes('%')) {
          return parseFloat(v.value.replace('%', ''));
        }
        if (typeof v.value === 'string' && v.value.includes('/yr')) {
          return parseFloat(v.value.replace('/yr', ''));
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

    const description = featureDescriptions[label];
    
    return (
      <tr className={`${!isLast ? 'border-b border-slate-100' : ''} hover:bg-slate-50/50 transition-colors`}>
        <td className="py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 bg-white sticky left-0 z-[5] min-w-[120px] sm:min-w-[150px] border-r border-slate-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-1.5">
            <span>{label}</span>
            {description && (
              <>
                <button
                  ref={(el) => { tooltipButtonRefs.current[label] = el; }}
                  onClick={() => setActiveTooltip(activeTooltip === label ? null : label)}
                  onMouseEnter={() => setActiveTooltip(label)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="p-0.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                  aria-label={`Info about ${label}`}
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                {activeTooltip === label && (
                  <InfoTooltip
                    label={label}
                    description={description}
                    buttonRef={{ current: tooltipButtonRefs.current[label] }}
                    onClose={() => setActiveTooltip(null)}
                  />
                )}
              </>
            )}
          </div>
        </td>
        {values.map((v, idx) => {
          const colorScheme = cardColors[idx % cardColors.length];
          const isBest = bestIndex === idx;
          return (
            <td 
              key={v.card.id} 
              className={`py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm text-center min-w-[140px] sm:min-w-[180px] ${
                isBest 
                  ? 'bg-green-100 text-green-800 font-semibold' 
                  : `${colorScheme.bg} ${colorScheme.text}`
              } ${idx < values.length - 1 ? 'border-r border-slate-200/60' : ''}`}
            >
              {v.value}
            </td>
          );
        })}
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
        <div className="overflow-x-auto max-h-[60vh]">
          <table className="w-full border-collapse">
            {renderTableHeader()}
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
                      : 'No',
                    undefined, true
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
                  }, 'higher', true)}
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
                  {renderComparisonRow('Dom. Spend Req', c => {
                    if (!c.loungeAccess.domestic) return <span className="text-slate-400">N/A</span>;
                    const sr = c.loungeAccess.domestic.spendRequired;
                    if (!sr) return <span className="text-green-600 font-medium">Free</span>;
                    return (
                      <span className="text-amber-700">
                        ₹{(sr.amount/1000).toFixed(0)}k/{sr.period.slice(0,3)}
                      </span>
                    );
                  })}
                  {renderComparisonRow('International', c => 
                    c.loungeAccess.international 
                      ? `${c.loungeAccess.international.freeVisits}/yr`
                      : <span className="text-red-500">No</span>,
                    'higher'
                  )}
                  {renderComparisonRow('Intl. Spend Req', c => {
                    if (!c.loungeAccess.international) return <span className="text-slate-400">N/A</span>;
                    const sr = c.loungeAccess.international.spendRequired;
                    if (!sr) return <span className="text-green-600 font-medium">Free</span>;
                    return (
                      <span className="text-amber-700">
                        ₹{(sr.amount/1000).toFixed(0)}k/{sr.period.slice(0,3)}
                      </span>
                    );
                  })}
                  {renderComparisonRow('Program', c => c.loungeAccess.domestic?.program || c.loungeAccess.international?.program || 'N/A')}
                  {renderComparisonRow('Guest', c => 
                    c.loungeAccess.domestic?.guestAccess || c.loungeAccess.international?.guestAccess
                      ? <span className="text-green-600">Yes</span>
                      : 'No',
                    undefined, true
                  )}
                </>
              )}

              {activeCategory === 'charges' && (
                <>
                  {renderComparisonRow('APR', c => formatPercent(c.charges.interestRate.annual), 'lower')}
                  {renderComparisonRow('Foreign Txn', c => formatPercent(c.charges.foreignTxnFee), 'lower')}
                  {renderComparisonRow('Late Fee', c => formatCurrency(c.charges.lateFee), 'lower')}
                  {renderComparisonRow('Cash Advance', c => `${c.charges.cashAdvanceFee.percent}%`)}
                  {renderComparisonRow('EMI Fee', c => `${c.charges.emiFee.processingPercent}%`, undefined, true)}
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
                  {renderComparisonRow('Age', c => `${c.eligibility.minAge}-${c.eligibility.maxAge}`, undefined, true)}
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
                      : 'None',
                    undefined, true
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
            <span>Best value</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-50 border border-blue-200"></div>
            <div className="w-3 h-3 rounded bg-purple-50 border border-purple-200"></div>
            <div className="w-3 h-3 rounded bg-amber-50 border border-amber-200"></div>
            <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200"></div>
            <span>Card columns</span>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4" onClick={() => setShowAddCard(false)}>
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
