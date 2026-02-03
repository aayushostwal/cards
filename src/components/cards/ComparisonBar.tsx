import { Sparkles } from 'lucide-react';
import type { CreditCard } from '../../types/card';

interface ComparisonBarProps {
  selectedCards: CreditCard[];
  onClearAll: () => void;
  onCompare: () => void;
}

export function ComparisonBar({ selectedCards, onClearAll, onCompare }: ComparisonBarProps) {
  if (selectedCards.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pb-4 sm:pb-6">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl sm:rounded-2xl shadow-2xl shadow-black/20 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Selected Cards Preview */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex -space-x-2 sm:-space-x-3 shrink-0">
                {selectedCards.slice(0, 3).map((card, index) => (
                  <div
                    key={card.id}
                    className="relative w-10 h-6 sm:w-12 sm:h-8 rounded-md bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-[hsl(var(--background))] flex items-center justify-center text-[7px] sm:text-[8px] text-white font-bold overflow-hidden"
                    style={{ zIndex: 3 - index }}
                  >
                    {card.basicInfo.network[0]?.slice(0, 2)}
                  </div>
                ))}
                {selectedCards.length > 3 && (
                  <div className="relative w-10 h-6 sm:w-12 sm:h-8 rounded-md bg-[hsl(var(--secondary))] border-2 border-[hsl(var(--background))] flex items-center justify-center text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] font-medium">
                    +{selectedCards.length - 3}
                  </div>
                )}
              </div>
              
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-white truncate">
                  {selectedCards.length} Card{selectedCards.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={onClearAll}
                  className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] hover:text-white transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={onClearAll}
                className="hidden sm:block px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-white bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--background-tertiary))] rounded-lg sm:rounded-xl border border-[hsl(var(--border))] transition-colors"
              >
                Close
              </button>
              <button
                onClick={onCompare}
                disabled={selectedCards.length < 2}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Compare</span> ({selectedCards.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
