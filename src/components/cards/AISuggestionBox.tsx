import { Sparkles, MessageSquare } from 'lucide-react';

interface AISuggestionBoxProps {
  onAskAI: () => void;
  filters: {
    hasTravelFilters?: boolean;
    hasRewardFilters?: boolean;
    hasFeeFilters?: boolean;
  };
}

export function AISuggestionBox({ onAskAI, filters }: AISuggestionBoxProps) {
  // Generate dynamic suggestion based on active filters
  const getSuggestion = () => {
    if (filters.hasTravelFilters) {
      return {
        highlight1: 'No Foreign Fees',
        highlight2: 'Travel Rewards'
      };
    }
    if (filters.hasRewardFilters) {
      return {
        highlight1: 'Higher Cashback',
        highlight2: 'Better Rewards'
      };
    }
    if (filters.hasFeeFilters) {
      return {
        highlight1: 'No Annual Fee',
        highlight2: 'Low APR'
      };
    }
    return {
      highlight1: 'No Foreign Fees',
      highlight2: 'Travel Rewards'
    };
  };

  const suggestion = getSuggestion();

  return (
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
        Based on your filters, you might prefer a card with{' '}
        <span className="text-white font-medium">{suggestion.highlight1}</span> and higher{' '}
        <span className="text-white font-medium">{suggestion.highlight2}</span>.
      </p>

      <button
        onClick={onAskAI}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
      >
        <MessageSquare className="w-4 h-4" />
        Ask AI Assistant
      </button>
    </div>
  );
}
