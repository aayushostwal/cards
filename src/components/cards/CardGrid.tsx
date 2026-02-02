import type { CreditCard } from '../../types/card';
import { formatCurrency } from '../../lib/utils';
import { Check, Plus, Plane, Percent } from 'lucide-react';

interface CardGridProps {
  cards: CreditCard[];
  selectedCards: string[];
  onToggleSelect: (cardId: string) => void;
}

export function CardGrid({ cards, selectedCards, onToggleSelect }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {cards.map(card => {
        const isSelected = selectedCards.includes(card.id);
        
        return (
          <div
            key={card.id}
            className={`bg-white rounded-xl border-2 transition-all hover:shadow-md flex flex-col h-full ${
              isSelected ? 'border-blue-500 shadow-blue-100 shadow-md' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Card Header */}
            <div className="p-4 flex-1">
              {/* Top Row: Type Badge & Select */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {card.basicInfo.issuer.split(' ')[0]}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    card.basicInfo.cardType === 'Super Premium' ? 'bg-purple-100 text-purple-700' :
                    card.basicInfo.cardType === 'Premium' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {card.basicInfo.cardType === 'Entry Level' ? 'Entry' : card.basicInfo.cardType}
                  </span>
                </div>
                <button
                  onClick={() => onToggleSelect(card.id)}
                  className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>

              {/* Card Name */}
              <h3 className="font-semibold text-slate-900 text-sm leading-tight mb-3 line-clamp-2">
                {card.basicInfo.name}
              </h3>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-slate-500">Joining</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {card.fees.joiningFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatCurrency(card.fees.joiningFee)
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Annual</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {card.fees.annualFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatCurrency(card.fees.annualFee)
                    )}
                  </p>
                </div>
              </div>

              {/* Reward & Lounge Row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Reward Rate */}
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md">
                  <Percent className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">
                    {card.rewards.rewardRate}% {card.rewards.rewardUnit === 'cashback' ? 'CB' : 'RP'}
                  </span>
                </div>

                {/* Lounge Access */}
                {(card.loungeAccess.domestic || card.loungeAccess.international) && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-md">
                    <Plane className="w-3 h-3 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">
                      {card.loungeAccess.domestic ? `${card.loungeAccess.domestic.freeVisits}D` : ''}
                      {card.loungeAccess.domestic && card.loungeAccess.international ? '/' : ''}
                      {card.loungeAccess.international ? `${card.loungeAccess.international.freeVisits}I` : ''}
                    </span>
                  </div>
                )}

                {/* Min Salary */}
                {card.eligibility.minSalary && (
                  <span className="text-xs text-slate-500">
                    ₹{Math.round(card.eligibility.minSalary/1000)}k+
                  </span>
                )}
              </div>
            </div>

            {/* Apply Button */}
            <div className="p-3 pt-0">
              <a
                href={card.basicInfo.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Apply
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
