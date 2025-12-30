
import React, { useEffect, useState, useRef } from 'react';
import { themes } from '../../utils/themes.js';
import { playSound } from '../../utils/sound.js';

const CROPS = {
  wheat: { id: 'wheat', name: '小麦', icon: '🌾', cost: 10, sellPrice: 20, xp: 20, growthTime: 3, unlockLevel: 1 },
  corn: { id: 'corn', name: '玉米', icon: '🌽', cost: 25, sellPrice: 60, xp: 45, growthTime: 8, unlockLevel: 2 },
  carrot: { id: 'carrot', name: '胡萝卜', icon: '🥕', cost: 50, sellPrice: 130, xp: 90, growthTime: 15, unlockLevel: 3 },
  pumpkin: { id: 'pumpkin', name: '南瓜', icon: '🎃', cost: 120, sellPrice: 320, xp: 180, growthTime: 30, unlockLevel: 5 },
  rose: { id: 'rose', name: '玫瑰', icon: '🌹', cost: 300, sellPrice: 850, xp: 500, growthTime: 60, unlockLevel: 8 },
};

const DECORATIONS = {
    scarecrow: { id: 'scarecrow', name: '稻草人', icon: '⛄', cost: 200, xpBonus: 10, desc: '+10% 经验' },
    fountain: { id: 'fountain', name: '喷泉', icon: '⛲', cost: 500, xpBonus: 25, desc: '+25% 经验' },
    barn: { id: 'barn', name: '谷仓', icon: '🏠', cost: 1000, xpBonus: 50, desc: '+50% 经验' },
};

const ITEMS = {
    fertilizer: { id: 'fertilizer', name: '化肥', icon: '⚡', cost: 50, desc: '立刻成熟' }
};

const FarmingGame = ({ 
  onBack, currentTheme, gameState, setGameState, soundEnabled, onSave, onLoad
}) => {
  const theme = themes[currentTheme];
  const [selectedTool, setSelectedTool] = useState('wheat');
  const [activeTab, setActiveTab] = useState('farm');
  const [floatText, setFloatText] = useState([]);
  const gameLoopRef = useRef(null);
  const containerRef = useRef(null);
  
  const toolsScrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const dragDistance = useRef(0);

  useEffect(() => {
    let newState = {...gameState};
    if (newState.level === undefined) newState.level = 1;
    if (newState.xp === undefined) newState.xp = 0;
    if (newState.ownedDecorations === undefined) newState.ownedDecorations = [];
    
    const unlockedCount = newState.level >= 5 ? 9 : newState.level >= 3 ? 6 : 3;
    const plotsUpdated = newState.plots.map((p, i) => ({
        ...p,
        isUnlocked: i < unlockedCount
    }));
    
    if (JSON.stringify(plotsUpdated) !== JSON.stringify(newState.plots)) {
        newState.plots = plotsUpdated;
        setGameState(newState);
    }
  }, [gameState.level]);

  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      setGameState({
        ...gameState,
        plots: gameState.plots.map(plot => {
          if (plot.cropId && plot.plantTime && plot.isWatered && !plot.isReady) {
            const crop = CROPS[plot.cropId];
            const elapsed = (Date.now() - plot.plantTime) / 1000;
            if (elapsed >= crop.growthTime) {
              return { ...plot, isReady: true };
            }
          }
          return plot;
        })
      });
    }, 1000);
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [gameState, setGameState]);

  useEffect(() => {
      if (floatText.length > 0) {
          const timer = setTimeout(() => {
              setFloatText(prev => prev.slice(1));
          }, 1000);
          return () => clearTimeout(timer);
      }
  }, [floatText]);

  const calculateXpBonus = () => {
      let bonus = 0;
      gameState.ownedDecorations?.forEach(id => {
          if (DECORATIONS[id]) bonus += DECORATIONS[id].xpBonus;
      });
      return bonus;
  };

  const maxXp = gameState.level * 150; 

  const triggerFloatText = (text, type, clientX, clientY) => {
      let x = 0; 
      let y = 0;
      if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          x = clientX - rect.left;
          y = clientY - rect.top;
      } else {
          x = 150; 
          y = 150;
      }
      setFloatText(prev => [...prev, { id: Date.now(), text, type, x, y }]);
  };

  const handlePlotClick = (plotId, e) => {
    const plotIndex = gameState.plots.findIndex(p => p.id === plotId);
    const plot = gameState.plots[plotIndex];
    
    if (!plot.isUnlocked) {
        playSound('fail', soundEnabled);
        return;
    }

    let newPlots = [...gameState.plots];
    let newMoney = gameState.money;
    let newXp = gameState.xp;
    let newLevel = gameState.level;
    let actionSuccess = false;

    if (selectedTool === 'harvest') {
      if (plot.isReady && plot.cropId) {
        const crop = CROPS[plot.cropId];
        const bonus = 1 + (calculateXpBonus() / 100);
        const xpGain = Math.floor(crop.xp * bonus);
        
        newMoney += crop.sellPrice;
        newXp += xpGain;
        newPlots[plotIndex] = { ...plot, cropId: null, plantTime: null, isWatered: false, isReady: false };
        playSound('success', soundEnabled);
        triggerFloatText(`+${crop.sellPrice}💰`, 'money', e.clientX, e.clientY);
        triggerFloatText(`+${xpGain}XP`, 'xp', e.clientX, e.clientY - 20);
        actionSuccess = true;
      }
    } else if (selectedTool === 'water') {
      if (plot.cropId && !plot.isWatered && !plot.isReady) {
        newPlots[plotIndex] = { ...plot, isWatered: true };
        playSound('water', soundEnabled);
        actionSuccess = true;
      }
    } else if (selectedTool === 'fertilizer') {
      if (plot.cropId && !plot.isReady && newMoney >= ITEMS.fertilizer.cost) {
          newMoney -= ITEMS.fertilizer.cost;
          newPlots[plotIndex] = { ...plot, isReady: true, isWatered: true };
          playSound('pop', soundEnabled);
          triggerFloatText(`-${ITEMS.fertilizer.cost}💰`, 'money', e.clientX, e.clientY);
          actionSuccess = true;
      } else if (newMoney < ITEMS.fertilizer.cost) {
          playSound('fail', soundEnabled);
      }
    } else {
      const cropToPlant = CROPS[selectedTool];
      if (cropToPlant && !plot.cropId && newMoney >= cropToPlant.cost) {
        newMoney -= cropToPlant.cost;
        newPlots[plotIndex] = { 
          ...plot, 
          cropId: cropToPlant.id, 
          plantTime: Date.now(), 
          isWatered: false, 
          isReady: false 
        };
        playSound('pop', soundEnabled);
        triggerFloatText(`-${cropToPlant.cost}💰`, 'money', e.clientX, e.clientY);
        actionSuccess = true;
      } else if (newMoney < cropToPlant?.cost) {
         playSound('fail', soundEnabled);
      }
    }

    if (newXp >= newLevel * 150) {
        newXp -= newLevel * 150;
        newLevel++;
        playSound('success', soundEnabled); 
        const unlockedCount = newLevel >= 5 ? 9 : newLevel >= 3 ? 6 : 3;
        newPlots = newPlots.map((p, i) => ({ ...p, isUnlocked: i < unlockedCount }));
        triggerFloatText("Level UP!", 'level', e.clientX, e.clientY - 40);
    }

    if (actionSuccess) {
      setGameState({
        ...gameState,
        money: newMoney,
        xp: newXp,
        level: newLevel,
        plots: newPlots
      });
    }
  };

  const buyDecoration = (id, e) => {
      if (gameState.ownedDecorations.includes(id)) return;
      const decor = DECORATIONS[id];
      if (gameState.money >= decor.cost) {
          setGameState({
              ...gameState,
              money: gameState.money - decor.cost,
              ownedDecorations: [...gameState.ownedDecorations, id]
          });
          playSound('success', soundEnabled);
          triggerFloatText(`Purchased!`, 'money', e.clientX, e.clientY);
      } else {
          playSound('fail', soundEnabled);
      }
  };

  const getGrowthProgress = (plot) => {
    if (!plot.cropId || !plot.plantTime) return 0;
    if (plot.isReady) return 100;
    const crop = CROPS[plot.cropId];
    const elapsed = (Date.now() - plot.plantTime) / 1000;
    return Math.min(100, (elapsed / crop.growthTime) * 100);
  };

  const handleMouseDown = (e) => {
      if (!toolsScrollRef.current) return;
      isDown.current = true;
      startX.current = e.pageX - toolsScrollRef.current.offsetLeft;
      scrollLeft.current = toolsScrollRef.current.scrollLeft;
      dragDistance.current = 0;
      toolsScrollRef.current.style.scrollBehavior = 'auto';
  };

  const handleMouseLeave = () => {
      isDown.current = false;
      if (toolsScrollRef.current) toolsScrollRef.current.style.scrollBehavior = 'smooth';
  };

  const handleMouseUp = () => {
      isDown.current = false;
      if (toolsScrollRef.current) toolsScrollRef.current.style.scrollBehavior = 'smooth';
  };

  const handleMouseMove = (e) => {
      if (!isDown.current || !toolsScrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - toolsScrollRef.current.offsetLeft;
      const walk = (x - startX.current) * 1.5; 
      toolsScrollRef.current.scrollLeft = scrollLeft.current - walk;
      dragDistance.current += Math.abs(walk);
  };

  const handleToolClickCapture = (e) => {
      if (dragDistance.current > 5) {
          e.stopPropagation();
          e.preventDefault();
      }
  };

  return (
    <div className="flex flex-col h-full gap-2 relative" ref={containerRef}>
      <div className="absolute top-0 right-0 opacity-20 pointer-events-none text-6xl">
          {gameState.ownedDecorations?.map(id => DECORATIONS[id].icon).join(' ')}
      </div>

      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {floatText.map(ft => (
              <div 
                key={ft.id} 
                className={`
                    absolute font-bold text-shadow animate-float-up
                    ${ft.type === 'money' ? 'text-yellow-400 text-lg' : ''}
                    ${ft.type === 'xp' ? 'text-blue-400 text-lg' : ''}
                    ${ft.type === 'level' ? 'text-purple-400 text-2xl' : ''}
                `}
                style={{ left: ft.x, top: ft.y }}
              >
                  {ft.text}
              </div>
          ))}
      </div>

      <div className="flex justify-between items-center pb-2 border-b border-opacity-20 border-gray-500 z-10 shrink-0">
         <div className="flex gap-2 items-center">
            <button onClick={() => { onBack(); playSound('click', soundEnabled); }} className={`text-sm ${theme.colors.textDim} hover:${theme.colors.textMain}`}>← 返回</button>
            <button onClick={onSave} className={`text-xs p-1.5 rounded border ${theme.colors.border} ${theme.colors.panel} opacity-80 hover:opacity-100`}>💾</button>
            <button onClick={onLoad} className={`text-xs p-1.5 rounded border ${theme.colors.border} ${theme.colors.panel} opacity-80 hover:opacity-100`}>📂</button>
         </div>
         <div className="flex gap-2">
            <button onClick={() => setActiveTab('farm')} className={`px-3 py-1 text-xs rounded-full transition-all ${activeTab === 'farm' ? theme.colors.primary + ' text-white' : 'bg-black/20 hover:bg-black/30'}`}>农场</button>
            <button onClick={() => setActiveTab('shop')} className={`px-3 py-1 text-xs rounded-full transition-all ${activeTab === 'shop' ? theme.colors.primary + ' text-white' : 'bg-black/20 hover:bg-black/30'}`}>装饰</button>
         </div>
         <div className="flex items-center gap-2">
            <div className={`font-bold ${theme.colors.textMain}`}>Lv.{gameState.level}</div>
            <div className={`font-bold ${theme.colors.accent}`}>💰 {gameState.money}</div>
         </div>
      </div>

      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mb-2 z-10 shrink-0">
          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min(100, (gameState.xp / maxXp) * 100)}%` }} />
      </div>

      {activeTab === 'farm' ? (
      <>
        <div className="grid grid-cols-3 gap-2 flex-1 content-start z-10 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
            {gameState.plots.map((plot, i) => (
            <button
                key={plot.id}
                onClick={(e) => handlePlotClick(plot.id, e)}
                disabled={!plot.isUnlocked}
                className={`
                aspect-square rounded-lg relative border-2 transition-all
                flex flex-col items-center justify-center active:scale-95
                ${!plot.isUnlocked 
                    ? 'bg-black/40 border-dashed border-white/10 opacity-60 cursor-not-allowed' 
                    : plot.isWatered ? 'bg-blue-900/30 border-blue-500/50' : `${theme.colors.panel} ${theme.colors.border}`
                }
                ${plot.isReady ? 'shadow-[0_0_15px_rgba(34,197,94,0.6)] border-green-400' : ''}
                `}
            >
                {!plot.isUnlocked && (
                    <div className="flex flex-col items-center opacity-50">
                        <span className="text-2xl mb-1">🔒</span>
                        <span className="text-[10px]">Lv.{i < 6 ? 3 : 5}</span>
                    </div>
                )}
                
                {plot.isUnlocked && plot.cropId ? (
                <>
                    <div className={`text-3xl transition-transform ${plot.isReady ? 'scale-110 animate-bounce' : 'scale-75 opacity-70'}`}>
                    {CROPS[plot.cropId].icon}
                    </div>
                    {!plot.isReady && (
                    <div className="absolute bottom-2 left-2 right-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${getGrowthProgress(plot)}%` }} />
                    </div>
                    )}
                    {!plot.isWatered && !plot.isReady && (
                       <div className="absolute top-1 right-1 text-xs animate-pulse opacity-80">💧</div>
                    )}
                    {plot.isWatered && !plot.isReady && (
                        <div className="absolute inset-0 bg-blue-500/10 pointer-events-none rounded-lg" />
                    )}
                    {plot.isReady && (
                        <>
                            <div className="absolute top-1 left-1 text-xs animate-ping text-yellow-300">✨</div>
                            <div className="absolute bottom-1 right-1 text-xs animate-ping delay-100 text-yellow-300">✨</div>
                        </>
                    )}
                </>
                ) : plot.isUnlocked ? (
                <div className="opacity-20 text-2xl">🌱</div>
                ) : null}
            </button>
            ))}
            <div className="col-span-3 h-16 w-full"></div>
        </div>

        <div className="space-y-1 z-10 shrink-0 pt-2 border-t border-white/10">
            <div 
                ref={toolsScrollRef}
                className="flex gap-2 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide cursor-grab active:cursor-grabbing h-24 items-center no-drag"
                style={{ touchAction: 'pan-x' }}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onClickCapture={handleToolClickCapture}
            >
            <ToolButton 
                active={selectedTool === 'water'} 
                onClick={() => { setSelectedTool('water'); playSound('click', soundEnabled); }}
                icon="💧" label="浇水" theme={theme} 
            />
            <ToolButton 
                active={selectedTool === 'harvest'} 
                onClick={() => { setSelectedTool('harvest'); playSound('click', soundEnabled); }}
                icon="✂️" label="收割" theme={theme} 
            />
            <ToolButton 
                active={selectedTool === 'fertilizer'} 
                onClick={() => { setSelectedTool('fertilizer'); playSound('click', soundEnabled); }}
                icon="⚡" label={`$${ITEMS.fertilizer.cost}`} theme={theme} 
                disabled={gameState.money < ITEMS.fertilizer.cost}
            />
            <div className="w-[1px] h-12 bg-white/20 mx-1 shrink-0"></div>
            {Object.values(CROPS).map(crop => {
                const locked = gameState.level < crop.unlockLevel;
                return (
                    <ToolButton 
                    key={crop.id}
                    active={selectedTool === crop.id}
                    onClick={() => { setSelectedTool(crop.id); playSound('click', soundEnabled); }}
                    icon={locked ? '🔒' : crop.icon}
                    label={locked ? `Lv.${crop.unlockLevel}` : `$${crop.cost}`}
                    theme={theme}
                    disabled={locked || gameState.money < crop.cost}
                    />
                );
            })}
            </div>
        </div>
      </>
      ) : (
          <div className="flex-1 overflow-y-auto z-10 space-y-2">
              <h3 className="text-xs opacity-70 mb-2">装饰品提供全局经验加成</h3>
              {Object.values(DECORATIONS).map(decor => {
                  const owned = gameState.ownedDecorations?.includes(decor.id);
                  return (
                      <div key={decor.id} className={`flex items-center justify-between p-2 rounded border ${theme.colors.border} ${theme.colors.panel}`}>
                          <div className="flex items-center gap-3">
                              <span className="text-2xl">{decor.icon}</span>
                              <div>
                                  <div className="font-bold text-sm">{decor.name}</div>
                                  <div className="text-[10px] opacity-70">{decor.desc}</div>
                              </div>
                          </div>
                          <button 
                            onClick={(e) => buyDecoration(decor.id, e)}
                            disabled={owned || gameState.money < decor.cost}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all active:scale-95 ${owned ? 'bg-green-600 text-white cursor-default' : gameState.money >= decor.cost ? theme.colors.primary + ' text-white' : 'bg-gray-600 opacity-50'}`}
                          >
                              {owned ? '已拥有' : `$${decor.cost}`}
                          </button>
                      </div>
                  )
              })}
              <div className="h-16 w-full"></div>
          </div>
      )}
      
      <style>{`
        @keyframes float-up {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-40px); opacity: 0; }
        }
        .animate-float-up {
            animation: float-up 0.8s ease-out forwards;
        }
        .text-shadow {
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
      `}</style>
    </div>
  );
};

const ToolButton = ({ active, onClick, icon, label, theme, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex flex-col items-center justify-center p-2 rounded-lg min-w-[70px] h-[70px] border transition-all active:scale-95 shrink-0
      ${active ? `${theme.colors.primary} text-white border-transparent` : `${theme.colors.panel} ${theme.colors.border}`}
      ${disabled ? 'opacity-40 cursor-not-allowed bg-black/20' : 'hover:scale-105'}
    `}
  >
    <span className="text-2xl mb-1">{icon}</span>
    <span className="text-xs whitespace-nowrap">{label}</span>
  </button>
);

export default FarmingGame;
