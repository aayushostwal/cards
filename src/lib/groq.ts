import Groq from 'groq-sdk';
import type { CreditCard } from '../types/card';

// API Provider configuration
type APIProvider = 'groq' | 'ollama';

// Get the active provider from environment (default to groq)
const ACTIVE_PROVIDER: APIProvider = (import.meta.env.VITE_AI_PROVIDER as APIProvider) || 'groq';

// Groq configuration - support multiple API keys (comma-separated)
const GROQ_API_KEYS: string[] = (import.meta.env.VITE_GROQ_API_KEY || '')
  .split(',')
  .map((key: string) => key.trim())
  .filter((key: string) => key.length > 0);

// Create Groq clients for each API key
const groqClients: Groq[] = GROQ_API_KEYS.map(
  (apiKey) => new Groq({ apiKey, dangerouslyAllowBrowser: true })
);

// Shuffle array utility (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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
    minSalary: card.eligibility.minSalary ? `₹${(card.eligibility.minSalary / 1000)}k/mo` : 'Any',
    forexFee: `${card.charges.foreignTxnFee}%`,
  }));

  return `You are a helpful credit card advisor for Indian consumers. You have detailed knowledge about ${cards.length} credit cards from major Indian banks.

  AVAILABLE CREDIT CARDS DATA:
  ${JSON.stringify(cardSummaries, null, 2)}
  
  YOUR ROLE:
  1. Help users find the best credit card based on their spending patterns and needs
  2. Ask follow-up questions to better understand their requirements if needed
  3. Compare cards and explain trade-offs clearly
  4. Be specific with numbers (fees, rewards rates, etc.)
  5. Mention both pros and cons of recommended cards
  6. If salary/income is mentioned, filter out cards they may not qualify for
  
  IMPORTANT GUIDELINES:
  - Always recommend from the available cards list only
  - Be concise but thorough
  - Mention fee waiver conditions when relevant
  - If user's needs are unclear, ask 1-2 focused follow-up questions
  - Consider: spending categories, travel frequency, salary, fee sensitivity
  
  SPENDING CATEGORIES TO ASK ABOUT:
  - Online shopping (Amazon, Flipkart)
  - Food delivery (Swiggy, Zomato)
  - Groceries
  - Travel (flights, hotels)
  - Fuel
  - Bill payments (utilities, mobile)
  - International transactions
  
  RESPONSE FORMAT:
  - Always respond in **Markdown format**
  - Use **bold** for card names and important numbers
  - Use bullet points (- or *) for lists and comparisons
  - Use ### for section headers when comparing multiple cards
  - Use tables when comparing features across cards
  - Use > blockquotes for pro tips or important notes
  - Keep responses well-structured and scannable
  
  Respond in a friendly, professional tone. Use ₹ symbol for Indian Rupees.`;
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

// Check if error is a 429 rate limit error
function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    // Check for Groq SDK error format
    if ('status' in error && error.status === 429) return true;
    // Check for error message
    if ('message' in error && typeof error.message === 'string') {
      return error.message.includes('429') || error.message.toLowerCase().includes('rate limit');
    }
  }
  return false;
}

// Groq API call with automatic retry on 429
async function getGroqCompletion(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  if (groqClients.length === 0) {
    throw new Error('No Groq API keys configured. Set VITE_GROQ_API_KEY in your .env file.');
  }

  // Shuffle clients to pick randomly
  const shuffledClients = shuffleArray(groqClients);
  const errors: string[] = [];

  for (let i = 0; i < shuffledClients.length; i++) {
    const client = shuffledClients[i];
    try {
      const completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.5,
        max_tokens: 1024,
      });

      return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      const keyIndex = groqClients.indexOf(client);
      const keyPreview = GROQ_API_KEYS[keyIndex]?.slice(0, 8) + '...';

      if (isRateLimitError(error)) {
        console.warn(`Groq API key ${keyPreview} hit rate limit (429), trying next key...`);
        errors.push(`Key ${keyPreview}: rate limited`);
        // Continue to next client
        continue;
      }

      // For non-429 errors, throw immediately
      throw error;
    }
  }

  // All keys exhausted
  throw new Error(`All Groq API keys exhausted. Errors: ${errors.join('; ')}`);
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

// Export the number of available Groq API keys for debugging
export function getGroqKeyCount(): number {
  return GROQ_API_KEYS.length;
}
