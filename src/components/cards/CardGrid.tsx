import { useState } from 'react';
import type { CreditCard } from '../../types/card';
import { formatCurrency } from '../../lib/utils';
import { Check, Plane, Percent, Gift, Sparkles } from 'lucide-react';
import { CardDetailModal } from './CardDetailModal';

interface CardGridProps {
  cards: CreditCard[];
  selectedCards: string[];
  onToggleSelect: (cardId: string) => void;
}

function getCardGradient(issuer: string, cardType: string): string {
  const issuerLower = issuer.toLowerCase();
  
  if (issuerLower.includes('hdfc')) return 'from-emerald-900 via-emerald-800 to-teal-900';
  if (issuerLower.includes('icici')) return 'from-slate-800 via-slate-700 to-slate-800';
  if (issuerLower.includes('sbi')) return 'from-blue-900 via-blue-800 to-indigo-900';
  if (issuerLower.includes('axis')) return 'from-purple-900 via-purple-800 to-violet-900';
  if (issuerLower.includes('amex') || issuerLower.includes('american')) return 'from-slate-700 via-slate-600 to-slate-700';
  if (issuerLower.includes('kotak')) return 'from-red-900 via-red-800 to-rose-900';
  if (issuerLower.includes('idfc')) return 'from-cyan-900 via-cyan-800 to-teal-900';
  if (issuerLower.includes('yes')) return 'from-blue-800 via-blue-700 to-sky-800';
  if (issuerLower.includes('rbl')) return 'from-orange-900 via-orange-800 to-amber-900';
  if (issuerLower.includes('indusind')) return 'from-violet-900 via-violet-800 to-purple-900';
  if (issuerLower.includes('hsbc')) return 'from-red-800 via-red-700 to-rose-800';
  if (issuerLower.includes('standard')) return 'from-green-900 via-green-800 to-emerald-900';
  
  // Card type fallback
  if (cardType === 'Super Premium') return 'from-amber-900 via-amber-800 to-yellow-900';
  if (cardType === 'Premium') return 'from-slate-800 via-slate-700 to-zinc-800';
  
  return 'from-slate-900 via-slate-800 to-slate-900';
}

function getCategoryBadge(card: CreditCard): { label: string; color: string } | null {
  // Determine primary category based on card features
  if (card.loungeAccess.international || (card.loungeAccess.domestic?.freeVisits && card.loungeAccess.domestic.freeVisits >= 4)) {
    return { label: 'TRAVEL', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  }
  if (card.rewards.rewardUnit === 'cashback') {
    return { label: 'CASHBACK', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  }
  if (card.rewards.rewardRate >= 3 || card.rewards.welcomeBonus) {
    return { label: 'REWARDS', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
  }
  if (card.discountsAndOffers.platforms.length > 3) {
    return { label: 'SHOPPING', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
  }
  return null;
}

export function CardGrid({ cards, selectedCards, onToggleSelect }: CardGridProps) {
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

  return (
    <>
      {selectedCard && (
        <CardDetailModal 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)} 
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5">
        {cards.map(card => {
          const isSelected = selectedCards.includes(card.id);
          const categoryBadge = getCategoryBadge(card);
          
          return (
            <div
              key={card.id}
              className={`bg-[hsl(var(--card))] rounded-xl sm:rounded-2xl border-2 transition-all duration-200 flex flex-col overflow-hidden card-hover ${
                isSelected 
                  ? 'border-blue-500 shadow-lg shadow-blue-500/10' 
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-light))]'
              }`}
            >
              {/* Card Visual */}
              <div 
                className={`relative h-28 sm:h-32 bg-gradient-to-br ${getCardGradient(card.basicInfo.issuer, card.basicInfo.cardType)} p-3 sm:p-4 cursor-pointer`}
                onClick={() => setSelectedCard(card)}
              >
                {/* Compare Checkbox */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(card.id);
                    }}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                      isSelected 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-black/30 text-white/80 hover:bg-black/50 backdrop-blur-sm'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-white border-white' : 'border-white/50'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />}
                    </div>
                    <span className="hidden xs:inline">Compare</span>
                  </button>
                </div>

                {/* Category Badge */}
                {categoryBadge && (
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold rounded-md border ${categoryBadge.color}`}>
                      {categoryBadge.label}
                    </span>
                  </div>
                )}

                {/* Card Name on Visual */}
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                  <p className="text-white/60 text-[10px] sm:text-xs uppercase tracking-wider mb-0.5">
                    {card.basicInfo.network[0]}
                  </p>
                  <h4 className="text-white font-bold text-xs sm:text-sm tracking-wide truncate">
                    {card.basicInfo.name.split(' ').slice(0, 3).join(' ').toUpperCase()}
                  </h4>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-3 sm:p-4 flex-1 flex flex-col">
                {/* Card Info */}
                <div className="mb-3 sm:mb-4">
                  <h3 
                    className="font-semibold text-white text-xs sm:text-sm leading-snug mb-0.5 sm:mb-1 cursor-pointer hover:text-blue-400 transition-colors line-clamp-1"
                    onClick={() => setSelectedCard(card)}
                  >
                    {card.basicInfo.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))]">
                    {card.basicInfo.issuer} • {card.basicInfo.cardType}
                  </p>
                </div>

                {/* Key Benefits */}
                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 flex-1">
                  {/* Welcome Bonus */}
                  {card.rewards.welcomeBonus && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                      <span className="text-emerald-400 font-medium truncate">
                        {card.rewards.welcomeBonus.points?.toLocaleString() || card.rewards.welcomeBonus.value?.toLocaleString()} {card.rewards.welcomeBonus.points ? 'Bonus Pts' : 'Value'}
                      </span>
                    </div>
                  )}
                  
                  {/* Reward Rate */}
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
                    <span className="text-[hsl(var(--muted-foreground))] truncate">
                      {card.rewards.rewardRate}% {card.rewards.rewardUnit === 'cashback' ? 'Cash Back' : 'Rewards'}
                    </span>
                  </div>

                  {/* Lounge Access */}
                  {(card.loungeAccess.domestic || card.loungeAccess.international) && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <Plane className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
                      <span className="text-[hsl(var(--muted-foreground))] truncate">
                        {card.loungeAccess.domestic?.freeVisits || 0}D / {card.loungeAccess.international?.freeVisits || 0}I Lounges
                      </span>
                    </div>
                  )}
                </div>

                {/* Fee Info */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 py-2.5 sm:py-3 border-t border-[hsl(var(--border))]">
                  <div>
                    <p className="text-[9px] sm:text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Joining</p>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {card.fees.joiningFee === 0 ? (
                        <span className="text-emerald-400">FREE</span>
                      ) : (
                        formatCurrency(card.fees.joiningFee)
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Annual</p>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {card.fees.annualFee === 0 ? (
                        <span className="text-emerald-400">FREE</span>
                      ) : (
                        formatCurrency(card.fees.annualFee)
                      )}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setSelectedCard(card)}
                  className="w-full mt-2 sm:mt-3 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
