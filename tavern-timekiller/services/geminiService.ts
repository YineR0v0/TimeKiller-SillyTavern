
import { GoogleGenAI } from "@google/genai";

// Assumes process.env.API_KEY is available (configured in SillyTavern/environment)
const API_KEY = process.env.API_KEY || ''; 

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!client) {
    if (!API_KEY) {
      console.warn("API_KEY is missing. Text Adventure may not work.");
    }
    client = new GoogleGenAI({ apiKey: API_KEY });
  }
  return client;
};

export const generateAdventureResponse = async (
  history: { role: string; text: string }[],
  userInput: string
): Promise<string> => {
  const ai = getClient();
  
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are a Dungeon Master for a text-based RPG. Keep responses concise (under 100 words), engaging, and second-person ('You...'). Track the player's inventory and health implicitly. If the player dies, say 'GAME OVER'.",
      temperature: 0.8,
    },
    history: history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }]
    }))
  });

  try {
    const response = await chat.sendMessage({ message: userInput });
    return response.text || "Something mysterious happened, but I can't describe it.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The mists of magic obscure your vision. (API Error: Check Console)";
  }
};
