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
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Build system prompt with card data context
export function buildSystemPrompt(cards: CreditCard[]): string {
  const cardSummaries = cards.map(card => ({
    name: card.basicInfo.name,
    issuer: card.basicInfo.issuer,
    type: card.basicInfo.cardType,
    joiningFee: card.fees.joiningFee,
    annualFee: card.fees.annualFee,
    annualFeeWaiver: card.fees.annualFeeWaiver,
    rewardRate: `${card.rewards.rewardRate}% ${card.rewards.rewardUnit}`,
    bestCategories: card.rewards.acceleratedCategories.slice(0, 3).map(c => `${c.category}: ${c.rate}%`).join(', '),
    domesticLounge: card.loungeAccess.domestic ? `${card.loungeAccess.domestic.freeVisits}/year` : 'No',
    internationalLounge: card.loungeAccess.international ? `${card.loungeAccess.international.freeVisits}/year` : 'No',
    minSalary: card.eligibility.minSalary ? `₹${card.eligibility.minSalary.toLocaleString('en-IN')}/month` : 'No minimum',
    foreignTxnFee: `${card.charges.foreignTxnFee}%`,
    welcomeBonus: card.rewards.welcomeBonus ? 
      (card.rewards.welcomeBonus.value ? `₹${card.rewards.welcomeBonus.value}` : `${card.rewards.welcomeBonus.points} points`) : 'None',
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

  // Add authorization header if token is provided
  if (OLLAMA_API_TOKEN) {
    headers["Content-Type"] = "application/json";
    headers['Authorization'] = `Bearer ${OLLAMA_API_TOKEN}`;
  }

  const response = await fetch(`${OLLAMA_ENDPOINT}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 1024,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.message?.content || 'Sorry, I could not generate a response.';
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
    temperature: 0.7,
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
