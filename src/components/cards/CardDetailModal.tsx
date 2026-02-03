import type { CreditCard } from '../../types/card';
import { formatCurrency } from '../../lib/utils';
import { 
  X, 
  CreditCard as CardIcon, 
  Percent, 
  Plane, 
  Gift, 
  Shield, 
  Banknote,
  Users,
  Fuel,
  Globe,
  Clock,
  CheckCircle,
  ExternalLink,
  Smartphone,
  Sparkles,
  Target
} from 'lucide-react';

interface CardDetailModalProps {
  card: CreditCard;
  onClose: () => void;
}

export function CardDetailModal({ card, onClose }: CardDetailModalProps) {
  const handleApply = () => {
    window.open(card.basicInfo.applyUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-[hsl(var(--background))] rounded-t-2xl sm:rounded-2xl max-w-3xl w-full max-h-[90vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-[hsl(var(--border))]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center shrink-0 border border-white/20">
              <CardIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0 pr-6 sm:pr-8">
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20">
                  {card.basicInfo.issuer}
                </span>
                <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20">
                  {card.basicInfo.network.join(' / ')}
                </span>
                <span className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full ${
                  card.basicInfo.cardType === 'Super Premium' ? 'bg-purple-400/30' :
                  card.basicInfo.cardType === 'Premium' ? 'bg-amber-400/30' :
                  'bg-green-400/30'
                }`}>
                  {card.basicInfo.cardType}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold line-clamp-2">{card.basicInfo.name}</h2>
              {card.basicInfo.description && (
                <p className="text-white/80 text-xs sm:text-sm mt-1 line-clamp-2 hidden sm:block">{card.basicInfo.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-6">
          <div className="grid gap-4 sm:gap-6">
            
            {/* Fees Section */}
            <section>
              <h3 className="text-xs sm:text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Fees
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-2.5 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] mb-0.5 sm:mb-1">Joining Fee</p>
                  <p className="text-sm sm:text-lg font-bold text-white">
                    {card.fees.joiningFee === 0 ? <span className="text-emerald-400">FREE</span> : formatCurrency(card.fees.joiningFee)}
                  </p>
                  {card.fees.joiningFeeWaiver && (
                    <p className="text-[10px] sm:text-xs text-emerald-400 mt-0.5 sm:mt-1 hidden sm:block">{card.fees.joiningFeeWaiver}</p>
                  )}
                </div>
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-2.5 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] mb-0.5 sm:mb-1">Annual Fee</p>
                  <p className="text-sm sm:text-lg font-bold text-white">
                    {card.fees.annualFee === 0 ? <span className="text-emerald-400">FREE</span> : formatCurrency(card.fees.annualFee)}
                  </p>
                  {card.fees.annualFeeWaiver && (
                    <p className="text-xs text-emerald-400 mt-1">{card.fees.annualFeeWaiver}</p>
                  )}
                </div>
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Renewal Fee</p>
                  <p className="text-lg font-bold text-white">
                    {card.fees.renewalFee === 0 ? <span className="text-emerald-400">FREE</span> : formatCurrency(card.fees.renewalFee)}
                  </p>
                </div>
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Add-on Card</p>
                  <p className="text-lg font-bold text-white">
                    {card.fees.addOnCardFee === 0 ? <span className="text-emerald-400">FREE</span> : formatCurrency(card.fees.addOnCardFee)}
                  </p>
                </div>
              </div>
              {card.fees.fuelSurchargeWaiver.enabled && (
                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
                  <Fuel className="w-4 h-4" />
                  Fuel surcharge waiver up to {formatCurrency(card.fees.fuelSurchargeWaiver.maxPerMonth || 0)}/month
                </div>
              )}
            </section>

            {/* Rewards Section */}
            <section>
              <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4" /> Rewards
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-xs text-blue-400 mb-1">Base Reward Rate</p>
                  <p className="text-xl font-bold text-blue-400">
                    {card.rewards.rewardRate}% <span className="text-sm font-normal">{card.rewards.rewardUnit}</span>
                  </p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-xs text-blue-400 mb-1">Point Value</p>
                  <p className="text-xl font-bold text-blue-400">
                    {formatCurrency(card.rewards.pointValue)} <span className="text-sm font-normal">/point</span>
                  </p>
                </div>
                {card.rewards.welcomeBonus && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 col-span-2 sm:col-span-1">
                    <p className="text-xs text-amber-400 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Welcome Bonus
                    </p>
                    <p className="text-lg font-bold text-amber-400">
                      {card.rewards.welcomeBonus.value 
                        ? formatCurrency(card.rewards.welcomeBonus.value)
                        : `${card.rewards.welcomeBonus.points?.toLocaleString()} pts`}
                    </p>
                    <p className="text-xs text-amber-400/70 mt-1">{card.rewards.welcomeBonus.condition}</p>
                  </div>
                )}
              </div>

              {/* Accelerated Categories */}
              {card.rewards.acceleratedCategories.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2">Accelerated Rewards</p>
                  <div className="flex flex-wrap gap-2">
                    {card.rewards.acceleratedCategories.map((cat, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-full text-sm">
                        <Percent className="w-3 h-3 text-blue-400" />
                        <span className="font-medium text-blue-400">{cat.rate}%</span>
                        <span className="text-[hsl(var(--muted-foreground))]">{cat.category}</span>
                        {cat.cap && <span className="text-[hsl(var(--muted-foreground))] text-xs">(cap {formatCurrency(cat.cap)})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestone Rewards */}
              {card.rewards.milestoneRewards.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2">Milestone Rewards</p>
                  <div className="space-y-2">
                    {card.rewards.milestoneRewards.map((milestone, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm bg-[hsl(var(--card))] border border-[hsl(var(--border))] px-3 py-2 rounded-lg">
                        <Target className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className="text-[hsl(var(--muted-foreground))]">Spend {formatCurrency(milestone.spend)} {milestone.period}</span>
                        <span className="text-[hsl(var(--muted-foreground))]">→</span>
                        <span className="font-medium text-white">{milestone.reward}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Lounge Access */}
            {(card.loungeAccess.domestic || card.loungeAccess.international) && (
              <section>
                <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Plane className="w-4 h-4" /> Lounge Access
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {card.loungeAccess.domestic && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <p className="text-xs text-purple-400 mb-1">Domestic Lounges</p>
                      <p className="text-xl font-bold text-purple-400">
                        {card.loungeAccess.domestic.freeVisits} <span className="text-sm font-normal">visits/year</span>
                      </p>
                      <p className="text-xs text-purple-400/70 mt-1">{card.loungeAccess.domestic.program}</p>
                      {card.loungeAccess.domestic.spendRequired ? (
                        <div className="mt-2 pt-2 border-t border-purple-500/20">
                          <p className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded inline-block">
                            Spend {formatCurrency(card.loungeAccess.domestic.spendRequired.amount)}/{card.loungeAccess.domestic.spendRequired.period} → {card.loungeAccess.domestic.spendRequired.visitsUnlocked} visit{card.loungeAccess.domestic.spendRequired.visitsUnlocked > 1 ? 's' : ''}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-400 mt-2 font-medium">✓ Complimentary (no spend required)</p>
                      )}
                    </div>
                  )}
                  {card.loungeAccess.international && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <p className="text-xs text-purple-400 mb-1">International Lounges</p>
                      <p className="text-xl font-bold text-purple-400">
                        {card.loungeAccess.international.freeVisits} <span className="text-sm font-normal">visits/year</span>
                      </p>
                      <p className="text-xs text-purple-400/70 mt-1">{card.loungeAccess.international.program}</p>
                      {card.loungeAccess.international.spendRequired ? (
                        <div className="mt-2 pt-2 border-t border-purple-500/20">
                          <p className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded inline-block">
                            Spend {formatCurrency(card.loungeAccess.international.spendRequired.amount)}/{card.loungeAccess.international.spendRequired.period} → {card.loungeAccess.international.spendRequired.visitsUnlocked} visit{card.loungeAccess.international.spendRequired.visitsUnlocked > 1 ? 's' : ''}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-400 mt-2 font-medium">✓ Complimentary (no spend required)</p>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Eligibility */}
            <section>
              <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" /> Eligibility
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {card.eligibility.minSalary && (
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Min. Salary</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(card.eligibility.minSalary)}/mo</p>
                  </div>
                )}
                {card.eligibility.minCibilScore && (
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Min. CIBIL</p>
                    <p className="text-lg font-bold text-white">{card.eligibility.minCibilScore}+</p>
                  </div>
                )}
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Age</p>
                  <p className="text-lg font-bold text-white">{card.eligibility.minAge} - {card.eligibility.maxAge} yrs</p>
                </div>
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Employment</p>
                  <p className="text-sm font-medium text-white">{card.eligibility.employmentType.join(', ')}</p>
                </div>
              </div>
            </section>

            {/* Charges */}
            <section>
              <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Charges
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Interest Rate</p>
                  <p className="text-lg font-bold text-white">{card.charges.interestRate.monthly}%/mo</p>
                </div>
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Forex Markup
                  </p>
                  <p className="text-lg font-bold text-white">{card.charges.foreignTxnFee}%</p>
                </div>
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Late Fee</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(card.charges.lateFee)}</p>
                </div>
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Cash Advance</p>
                  <p className="text-sm font-bold text-white">{card.charges.cashAdvanceFee.percent}%</p>
                </div>
              </div>
            </section>

            {/* Features */}
            <section>
              <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {card.features.contactless && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm">
                    <Smartphone className="w-4 h-4" /> Contactless
                  </span>
                )}
                {card.features.virtualCard && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" /> Virtual Card
                  </span>
                )}
                {card.features.zeroLiability && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm">
                    <Shield className="w-4 h-4" /> Zero Liability
                  </span>
                )}
                {card.features.concierge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" /> Concierge
                  </span>
                )}
                {card.features.emiConversion && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" /> EMI Conversion
                  </span>
                )}
                {card.features.instantIssuance && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" /> Instant Issuance
                  </span>
                )}
                {card.features.addOnCards > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] rounded-full text-sm">
                    <Users className="w-4 h-4" /> {card.features.addOnCards} Add-on Cards
                  </span>
                )}
                {card.features.golfAccess?.enabled && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" /> Golf: {card.features.golfAccess.freeGames} games
                  </span>
                )}
              </div>

              {/* Insurance */}
              {(card.features.insuranceCover.airAccident || card.features.insuranceCover.lostCard || card.features.insuranceCover.purchaseProtection) && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2">Insurance Coverage</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {card.features.insuranceCover.airAccident && (
                      <div className="text-sm">
                        <span className="text-[hsl(var(--muted-foreground))]">Air Accident:</span>{' '}
                        <span className="font-medium text-white">{formatCurrency(card.features.insuranceCover.airAccident)}</span>
                      </div>
                    )}
                    {card.features.insuranceCover.lostCard && (
                      <div className="text-sm">
                        <span className="text-[hsl(var(--muted-foreground))]">Lost Card:</span>{' '}
                        <span className="font-medium text-white">{formatCurrency(card.features.insuranceCover.lostCard)}</span>
                      </div>
                    )}
                    {card.features.insuranceCover.purchaseProtection && (
                      <div className="text-sm">
                        <span className="text-[hsl(var(--muted-foreground))]">Purchase:</span>{' '}
                        <span className="font-medium text-white">{formatCurrency(card.features.insuranceCover.purchaseProtection)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Offers Section */}
            {card.discountsAndOffers.platforms.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Percent className="w-4 h-4" /> Partner Offers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {card.discountsAndOffers.platforms.slice(0, 6).map((platform, i) => (
                    <div key={i} className="flex items-center justify-between bg-[hsl(var(--card))] border border-[hsl(var(--border))] px-4 py-3 rounded-lg">
                      <span className="font-medium text-white">{platform.name}</span>
                      <span className="text-sm text-blue-400 font-medium">{platform.discount}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer with Apply Button */}
        <div className="border-t border-[hsl(var(--border))] p-4 bg-[hsl(var(--card))] shrink-0">
          <button
            onClick={handleApply}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25"
          >
            Apply Now
            <ExternalLink className="w-5 h-5" />
          </button>
          <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-2">
            You'll be redirected to {card.basicInfo.issuer}'s website
          </p>
        </div>
      </div>
    </div>
  );
}
