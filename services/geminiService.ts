
import { GoogleGenAI, Type } from "@google/genai";
import { Message, AgentResponse } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-3-flash-preview';

const systemInstruction = `You are an AI-powered Agentic Honey-Pot system.
Your mission is to detect scam messages and engage scammers to extract actionable intelligence.
You must maintain a believable, unsuspecting persona of a potential victim. Never reveal you are an AI or a honey-pot.
Analyze the conversation. If you detect scam intent, continue the conversation strategically to extract information like bank account numbers, UPI IDs, phishing links, names, or phone numbers. Be patient and build trust.
Your response MUST be a single JSON object that conforms to the provided schema.
The JSON object must have two top-level keys: 'reply' (your conversational response to the user) and 'analysis' (your internal analysis of the situation).
The analysis must include a numerical 'scam_score' from 0 (definitely not a scam) to 100 (confirmed scam).`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description: 'Your conversational response to the user, maintaining your persona.',
    },
    analysis: {
      type: Type.OBJECT,
      properties: {
        scam_status: {
          type: Type.STRING,
          enum: ['NOT_DETECTED', 'MONITORING', 'SCAM_CONFIRMED'],
          description: 'The current assessment of scam activity.',
        },
        scam_score: {
          type: Type.INTEGER,
          description: 'A numerical score from 0 to 100 representing the likelihood of a scam.'
        },
        reasoning: {
          type: Type.STRING,
          description: 'Brief reasoning for the current scam status assessment.',
        },
        extracted_intelligence: {
          type: Type.OBJECT,
          properties: {
            bank_accounts: { type: Type.ARRAY, items: { type: Type.STRING } },
            upi_ids: { type: Type.ARRAY, items: { type: Type.STRING } },
            phishing_links: { type: Type.ARRAY, items: { type: Type.STRING } },
            names: { type: Type.ARRAY, items: { type: Type.STRING } },
            phone_numbers: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
      required: ['scam_status', 'scam_score', 'reasoning', 'extracted_intelligence'],
    },
  },
  required: ['reply', 'analysis'],
};


export const getAgentResponse = async (history: Message[]): Promise<AgentResponse> => {
  const conversationHistory = history.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
  const prompt = `Here is the conversation history:\n${conversationHistory}\n\nBased on this, provide your response and analysis in the required JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    if (response.text) {
        const jsonText = response.text.trim();
        try {
            // The API should return valid JSON, but we parse defensively.
            return JSON.parse(jsonText) as AgentResponse;
        } catch (parseError) {
            console.error("Failed to parse JSON response from AI:", jsonText, parseError);
            throw new Error("The AI returned a response in an invalid format.");
        }
    } else {
        throw new Error("Received an empty response from the AI.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Re-throw a more generic error for the UI to handle, hiding implementation details.
    if (error instanceof Error) {
        // If it's one of our custom errors, pass it along.
        if (error.message.includes("invalid format") || error.message.includes("empty response")) {
            throw error;
        }
    }
    throw new Error("An unexpected error occurred while communicating with the AI model.");
  }
};
