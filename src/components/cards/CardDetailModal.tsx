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
      className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shrink-0">
              <CardIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20">
                  {card.basicInfo.issuer}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20">
                  {card.basicInfo.network.join(' / ')}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  card.basicInfo.cardType === 'Super Premium' ? 'bg-purple-400/30' :
                  card.basicInfo.cardType === 'Premium' ? 'bg-amber-400/30' :
                  'bg-green-400/30'
                }`}>
                  {card.basicInfo.cardType}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">{card.basicInfo.name}</h2>
              {card.basicInfo.description && (
                <p className="text-white/80 text-sm mt-1 line-clamp-2">{card.basicInfo.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          <div className="grid gap-6">
            
            {/* Fees Section */}
            <section>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Banknote className="w-4 h-4" /> Fees
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Joining Fee</p>
                  <p className="text-lg font-bold text-slate-900">
                    {card.fees.joiningFee === 0 ? <span className="text-green-600">FREE</span> : formatCurrency(card.fees.joiningFee)}
                  </p>
                  {card.fees.joiningFeeWaiver && (
                    <p className="text-xs text-green-600 mt-1">{card.fees.joiningFeeWaiver}</p>
                  )}
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Annual Fee</p>
                  <p className="text-lg font-bold text-slate-900">
                    {card.fees.annualFee === 0 ? <span className="text-green-600">FREE</span> : formatCurrency(card.fees.annualFee)}
                  </p>
                  {card.fees.annualFeeWaiver && (
                    <p className="text-xs text-green-600 mt-1">{card.fees.annualFeeWaiver}</p>
                  )}
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Renewal Fee</p>
                  <p className="text-lg font-bold text-slate-900">
                    {card.fees.renewalFee === 0 ? <span className="text-green-600">FREE</span> : formatCurrency(card.fees.renewalFee)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Add-on Card</p>
                  <p className="text-lg font-bold text-slate-900">
                    {card.fees.addOnCardFee === 0 ? <span className="text-green-600">FREE</span> : formatCurrency(card.fees.addOnCardFee)}
                  </p>
                </div>
              </div>
              {card.fees.fuelSurchargeWaiver.enabled && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  <Fuel className="w-4 h-4" />
                  Fuel surcharge waiver up to {formatCurrency(card.fees.fuelSurchargeWaiver.maxPerMonth || 0)}/month
                </div>
              )}
            </section>

            {/* Rewards Section */}
            <section>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4" /> Rewards
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-blue-600 mb-1">Base Reward Rate</p>
                  <p className="text-xl font-bold text-blue-700">
                    {card.rewards.rewardRate}% <span className="text-sm font-normal">{card.rewards.rewardUnit}</span>
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-blue-600 mb-1">Point Value</p>
                  <p className="text-xl font-bold text-blue-700">
                    {formatCurrency(card.rewards.pointValue)} <span className="text-sm font-normal">/point</span>
                  </p>
                </div>
                {card.rewards.welcomeBonus && (
                  <div className="bg-amber-50 rounded-xl p-4 col-span-2 sm:col-span-1">
                    <p className="text-xs text-amber-600 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Welcome Bonus
                    </p>
                    <p className="text-lg font-bold text-amber-700">
                      {card.rewards.welcomeBonus.value 
                        ? formatCurrency(card.rewards.welcomeBonus.value)
                        : `${card.rewards.welcomeBonus.points?.toLocaleString()} pts`}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">{card.rewards.welcomeBonus.condition}</p>
                  </div>
                )}
              </div>

              {/* Accelerated Categories */}
              {card.rewards.acceleratedCategories.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-600 mb-2">Accelerated Rewards</p>
                  <div className="flex flex-wrap gap-2">
                    {card.rewards.acceleratedCategories.map((cat, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-full text-sm">
                        <Percent className="w-3 h-3 text-blue-600" />
                        <span className="font-medium text-blue-700">{cat.rate}%</span>
                        <span className="text-slate-600">{cat.category}</span>
                        {cat.cap && <span className="text-slate-400 text-xs">(cap {formatCurrency(cat.cap)})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestone Rewards */}
              {card.rewards.milestoneRewards.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-2">Milestone Rewards</p>
                  <div className="space-y-2">
                    {card.rewards.milestoneRewards.map((milestone, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm bg-slate-50 px-3 py-2 rounded-lg">
                        <Target className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="text-slate-600">Spend {formatCurrency(milestone.spend)} {milestone.period}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-medium text-slate-900">{milestone.reward}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Lounge Access */}
            {(card.loungeAccess.domestic || card.loungeAccess.international) && (
              <section>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Plane className="w-4 h-4" /> Lounge Access
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {card.loungeAccess.domestic && (
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-xs text-purple-600 mb-1">Domestic Lounges</p>
                      <p className="text-xl font-bold text-purple-700">
                        {card.loungeAccess.domestic.freeVisits} <span className="text-sm font-normal">free visits/year</span>
                      </p>
                      <p className="text-xs text-purple-600 mt-1">{card.loungeAccess.domestic.program}</p>
                    </div>
                  )}
                  {card.loungeAccess.international && (
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-xs text-purple-600 mb-1">International Lounges</p>
                      <p className="text-xl font-bold text-purple-700">
                        {card.loungeAccess.international.freeVisits} <span className="text-sm font-normal">free visits/year</span>
                      </p>
                      <p className="text-xs text-purple-600 mt-1">{card.loungeAccess.international.program}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Eligibility */}
            <section>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" /> Eligibility
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {card.eligibility.minSalary && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Min. Salary</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(card.eligibility.minSalary)}/mo</p>
                  </div>
                )}
                {card.eligibility.minCibilScore && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Min. CIBIL</p>
                    <p className="text-lg font-bold text-slate-900">{card.eligibility.minCibilScore}+</p>
                  </div>
                )}
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Age</p>
                  <p className="text-lg font-bold text-slate-900">{card.eligibility.minAge} - {card.eligibility.maxAge} yrs</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Employment</p>
                  <p className="text-sm font-medium text-slate-900">{card.eligibility.employmentType.join(', ')}</p>
                </div>
              </div>
            </section>

            {/* Charges */}
            <section>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Charges
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Interest Rate</p>
                  <p className="text-lg font-bold text-slate-900">{card.charges.interestRate.monthly}%/mo</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Forex Markup
                  </p>
                  <p className="text-lg font-bold text-slate-900">{card.charges.foreignTxnFee}%</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Late Fee</p>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(card.charges.lateFee)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Cash Advance</p>
                  <p className="text-sm font-bold text-slate-900">{card.charges.cashAdvanceFee.percent}%</p>
                </div>
              </div>
            </section>

            {/* Features */}
            <section>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {card.features.contactless && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                    <Smartphone className="w-4 h-4" /> Contactless
                  </span>
                )}
                {card.features.virtualCard && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" /> Virtual Card
                  </span>
                )}
                {card.features.zeroLiability && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                    <Shield className="w-4 h-4" /> Zero Liability
                  </span>
                )}
                {card.features.concierge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" /> Concierge
                  </span>
                )}
                {card.features.emiConversion && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" /> EMI Conversion
                  </span>
                )}
                {card.features.instantIssuance && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" /> Instant Issuance
                  </span>
                )}
                {card.features.addOnCards > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm">
                    <Users className="w-4 h-4" /> {card.features.addOnCards} Add-on Cards
                  </span>
                )}
                {card.features.golfAccess?.enabled && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" /> Golf: {card.features.golfAccess.freeGames} games
                  </span>
                )}
              </div>

              {/* Insurance */}
              {(card.features.insuranceCover.airAccident || card.features.insuranceCover.lostCard || card.features.insuranceCover.purchaseProtection) && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-slate-600 mb-2">Insurance Coverage</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {card.features.insuranceCover.airAccident && (
                      <div className="text-sm">
                        <span className="text-slate-500">Air Accident:</span>{' '}
                        <span className="font-medium">{formatCurrency(card.features.insuranceCover.airAccident)}</span>
                      </div>
                    )}
                    {card.features.insuranceCover.lostCard && (
                      <div className="text-sm">
                        <span className="text-slate-500">Lost Card:</span>{' '}
                        <span className="font-medium">{formatCurrency(card.features.insuranceCover.lostCard)}</span>
                      </div>
                    )}
                    {card.features.insuranceCover.purchaseProtection && (
                      <div className="text-sm">
                        <span className="text-slate-500">Purchase:</span>{' '}
                        <span className="font-medium">{formatCurrency(card.features.insuranceCover.purchaseProtection)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Offers Section */}
            {card.discountsAndOffers.platforms.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Percent className="w-4 h-4" /> Partner Offers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {card.discountsAndOffers.platforms.slice(0, 6).map((platform, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-lg">
                      <span className="font-medium text-slate-900">{platform.name}</span>
                      <span className="text-sm text-blue-600 font-medium">{platform.discount}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer with Apply Button */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <button
            onClick={handleApply}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25"
          >
            Apply Now
            <ExternalLink className="w-5 h-5" />
          </button>
          <p className="text-center text-xs text-slate-500 mt-2">
            You'll be redirected to {card.basicInfo.issuer}'s website
          </p>
        </div>
      </div>
    </div>
  );
}
