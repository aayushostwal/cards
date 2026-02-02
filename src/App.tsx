import { useState } from 'react';
import { CardGrid } from './components/cards/CardGrid';
import { CardComparison } from './components/cards/CardComparison';
import { FilterPanel } from './components/dashboard/FilterPanel';
import { ChatInterface } from './components/ai/ChatInterface';
import type { CreditCard, CardFilters } from './types/card';
import cardsData from './data/cards.json';
import { CreditCard as CreditCardIcon, BarChart3, MessageSquare, GitCompare } from 'lucide-react';

type Tab = 'browse' | 'compare' | 'ai';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('browse');
  const [filters, setFilters] = useState<CardFilters>({});
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const cards = cardsData.cards as CreditCard[];

  const filteredCards = cards.filter(card => {
    if (filters.issuer?.length && !filters.issuer.includes(card.basicInfo.issuer)) return false;
    if (filters.network?.length && !filters.network.some(n => card.basicInfo.network.includes(n))) return false;
    if (filters.cardType?.length && !filters.cardType.includes(card.basicInfo.cardType)) return false;
    if (filters.maxJoiningFee !== undefined && card.fees.joiningFee > filters.maxJoiningFee) return false;
    if (filters.maxAnnualFee !== undefined && card.fees.annualFee > filters.maxAnnualFee) return false;
    if (filters.minRewardRate !== undefined && card.rewards.rewardRate < filters.minRewardRate) return false;
    if (filters.hasDomesticLounge && !card.loungeAccess.domestic) return false;
    if (filters.hasInternationalLounge && !card.loungeAccess.international) return false;
    if (filters.maxMinSalary !== undefined && card.eligibility.minSalary && card.eligibility.minSalary > filters.maxMinSalary) return false;
    if (filters.hasWelcomeBonus && !card.rewards.welcomeBonus) return false;
    return true;
  });

  const toggleCardSelection = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : prev.length < 4 ? [...prev, cardId] : prev
    );
  };

  const selectedCardObjects = cards.filter(c => selectedCards.includes(c.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <CreditCardIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">CardCompare India</h1>
                <p className="text-xs text-slate-500">Compare 50+ Credit Cards</p>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="flex gap-1">
              <button
                onClick={() => setActiveTab('browse')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'browse'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Browse Cards
              </button>
              <button
                onClick={() => setActiveTab('compare')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'compare'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <GitCompare className="w-4 h-4" />
                Compare
                {selectedCards.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {selectedCards.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'ai'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                AI Assistant
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'browse' && (
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <aside className="w-72 shrink-0">
              <FilterPanel 
                filters={filters} 
                onFiltersChange={setFilters}
                cards={cards}
              />
            </aside>
            
            {/* Cards Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  {filteredCards.length} Cards Found
                </h2>
                <p className="text-sm text-slate-500">
                  Select up to 4 cards to compare
                </p>
              </div>
              <CardGrid 
                cards={filteredCards}
                selectedCards={selectedCards}
                onToggleSelect={toggleCardSelection}
              />
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          <CardComparison 
            cards={selectedCardObjects}
            allCards={cards}
            onRemoveCard={(id) => setSelectedCards(prev => prev.filter(cid => cid !== id))}
            onAddCard={(id) => toggleCardSelection(id)}
          />
        )}

        {activeTab === 'ai' && (
          <ChatInterface cards={cards} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            Data last updated: {cardsData.lastUpdated} • 
            Always verify details on the bank's official website before applying
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
