import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { CreditCard } from '../../types/card';
import { getChatCompletion } from '../../lib/groq';
import type { ChatMessage } from '../../lib/groq';
import { Send, Bot, User, Loader2, Sparkles, ChevronDown } from 'lucide-react';

interface AIChatBarProps {
  cards: CreditCard[];
}

const QUICK_PROMPTS = [
  "Best cashback card with no annual fee?",
  "Card for Amazon & Swiggy shopping",
  "Good lounge access under ₹2500 fee",
  "Card for ₹30k salary fresher",
];

export function AIChatBar({ cards }: AIChatBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

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
    setIsExpanded(true);

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
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Expanded Chat Panel */}
      {isExpanded && (
        <div className="bg-white border-t border-slate-200 shadow-2xl max-h-[60vh] sm:max-h-[50vh] flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">AI Card Advisor</span>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
            {messages.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500 mb-3">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmit(undefined, prompt)}
                      className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      ) : (
                        <div className="text-sm prose prose-sm prose-slate max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-2 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-blockquote:text-slate-600 prose-blockquote:border-blue-500 prose-a:text-blue-600 prose-table:my-2 prose-th:bg-slate-100 prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1 prose-table:border-collapse prose-table:text-xs">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-slate-600" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl px-3 py-2">
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    </div>
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600">
                    {error}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
      )}

      {/* Input Bar - Always visible */}
      <div className="bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            {!isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shrink-0"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onClick={() => !isExpanded && setIsExpanded(true)}
                placeholder="Ask AI: Which card is best for my spending?"
                className="w-full rounded-full border border-slate-200 pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
          {!hasApiKey && !isExpanded && (
            <p className="text-xs text-amber-600 text-center mt-1">
              Add VITE_GROQ_API_KEY to enable AI
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
