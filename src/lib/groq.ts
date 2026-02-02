import Groq from 'groq-sdk';
import type { CreditCard } from '../types/card';

// Initialize Groq client - API key should be set in environment
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true, // For client-side usage
});

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
- Use bullet points for comparisons
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

Respond in a friendly, professional tone. Use ₹ symbol for Indian Rupees.`;
}

export async function getChatCompletion(
  messages: ChatMessage[],
  cards: CreditCard[]
): Promise<string> {
  try {
    const systemPrompt = buildSystemPrompt(cards);
    
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
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}
