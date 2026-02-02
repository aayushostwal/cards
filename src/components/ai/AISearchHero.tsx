import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { CreditCard } from '../../types/card';
import { getChatCompletion } from '../../lib/groq';
import type { ChatMessage } from '../../lib/groq';
import { Send, Bot, User, Loader2, Sparkles, Trash2, ArrowDown } from 'lucide-react';

interface AISearchHeroProps {
  cards: CreditCard[];
  onScrollToBrowse: () => void;
}

const QUICK_PROMPTS = [
  { text: "Best cashback card with no annual fee?", icon: "💰" },
  { text: "Card for Amazon & Swiggy shopping", icon: "🛒" },
  { text: "Good lounge access under ₹2500 fee", icon: "✈️" },
  { text: "Card for ₹30k salary fresher", icon: "🎓" },
  { text: "Best travel rewards credit card", icon: "🌍" },
  { text: "Compare HDFC vs ICICI cards", icon: "⚖️" },
];

export function AISearchHero({ cards, onScrollToBrowse }: AISearchHeroProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasApiKey = !!import.meta.env.VITE_GROQ_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, promptOverride?: string) => {
    e?.preventDefault();
    const messageText = promptOverride || input.trim();
    if (!messageText || isLoading) return;

    if (!hasApiKey) {
      setError('Please add VITE_GROQ_API_KEY to .env file');
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMessage];
      const response = await getChatCompletion(allMessages, cards);
      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-200 text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Credit Card Advisor</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
            Find Your Perfect Card
          </h1>
          <p className="text-blue-200 text-lg">
            Ask anything about credit cards - I'll help you choose
          </p>
        </div>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-6">
          {!hasApiKey && (
            <div className="mb-4 px-4 py-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-sm text-amber-200 flex items-center gap-2 justify-center">
              <span>⚠️</span>
              <span>Add VITE_GROQ_API_KEY to enable AI features</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask: Which card is best for travel rewards?"
              className="w-full rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-sm pl-5 pr-14 py-4 sm:py-5 text-white placeholder-blue-200/60 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>

        {/* Quick Prompts - Only show when no messages */}
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-blue-300/60 text-sm mb-3">Popular questions</p>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(undefined, prompt.text)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white/90 rounded-full transition-all text-sm"
                >
                  <span>{prompt.icon}</span>
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/80 text-sm font-medium">Conversation</h3>
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      message.role === 'assistant' 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                        : 'bg-white/20'
                    }`}>
                      {message.role === 'assistant' ? (
                        <Bot className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-500/30 text-white rounded-br-md'
                          : 'bg-white text-slate-800 rounded-bl-md shadow-lg'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      ) : (
                        <div className="text-sm prose prose-sm prose-slate max-w-none prose-p:my-1.5 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-a:text-blue-600 prose-table:my-2 prose-th:bg-slate-100 prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1 prose-table:border-collapse prose-table:text-xs">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        <span className="text-sm text-slate-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-sm text-red-200 flex items-start gap-2">
                    <span className="shrink-0">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        )}

        {/* Scroll to Browse */}
        <div className="text-center mt-8">
          <button
            onClick={onScrollToBrowse}
            className="inline-flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors group"
          >
            <span className="text-sm">Or browse cards manually</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </div>
    </div>
  );
}
