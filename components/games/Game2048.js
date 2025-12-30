
import React, { useEffect, useRef } from 'react';
import { themes } from '../../utils/themes.js';
import { playSound } from '../../utils/sound.js';

const SIZE = 4;

const Game2048 = ({ 
  onBack, currentTheme, soundEnabled, onSave, onLoad, gameState, setGameState
}) => {
  const theme = themes[currentTheme];
  const touchStart = useRef(null);

  const createEmptyGrid = () => Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));

  const addRandomTile = (currentGrid) => {
    const available = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (currentGrid[r][c] === 0) available.push({ r, c });
      }
    }
    if (available.length > 0) {
      const spot = available[Math.floor(Math.random() * available.length)];
      currentGrid[spot.r][spot.c] = Math.random() > 0.9 ? 4 : 2;
    }
    return currentGrid;
  };

  useEffect(() => {
    if (!gameState) {
      let newGrid = createEmptyGrid();
      addRandomTile(newGrid);
      addRandomTile(newGrid);
      setGameState({
        grid: newGrid,
        score: 0,
        gameOver: false
      });
    }
  }, []);

  const resetGame = () => {
    let newGrid = createEmptyGrid();
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    setGameState({
      grid: newGrid,
      score: 0,
      gameOver: false
    });
    playSound('click', soundEnabled);
  };

  const move = (dir) => {
    if (!gameState || gameState.gameOver) return;
    const { grid, score } = gameState;

    let rotatedGrid = [...grid.map(row => [...row])];
    
    if (dir === 'UP') rotatedGrid = rotateLeft(rotatedGrid);
    if (dir === 'RIGHT') rotatedGrid = rotateLeft(rotateLeft(rotatedGrid));
    if (dir === 'DOWN') rotatedGrid = rotateLeft(rotateLeft(rotateLeft(rotatedGrid)));

    let moved = false;
    let newScore = score;

    for (let r = 0; r < SIZE; r++) {
      const row = rotatedGrid[r].filter(val => val !== 0);
      const newRow = [];
      
      for (let c = 0; c < row.length; c++) {
        if (c + 1 < row.length && row[c] === row[c + 1]) {
          newRow.push(row[c] * 2);
          newScore += row[c] * 2;
          c++; 
          moved = true;
          playSound('pop', soundEnabled); 
        } else {
          newRow.push(row[c]);
        }
      }
      
      while (newRow.length < SIZE) newRow.push(0);
      
      if (newRow.join(',') !== rotatedGrid[r].join(',')) moved = true;
      rotatedGrid[r] = newRow;
    }

    if (dir === 'UP') rotatedGrid = rotateLeft(rotateLeft(rotateLeft(rotatedGrid)));
    if (dir === 'RIGHT') rotatedGrid = rotateLeft(rotateLeft(rotatedGrid));
    if (dir === 'DOWN') rotatedGrid = rotateLeft(rotatedGrid);

    if (moved) {
      addRandomTile(rotatedGrid);
      const isOver = checkGameOver(rotatedGrid);
      setGameState({
        grid: rotatedGrid,
        score: newScore,
        gameOver: isOver
      });
      if (isOver) playSound('fail', soundEnabled);
      else playSound('click', soundEnabled);
    }
  };

  const rotateLeft = (matrix) => {
    const result = createEmptyGrid();
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        result[SIZE - 1 - c][r] = matrix[r][c];
      }
    }
    return result;
  };

  const checkGameOver = (currentGrid) => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (currentGrid[r][c] === 0) return false;
        if (c < SIZE - 1 && currentGrid[r][c] === currentGrid[r][c + 1]) return false;
        if (r < SIZE - 1 && currentGrid[r][c] === currentGrid[r + 1][c]) return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
         e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp': move('UP'); break;
        case 'ArrowDown': move('DOWN'); break;
        case 'ArrowLeft': move('LEFT'); break;
        case 'ArrowRight': move('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const handleTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    
    const dx = touchEnd.x - touchStart.current.x;
    const dy = touchEnd.y - touchStart.current.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) move(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      if (Math.abs(dy) > 30) move(dy > 0 ? 'DOWN' : 'UP');
    }
    touchStart.current = null;
  };

  const getCellColor = (val) => {
    if (val === 0) return 'bg-opacity-10 bg-black';

    const isRetro = currentTheme === 'retro';
    const isLight = currentTheme === 'light';

    if (isRetro) {
      const colors = {
        2: 'bg-[#eee8d5] text-[#657b83]',
        4: 'bg-[#fdf6e3] text-[#657b83]',
        8: 'bg-[#b58900] text-white',
        16: 'bg-[#cb4b16] text-white',
        32: 'bg-[#dc322f] text-white',
        64: 'bg-[#d33682] text-white',
        128: 'bg-[#6c71c4] text-white',
        256: 'bg-[#268bd2] text-white',
        512: 'bg-[#2aa198] text-white',
        1024: 'bg-[#859900] text-white',
        2048: 'bg-[#002b36] text-[#b58900] shadow-[0_0_10px_#b58900]',
      };
      return colors[val] || 'bg-[#073642] text-white';
    }

    const colors = {
      2: isLight ? 'bg-gray-200 text-gray-700' : 'bg-slate-700 text-white',
      4: isLight ? 'bg-gray-300 text-gray-800' : 'bg-slate-600 text-white',
      8: 'bg-indigo-400 text-white',
      16: 'bg-indigo-500 text-white',
      32: 'bg-indigo-600 text-white',
      64: 'bg-purple-500 text-white',
      128: 'bg-purple-600 text-white',
      256: 'bg-pink-500 text-white',
      512: 'bg-pink-600 text-white',
      1024: 'bg-yellow-500 text-white',
      2048: 'bg-green-500 text-white shadow-[0_0_10px_#22c55e]',
    };
    return colors[val] || 'bg-black text-white';
  };

  if (!gameState) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="flex flex-col items-center gap-4 h-full select-none"
         onTouchStart={handleTouchStart}
         onTouchEnd={handleTouchEnd}>
      
      <div className="w-full flex justify-between items-center gap-2">
         <button 
           onClick={() => { onBack(); playSound('click', soundEnabled); }}
           className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80 transition-all`}
         >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
         </button>
         
         <div className="flex-1 flex justify-center gap-2">
             <button onClick={onSave} className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80 transition-all flex items-center gap-1 text-xs`} title="保存">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                保存
             </button>
             <button onClick={onLoad} className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80 transition-all flex items-center gap-1 text-xs`} title="读取">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 13h6m-3-3v6m-9 1V7a2 2 0 0 1 2-2h6l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                读取
             </button>
         </div>

        <div className={`px-4 py-1.5 rounded-lg text-sm border font-medium ${theme.colors.panel} ${theme.colors.border}`}>
          分数: <span className={`${theme.colors.accent}`}>{gameState.score}</span>
        </div>
      </div>

      <div className={`relative p-3 rounded-lg border ${theme.colors.panel} ${theme.colors.border}`}>
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {gameState.grid.map((row, r) => (
            row.map((val, c) => (
              <div 
                key={`${r}-${c}`}
                className={`
                  w-14 h-14 md:w-16 md:h-16 rounded-md flex items-center justify-center 
                  text-xl font-bold transition-all duration-200 transform
                  ${getCellColor(val)}
                  ${val > 0 ? 'scale-100' : 'scale-95 opacity-50'}
                `}
              >
                {val > 0 ? val : ''}
              </div>
            ))
          ))}
        </div>
        {gameState.gameOver && (
          <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg animate-in fade-in duration-300">
            <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-md">游戏结束!</h3>
            <button 
              onClick={resetGame}
              className={`${theme.colors.primary} ${theme.colors.primaryHover} text-white px-6 py-2 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95`}
            >
              重来一局
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game2048;
