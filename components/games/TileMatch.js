
import React, { useEffect } from 'react';
import { themes } from '../../utils/themes.js';
import { playSound } from '../../utils/sound.js';

const TILE_TYPES = ['🌟', '🌙', '⚡', '🔥', '💧', '🍀', '🍎', '🎨', '💎', '🔑'];
const DOCK_SIZE = 7;
const OFFSET = 24; 

const TileMatch = ({ 
  onBack, currentTheme, soundEnabled, gameState, setGameState
}) => {
  const theme = themes[currentTheme];

  useEffect(() => {
    if (!gameState || !gameState.isGenerated) {
        initGame();
    }
  }, []);

  const initGame = () => {
    let positions = [];
    
    // Layers
    for(let x=0; x<6; x++) positions.push(...Array(6).fill(0).map((_, y) => ({x: x*2, y: y*2, layer: 0})));
    for(let x=0; x<5; x++) positions.push(...Array(5).fill(0).map((_, y) => ({x: x*2+1, y: y*2+1, layer: 1})));
    for(let x=1; x<5; x++) positions.push(...Array(4).fill(0).map((_, y) => ({x: x*2, y: y*2+2, layer: 2})));
    for(let i=0; i<12; i++) {
        positions.push({x: Math.floor(Math.random()*4)*2 + 2, y: Math.floor(Math.random()*4)*2 + 2, layer: 3});
    }

    const maxTiles = Math.floor(positions.length / 3) * 3;
    positions = positions.slice(0, maxTiles);

    let typePool = [];
    for(let i=0; i < maxTiles/3; i++) {
        const type = TILE_TYPES[i % TILE_TYPES.length];
        typePool.push(type, type, type);
    }
    typePool.sort(() => Math.random() - 0.5);

    const newTiles = positions.map((pos, index) => ({
        id: index,
        type: typePool[index],
        gridX: pos.x,
        gridY: pos.y,
        layer: pos.layer,
        visX: pos.x * OFFSET, 
        visY: pos.y * OFFSET,
        isClickable: true
    }));

    const processedTiles = calculateClickability(newTiles);

    setGameState({
        tiles: processedTiles,
        dock: [],
        status: 'playing',
        isGenerated: true
    });
  };

  const calculateClickability = (currentTiles) => {
      return currentTiles.map(t1 => {
          const isCovered = currentTiles.some(t2 => {
              if (t2.id === t1.id) return false;
              if (t2.layer <= t1.layer) return false; 
              
              const xOverlap = Math.abs(t1.gridX - t2.gridX) < 1.8;
              const yOverlap = Math.abs(t1.gridY - t2.gridY) < 1.8;
              
              return xOverlap && yOverlap;
          });
          return { ...t1, isClickable: !isCovered };
      });
  };

  const handleTileClick = (tile) => {
    if (!gameState || gameState.status !== 'playing' || !tile.isClickable) return;

    playSound('click', soundEnabled);

    const newBoardTiles = gameState.tiles.filter(t => t.id !== tile.id);
    const newDock = [...gameState.dock, tile];
    
    const typeCounts = {};
    newDock.forEach(t => { typeCounts[t.type] = (typeCounts[t.type] || 0) + 1; });
    
    let nextDock = [...newDock];
    let matched = false;
    for (const type in typeCounts) {
        if (typeCounts[type] >= 3) {
            matched = true;
            let removedCount = 0;
            nextDock = nextDock.filter(t => {
                if (t.type === type && removedCount < 3) {
                    removedCount++;
                    return false;
                }
                return true;
            });
        }
    }
    if (matched) playSound('success', soundEnabled);

    let status = 'playing';
    if (nextDock.length >= DOCK_SIZE) {
        status = 'lost';
        playSound('fail', soundEnabled);
    } else if (newBoardTiles.length === 0 && nextDock.length === 0) {
        status = 'won';
        playSound('success', soundEnabled);
    }

    setGameState({
        ...gameState,
        tiles: calculateClickability(newBoardTiles),
        dock: nextDock,
        status
    });
  };

  if (!gameState) return null;

  return (
    <div className="flex flex-col h-full gap-2 relative min-h-[400px]">
      <div className="w-full flex justify-between items-center gap-2 pb-2 border-b border-opacity-20 border-gray-500 z-10 shrink-0">
         <button onClick={() => { onBack(); playSound('click', soundEnabled); }} className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
         </button>
         <div className={`font-bold ${theme.colors.accent}`}>
            {gameState.status === 'won' ? '🎉' : gameState.status === 'lost' ? '💀' : `剩余: ${gameState.tiles.length}`}
         </div>
         <button onClick={() => { initGame(); playSound('click', soundEnabled); }} className={`p-2 rounded-lg border ${theme.colors.border} ${theme.colors.panel} hover:bg-opacity-80 active:scale-95`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
         </button>
      </div>

      <div className="flex-1 relative bg-black/10 rounded-lg my-2 border border-white/5 overflow-auto min-h-[300px]">
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-[320px] h-[350px]">
            {gameState.tiles.map((tile) => (
                <button
                    key={tile.id}
                    onClick={() => handleTileClick(tile)}
                    disabled={!tile.isClickable}
                    style={{
                        position: 'absolute',
                        left: tile.visX + 16, 
                        top: tile.visY + 20,
                        zIndex: tile.layer * 10 + (tile.gridY),
                        transition: 'all 0.2s',
                    }}
                    className={`
                        w-10 h-10 rounded-[8px] border-b-[4px] flex items-center justify-center text-xl shadow-md active:scale-90
                        ${tile.isClickable 
                            ? `${theme.colors.panel} ${theme.colors.border} ${theme.colors.textMain} hover:-translate-y-0.5 hover:brightness-110 cursor-pointer` 
                            : 'bg-black/80 border-black/50 text-white/10 cursor-not-allowed brightness-50 contrast-50'
                        }
                    `}
                >
                    <span className="drop-shadow-sm filter">{tile.type}</span>
                </button>
            ))}
        </div>

        {(gameState.status === 'won' || gameState.status === 'lost') && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in h-full w-full">
                <h2 className={`text-3xl font-bold mb-4 ${gameState.status === 'won' ? theme.colors.success : theme.colors.danger}`}>
                    {gameState.status === 'won' ? '消除成功!' : '卡槽已满!'}
                </h2>
                <button 
                  onClick={() => { initGame(); playSound('click', soundEnabled); }}
                  className={`px-6 py-2 rounded-full font-bold text-white shadow-lg active:scale-95 transition-transform ${theme.colors.primary} ${theme.colors.primaryHover}`}
                >
                   再玩一次
                </button>
            </div>
        )}
      </div>

      <div className={`
        h-14 rounded-lg border-2 flex items-center justify-center gap-1.5 px-2 relative shrink-0
        ${theme.colors.bgHeader} ${theme.colors.border}
        ${gameState.status === 'lost' ? 'border-red-500/50' : ''}
      `}>
          {gameState.dock.map((tile, i) => (
              <div 
                key={`${tile.id}-${i}`} 
                className={`w-9 h-9 rounded border-b-2 bg-opacity-90 flex items-center justify-center text-lg animate-in zoom-in duration-200 ${theme.colors.panel} ${theme.colors.border}`}
              >
                  {tile.type}
              </div>
          ))}
          {Array(DOCK_SIZE - gameState.dock.length).fill(0).map((_, i) => (
              <div key={`empty-${i}`} className="w-9 h-9 rounded border border-dashed border-white/10 bg-black/20" />
          ))}
      </div>
    </div>
  );
};

export default TileMatch;
