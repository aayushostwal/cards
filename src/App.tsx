import { useState, useEffect } from 'react';
import { CardGrid } from './components/cards/CardGrid';
import { CardComparison } from './components/cards/CardComparison';
import { FilterPanel } from './components/dashboard/FilterPanel';
import { AIChatBar } from './components/ai/AIChatBar';
import { ContactPage } from './components/contact/ContactPage';
import { HomePage } from './components/home/HomePage';
import type { CreditCard, CardFilters } from './types/card';
import cardsData from './data/cards.json';
import { CreditCard as CreditCardIcon, BarChart3, GitCompare, SlidersHorizontal, X, Mail } from 'lucide-react';

type Tab = 'home' | 'browse' | 'compare' | 'contact';

// Cookie helper functions
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [filters, setFilters] = useState<CardFilters>({});
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const cards = cardsData.cards as CreditCard[];

  // Check cookie on mount to determine if we should skip home page
  useEffect(() => {
    const skipHome = "true" // getCookie('skipHomePage');
    if (skipHome === 'true') {
      setActiveTab('browse');
    }
  }, []);

  const handleEnterFromHome = () => {
    setActiveTab('browse');
  };

  const handleSkipNextTime = (skip: boolean) => {
    if (skip) {
      setCookie('skipHomePage', 'true', 365); // Remember for 1 year
    } else {
      setCookie('skipHomePage', 'false', 365);
    }
  };

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

  // Show home page
  if (activeTab === 'home') {
    return (
      <HomePage 
        onEnter={handleEnterFromHome} 
        onSkipNextTime={handleSkipNextTime} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 sm:p-2 rounded-xl shadow-md">
                <CreditCardIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-lg sm:text-xl font-bold">
                  <span className="text-slate-900">Card</span>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Compare</span>
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">Compare 50+ Credit Cards</p>
              </div>
            </button>
            
            {/* Navigation Tabs */}
            <nav className="flex gap-1">
              <button
                onClick={() => setActiveTab('browse')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'browse'
                    ? 'bg-blue-100 text-blue-700'
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
                    ? 'bg-blue-100 text-blue-700'
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
                    ? 'bg-blue-100 text-blue-700'
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {activeTab === 'browse' && (
          <>
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700"
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
                <FilterPanel 
                  filters={filters} 
                  onFiltersChange={setFilters}
                  cards={cards}
                />
              </aside>
              
              {/* Cards Grid */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    {filteredCards.length} Cards
                  </h2>
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
              <div className="fixed inset-0 bg-black/50 z-[55] lg:hidden" onClick={() => setShowMobileFilters(false)}>
                <div 
                  className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Handle */}
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-slate-300 rounded-full" />
                  </div>
                  
                  {/* Header */}
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
                  
                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <FilterPanel 
                      filters={filters} 
                      onFiltersChange={setFilters}
                      cards={cards}
                      isMobile
                    />
                  </div>
                  
                  {/* Footer */}
                  <div className="p-4 border-t border-slate-200 bg-white pb-20">
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

      {/* Footer - only visible when chat is closed */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-slate-500">
            Data last updated: {cardsData.lastUpdated} • 
            Always verify on bank's official website
          </p>
        </div>
      </footer>

      {/* Floating AI Chat Bar */}
      <AIChatBar cards={cards} />
    </div>
  );
}

export default App;
