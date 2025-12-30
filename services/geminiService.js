
// Fetch based gemini service for no-build environment

window.TK.generateAdventureResponse = async (history, userInput) => {
  const apiKey = window.TK.config?.apiKey || '';
  const userName = window.TK.config?.userName || 'User';
  const charName = window.TK.config?.charName || 'Character';
  
  if (!apiKey) {
      return "请在[设置] -> [API & 杂项]中配置 Gemini API Key 以启用 AI 功能。";
  }

  try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              contents: [
                  { 
                    role: "user", 
                    parts: [{ text: `System: You are a Dungeon Master for a text adventure game. The player is ${userName}. The current companion character is ${charName}. You should incorporate ${charName} into the adventure if appropriate. Keep responses short (under 100 words), engaging, and interactive. Be creative.` }] 
                  },
                  ...history.map(h => ({
                      role: h.role === 'model' ? 'model' : 'user',
                      parts: [{ text: h.text }]
                  })),
                  { role: "user", parts: [{ text: userInput }] }
              ]
          })
      });
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "AI 没有回应...请检查 API Key 是否正确。";
  } catch (e) {
      console.error(e);
      return "连接失败...请检查网络连接。";
  }
};
