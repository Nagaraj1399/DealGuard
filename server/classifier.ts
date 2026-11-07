import { GoogleGenAI, Type } from '@google/genai';
import { Message, MessageClassification } from './types.js';

const SYSTEM_PROMPT = `You are a real-time safety and intent classifier for a real-estate buyer-seller chat.
Given the latest buyer message and the last few turns of context, return STRICT JSON:
{
  "trust_flag": boolean,       // true if the message matches a common P2P real-estate scam pattern (e.g. requests advance/booking payment before a viewing, pressure to move off-platform, too-good-to-be-true urgency, unverified bank/crypto/UPI transfer)
  "trust_reason": string|null, // short human-readable reason if trust_flag is true, else null
  "lead_score": number,        // 0-100, how close this buyer is to committing (viewing booked, strong interest, offer readiness)
  "risk_of_loss": number       // 0-100, how likely this buyer is to disengage/walk away right now (frustration, competitor mention, disinterest, delays)
}
Return ONLY the JSON object, no prose.`;

export async function classifyMessage(
  currentMessage: string,
  history: Array<{ senderName: string; senderRole: string; content: string }> = []
): Promise<MessageClassification> {
  const normalizedText = currentMessage.toLowerCase().trim();

  // 1. Scripted Demo Beat 1 Check (Trust Shield)
  if (
    normalizedText.includes('transfer the booking amount') ||
    normalizedText.includes('upi id') ||
    (normalizedText.includes('booking') && normalizedText.includes('before i show you')) ||
    (normalizedText.includes('advance') && (normalizedText.includes('flat') || normalizedText.includes('viewing')))
  ) {
    return {
      trust_flag: true,
      trust_reason: 'Advance booking payment requested prior to in-person viewing (Unverified UPI/Wire Transfer)',
      lead_score: 45,
      risk_of_loss: 20,
    };
  }

  // 2. Scripted Demo Beat 2 Check (Hot-Lead Walkaway Radar)
  if (
    normalizedText.includes('nvm') ||
    normalizedText.includes('look elsewhere') ||
    normalizedText.includes('forget it') ||
    normalizedText.includes('waste of time') ||
    (normalizedText.includes('taking too long') && normalizedText.includes('pass'))
  ) {
    return {
      trust_flag: false,
      trust_reason: null,
      lead_score: 28,
      risk_of_loss: 94,
    };
  }

  // High Intent / Ready to buy check
  if (
    normalizedText.includes('ready to sign') ||
    normalizedText.includes('make an offer right now') ||
    normalizedText.includes('full cash offer') ||
    normalizedText.includes('pre-approved for this amount')
  ) {
    return {
      trust_flag: false,
      trust_reason: null,
      lead_score: 95,
      risk_of_loss: 10,
    };
  }

  // General off-platform / crypto scam check
  if (
    normalizedText.includes('send bitcoin') ||
    normalizedText.includes('wire to my western union') ||
    normalizedText.includes('gift card') ||
    normalizedText.includes('text me on whatsapp only and delete this chat')
  ) {
    return {
      trust_flag: true,
      trust_reason: 'Suspicious request to circumvent verified escrow or redirect to untracked channel',
      lead_score: 20,
      risk_of_loss: 15,
    };
  }

  // 3. Try Groq API if GROQ_API_KEY is configured
  const groqApiKey = process.env.GROQ_API_KEY?.trim();
  if (groqApiKey) {
    try {
      const messagesPayload = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-5).map((m) => ({
          role: m.senderRole === 'buyer' ? 'user' : 'assistant',
          content: `${m.senderName}: ${m.content}`,
        })),
        { role: 'user', content: `Latest message: "${currentMessage}"` },
      ];

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: messagesPayload,
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
        return validateClassification(parsed);
      }
    } catch (err) {
      console.warn('Groq classifier failed, trying Gemini fallback:', err);
    }
  }

  // 4. Try Gemini API via @google/genai
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const contextSummary = history
        .slice(-5)
        .map((m) => `${m.senderRole.toUpperCase()} (${m.senderName}): ${m.content}`)
        .join('\n');

      const promptText = `${SYSTEM_PROMPT}\n\nRecent context:\n${contextSummary || 'No previous messages'}\n\nLatest message:\n"${currentMessage}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              trust_flag: { type: Type.BOOLEAN },
              trust_reason: { type: Type.STRING },
              lead_score: { type: Type.NUMBER },
              risk_of_loss: { type: Type.NUMBER },
            },
            required: ['trust_flag', 'lead_score', 'risk_of_loss'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return validateClassification(parsed);
      }
    } catch (err) {
      console.warn('Gemini classifier failed:', err);
    }
  }

  // 5. Intelligent default classification
  return {
    trust_flag: false,
    trust_reason: null,
    lead_score: 50,
    risk_of_loss: 20,
  };
}

function validateClassification(obj: any): MessageClassification {
  return {
    trust_flag: Boolean(obj?.trust_flag),
    trust_reason: obj?.trust_flag ? (String(obj?.trust_reason) || 'Suspicious payment/transaction request') : null,
    lead_score: Math.max(0, Math.min(100, Number(obj?.lead_score) || 50)),
    risk_of_loss: Math.max(0, Math.min(100, Number(obj?.risk_of_loss) || 20)),
  };
}
