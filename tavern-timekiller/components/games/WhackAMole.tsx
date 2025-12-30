
import React, { useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { ThemeMode, WhackAMoleState } from '../../types.ts';
import { themes } from '../../utils/themes.ts';
import { playSound } from '../../utils/sound.ts';

interface WhackAMoleProps {
  onBack: () => void;
  currentTheme: ThemeMode;
  soundEnabled: boolean;
  gameState: WhackAMoleState | undefined;
  setGameState: Dispatch<SetStateAction<WhackAMoleState | undefined>>;
}

const GAME_DURATION = 30; // seconds

const WhackAMole: React.FC<WhackAMoleProps> = ({ 
  onBack, currentTheme, soundEnabled, gameState, setGameState
}) => {
  const theme = themes[currentTheme];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!gameState) {
      resetGame();
    }
    return () => stopGame();
  }, []);

  const stopGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
  };

  const resetGame = () => {
    stopGame();
    const newState: WhackAMoleState = {
        score: 0,
        timeLeft: GAME_DURATION,
        activeMole: null,
        isPlaying: false,
        difficulty: gameState?.difficulty || 'easy',
        highScore: gameState?.highScore || 0
    };
    setGameState(newState);
  };

  const startGame = () => {
      if (gameState?.isPlaying) return;
      
      const newState = { ...gameState!, isPlaying: true, score: 0, timeLeft: GAME_DURATION };
      setGameState(newState);
      playSound('click', soundEnabled);

      // Game Timer
      timerRef.current = setInterval(() => {
          setGameState(prev => {
              if (!prev) return prev;
              if (prev.timeLeft <= 1) {
                  stopGame();
                  playSound('success', soundEnabled);
                  return { ...prev, timeLeft: 0, isPlaying: false, activeMole: null };
              }
              return { ...prev, timeLeft: prev.timeLeft - 1 };
          });
      }, 1000);

      // Mole Loop
      scheduleNextMole();
  };

  const scheduleNextMole = () => {
      const speed = gameState?.difficulty === 'hard' ? 600 : 1000;
      const stayTime = gameState?.difficulty === 'hard' ? 500 : 800;

      moleTimerRef.current = setTimeout(() => {
          const hole = Math.floor(Math.random() * 9);
          setGameState(prev => {
              if (!prev) return prev;
              return { ...prev, activeMole: hole };
          });
          
          // Hide mole after some time
          setTimeout(() => {
              setGameState(prev => {
                  if (!prev) return prev;
                  if (!prev.isPlaying) return prev;
                  if (prev.activeMole === hole) return { ...prev, activeMole: null };
                  return prev;
              });
              if (gameState?.isPlaying || true) scheduleNextMole();
          }, stayTime);

      }, Math.random() * speed + 500);
  };

  const whack = (index: number) => {
      if (!gameState?.isPlaying || gameState.activeMole !== index) return;
      
      playSound('pop', soundEnabled);
      setGameState(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            score: prev.score + 10,
            activeMole: null, // Hide immediately
            highScore: Math.max(prev.highScore, prev.score + 10)
          };
      });
  };

  if (!gameState) return null;

  return (
    <div className="flex flex-col h-full gap-4">
       <div className="w-full flex justify-between items-center pb-2 border-b border-opacity-20 border-gray-500 shrink-0">
         <button onClick={() => { onBack(); playSound('click', soundEnabled); }} className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
         </button>
         <div className="flex gap-4 text-xs font-bold">
             <span className={theme.colors.accent}>时间: {gameState.timeLeft}s</span>
             <span className={theme.colors.textMain}>得分: {gameState.score}</span>
         </div>
         <button onClick={startGame} disabled={gameState.isPlaying} className={`px-3 py-1.5 rounded-lg font-bold text-xs ${gameState.isPlaying ? 'bg-gray-600 opacity-50' : theme.colors.primary + ' text-white hover:opacity-90'}`}>
            {gameState.timeLeft === 0 ? '重试' : gameState.isPlaying ? '进行中' : '开始'}
         </button>
      </div>

      <div className={`flex-1 grid grid-cols-3 gap-3 p-4 rounded-xl ${theme.colors.panel} border ${theme.colors.border}`}>
          {Array(9).fill(0).map((_, i) => (
              <button
                key={i}
                onClick={() => whack(i)}
                className={`
                    relative rounded-full border-4 shadow-inner flex items-center justify-center overflow-hidden
                    ${theme.colors.bgBase} ${theme.colors.border}
                    active:scale-95 transition-transform
                `}
              >
                  {/* Hole Shadow */}
                  <div className="absolute inset-0 bg-black/40 rounded-full" />
                  
                  {/* Mole */}
                  <div className={`
                      absolute w-3/4 h-3/4 bg-amber-600 rounded-full border-4 border-amber-800 shadow-lg transition-transform duration-100
                      flex items-center justify-center
                      ${gameState.activeMole === i ? 'translate-y-0' : 'translate-y-[150%]'}
                  `}>
                      <div className="w-full text-center text-xl">🐹</div>
                  </div>
              </button>
          ))}
      </div>
      
      <div className="text-center text-xs opacity-50">
          最高分: {gameState.highScore}
      </div>
    </div>
  );
};

export default WhackAMole;
