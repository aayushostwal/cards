import type { CreditCard } from '../../types/card';
import { formatCurrency } from '../../lib/utils';
import { Check, Plus, Plane, Percent, Gift } from 'lucide-react';

interface CardGridProps {
  cards: CreditCard[];
  selectedCards: string[];
  onToggleSelect: (cardId: string) => void;
}

export function CardGrid({ cards, selectedCards, onToggleSelect }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {cards.map(card => {
        const isSelected = selectedCards.includes(card.id);
        
        return (
          <div
            key={card.id}
            className={`bg-white rounded-xl border-2 transition-all hover:shadow-lg ${
              isSelected ? 'border-blue-500 shadow-blue-100' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Card Header */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {card.basicInfo.issuer}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      card.basicInfo.cardType === 'Super Premium' ? 'bg-purple-100 text-purple-700' :
                      card.basicInfo.cardType === 'Premium' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {card.basicInfo.cardType}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg leading-tight">
                    {card.basicInfo.name}
                  </h3>
                  <div className="flex gap-1 mt-2">
                    {card.basicInfo.network.map(net => (
                      <span key={net} className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                        {net}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => onToggleSelect(card.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="p-5 space-y-4">
              {/* Fees */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Joining Fee</p>
                  <p className="font-semibold text-slate-900">
                    {card.fees.joiningFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatCurrency(card.fees.joiningFee)
                    )}
                  </p>
                  {card.fees.joiningFeeWaiver && (
                    <p className="text-xs text-green-600 mt-0.5">Waiver available</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Annual Fee</p>
                  <p className="font-semibold text-slate-900">
                    {card.fees.annualFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatCurrency(card.fees.annualFee)
                    )}
                  </p>
                  {card.fees.annualFeeWaiver && (
                    <p className="text-xs text-green-600 mt-0.5">Waiver available</p>
                  )}
                </div>
              </div>

              {/* Rewards */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Percent className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {card.rewards.rewardRate}% {card.rewards.rewardUnit === 'cashback' ? 'Cashback' : 'Reward Points'}
                  </p>
                  <p className="text-xs text-slate-600">
                    {card.rewards.acceleratedCategories.length > 0 && 
                      `Up to ${Math.max(...card.rewards.acceleratedCategories.map(c => c.rate))}% on select categories`
                    }
                  </p>
                </div>
              </div>

              {/* Welcome Bonus */}
              {card.rewards.welcomeBonus && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Gift className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {card.rewards.welcomeBonus.value 
                        ? `₹${card.rewards.welcomeBonus.value} Welcome Bonus`
                        : `${card.rewards.welcomeBonus.points} Welcome Points`
                      }
                    </p>
                    <p className="text-xs text-slate-600">{card.rewards.welcomeBonus.condition}</p>
                  </div>
                </div>
              )}

              {/* Lounge Access */}
              {(card.loungeAccess.domestic || card.loungeAccess.international) && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Plane className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Lounge Access</p>
                    <p className="text-xs text-slate-600">
                      {card.loungeAccess.domestic && `${card.loungeAccess.domestic.freeVisits} domestic`}
                      {card.loungeAccess.domestic && card.loungeAccess.international && ' • '}
                      {card.loungeAccess.international && `${card.loungeAccess.international.freeVisits} international`}
                      /year
                    </p>
                  </div>
                </div>
              )}

              {/* Eligibility */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Min. Salary Requirement</p>
                <p className="text-sm font-medium text-slate-900">
                  {card.eligibility.minSalary 
                    ? formatCurrency(card.eligibility.minSalary) + '/month'
                    : <span className="text-green-600">No minimum</span>
                  }
                </p>
              </div>

              {/* Key Features Icons */}
              <div className="flex gap-2 flex-wrap">
                {card.features.contactless && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">Contactless</span>
                )}
                {card.features.instantIssuance && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Instant</span>
                )}
                {card.features.concierge && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Concierge</span>
                )}
                {card.features.zeroLiability && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Zero Liability</span>
                )}
              </div>
            </div>

            {/* Apply Button */}
            <div className="p-5 pt-0">
              <a
                href={card.basicInfo.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Apply Now
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
