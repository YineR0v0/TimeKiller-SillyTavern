
window.TK.TextAdventure = ({ 
  onBack, currentTheme, soundEnabled, gameState, setGameState
}) => {
  const { themes, playSound, generateAdventureResponse } = window.TK;
  const theme = themes[currentTheme];
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (!gameState) {
      setGameState({
          messages: [{ role: 'system', text: '欢迎来到文字冒险！你在一个神秘的森林入口醒来。你想要做什么？', timestamp: Date.now() }],
          isLoading: false,
          inventory: [],
          health: 100,
          location: 'Forest Entrance'
      });
    }
  }, []);

  React.useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [gameState?.messages, gameState?.isLoading]);

  const handleSend = async () => {
      if (!input.trim() || !gameState || gameState.isLoading) return;
      
      const userMsg = { role: 'user', text: input, timestamp: Date.now() };
      const newHistory = [...gameState.messages, userMsg];
      
      setGameState({ ...gameState, messages: newHistory, isLoading: true });
      setInput('');
      playSound('click', soundEnabled);

      try {
          const aiText = await generateAdventureResponse(
              newHistory.map(m => ({ role: m.role, text: m.text })),
              input
          );
          
          const aiMsg = { role: 'model', text: aiText, timestamp: Date.now() };
          setGameState({ 
              ...gameState, 
              messages: [...newHistory, aiMsg], 
              isLoading: false 
          });
          playSound('pop', soundEnabled);
      } catch (e) {
          setGameState({ ...gameState, isLoading: false });
      }
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter') handleSend();
  };

  if (!gameState) return null;

  return (
    <div className="flex flex-col h-full gap-2">
       <div className="w-full flex justify-between items-center pb-2 border-b border-opacity-20 border-gray-500 shrink-0">
         <button onClick={() => { onBack(); playSound('click', soundEnabled); }} className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
         </button>
         <span className="font-bold text-sm">AI 冒险</span>
         <div className="w-8" />
      </div>

      <div ref={scrollRef} className={`flex-1 overflow-y-auto p-2 rounded-lg bg-black/20 border ${theme.colors.border} space-y-3 custom-scrollbar`}>
          {gameState.messages.filter(m => m.role !== 'system').map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`
                      max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed
                      ${msg.role === 'user' 
                          ? `${theme.colors.primary} text-white rounded-tr-none` 
                          : `${theme.colors.panel} border ${theme.colors.border} rounded-tl-none`
                      }
                  `}>
                      {msg.text}
                  </div>
              </div>
          ))}
          
          {gameState.messages.length > 0 && gameState.messages[0].role === 'system' && (
              <div className="text-center text-xs opacity-50 italic my-2">{gameState.messages[0].text}</div>
          )}
          
          {gameState.isLoading && (
              <div className="flex justify-start">
                  <div className={`px-3 py-2 rounded-lg ${theme.colors.panel} text-xs animate-pulse`}>
                      Thinking...
                  </div>
              </div>
          )}
      </div>

      <div className="flex gap-2 shrink-0">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="你想要做什么..."
            className={`flex-1 bg-black/30 border ${theme.colors.border} rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors ${theme.colors.textMain}`}
          />
          <button 
            onClick={handleSend}
            disabled={gameState.isLoading || !input.trim()}
            className={`px-4 rounded-lg font-bold ${theme.colors.primary} text-white disabled:opacity-50`}
          >
              ➤
          </button>
      </div>
    </div>
  );
};
