import Groq from 'groq-sdk';
import type { CreditCard } from '../types/card';

// API Provider configuration
type APIProvider = 'groq' | 'ollama';

// Get the active provider from environment (default to groq)
const ACTIVE_PROVIDER: APIProvider = (import.meta.env.VITE_AI_PROVIDER as APIProvider) || 'groq';

// Groq configuration
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

// Ollama configuration (via ngrok)
const OLLAMA_ENDPOINT = import.meta.env.VITE_OLLAMA_ENDPOINT || '';
const OLLAMA_API_TOKEN = import.meta.env.VITE_OLLAMA_API_TOKEN || '';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'gemma2';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Build system prompt optimized for Gemma models
export function buildSystemPrompt(cards: CreditCard[]): string {
  const cardSummaries = cards.map(card => ({
    name: card.basicInfo.name,
    issuer: card.basicInfo.issuer,
    type: card.basicInfo.cardType,
    annualFee: `₹${card.fees.annualFee}`,
    feeWaiver: card.fees.annualFeeWaiver || 'None',
    rewards: `${card.rewards.rewardRate}% ${card.rewards.rewardUnit}`,
    categories: card.rewards.acceleratedCategories.slice(0, 2).map(c => `${c.category} ${c.rate}%`).join(', '),
    lounge: card.loungeAccess.domestic ? `${card.loungeAccess.domestic.freeVisits}/yr` : 'No',
    minSalary: card.eligibility.minSalary ? `₹${(card.eligibility.minSalary/1000)}k/mo` : 'Any',
    forexFee: `${card.charges.foreignTxnFee}%`,
  }));

  return `You are a credit card advisor for India. Recommend cards ONLY from the database below.

IMPORTANT RULES:
1. Be concise - max 200 words
2. Use proper markdown tables with separator rows
3. Use ₹ for rupees
4. No greetings or fluff

CARD DATABASE:
${JSON.stringify(cardSummaries, null, 2)}

MARKDOWN TABLE FORMAT (MUST follow exactly):

| Card | Issuer | Fee | Rewards |
|------|--------|-----|---------|
| Card1 | Bank1 | ₹X | X% |
| Card2 | Bank2 | ₹Y | Y% |

CRITICAL: Tables MUST have:
- Line 1: Header with | separators
- Line 2: Dashes like |------|--------|
- Line 3+: Data rows

EXAMPLE RESPONSE:

### Best Cards for Online Shopping

| Card | Issuer | Annual Fee | Rewards |
|------|--------|------------|---------|
| HDFC Millennia | HDFC Bank | ₹1,000 | 5% on Amazon |
| Amazon Pay ICICI | ICICI Bank | ₹0 | 5% with Prime |

**Top Pick:** HDFC Millennia for best overall rewards.

> Tip: HDFC fee waived on ₹1L yearly spend.

---

Now answer the user. Use the exact table format shown above with the |------| separator row.`;
}

// Ollama API call (OpenAI-compatible format)
async function getOllamaCompletion(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  if (!OLLAMA_ENDPOINT) {
    throw new Error('Ollama endpoint not configured. Set VITE_OLLAMA_ENDPOINT in your .env file.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (OLLAMA_API_TOKEN) {
    headers['Authorization'] = `Bearer ${OLLAMA_API_TOKEN}`;
  }

  // Combine system prompt with user message for better Gemma compatibility
  const userQuestion = messages[messages.length - 1]?.content || '';
  
  const response = await fetch(`${OLLAMA_ENDPOINT}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { 
          role: 'user', 
          content: `${systemPrompt}\n\n---\n\nUSER QUESTION: ${userQuestion}\n\nRemember: Use proper markdown table with |------| separator row.`
        },
      ],
      stream: false,
      temperature: 0.3,
      top_p: 0.85,
      max_tokens: 700,
      repeat_penalty: 1.15,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Handle OpenAI-compatible response format
  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }
  // Handle native Ollama format
  if (data.message?.content) {
    return data.message.content;
  }
  
  return 'Sorry, I could not generate a response.';
}

// Groq API call
async function getGroqCompletion(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.5,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
}

// Main function - routes to the active provider
export async function getChatCompletion(
  messages: ChatMessage[],
  cards: CreditCard[]
): Promise<string> {
  try {
    const systemPrompt = buildSystemPrompt(cards);
    
    if (ACTIVE_PROVIDER === 'ollama') {
      return await getOllamaCompletion(messages, systemPrompt);
    } else {
      return await getGroqCompletion(messages, systemPrompt);
    }
  } catch (error) {
    console.error(`${ACTIVE_PROVIDER} API error:`, error);
    throw error;
  }
}

// Export the active provider for debugging/display
export function getActiveProvider(): APIProvider {
  return ACTIVE_PROVIDER;
}
