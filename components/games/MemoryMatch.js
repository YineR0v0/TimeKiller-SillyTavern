
import React, { useEffect } from 'react';
import { themes } from '../../utils/themes.js';
import { playSound } from '../../utils/sound.js';

const ICONS = ['🍎', '🍌', '🍒', '🍇', '🍉', '🥝', '🥑', '🍋'];

const MemoryMatch = ({ 
  onBack, currentTheme, soundEnabled, gameState, setGameState
}) => {
  const theme = themes[currentTheme];

  useEffect(() => {
    if (!gameState || !gameState.isGenerated) {
        initializeGame();
    }
  }, []);

  const initializeGame = () => {
    const shuffledIcons = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false,
      }));
    setGameState({
        cards: shuffledIcons,
        flippedCards: [],
        matches: 0,
        moves: 0,
        isGenerated: true
    });
  };

  const handleCardClick = (id) => {
    if (!gameState || gameState.flippedCards.length === 2 || gameState.cards[id].isFlipped || gameState.cards[id].isMatched) return;

    playSound('click', soundEnabled);
    const newCards = [...gameState.cards];
    newCards[id].isFlipped = true;
    
    const newFlipped = [...gameState.flippedCards, id];
    
    setGameState({ ...gameState, cards: newCards, flippedCards: newFlipped });

    if (newFlipped.length === 2) {
      const [firstId, secondId] = newFlipped;
      if (newCards[firstId].icon === newCards[secondId].icon) {
        setTimeout(() => {
          playSound('success', soundEnabled);
          const matchedCards = newCards.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          );
          setGameState({
              ...gameState,
              cards: matchedCards,
              flippedCards: [],
              matches: gameState.matches + 1,
              moves: gameState.moves + 1
          });
        }, 500);
      } else {
        setTimeout(() => {
          playSound('pop', soundEnabled);
          const resetCards = newCards.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
          );
          setGameState({
              ...gameState,
              cards: resetCards,
              flippedCards: [],
              moves: gameState.moves + 1
          });
        }, 1000);
      }
    }
  };

  if (!gameState) return null;
  const isWin = gameState.matches === ICONS.length;

  return (
    <div className="flex flex-col h-full gap-4 relative">
       <div className="w-full flex justify-between items-center pb-2 border-b border-opacity-20 border-gray-500">
         <button 
           onClick={() => { onBack(); playSound('click', soundEnabled); }}
           className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80 transition-all`}
         >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
         </button>
         
         <div className={`font-bold ${theme.colors.accent} text-sm`}>
           步数: {gameState.moves}
         </div>

         <button onClick={() => { initializeGame(); playSound('click', soundEnabled); }} className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80 transition-all active:scale-95`} title="重置">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
         </button>
      </div>

      <div className="grid grid-cols-4 gap-2 flex-1 content-start">
        {gameState.cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              aspect-square rounded-lg flex items-center justify-center text-2xl transition-all duration-300 transform active:scale-95
              ${card.isFlipped || card.isMatched 
                ? `${theme.colors.primary} rotate-y-180` 
                : `${theme.colors.panel} ${theme.colors.border} border`
              }
              ${card.isMatched ? 'opacity-50' : 'hover:scale-105'}
            `}
          >
            {(card.isFlipped || card.isMatched) ? card.icon : '❓'}
          </button>
        ))}
      </div>
      
      {isWin && (
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in z-20">
             <h2 className="text-2xl font-bold text-white mb-4">记忆大师!</h2>
             <button 
               onClick={() => { initializeGame(); playSound('click', soundEnabled); }}
               className={`px-6 py-2 rounded-full font-bold text-white shadow-lg active:scale-95 transition-transform ${theme.colors.primary} ${theme.colors.primaryHover}`}
             >
                再玩一次
             </button>
         </div>
      )}
    </div>
  );
};

export default MemoryMatch;
