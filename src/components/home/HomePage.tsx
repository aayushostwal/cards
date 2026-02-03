import { useState } from 'react';
import { ArrowRight, Sparkles, Bot, Send, Shield, Star, ChevronRight } from 'lucide-react';
import type { CreditCard } from '../../types/card';
import { AIChatModal } from '../ai/AIChatModal';

interface HomePageProps {
  cards: CreditCard[];
  onGoToBrowse: () => void;
  onCardClick?: (card: CreditCard) => void;
}

// AI Chat Widget Component (Teaser that opens modal)
function AIChatWidget({ onOpenChat }: { onOpenChat: (message?: string) => void }) {
  const [inputValue, setInputValue] = useState('');
  
  const suggestedPrompts = [
    "Best for international travel",
    "No annual fee with cashback"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onOpenChat(inputValue.trim());
      setInputValue('');
    }
  };

  const handlePromptClick = (prompt: string) => {
    onOpenChat(prompt);
  };

  return (
    <div 
      className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden flex flex-col h-[340px] sm:h-[380px] cursor-pointer hover:border-[hsl(var(--border-light))] transition-colors"
      onClick={() => onOpenChat()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-white">AI Financial Assistant</span>
        </div>
      </div>

      {/* Chat Preview Area */}
      <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4" onClick={e => e.stopPropagation()}>
        {/* Initial Bot Message */}
        <div className="flex gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <div className="bg-[hsl(var(--secondary))] rounded-2xl rounded-tl-none px-3 sm:px-4 py-2 sm:py-3 max-w-[85%]">
            <p className="text-xs sm:text-sm text-[hsl(var(--foreground))]">
              Hi! I'm your AI assistant. Tell me about your spending habits, and I'll find your perfect credit card match.
            </p>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="space-y-2">
          <p className="text-[10px] sm:text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
            Suggested Prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePromptClick(prompt);
                }}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--background-tertiary))] text-[hsl(var(--muted-foreground))] hover:text-white border border-[hsl(var(--border))] rounded-full transition-colors"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-2.5 sm:p-3 border-t border-[hsl(var(--border))]" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tell me your spending habits..."
            className="w-full pl-3 sm:pl-4 pr-12 py-2.5 sm:py-3 bg-[hsl(var(--background-secondary))] border border-[hsl(var(--border))] rounded-xl text-xs sm:text-sm text-white placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-blue-500 transition-colors"
            onClick={e => e.stopPropagation()}
          />
          <button
            type="submit"
            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </form>
        
        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-2 sm:mt-3">
          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))]">
            <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>Bank-level security</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))]">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>Independent Reviews</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Credit Card Preview Component
function CardPreview({ card, category, onClick }: { card: CreditCard; category: string; onClick: () => void }) {
  const getGradient = (issuer: string) => {
    const issuerLower = issuer.toLowerCase();
    if (issuerLower.includes('hdfc')) return 'from-emerald-900 via-emerald-800 to-teal-900';
    if (issuerLower.includes('icici')) return 'from-slate-800 via-slate-700 to-slate-800';
    if (issuerLower.includes('sbi')) return 'from-blue-900 via-blue-800 to-indigo-900';
    if (issuerLower.includes('axis')) return 'from-purple-900 via-purple-800 to-violet-900';
    return 'from-slate-800 via-slate-700 to-slate-800';
  };

  const getCategoryColor = (cat: string) => {
    if (cat === 'TRAVEL') return 'bg-emerald-500/20 text-emerald-400';
    if (cat === 'REWARDS') return 'bg-amber-500/20 text-amber-400';
    if (cat === 'CASHBACK') return 'bg-blue-500/20 text-blue-400';
    return 'bg-purple-500/20 text-purple-400';
  };

  return (
    <div 
      className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden card-hover cursor-pointer"
      onClick={onClick}
    >
      {/* Card Image */}
      <div className={`relative h-36 sm:h-44 bg-gradient-to-br ${getGradient(card.basicInfo.issuer)} p-4 sm:p-5 flex flex-col justify-between`}>
        <div className="flex justify-end">
          <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full ${getCategoryColor(category)}`}>
            {category}
          </span>
        </div>
        <div>
          <p className="text-white/60 text-[10px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1">
            {card.basicInfo.network.join(' / ')}
          </p>
          <h4 className="text-white font-bold text-sm sm:text-lg tracking-wide">
            {card.basicInfo.name.split(' ').slice(0, 2).join(' ').toUpperCase()}
          </h4>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-white text-sm sm:text-base mb-0.5 sm:mb-1 line-clamp-1">{card.basicInfo.name}</h3>
        <p className="text-xs sm:text-sm text-blue-400 mb-3 sm:mb-4">
          {card.rewards.welcomeBonus?.points 
            ? `${card.rewards.welcomeBonus.points.toLocaleString()} Bonus Points`
            : card.fees.annualFee === 0 
              ? 'No Annual Fee'
              : `${card.rewards.rewardRate}% ${card.rewards.rewardUnit === 'cashback' ? 'Cash Back' : 'Rewards'}`
          }
        </p>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide">APR Range</p>
            <p className="text-xs sm:text-sm font-medium text-white">
              {card.charges.interestRate.monthly * 12}% - {(card.charges.interestRate.monthly * 12 + 5).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Annual Fee</p>
            <p className="text-xs sm:text-sm font-medium text-white">
              {card.fees.annualFee === 0 ? '$0' : `₹${card.fees.annualFee.toLocaleString()}`}
            </p>
          </div>
        </div>

        <button 
          className="w-full py-2 sm:py-2.5 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--background-tertiary))] text-white text-xs sm:text-sm font-medium rounded-lg border border-[hsl(var(--border-light))] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

// User Avatar Stack
function AvatarStack() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex -space-x-2">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 border-2 border-[hsl(var(--background))]" />
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-400 border-2 border-[hsl(var(--background))]" />
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-400 border-2 border-[hsl(var(--background))]" />
      </div>
      <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
        <span className="text-white font-semibold">10k+</span> users found their card this month
      </p>
    </div>
  );
}

export function HomePage({ cards, onGoToBrowse, onCardClick }: HomePageProps) {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState<string | undefined>();
  
  // Get featured cards (first 3 for display)
  const featuredCards = cards.slice(0, 3);
  const categories = ['TRAVEL', 'CASHBACK', 'REWARDS'];

  const handleOpenChat = (message?: string) => {
    setInitialChatMessage(message);
    setIsChatModalOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatModalOpen(false);
    setInitialChatMessage(undefined);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* AI Chat Modal */}
      <AIChatModal
        cards={cards}
        isOpen={isChatModalOpen}
        onClose={handleCloseChat}
        initialMessage={initialChatMessage}
      />

      {/* Hero Section */}
      <section className="pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-full">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full" />
                <span className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">AI-Powered Comparisons</span>
              </div>

              {/* Heading */}
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                  The Smartest Way<br className="hidden sm:block" />
                  <span className="sm:hidden"> </span>to Find Your{' '}
                  <span className="gradient-text">Next Credit Card</span>
                </h1>
                <p className="text-base sm:text-lg text-[hsl(var(--muted-foreground))] max-w-lg">
                  Compare over 55+ cards instantly or let our AI analyze your spending to find the perfect match.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <button
                  onClick={onGoToBrowse}
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-sm sm:text-base"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  Browse All Cards
                </button>
                <button 
                  onClick={() => handleOpenChat()}
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--background-tertiary))] text-white font-medium rounded-xl border border-[hsl(var(--border-light))] transition-colors text-sm sm:text-base"
                >
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  Ask AI Assistant
                </button>
              </div>

              {/* Social Proof */}
              <AvatarStack />
            </div>

            {/* Right Column - AI Chat Widget */}
            <div className="lg:pl-8 order-1 lg:order-2">
              <AIChatWidget onOpenChat={handleOpenChat} />
            </div>
          </div>
        </div>
      </section>

      {/* Top Picks Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
                Today's Top Picks for You
              </h2>
              <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))]">
                Based on popularity and overall value for the current month.
              </p>
            </div>
            <button 
              onClick={onGoToBrowse}
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors text-sm sm:text-base"
            >
              View All 55+ Cards
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredCards.map((card, index) => (
              <CardPreview 
                key={card.id} 
                card={card} 
                category={categories[index % categories.length]}
                onClick={() => onCardClick?.(card)}
              />
            ))}
          </div>

          {/* Mobile View All Button */}
          <div className="mt-6 sm:mt-8 sm:hidden">
            <button
              onClick={onGoToBrowse}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--background-tertiary))] text-white font-medium rounded-xl border border-[hsl(var(--border-light))] transition-colors"
            >
              View All 55+ Cards
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
