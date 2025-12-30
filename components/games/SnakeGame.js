
const GRID_SIZE = 20;
const SPEED = 130;

window.TK.SnakeGame = ({ 
  onBack, currentTheme, soundEnabled, gameState, setGameState
}) => {
  const { themes, playSound } = window.TK;
  const theme = themes[currentTheme];
  const directionRef = React.useRef('RIGHT');
  const gameLoopRef = React.useRef(null);
  const touchStartRef = React.useRef(null);

  const generateFood = (snake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      const onSnake = snake.some(s => s.x === newFood.x && s.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  };

  React.useEffect(() => {
    if (!gameState) {
      resetGame();
    } else {
      directionRef.current = gameState.direction;
    }
  }, []);

  const resetGame = () => {
    setGameState({
        snake: [{x: 10, y: 10}],
        food: generateFood([{x: 10, y: 10}]),
        direction: 'RIGHT',
        score: 0,
        gameOver: false,
        highScore: gameState?.highScore || 0,
        isPlaying: true
    });
    directionRef.current = 'RIGHT';
    playSound('click', soundEnabled);
  };

  React.useEffect(() => {
    if (gameState?.isPlaying && !gameState.gameOver) {
        gameLoopRef.current = setInterval(moveSnake, SPEED);
    }
    return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState?.isPlaying, gameState?.gameOver, gameState?.snake]);

  const moveSnake = () => {
      setGameState(prev => {
         const head = { ...prev.snake[0] };
      
         switch (directionRef.current) {
            case 'UP': head.y -= 1; break;
            case 'DOWN': head.y += 1; break;
            case 'LEFT': head.x -= 1; break;
            case 'RIGHT': head.x += 1; break;
         }

         if (
            head.x < 0 || head.x >= GRID_SIZE ||
            head.y < 0 || head.y >= GRID_SIZE ||
            prev.snake.some(s => s.x === head.x && s.y === head.y)
         ) {
            playSound('fail', soundEnabled);
            return { ...prev, gameOver: true, isPlaying: false };
         }

         const newSnake = [head, ...prev.snake];
         let newScore = prev.score;
         let newFood = prev.food;

         if (head.x === prev.food.x && head.y === prev.food.y) {
            newScore += 10;
            newFood = generateFood(newSnake);
            playSound('pop', soundEnabled);
         } else {
            newSnake.pop();
         }

         return {
            ...prev,
            snake: newSnake,
            food: newFood,
            score: newScore,
            direction: directionRef.current,
            highScore: Math.max(prev.highScore, newScore)
         };
      });
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      
      const current = directionRef.current;
      if (e.key === 'ArrowUp' && current !== 'DOWN') directionRef.current = 'UP';
      if (e.key === 'ArrowDown' && current !== 'UP') directionRef.current = 'DOWN';
      if (e.key === 'ArrowLeft' && current !== 'RIGHT') directionRef.current = 'LEFT';
      if (e.key === 'ArrowRight' && current !== 'LEFT') directionRef.current = 'RIGHT';
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTouchStart = (e) => {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
      if (!touchStartRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      
      const current = directionRef.current;

      if (Math.abs(dx) > Math.abs(dy)) {
          if (Math.abs(dx) > 30) {
              if (dx > 0 && current !== 'LEFT') directionRef.current = 'RIGHT';
              else if (dx < 0 && current !== 'RIGHT') directionRef.current = 'LEFT';
          }
      } else {
          if (Math.abs(dy) > 30) {
              if (dy > 0 && current !== 'UP') directionRef.current = 'DOWN';
              else if (dy < 0 && current !== 'DOWN') directionRef.current = 'UP';
          }
      }
      touchStartRef.current = null;
  };

  const handleDirBtn = (e, dir) => {
      e.preventDefault();
      e.stopPropagation();
      const current = directionRef.current;
      if (dir === 'UP' && current !== 'DOWN') directionRef.current = 'UP';
      if (dir === 'DOWN' && current !== 'UP') directionRef.current = 'DOWN';
      if (dir === 'LEFT' && current !== 'RIGHT') directionRef.current = 'LEFT';
      if (dir === 'RIGHT' && current !== 'LEFT') directionRef.current = 'RIGHT';
  };

  if (!gameState) return null;

  return (
    <div className="flex flex-col h-full gap-2 relative touch-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
       <div className="w-full flex justify-between items-center pb-2 border-b border-opacity-20 border-gray-500 shrink-0">
         <button onClick={() => { onBack(); playSound('click', soundEnabled); }} className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
         </button>
         <div className="flex gap-4 text-xs font-bold">
             <span className={theme.colors.textMain}>得分: {gameState.score}</span>
             <span className={theme.colors.accent}>最高: {gameState.highScore}</span>
         </div>
         <button onClick={resetGame} className={`px-3 py-1.5 rounded-lg font-bold text-xs ${theme.colors.primary} text-white hover:opacity-90`}>
            {gameState.isPlaying ? '重置' : '开始'}
         </button>
      </div>

      <div className={`flex-1 relative rounded-lg border ${theme.colors.border} ${theme.colors.panel} overflow-hidden`}>
          {!gameState.isPlaying && !gameState.gameOver && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <span className={`animate-pulse ${theme.colors.textDim}`}>点击开始游戏</span>
              </div>
          )}
          
          {gameState.gameOver && (
              <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                  <h3 className="text-2xl font-bold text-white mb-2">游戏结束</h3>
                  <p className="text-white/80 mb-4">最终得分: {gameState.score}</p>
                  <button onClick={resetGame} className={`px-4 py-2 rounded-full font-bold text-white ${theme.colors.primary}`}>再玩一次</button>
              </div>
          )}

          <div 
            className="w-full h-full relative"
            style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
            }}
          >
              {gameState.snake.map((segment, i) => (
                  <div 
                    key={`${segment.x}-${segment.y}-${i}`}
                    style={{ gridColumn: segment.x + 1, gridRow: segment.y + 1 }}
                    className={`rounded-sm z-10 ${i === 0 ? theme.colors.primary : theme.colors.textDim} opacity-90`}
                  />
              ))}
              
              <div 
                style={{ 
                    gridColumn: gameState.food.x + 1, 
                    gridRow: gameState.food.y + 1,
                    boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)'
                }}
                className={`rounded-full bg-red-500 animate-pulse`}
              />
          </div>
      </div>
      
      <div className="md:hidden h-24 grid grid-cols-3 gap-1 mt-2 px-8 select-none touch-none">
          <div />
          <button 
             className="bg-white/10 active:bg-white/20 rounded-lg flex items-center justify-center text-xl shadow"
             onPointerDown={(e) => handleDirBtn(e, 'UP')}
          >↑</button>
          <div />
          
          <button 
             className="bg-white/10 active:bg-white/20 rounded-lg flex items-center justify-center text-xl shadow"
             onPointerDown={(e) => handleDirBtn(e, 'LEFT')}
          >←</button>
          <button 
             className="bg-white/10 active:bg-white/20 rounded-lg flex items-center justify-center text-xl shadow"
             onPointerDown={(e) => handleDirBtn(e, 'DOWN')}
          >↓</button>
          <button 
             className="bg-white/10 active:bg-white/20 rounded-lg flex items-center justify-center text-xl shadow"
             onPointerDown={(e) => handleDirBtn(e, 'RIGHT')}
          >→</button>
      </div>

    </div>
  );
};
