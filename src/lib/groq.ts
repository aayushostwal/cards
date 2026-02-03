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

  return `<role>Credit Card Advisor for India</role>

<task>Recommend credit cards from the database. Be helpful, concise, and use proper formatting.</task>

<rules>
- ONLY recommend cards from the CARDS list below
- Use markdown tables for comparisons
- Keep responses under 200 words
- Use ₹ symbol for Indian Rupees
- Be direct, no unnecessary greetings
- If user needs are unclear, ask ONE short question
</rules>

<cards>
${JSON.stringify(cardSummaries, null, 2)}
</cards>

<format>
When recommending cards, use this structure:

### [Card Name]
**Issuer:** [Bank Name]

| Feature | Value |
|---------|-------|
| Annual Fee | ₹X |
| Rewards | X% |
| Best For | [Category] |
| Min Salary | ₹X/month |

**Recommendation:** [1-2 sentence explanation]

> **Pro tip:** [Fee waiver or bonus info]
</format>

<example>
User: "card for online shopping"

### HDFC Millennia
**Issuer:** HDFC Bank

| Feature | Value |
|---------|-------|
| Annual Fee | ₹1,000 |
| Rewards | 5% on Amazon/Flipkart |
| Best For | Online Shopping |
| Min Salary | ₹25k/month |

**Recommendation:** Best entry-level card for e-commerce with 5% cashback on major platforms.

> **Pro tip:** Annual fee waived on spending ₹1 lakh/year.
</example>

Now answer the user's question using cards from the database above. Use tables and proper markdown formatting.`;
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

  // Combine system prompt with first user message for better Gemma compatibility
  const formattedMessages = messages.map(m => ({ 
    role: m.role, 
    content: m.content 
  }));

  const response = await fetch(`${OLLAMA_ENDPOINT}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'user', content: systemPrompt + '\n\n---\n\nUser question: ' + (formattedMessages[0]?.content || '') },
        ...formattedMessages.slice(1),
      ],
      stream: false,
      temperature: 0.4,      // Balanced for Gemma - not too creative, not too rigid
      top_p: 0.9,            // Nucleus sampling for better quality
      max_tokens: 600,       // Enough for detailed response with table
      repeat_penalty: 1.1,   // Reduce repetition
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
