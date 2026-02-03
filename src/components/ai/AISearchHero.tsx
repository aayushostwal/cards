import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { CreditCard } from '../../types/card';
import { getChatCompletion } from '../../lib/groq';
import type { ChatMessage } from '../../lib/groq';
import { Send, Bot, User, CreditCard as CreditCardIcon, Trash2, LayoutGrid, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AISearchHeroProps {
  cards: CreditCard[];
  onGoToBrowse: () => void;
}

const QUICK_PROMPTS = [
  { text: "Best cashback card with no annual fee?", icon: "💰" },
  { text: "Card for Amazon & Swiggy shopping", icon: "🛒" },
  { text: "Good lounge access under ₹2500 fee", icon: "✈️" },
  { text: "Card for ₹30k salary fresher", icon: "🎓" },
  { text: "Best travel rewards credit card", icon: "🌍" },
  { text: "Compare HDFC vs ICICI cards", icon: "⚖️" },
];

export function AISearchHero({ cards, onGoToBrowse }: AISearchHeroProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasApiKey = !!import.meta.env.VITE_GROQ_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

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

  return (
    <div className="h-screen bg-[hsl(var(--background))] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[hsl(var(--background))]/95 backdrop-blur border-b border-[hsl(var(--border))] px-3 sm:px-4 py-2.5 sm:py-3 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <CreditCardIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </Link>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-white">CardCompare AI</h1>
              <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))]">Your credit card advisor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            )}
            <Link
              to="/browse"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[hsl(var(--muted-foreground))] hover:text-white bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--background-tertiary))] rounded-lg transition-colors border border-[hsl(var(--border))]"
            >
              <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Browse</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center min-h-[55vh] sm:min-h-[60vh] text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-2xl shadow-blue-500/20">
                <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                Find Your Perfect Credit Card
              </h2>
              <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] mb-6 sm:mb-8 max-w-md px-4">
                Ask me anything about credit cards in India. I can help you compare cards and make smart choices.
              </p>
              
              {!hasApiKey && (
                <div className="mb-4 sm:mb-6 px-3 sm:px-4 py-2 sm:py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs sm:text-sm text-amber-400 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Add VITE_GROQ_API_KEY to enable AI</span>
                </div>
              )}
              
              <div className="w-full max-w-xl px-2">
                <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] mb-2 sm:mb-3 font-medium">Try asking:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmit(undefined, prompt.text)}
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-[hsl(var(--card))] hover:bg-[hsl(var(--background-tertiary))] border border-[hsl(var(--border))] hover:border-[hsl(var(--border-light))] text-[hsl(var(--muted-foreground))] hover:text-white rounded-xl transition-all text-xs sm:text-sm text-left"
                    >
                      <span className="text-base sm:text-lg">{prompt.icon}</span>
                      <span className="flex-1 line-clamp-1">{prompt.text}</span>
                    </button>
                  ))}
                </div>
                
                {/* Divider */}
                <div className="flex items-center gap-3 sm:gap-4 my-6 sm:my-8">
                  <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                  <span className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">or</span>
                  <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                </div>
                
                {/* Browse Cards Button */}
                <Link
                  to="/browse"
                  className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--background-tertiary))] text-white font-semibold rounded-xl transition-all text-sm sm:text-base border border-[hsl(var(--border-light))]"
                >
                  <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Browse All 50+ Cards</span>
                </Link>
                <p className="text-center text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] mt-2 sm:mt-3">
                  Filter by bank, rewards, fees, and more
                </p>
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="space-y-4 sm:space-y-6 pb-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-2 sm:gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
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
                          ? 'bg-blue-600 text-white max-w-[90%] sm:max-w-[70%]'
                          : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-white'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <div className="text-sm sm:text-[15px] whitespace-pre-wrap">{message.content}</div>
                      ) : (
                        <div className="text-sm sm:text-[15px] prose prose-sm prose-dark max-w-none prose-p:my-2 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-headings:my-3 prose-headings:text-white prose-strong:text-white prose-a:text-blue-400">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-2 sm:gap-4">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full typing-dot" />
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full typing-dot" />
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full typing-dot" />
                      </div>
                      <span className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-red-400 flex items-start gap-2 sm:gap-3">
                  <span className="shrink-0 text-base sm:text-lg">⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 sm:px-4 pt-3 sm:pt-4 pb-4 sm:pb-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about credit cards..."
              rows={1}
              className="w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-3 sm:pl-4 pr-12 sm:pr-14 py-3 sm:py-3.5 text-sm sm:text-[15px] text-white placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 p-2 sm:p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-colors"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>
          <p className="text-center text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] mt-2">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
