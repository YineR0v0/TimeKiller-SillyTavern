
import React, { useEffect } from 'react';
import { themes } from '../../utils/themes.js';
import { playSound } from '../../utils/sound.js';

const isValid = (board, row, col, num) => {
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num || board[x][col] === num) return false;
        const boxRow = 3 * Math.floor(row / 3) + Math.floor(x / 3);
        const boxCol = 3 * Math.floor(col / 3) + x % 3;
        if (board[boxRow][boxCol] === num) return false;
    }
    return true;
};

const solveSudoku = (board) => {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, r, c, num)) {
                        board[r][c] = num;
                        if (solveSudoku(board)) return true;
                        board[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
};

const generateSudoku = (difficulty) => {
    const board = Array(9).fill(0).map(() => Array(9).fill(0));
    for (let i = 0; i < 9; i = i + 3) {
        for(let r=0; r<3; r++) {
            for(let c=0; c<3; c++) {
                let num;
                do { num = Math.floor(Math.random() * 9) + 1; } 
                while (!isValid(board, i+r, i+c, num));
                board[i+r][i+c] = num;
            }
        }
    }
    solveSudoku(board);
    const solution = board.map(row => [...row]);
    
    const attempts = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 55;
    for(let i=0; i<attempts; i++) {
        const r = Math.floor(Math.random()*9);
        const c = Math.floor(Math.random()*9);
        board[r][c] = 0;
    }
    
    return { initial: board, solution };
};

const Sudoku = ({ onBack, currentTheme, soundEnabled, gameState, setGameState }) => {
  const theme = themes[currentTheme];

  useEffect(() => {
    if (!gameState) {
        startNewGame('easy');
    }
  }, []);

  const startNewGame = (diff) => {
    const { initial, solution } = generateSudoku(diff);
    const playable = initial.map(row => [...row]);
    setGameState({
        board: playable,
        initialBoard: initial,
        solution: solution,
        selectedCell: null,
        mistakes: 0,
        isWon: false,
        difficulty: diff,
        notes: Array(9).fill(null).map(() => Array(9).fill([])),
        isNoteMode: false
    });
    playSound('click', soundEnabled);
  };

  const handleCellClick = (r, c) => {
      if(!gameState) return;
      setGameState({ ...gameState, selectedCell: { x: c, y: r } });
  };

  const handleNumberInput = (num) => {
      if (!gameState || !gameState.selectedCell || gameState.isWon) return;
      const { x: c, y: r } = gameState.selectedCell;
      
      if (gameState.initialBoard[r][c] !== 0) return;

      if (num === 0) {
          const newBoard = gameState.board.map(row => [...row]);
          newBoard[r][c] = 0;
          setGameState({ ...gameState, board: newBoard });
          playSound('pop', soundEnabled);
          return;
      }

      if (gameState.isNoteMode) {
          const currentNotes = [...gameState.notes];
          const cellNotes = [...currentNotes[r][c]];
          if (cellNotes.includes(num)) {
              currentNotes[r][c] = cellNotes.filter(n => n !== num);
          } else {
              currentNotes[r][c] = [...cellNotes, num];
          }
          setGameState({ ...gameState, notes: currentNotes });
          playSound('click', soundEnabled);
      } else {
          const newBoard = gameState.board.map(row => [...row]);
          
          if (newBoard[r][c] === num) return; 

          if (num === gameState.solution[r][c]) {
              newBoard[r][c] = num;
              const isWin = newBoard.every((row, rIdx) => row.every((val, cIdx) => val === gameState.solution[rIdx][cIdx]));
              
              setGameState({
                  ...gameState,
                  board: newBoard,
                  isWon: isWin
              });
              playSound(isWin ? 'success' : 'click', soundEnabled);
          } else {
              playSound('fail', soundEnabled);
              setGameState({
                  ...gameState,
                  mistakes: gameState.mistakes + 1
              });
          }
      }
  };

  if (!gameState) return null;

  return (
    <div className="flex flex-col h-full gap-2 relative">
      <div className="w-full flex justify-between items-center pb-2 border-b border-opacity-20 border-gray-500 shrink-0">
         <button onClick={() => { onBack(); playSound('click', soundEnabled); }} className={`p-2 rounded-lg bg-black/20 hover:bg-opacity-80`}>
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
         </button>
         <div className="flex gap-2 text-xs items-center">
             <select 
                value={gameState.difficulty} 
                onChange={(e) => startNewGame(e.target.value)}
                className={`bg-black/20 rounded px-2 py-1 outline-none ${theme.colors.textMain}`}
             >
                 <option value="easy">简单</option>
                 <option value="medium">普通</option>
                 <option value="hard">困难</option>
             </select>
             <div className="px-2 py-1 bg-red-500/20 text-red-300 rounded">错误: {gameState.mistakes}/3</div>
         </div>
         <button onClick={() => startNewGame(gameState.difficulty)} className={`p-2 rounded-lg bg-black/20 hover:bg-opacity-80 active:scale-95`} title="重置">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
         </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
          <div className="aspect-square w-full max-w-[350px] bg-black/40 border-2 border-gray-500 grid grid-rows-9 grid-cols-9">
              {gameState.board.map((row, r) => row.map((val, c) => {
                  const isSelected = gameState.selectedCell?.y === r && gameState.selectedCell?.x === c;
                  const isInitial = gameState.initialBoard[r][c] !== 0;
                  const isSameNum = val !== 0 && gameState.selectedCell && gameState.board[gameState.selectedCell.y][gameState.selectedCell.x] === val;
                  const notes = gameState.notes[r][c];

                  return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => handleCellClick(r, c)}
                        className={`
                            border-[0.5px] border-gray-700/50 flex items-center justify-center text-lg relative
                            ${(c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-gray-500' : ''}
                            ${(r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-gray-500' : ''}
                            ${isSelected ? 'bg-blue-500/40' : isSameNum ? 'bg-blue-500/20' : ''}
                            ${isInitial ? 'font-bold' : theme.colors.primary.replace('bg-', 'text-')}
                        `}
                      >
                          {val !== 0 ? val : (
                              <div className="grid grid-cols-3 grid-rows-3 w-full h-full text-[6px] text-gray-400 leading-none p-0.5">
                                  {[1,2,3,4,5,6,7,8,9].map(n => <span key={n} className="flex items-center justify-center">{notes.includes(n) ? n : ''}</span>)}
                              </div>
                          )}
                      </button>
                  );
              }))}
          </div>
      </div>

      <div className="shrink-0 flex flex-col gap-2">
          <div className="flex justify-between px-2">
               <button 
                  onClick={() => setGameState({...gameState, isNoteMode: !gameState.isNoteMode})}
                  className={`p-2 rounded text-xs flex gap-1 ${gameState.isNoteMode ? theme.colors.primary + ' text-white' : 'bg-white/10 text-gray-400'}`}
                >
                   ✎ 笔记 {gameState.isNoteMode ? 'ON' : 'OFF'}
               </button>
               <button onClick={() => handleNumberInput(0)} className="text-xs text-red-400 p-2 border border-red-500/30 rounded hover:bg-red-500/10 active:scale-95">清除</button>
          </div>
          <div className="grid grid-cols-9 gap-1 h-10">
              {[1,2,3,4,5,6,7,8,9].map(num => (
                  <button 
                    key={num} 
                    onClick={() => handleNumberInput(num)}
                    className={`rounded bg-white/10 hover:bg-white/20 text-lg font-bold ${theme.colors.textMain}`}
                  >
                      {num}
                  </button>
              ))}
          </div>
      </div>

      {(gameState.isWon || gameState.mistakes >= 3) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
              <h2 className={`text-3xl font-bold mb-2 ${gameState.isWon ? theme.colors.success : theme.colors.danger}`}>
                  {gameState.isWon ? '解题成功!' : '失败!'}
              </h2>
              <button onClick={() => startNewGame(gameState.difficulty)} className={`px-6 py-2 rounded-full font-bold text-white ${theme.colors.primary}`}>再来一局</button>
          </div>
      )}
    </div>
  );
};

export default Sudoku;
