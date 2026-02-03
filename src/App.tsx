import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { CardGrid } from './components/cards/CardGrid';
import { CardComparison } from './components/cards/CardComparison';
import { FilterPanel } from './components/dashboard/FilterPanel';
import { HomePage } from './components/home/HomePage';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ComparisonBar } from './components/cards/ComparisonBar';
import { AIChatModal } from './components/ai/AIChatModal';
import { CardDetailModal } from './components/cards/CardDetailModal';
import type { CreditCard, CardFilters } from './types/card';
import cardsData from './data/cards.json';
import { SlidersHorizontal, X, Search, Bot, ChevronRight, Sparkles } from 'lucide-react';

// Main App content with routing
function AppContent() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CardFilters>({});
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailCard, setDetailCard] = useState<CreditCard | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const cards = cardsData.cards as CreditCard[];

  // Filter cards based on all criteria
  const filteredCards = cards.filter(card => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        card.basicInfo.name.toLowerCase().includes(query) ||
        card.basicInfo.issuer.toLowerCase().includes(query) ||
        card.basicInfo.network.some(n => n.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }
    
    // Other filters
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

  const openCardDetail = (card: CreditCard) => {
    setDetailCard(card);
  };

  return (
    <>
      {/* Card Detail Modal */}
      {detailCard && (
        <CardDetailModal card={detailCard} onClose={() => setDetailCard(null)} />
      )}

      {/* AI Chat Modal */}
      <AIChatModal
        cards={cards}
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />

      <Routes>
        {/* Home Page */}
        <Route path="/" element={
          <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
            <Header />
            <div className="flex-1">
              <HomePage 
                cards={cards} 
                onGoToBrowse={() => navigate('/browse')}
                onCardClick={openCardDetail}
              />
            </div>
            <Footer />
          </div>
        } />

        {/* Compare Page */}
        <Route path="/compare" element={
          <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full">
              <button
                onClick={() => navigate('/browse')}
                className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-white mb-4 sm:mb-6 transition-colors text-sm"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Browse
              </button>
              <CardComparison 
                cards={selectedCardObjects}
                allCards={cards}
                onRemoveCard={(id) => setSelectedCards(prev => prev.filter(cid => cid !== id))}
                onAddCard={(id) => toggleCardSelection(id)}
              />
            </main>
            <Footer />
          </div>
        } />

        {/* Browse Page */}
        <Route path="/browse" element={
          <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
            <Header />
            
            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full">
              {/* Breadcrumb - Hidden on mobile */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] mb-4 sm:mb-6">
                <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">Browse Credit Cards</span>
              </div>

              {/* Page Header */}
              <div className="flex flex-col gap-4 mb-6 sm:mb-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">Compare Premium Cards</h1>
                    <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))]">Discover the best offers tailored to your profile.</p>
                  </div>
                  
                  {/* AI Assistant Button */}
                  <button
                    onClick={() => setShowAIModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Ask AI Assistant</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full lg:max-w-md">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-[hsl(var(--muted-foreground))]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cards..."
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl text-sm sm:text-base text-white placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Mobile Filter Button */}
              <div className="lg:hidden mb-4 sm:mb-6 flex items-center justify-between">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl text-sm font-medium text-white"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                
                {/* Mobile sort */}
                <select className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500">
                  <option value="recommended">Recommended</option>
                  <option value="popular">Most Popular</option>
                  <option value="fee-low">Lowest Fee</option>
                </select>
              </div>

              <div className="flex gap-6 lg:gap-8">
                {/* Filters Sidebar - Desktop */}
                <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
                  <div className="sticky top-24">
                    <FilterPanel 
                      filters={filters} 
                      onFiltersChange={setFilters}
                    />
                    
                    {/* AI Suggestion Box */}
                    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-5 mt-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Sparkles className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-blue-400 uppercase tracking-wide mb-1">
                            AI Top Choice for You
                          </p>
                          <h4 className="text-white font-semibold">Need a custom pick?</h4>
                        </div>
                      </div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                        Let AI analyze your needs and find the perfect card match.
                      </p>
                      <button
                        onClick={() => setShowAIModal(true)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                      >
                        <Bot className="w-4 h-4" />
                        Ask AI Assistant
                      </button>
                    </div>
                  </div>
                </aside>
                
                {/* Cards Grid */}
                <div className="flex-1 min-w-0">
                  {/* Results Header - Desktop */}
                  <div className="hidden sm:flex items-center justify-between mb-4 sm:mb-6">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Showing <span className="text-white font-semibold">{filteredCards.length}</span> results
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">Sort by:</span>
                      <select className="bg-transparent border-none text-blue-400 font-medium text-sm focus:outline-none cursor-pointer">
                        <option value="recommended">Recommended</option>
                        <option value="popular">Most Popular</option>
                        <option value="fee-low">Lowest Fee</option>
                        <option value="rewards">Best Rewards</option>
                      </select>
                    </div>
                  </div>

                  {/* Mobile Results Count */}
                  <p className="sm:hidden text-xs text-[hsl(var(--muted-foreground))] mb-4">
                    Showing <span className="text-white font-semibold">{filteredCards.length}</span> cards
                  </p>

                  <CardGrid 
                    cards={filteredCards}
                    selectedCards={selectedCards}
                    onToggleSelect={toggleCardSelection}
                  />
                </div>
              </div>

              {/* Mobile Filters Bottom Sheet */}
              {showMobileFilters && (
                <div className="fixed inset-0 bg-black/60 z-50 lg:hidden animate-fade-in" onClick={() => setShowMobileFilters(false)}>
                  <div 
                    className="absolute left-0 right-0 bottom-0 bg-[hsl(var(--background))] rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex justify-center pt-3 pb-2">
                      <div className="w-12 h-1 bg-[hsl(var(--border-light))] rounded-full" />
                    </div>
                    
                    <div className="flex items-center justify-between px-4 sm:px-5 pb-4 border-b border-[hsl(var(--border))]">
                      <h3 className="font-semibold text-white text-lg">Filters</h3>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="p-2 bg-[hsl(var(--secondary))] rounded-full text-[hsl(var(--muted-foreground))] hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                      <FilterPanel 
                        filters={filters} 
                        onFiltersChange={setFilters}
                        isMobile
                      />
                    </div>
                    
                    <div className="p-4 sm:p-5 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="w-full py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                      >
                        Show {filteredCards.length} Cards
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>

            {/* Comparison Sticky Bar */}
            <ComparisonBar 
              selectedCards={selectedCardObjects}
              onClearAll={() => setSelectedCards([])}
              onCompare={() => navigate('/compare')}
            />

            <Footer />
          </div>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
