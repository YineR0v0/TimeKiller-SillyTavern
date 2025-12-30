
import { GoogleGenAI } from "@google/genai";

// Tries to find key in process.env or assumes user config
const getApiKey = () => {
    try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            return process.env.API_KEY;
        }
    } catch(e) {}
    return '';
};

let client = null;

const getClient = () => {
  const key = getApiKey();
  if (!client && key) {
    client = new GoogleGenAI({ apiKey: key });
  }
  return client;
};

export const generateAdventureResponse = async (history, userInput) => {
  const ai = getClient();
  if (!ai) return "Error: API Key not configured.";
  
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
