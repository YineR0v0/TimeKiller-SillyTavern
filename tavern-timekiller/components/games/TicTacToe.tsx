import React, { useEffect } from 'react';
import { ThemeMode, TicTacToeState } from '../../types';
import { themes } from '../../utils/themes';
import { playSound } from '../../utils/sound';

interface TicTacToeProps {
  onBack: () => void;
  currentTheme: ThemeMode;
  soundEnabled: boolean;
  gameState: TicTacToeState | undefined;
  setGameState: (state: TicTacToeState) => void;
}

const TicTacToe: React.FC<TicTacToeProps> = ({
  onBack, currentTheme, soundEnabled, gameState, setGameState
}) => {
  const theme = themes[currentTheme];

  useEffect(() => {
    if (!gameState) {
      resetGame();
    }
  }, []);

  const resetGame = (fullReset = false) => {
    setGameState({
      board: Array(9).fill(null),
      isXNext: true,
      winner: null,
      difficulty: gameState?.difficulty || 'hard',
      scores: fullReset ? { player: 0, ai: 0, draw: 0 } : (gameState?.scores || { player: 0, ai: 0, draw: 0 })
    });
    playSound('click', soundEnabled);
  };

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i: number) => {
    if (!gameState || gameState.board[i] || gameState.winner || !gameState.isXNext) return;

    const newBoard = [...gameState.board];
    newBoard[i] = 'X';
    
    const winner = calculateWinner(newBoard);
    
    let newScores = { ...gameState.scores };
    if (winner === 'X') newScores.player++;
    else if (!newBoard.includes(null)) newScores.draw++;

    playSound('pop', soundEnabled);

    setGameState({
      ...gameState,
      board: newBoard,
      isXNext: false,
      winner: winner || (newBoard.includes(null) ? null : 'Draw'),
      scores: newScores
    });
  };

  // AI Turn
  useEffect(() => {
    if (!gameState || gameState.winner || gameState.isXNext) return;

    const timer = setTimeout(() => {
        makeAiMove();
    }, 500);

    return () => clearTimeout(timer);
  }, [gameState?.isXNext]);

  const makeAiMove = () => {
      if (!gameState) return;
      const newBoard = [...gameState.board];
      let moveIndex = -1;

      if (gameState.difficulty === 'easy') {
          // Random valid move
          const available = newBoard.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
          if (available.length > 0) {
              moveIndex = available[Math.floor(Math.random() * available.length)];
          }
      } else {
          // Minimax
          moveIndex = getBestMove(newBoard);
      }

      if (moveIndex !== -1) {
          newBoard[moveIndex] = 'O';
          const winner = calculateWinner(newBoard);
          let newScores = { ...gameState.scores };
          
          if (winner === 'O') {
              newScores.ai++;
              playSound('fail', soundEnabled);
          } else if (!newBoard.includes(null)) {
              newScores.draw++;
          } else {
              playSound('click', soundEnabled);
          }

          setGameState({
              ...gameState,
              board: newBoard,
              isXNext: true,
              winner: winner || (newBoard.includes(null) ? null : 'Draw'),
              scores: newScores
          });
      }
  };

  const getBestMove = (board: (string | null)[]) => {
      let bestScore = -Infinity;
      let move = -1;
      for (let i = 0; i < 9; i++) {
          if (board[i] === null) {
              board[i] = 'O';
              let score = minimax(board, 0, false);
              board[i] = null;
              if (score > bestScore) {
                  bestScore = score;
                  move = i;
              }
          }
      }
      return move;
  };

  const minimax = (board: (string | null)[], depth: number, isMaximizing: boolean) => {
      const winner = calculateWinner(board);
      if (winner === 'O') return 10 - depth;
      if (winner === 'X') return depth - 10;
      if (!board.includes(null)) return 0;

      if (isMaximizing) {
          let bestScore = -Infinity;
          for (let i = 0; i < 9; i++) {
              if (board[i] === null) {
                  board[i] = 'O';
                  let score = minimax(board, depth + 1, false);
                  board[i] = null;
                  bestScore = Math.max(score, bestScore);
              }
          }
          return bestScore;
      } else {
          let bestScore = Infinity;
          for (let i = 0; i < 9; i++) {
              if (board[i] === null) {
                  board[i] = 'X';
                  let score = minimax(board, depth + 1, true);
                  board[i] = null;
                  bestScore = Math.min(score, bestScore);
              }
          }
          return bestScore;
      }
  };

  if (!gameState) return null;

  return (
    <div className="flex flex-col h-full gap-4 items-center">
       <div className="w-full flex justify-between items-center pb-2 border-b border-opacity-20 border-gray-500 shrink-0">
         <button onClick={() => { onBack(); playSound('click', soundEnabled); }} className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
         </button>
         
         <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
             <button 
                onClick={() => setGameState({...gameState, difficulty: 'easy'})}
                className={`text-[10px] px-2 py-1 rounded ${gameState.difficulty === 'easy' ? theme.colors.primary + ' text-white' : 'opacity-50'}`}
             >
                 简单
             </button>
             <button 
                onClick={() => setGameState({...gameState, difficulty: 'hard'})}
                className={`text-[10px] px-2 py-1 rounded ${gameState.difficulty === 'hard' ? theme.colors.primary + ' text-white' : 'opacity-50'}`}
             >
                 不可战胜
             </button>
         </div>

         <button onClick={() => resetGame(false)} className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80 active:scale-95`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
         </button>
      </div>

      <div className="grid grid-cols-3 gap-2 p-2 bg-black/10 rounded-xl">
          {gameState.board.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                disabled={!!cell || !!gameState.winner}
                className={`
                    w-20 h-20 md:w-24 md:h-24 rounded-lg text-4xl font-bold flex items-center justify-center transition-all
                    ${!cell ? `${theme.colors.panel} ${theme.colors.border} border hover:bg-white/5` : ''}
                    ${cell === 'X' ? theme.colors.primary + ' text-white' : ''}
                    ${cell === 'O' ? theme.colors.bgHeader + ' ' + theme.colors.textMain : ''}
                `}
              >
                  {cell}
              </button>
          ))}
      </div>

      <div className="flex justify-between w-full px-4 text-xs font-medium opacity-80">
          <div className="text-center">
              <div className={theme.colors.primary.replace('bg-', 'text-')}>玩家 (X)</div>
              <div className="text-xl">{gameState.scores.player}</div>
          </div>
          <div className="text-center">
              <div className="text-gray-400">平局</div>
              <div className="text-xl">{gameState.scores.draw}</div>
          </div>
          <div className="text-center">
              <div className={theme.colors.textMain}>电脑 (O)</div>
              <div className="text-xl">{gameState.scores.ai}</div>
          </div>
      </div>

      {gameState.winner && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
              <h2 className={`text-3xl font-bold mb-4 ${gameState.winner === 'X' ? theme.colors.success : gameState.winner === 'O' ? theme.colors.danger : theme.colors.textMain}`}>
                  {gameState.winner === 'X' ? '你赢了!' : gameState.winner === 'O' ? '电脑获胜!' : '平局!'}
              </h2>
              <button onClick={() => resetGame(false)} className={`px-6 py-2 rounded-full font-bold text-white shadow-lg ${theme.colors.primary}`}>再来一局</button>
          </div>
      )}
    </div>
  );
};

export default TicTacToe;