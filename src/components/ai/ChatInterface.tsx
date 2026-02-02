import { useState, useRef, useEffect } from 'react';
import type { CreditCard } from '../../types/card';
import { getChatCompletion } from '../../lib/groq';
import type { ChatMessage } from '../../lib/groq';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface ChatInterfaceProps {
  cards: CreditCard[];
}

const SUGGESTED_PROMPTS = [
  "I spend ₹15,000/month on Amazon and Swiggy. Which card gives best rewards?",
  "I travel internationally twice a year. Need a card with good lounge access.",
  "I'm a fresher with ₹30,000 salary. Which card can I get?",
  "Best cashback card with no annual fee?",
  "Compare HDFC Regalia Gold vs ICICI Sapphiro for a frequent traveler",
];

export function ChatInterface({ cards }: ChatInterfaceProps) {
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

  const handleSubmit = async (e?: React.FormEvent, promptOverride?: string) => {
    e?.preventDefault();
    const messageText = promptOverride || input.trim();
    if (!messageText || isLoading) return;

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

  if (!hasApiKey) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">API Key Required</h2>
          <p className="text-slate-600 mb-4">
            To use the AI assistant, you need to add your Groq API key.
          </p>
          <div className="bg-white rounded-lg p-4 text-left">
            <p className="text-sm text-slate-700 mb-2">
              1. Get a free API key from{' '}
              <a 
                href="https://console.groq.com/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                console.groq.com/keys
              </a>
            </p>
            <p className="text-sm text-slate-700 mb-2">
              2. Create a <code className="bg-slate-100 px-1.5 py-0.5 rounded">.env</code> file in the project root:
            </p>
            <pre className="bg-slate-900 text-green-400 p-3 rounded-lg text-sm overflow-x-auto">
              VITE_GROQ_API_KEY=your_api_key_here
            </pre>
            <p className="text-sm text-slate-700 mt-2">
              3. Restart the dev server
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full mb-4">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AI Card Advisor</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Find Your Perfect Credit Card
        </h2>
        <p className="text-slate-600">
          Tell me about your spending habits, and I'll recommend the best cards for you
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Messages Area */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <Bot className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500 mb-6">
                Start by telling me about your spending patterns or try one of these:
              </p>
              <div className="grid gap-2 w-full max-w-md">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubmit(undefined, prompt)}
                    className="text-left p-3 text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
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
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                  </div>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                  Error: {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me about your spending habits..."
              className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Powered by Groq • Responses may not always be accurate
          </p>
        </div>
      </div>
    </div>
  );
}
