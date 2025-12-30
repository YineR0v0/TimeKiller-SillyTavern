
// Since we are no-build, we will use a simple fetch to the API or window.GoogleGenAI if loaded
// For now, we will simulate or assume the script is loaded via ImportMap in index.html, 
// BUT index.html uses babel standalone. 
// Simplest way for Gemini in this specific environment is to use fetch directly or check window.

window.TK.generateAdventureResponse = async (history, userInput) => {
  const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';
  
  if (!apiKey) {
      return "请在 SillyTavern 环境变量中配置 API_KEY 以启用 AI 功能。";
  }

  try {
      // Direct REST Call to avoid dependency issues in no-build
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              contents: [
                  { role: "user", parts: [{ text: "System: You are a Dungeon Master. Keep it short." }] },
                  ...history.map(h => ({
                      role: h.role === 'model' ? 'model' : 'user',
                      parts: [{ text: h.text }]
                  })),
                  { role: "user", parts: [{ text: userInput }] }
              ]
          })
      });
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "AI 没有回应...";
  } catch (e) {
      console.error(e);
      return "连接失败...";
  }
};
