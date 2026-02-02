import { useState } from 'react';
import { CardGrid } from './components/cards/CardGrid';
import { CardComparison } from './components/cards/CardComparison';
import { FilterPanel } from './components/dashboard/FilterPanel';
import { AISearchHero } from './components/ai/AISearchHero';
import { ContactPage } from './components/contact/ContactPage';
import type { CreditCard, CardFilters } from './types/card';
import cardsData from './data/cards.json';
import { CreditCard as CreditCardIcon, BarChart3, GitCompare, SlidersHorizontal, X, Mail, Bot } from 'lucide-react';

type View = 'ai' | 'browse';
type Tab = 'browse' | 'compare' | 'contact';

function App() {
  const [currentView, setCurrentView] = useState<View>('ai');
  const [activeTab, setActiveTab] = useState<Tab>('browse');
  const [filters, setFilters] = useState<CardFilters>({});
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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

  const activeFilterCount = Object.values(filters).filter(v => 
    v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  // AI View - Full Screen Chat
  if (currentView === 'ai') {
    return <AISearchHero cards={cards} onGoToBrowse={() => setCurrentView('browse')} />;
  }

  // Browse View - Manual Browsing
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <CreditCardIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">CardCompare</h1>
                <p className="text-xs text-slate-500 hidden sm:block">50+ Credit Cards</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setCurrentView('ai')}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">Ask AI</span>
              </button>
              <button
                onClick={() => setActiveTab('browse')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'browse'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Browse</span>
              </button>
              <button
                onClick={() => setActiveTab('compare')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'compare'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <GitCompare className="w-4 h-4" />
                <span className="hidden sm:inline">Compare</span>
                {selectedCards.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {selectedCards.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'contact'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Contact</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'browse' && (
          <>
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Browse All Cards</h2>
              <p className="text-slate-500">Filter and explore 50+ credit cards</p>
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex gap-6 lg:gap-8">
              {/* Filters Sidebar - Desktop */}
              <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
                <div className="sticky top-20">
                  <FilterPanel 
                    filters={filters} 
                    onFiltersChange={setFilters}
                    cards={cards}
                  />
                </div>
              </aside>
              
              {/* Cards Grid */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <p className="text-sm font-medium text-slate-700">
                    Showing <span className="text-blue-600 font-semibold">{filteredCards.length}</span> cards
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Select up to 4 to compare
                  </p>
                </div>
                <CardGrid 
                  cards={filteredCards}
                  selectedCards={selectedCards}
                  onToggleSelect={toggleCardSelection}
                />
              </div>
            </div>

            {/* Mobile Filters Bottom Sheet */}
            {showMobileFilters && (
              <div className="fixed inset-0 bg-black/50 z-50 lg:hidden animate-fade-in" onClick={() => setShowMobileFilters(false)}>
                <div 
                  className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col animate-modal-enter"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-slate-300 rounded-full" />
                  </div>
                  
                  <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">Filters</h3>
                    <div className="flex items-center gap-2">
                      {activeFilterCount > 0 && (
                        <button
                          onClick={() => setFilters({})}
                          className="text-sm text-blue-600 font-medium"
                        >
                          Clear all
                        </button>
                      )}
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="p-1.5 bg-slate-100 rounded-full text-slate-500 hover:text-slate-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    <FilterPanel 
                      filters={filters} 
                      onFiltersChange={setFilters}
                      cards={cards}
                      isMobile
                    />
                  </div>
                  
                  <div className="p-4 border-t border-slate-200 bg-white pb-8">
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                    >
                      Show {filteredCards.length} Cards
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'compare' && (
          <CardComparison 
            cards={selectedCardObjects}
            allCards={cards}
            onRemoveCard={(id) => setSelectedCards(prev => prev.filter(cid => cid !== id))}
            onAddCard={(id) => toggleCardSelection(id)}
          />
        )}

        {activeTab === 'contact' && (
          <ContactPage />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-slate-500">
            Data last updated: {cardsData.lastUpdated} • Always verify on bank's official website
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
