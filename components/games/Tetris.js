
import React, { useEffect, useRef, useCallback } from 'react';
import { themes } from '../../utils/themes.js';
import { playSound } from '../../utils/sound.js';

const ROWS = 20;
const COLS = 10;
const SHAPES = [
  [[1, 1, 1, 1]], 
  [[1, 1], [1, 1]], 
  [[0, 1, 0], [1, 1, 1]], 
  [[1, 0, 0], [1, 1, 1]], 
  [[0, 0, 1], [1, 1, 1]], 
  [[0, 1, 1], [1, 1, 0]], 
  [[1, 1, 0], [0, 1, 1]]  
];
const COLORS = ['#06b6d4', '#fbbf24', '#a855f7', '#f97316', '#3b82f6', '#22c55e', '#ef4444'];

const createEmptyGrid = () => Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

const Tetris = ({ onBack, currentTheme, soundEnabled, gameState, setGameState }) => {
  const theme = themes[currentTheme];
  const requestRef = useRef(null);
  const lastTimeRef = useRef(0);
  const dropCounterRef = useRef(0);
  const dropInterval = useRef(800);
  
  const moveIntervalRef = useRef(null);
  const isTouchingRef = useRef(false);

  const spawnPiece = (currentNextPiece, currentState) => {
    const id = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[id];
    const color = COLORS[id];
    
    const pieceToSpawn = currentNextPiece || { shape, color };
    
    const nextId = Math.floor(Math.random() * SHAPES.length);
    const nextPiece = { shape: SHAPES[nextId], color: COLORS[nextId] };

    const newPiece = {
      shape: pieceToSpawn.shape,
      color: pieceToSpawn.color,
      x: Math.floor(COLS / 2) - Math.floor(pieceToSpawn.shape[0].length / 2),
      y: 0
    };
    
    return { active: newPiece, next: nextPiece };
  };

  const resetGame = () => {
      const spawn = spawnPiece(null);
      setGameState({
          grid: createEmptyGrid(),
          activePiece: spawn.active,
          score: 0,
          gameOver: false,
          isPaused: false,
          nextPiece: spawn.next
      });
      playSound('click', soundEnabled);
  };

  useEffect(() => {
    if (!gameState) {
        resetGame();
    }
    if (gameState && !gameState.gameOver && !gameState.isPaused) {
        requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const checkCollision = (grid, shape, x, y) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const newY = y + r;
          const newX = x + c;
          if (newY >= ROWS || newX < 0 || newX >= COLS || (newY >= 0 && grid[newY][newX])) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotate = (matrix) => {
    return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
  };

  const merge = (grid, piece) => {
    const newGrid = grid.map(row => [...row]);
    piece.shape.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val !== 0) {
           if(piece.y + r >= 0) newGrid[piece.y + r][piece.x + c] = piece.color;
        }
      });
    });
    return newGrid;
  };

  const clearLines = (grid) => {
    let linesCleared = 0;
    const newGrid = grid.filter(row => {
      const full = row.every(cell => cell !== null);
      if (full) linesCleared++;
      return !full;
    });
    while (newGrid.length < ROWS) {
      newGrid.unshift(Array(COLS).fill(null));
    }
    return { newGrid, linesCleared };
  };

  const handleDrop = useCallback(() => {
    const current = stateRef.current;
    if (!current || !current.activePiece) return;

    if (checkCollision(current.grid, current.activePiece.shape, current.activePiece.x, current.activePiece.y + 1)) {
        const newGridMerged = merge(current.grid, current.activePiece);
        const { newGrid, linesCleared } = clearLines(newGridMerged);
        
        if (linesCleared > 0) playSound('success', soundEnabled);
        else playSound('click', soundEnabled);

        const newScore = current.score + (linesCleared * 100 * linesCleared);
        
        dropInterval.current = Math.max(100, 800 - Math.floor(newScore / 500) * 50);

        const spawn = spawnPiece(current.nextPiece);
        
        if (checkCollision(newGrid, spawn.active.shape, spawn.active.x, spawn.active.y)) {
             setGameState({ ...current, grid: newGrid, score: newScore, gameOver: true });
             playSound('fail', soundEnabled);
        } else {
             setGameState({
                ...current,
                grid: newGrid,
                score: newScore,
                activePiece: spawn.active,
                nextPiece: spawn.next
            });
        }
    } else {
        setGameState({
          ...current,
          activePiece: { ...current.activePiece, y: current.activePiece.y + 1 }
        });
    }
    dropCounterRef.current = 0;
  }, [soundEnabled]);

  const gameLoop = (time) => {
    if (!stateRef.current || stateRef.current.gameOver || stateRef.current.isPaused) {
        requestRef.current = requestAnimationFrame(gameLoop);
        return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    dropCounterRef.current += deltaTime;

    if (dropCounterRef.current > dropInterval.current) {
      handleDrop();
    }
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
     if (requestRef.current) cancelAnimationFrame(requestRef.current);
     requestRef.current = requestAnimationFrame(gameLoop);
     return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); }
  }, []); 

  const handleMove = (dir) => {
    const s = stateRef.current;
    if (!s || s.gameOver || s.isPaused || !s.activePiece) return;
    if (!checkCollision(s.grid, s.activePiece.shape, s.activePiece.x + dir, s.activePiece.y)) {
      setGameState({
        ...s,
        activePiece: { ...s.activePiece, x: s.activePiece.x + dir }
      });
    }
  };

  const handleRotate = () => {
    const s = stateRef.current;
    if (!s || s.gameOver || s.isPaused || !s.activePiece) return;
    const rotated = rotate(s.activePiece.shape);
    let offset = 0;
    if (checkCollision(s.grid, rotated, s.activePiece.x, s.activePiece.y)) {
        offset = s.activePiece.x > COLS / 2 ? -1 : 1;
        if (checkCollision(s.grid, rotated, s.activePiece.x + offset, s.activePiece.y)) return;
    }
    
    setGameState({
      ...s,
      activePiece: { ...s.activePiece, shape: rotated, x: s.activePiece.x + offset }
    });
  };

  const handleHardDrop = () => {
      const s = stateRef.current;
      if (!s || s.gameOver || s.isPaused || !s.activePiece) return;
      let tempY = s.activePiece.y;
      while(!checkCollision(s.grid, s.activePiece.shape, s.activePiece.x, tempY + 1)) {
          tempY++;
      }
      setGameState({
          ...s,
          activePiece: { ...s.activePiece, y: tempY }
      });
      dropCounterRef.current = dropInterval.current + 100;
  };

  const togglePause = () => {
      if(!gameState) return;
      setGameState({ ...gameState, isPaused: !gameState.isPaused });
  };

  const startAction = (action, interval = 100) => {
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
      action(); 
      isTouchingRef.current = true;
      moveIntervalRef.current = setInterval(() => {
          if (isTouchingRef.current) action();
      }, interval);
  };

  const stopAction = () => {
      isTouchingRef.current = false;
      if (moveIntervalRef.current) {
          clearInterval(moveIntervalRef.current);
          moveIntervalRef.current = null;
      }
  };

  if (!gameState) return null;

  return (
    <div className="flex flex-col h-full gap-2 relative outline-none touch-none" tabIndex={0} onKeyDown={(e) => {
        if(e.key === 'ArrowLeft') handleMove(-1);
        if(e.key === 'ArrowRight') handleMove(1);
        if(e.key === 'ArrowUp') handleRotate();
        if(e.key === 'ArrowDown') handleDrop();
        if(e.key === ' ') handleHardDrop();
    }}>
       <div className="w-full flex justify-between items-center pb-2 border-b border-opacity-20 border-gray-500 shrink-0">
         <button onClick={() => { onBack(); playSound('click', soundEnabled); }} className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80`}>
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
         </button>
         <div className="flex flex-col items-center">
             <span className={`text-[10px] ${theme.colors.textDim}`}>分数</span>
             <span className={`font-bold ${theme.colors.textMain}`}>{gameState.score}</span>
         </div>
         <div className="flex gap-2">
            <button onClick={togglePause} className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80`}>
                {gameState.isPaused ? '▶' : 'II'}
            </button>
            <button onClick={resetGame} className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80 active:scale-95`} title="重置">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
         </div>
      </div>

      <div className="flex-1 flex gap-2 overflow-hidden">
          <div className={`relative flex-1 rounded-lg border ${theme.colors.border} bg-black/40 overflow-hidden`}>
               <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
                   {gameState.grid.map((row, y) => row.map((color, x) => (
                       <div key={`${x}-${y}`} className={`border-[0.5px] border-white/5 ${color ? '' : ''}`} style={{ backgroundColor: color || 'transparent' }} />
                   )))}
               </div>
               
               {gameState.activePiece && gameState.activePiece.shape.map((row, r) => row.map((val, c) => {
                   if (val && gameState.activePiece) {
                       const finalX = gameState.activePiece.x + c;
                       const finalY = gameState.activePiece.y + r;
                       if(finalY >= 0) {
                           return (
                               <div 
                                key={`active-${r}-${c}`}
                                className="absolute border-[0.5px] border-white/20"
                                style={{ 
                                    left: `${finalX * 10}%`, 
                                    top: `${finalY * 5}%`, 
                                    width: '10%', 
                                    height: '5%',
                                    backgroundColor: gameState.activePiece.color
                                }}
                               />
                           )
                       }
                   }
                   return null;
               }))}

               {gameState.gameOver && (
                   <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
                       <h3 className="text-2xl font-bold text-white mb-2">Game Over</h3>
                       <button onClick={resetGame} className={`px-4 py-2 rounded-full ${theme.colors.primary} text-white`}>重试</button>
                   </div>
               )}
               {gameState.isPaused && !gameState.gameOver && (
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                       <span className="text-white font-bold text-xl">已暂停</span>
                   </div>
               )}
          </div>

          <div className="w-16 flex flex-col gap-2">
              <div className={`p-1 rounded border ${theme.colors.border} ${theme.colors.panel} aspect-square flex flex-col items-center justify-center`}>
                  <span className="text-[9px] mb-1 opacity-70">Next</span>
                  <div className="w-10 h-10 relative">
                      {gameState.nextPiece && gameState.nextPiece.shape.map((row, r) => row.map((val, c) => (
                          val ? <div key={`next-${r}-${c}`} className="absolute w-2 h-2" style={{ left: c*8 + (gameState.nextPiece.shape[0].length === 2 ? 8 : 4), top: r*8 + 8, backgroundColor: gameState.nextPiece.color }} /> : null
                      )))}
                  </div>
              </div>
          </div>
      </div>
      
      <div className="md:hidden h-32 grid grid-cols-4 gap-2 mt-2 px-1 select-none touch-none">
          <button 
            className="no-drag col-span-1 bg-purple-500/20 active:bg-purple-500/40 rounded-xl flex flex-col items-center justify-center border border-purple-500/30 shadow-lg" 
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); startAction(handleRotate, 250); }}
            onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); stopAction(); }}
            onPointerLeave={(e) => { e.preventDefault(); e.stopPropagation(); stopAction(); }}
            onContextMenu={(e) => e.preventDefault()}
            style={{ touchAction: 'none' }}
          >
            <span className="text-2xl font-bold">↻</span>
            <span className="text-[10px] opacity-70">旋转</span>
          </button>
          
          <div className="col-span-2 grid grid-cols-3 gap-1">
            <button 
                className="no-drag bg-white/10 active:bg-white/20 rounded-lg flex items-center justify-center text-xl shadow" 
                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); startAction(() => handleMove(-1), 100); }}
                onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); stopAction(); }}
                onPointerLeave={(e) => { e.preventDefault(); e.stopPropagation(); stopAction(); }}
                onContextMenu={(e) => e.preventDefault()}
                style={{ touchAction: 'none' }}
            >←</button>
            <button 
                className="no-drag bg-white/10 active:bg-white/20 rounded-lg flex items-center justify-center text-xl shadow" 
                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); startAction(handleDrop, 100); }}
                onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); stopAction(); }}
                onPointerLeave={(e) => { e.preventDefault(); e.stopPropagation(); stopAction(); }}
                onContextMenu={(e) => e.preventDefault()}
                style={{ touchAction: 'none' }}
            >↓</button>
            <button 
                className="no-drag bg-white/10 active:bg-white/20 rounded-lg flex items-center justify-center text-xl shadow" 
                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); startAction(() => handleMove(1), 100); }}
                onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); stopAction(); }}
                onPointerLeave={(e) => { e.preventDefault(); e.stopPropagation(); stopAction(); }}
                onContextMenu={(e) => e.preventDefault()}
                style={{ touchAction: 'none' }}
            >→</button>
          </div>

          <button 
            className="no-drag col-span-1 bg-red-500/20 active:bg-red-500/40 rounded-xl flex flex-col items-center justify-center border border-red-500/30 shadow-lg" 
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); handleHardDrop(); }}
            onContextMenu={(e) => e.preventDefault()}
            style={{ touchAction: 'none' }}
          >
             <span className="text-xl font-bold">⚡</span>
             <span className="text-[10px] opacity-70">直落</span>
          </button>
      </div>
    </div>
  );
};

export default Tetris;
