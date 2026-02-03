import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { CreditCard } from '../../types/card';
import { getChatCompletion } from '../../lib/groq';
import type { ChatMessage } from '../../lib/groq';
import { Send, Bot, User, X, Maximize2, Minimize2, Trash2, Sparkles } from 'lucide-react';

interface AIChatModalProps {
  cards: CreditCard[];
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

const QUICK_PROMPTS = [
  { text: "Best cashback card with no annual fee?", icon: "💰" },
  { text: "Card for Amazon & Swiggy shopping", icon: "🛒" },
  { text: "Good lounge access under ₹2500 fee", icon: "✈️" },
  { text: "Best travel rewards credit card", icon: "🌍" },
];

// Credit card quotes and tips to show while loading
const LOADING_QUOTES = [
  { text: "A good credit score is your financial superpower.", icon: "💪" },
  { text: "The best credit card is the one that matches your spending habits.", icon: "🎯" },
  { text: "Rewards are great, but never spend more just to earn points.", icon: "💡" },
  { text: "Always pay your full balance to avoid interest charges.", icon: "✨" },
  { text: "Annual fees can be worth it if the rewards outweigh the cost.", icon: "⚖️" },
  { text: "Lounge access alone can justify a premium card for frequent travelers.", icon: "✈️" },
  { text: "Welcome bonuses are free money — if you were planning to spend anyway.", icon: "🎁" },
  { text: "Track your spending categories to maximize cashback.", icon: "📊" },
  { text: "One reward point isn't always equal to one rupee.", icon: "🔢" },
  { text: "Compare the effective reward rate, not just the headline rate.", icon: "🧮" },
  { text: "Fuel surcharge waiver can save you thousands yearly.", icon: "⛽" },
  { text: "Zero liability protection keeps your money safe from fraud.", icon: "🛡️" },
  { text: "Some cards offer complimentary insurance worth lakhs.", icon: "🏥" },
  { text: "Read the fine print — fee waivers often have spending conditions.", icon: "📖" },
  { text: "Multiple cards can help you maximize category-specific rewards.", icon: "🃏" },
  { text: "Your credit utilization should stay below 30%.", icon: "📉" },
  { text: "Never miss a payment — it affects your credit score for years.", icon: "📅" },
  { text: "International cards with low forex fees save money abroad.", icon: "🌍" },
  { text: "Milestone rewards can add significant value to your card.", icon: "🏆" },
  { text: "Golf, movies, dining — premium cards come with hidden perks.", icon: "🎬" },
];

export function AIChatModal({ cards, isOpen, onClose, initialMessage }: AIChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasProcessedInitialMessage = useRef(false);

  const hasApiKey = !!import.meta.env.VITE_GROQ_API_KEY || !!import.meta.env.VITE_OLLAMA_ENDPOINT;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle initial message
  useEffect(() => {
    if (isOpen && initialMessage && !hasProcessedInitialMessage.current && hasApiKey) {
      hasProcessedInitialMessage.current = true;
      handleSubmit(undefined, initialMessage);
    }
  }, [isOpen, initialMessage]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasProcessedInitialMessage.current = false;
    }
  }, [isOpen]);

  // Shuffle quotes while loading
  useEffect(() => {
    if (!isLoading) return;

    // Set initial random quote
    setCurrentQuoteIndex(Math.floor(Math.random() * LOADING_QUOTES.length));

    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => {
        let next = Math.floor(Math.random() * LOADING_QUOTES.length);
        // Ensure we don't show the same quote twice in a row
        while (next === prev && LOADING_QUOTES.length > 1) {
          next = Math.floor(Math.random() * LOADING_QUOTES.length);
        }
        return next;
      });
    }, 2500); // Change quote every 2.5 seconds

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e?: React.FormEvent, promptOverride?: string) => {
    e?.preventDefault();
    const messageText = promptOverride || input.trim();
    if (!messageText || isLoading) return;

    if (!hasApiKey) {
      setError('Please add VITE_GROQ_API_KEY or VITE_OLLAMA_ENDPOINT to .env file');
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  if (!isOpen) return null;

  const currentQuote = LOADING_QUOTES[currentQuoteIndex];

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className={`bg-[hsl(var(--background))] flex flex-col overflow-hidden shadow-2xl border border-[hsl(var(--border))] animate-modal-enter ${
          isFullscreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full sm:max-w-2xl lg:max-w-3xl h-[95vh] sm:h-[85vh] sm:max-h-[700px] rounded-t-2xl sm:rounded-2xl'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-[hsl(var(--border))] shrink-0 bg-[hsl(var(--card))]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white">AI Assistant</h2>
              <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))]">Ask about credit cards</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:block p-2 text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-500/20">
                  <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  How can I help you?
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 max-w-md px-4">
                  Ask me anything about credit cards. I can help you compare, find rewards, and make smart choices.
                </p>
                
                {!hasApiKey && (
                  <div className="mb-4 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Add VITE_GROQ_API_KEY to enable AI</span>
                  </div>
                )}
                
                <div className="w-full max-w-md px-2">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2 font-medium">Quick questions:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {QUICK_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSubmit(undefined, prompt.text)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-[hsl(var(--card))] hover:bg-[hsl(var(--background-tertiary))] border border-[hsl(var(--border))] hover:border-[hsl(var(--border-light))] text-[hsl(var(--muted-foreground))] hover:text-white rounded-xl transition-all text-xs text-left"
                      >
                        <span className="text-base">{prompt.icon}</span>
                        <span className="flex-1 line-clamp-1">{prompt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="space-y-4 sm:space-y-5">
                {messages.map((message, index) => (
                  <div key={index} className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      message.role === 'assistant' 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                        : 'bg-[hsl(var(--secondary))]'
                    }`}>
                      {message.role === 'assistant' ? (
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      ) : (
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--muted-foreground))]" />
                      )}
                    </div>
                    <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                      <div
                        className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white max-w-[90%] sm:max-w-[80%]'
                            : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-white'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        ) : (
                          <div className="text-sm prose prose-sm prose-dark max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-white prose-strong:text-white prose-a:text-blue-400">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading state with quotes */}
                {isLoading && (
                  <div className="flex gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl px-3 sm:px-4 py-3 sm:py-4">
                        {/* Typing indicator */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full typing-dot" />
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full typing-dot" />
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full typing-dot" />
                          </div>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">Thinking...</span>
                        </div>
                        
                        {/* Quote card */}
                        <div 
                          key={currentQuoteIndex}
                          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-3 animate-fade-in"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg shrink-0">{currentQuote.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] italic leading-relaxed">
                                "{currentQuote.text}"
                              </p>
                              <div className="flex items-center gap-1 mt-2">
                                <Sparkles className="w-3 h-3 text-blue-400" />
                                <span className="text-[10px] text-blue-400 font-medium">Did you know?</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400 flex items-start gap-2">
                    <span className="shrink-0">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 sm:px-4 py-3 sm:py-4" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about credit cards..."
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-4 pr-12 py-3 text-sm text-white placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isLoading || !hasApiKey}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || !hasApiKey}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
