import React, { useEffect } from 'react';
import { ThemeMode, MinesweeperState, MineCell } from '../../types';
import { themes } from '../../utils/themes';
import { playSound } from '../../utils/sound';

interface MinesweeperProps {
  onBack: () => void;
  currentTheme: ThemeMode;
  soundEnabled: boolean;
  gameState: MinesweeperState | undefined;
  setGameState: (state: MinesweeperState) => void;
}

const ROWS = 8;
const COLS = 8;
const MINES = 8;

const Minesweeper: React.FC<MinesweeperProps> = ({ 
  onBack, currentTheme, soundEnabled, gameState, setGameState
}) => {
  const theme = themes[currentTheme];

  useEffect(() => {
    if (!gameState || !gameState.isGenerated) {
        startNewGame();
    }
  }, []);

  const startNewGame = () => {
    let newBoard: MineCell[] = Array(ROWS * COLS).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
    }));

    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const idx = Math.floor(Math.random() * (ROWS * COLS));
      if (!newBoard[idx].isMine) {
        newBoard[idx].isMine = true;
        minesPlaced++;
      }
    }

    for (let i = 0; i < ROWS * COLS; i++) {
      if (!newBoard[i].isMine) {
        let count = 0;
        const r = Math.floor(i / COLS);
        const c = i % COLS;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              if (newBoard[nr * COLS + nc].isMine) count++;
            }
          }
        }
        newBoard[i].neighborCount = count;
      }
    }

    setGameState({
        board: newBoard,
        gameOver: false,
        win: false,
        isGenerated: true
    });
  };

  const handleCellClick = (idx: number) => {
    if (!gameState || gameState.gameOver || gameState.win || gameState.board[idx].isFlagged || gameState.board[idx].isRevealed) return;

    const newBoard = [...gameState.board];
    
    if (newBoard[idx].isMine) {
      newBoard.forEach(c => { if(c.isMine) c.isRevealed = true });
      setGameState({ ...gameState, board: newBoard, gameOver: true });
      playSound('fail', soundEnabled);
      return;
    }

    let revealedCount = 0;
    const reveal = (index: number) => {
      if (index < 0 || index >= ROWS * COLS || newBoard[index].isRevealed || newBoard[index].isFlagged) return;
      newBoard[index].isRevealed = true;
      revealedCount++;
      if (newBoard[index].neighborCount === 0) {
        const r = Math.floor(index / COLS);
        const c = index % COLS;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
             const nr = r + dr;
             const nc = c + dc;
             if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
               reveal(nr * COLS + nc);
             }
          }
        }
      }
    };
    reveal(idx);

    // Recalculate full win condition
    const totalRevealed = newBoard.filter(c => c.isRevealed).length;
    const win = totalRevealed === ROWS * COLS - MINES;

    setGameState({ ...gameState, board: newBoard, win });
    
    if (win) playSound('success', soundEnabled);
    else playSound('click', soundEnabled);
  };

  const handleContextMenu = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    if (!gameState || gameState.gameOver || gameState.win || gameState.board[idx].isRevealed) return;
    const newBoard = [...gameState.board];
    newBoard[idx].isFlagged = !newBoard[idx].isFlagged;
    setGameState({ ...gameState, board: newBoard });
    playSound('pop', soundEnabled);
  };

  const getNumberColor = (count: number) => {
    const colors = ['text-transparent', 'text-blue-500', 'text-green-500', 'text-red-500', 'text-purple-600', 'text-red-700', 'text-cyan-600', 'text-black'];
    return colors[count];
  };

  if (!gameState) return null;

  return (
    <div className="flex flex-col items-center gap-4 h-full relative">
      <div className="w-full flex justify-between items-center gap-2 border-b border-opacity-20 border-gray-500 pb-2">
         <button 
           onClick={() => { onBack(); playSound('click', soundEnabled); }}
           className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80 transition-all`}
         >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
         </button>
         
         <div className={`font-bold flex-1 text-center ${theme.colors.accent}`}>
           {gameState.win ? '🎉 胜利!' : gameState.gameOver ? '💥 失败' : `剩余雷: ${MINES - gameState.board.filter(c => c.isFlagged).length}`}
         </div>
         
         <button onClick={() => { startNewGame(); playSound('click', soundEnabled); }} className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80 transition-all active:scale-95`} title="重置">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
         </button>
      </div>

      <div 
        className={`grid gap-1 p-2 rounded-lg ${theme.colors.panel} border ${theme.colors.border} select-none`}
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {gameState.board.map((cell, i) => (
          <div
            key={i}
            onClick={() => handleCellClick(i)}
            onContextMenu={(e) => handleContextMenu(e, i)}
            className={`
              w-8 h-8 md:w-9 md:h-9 flex items-center justify-center font-bold text-sm cursor-pointer rounded-sm
              transition-all duration-100 active:scale-90
              ${cell.isRevealed 
                ? `${theme.colors.bgBase} ${getNumberColor(cell.neighborCount)}`
                : `${theme.colors.primary} hover:opacity-80 shadow-sm border-b-2 border-r-2 border-black/20`
              }
              ${cell.isMine && cell.isRevealed ? 'bg-red-500 text-white' : ''}
            `}
          >
            {cell.isRevealed && cell.isMine ? '💣' : ''}
            {cell.isRevealed && !cell.isMine && cell.neighborCount > 0 ? cell.neighborCount : ''}
            {!cell.isRevealed && cell.isFlagged ? '🚩' : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Minesweeper;