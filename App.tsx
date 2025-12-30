
import React, { useState, useEffect } from 'react';
import FloatingWindow from './components/FloatingWindow.tsx';
import Game2048 from './components/games/Game2048.tsx';
import Minesweeper from './components/games/Minesweeper.tsx';
import FarmingGame from './components/games/FarmingGame.tsx';
import MemoryMatch from './components/games/MemoryMatch.tsx';
import TileMatch from './components/games/TileMatch.tsx';
import SnakeGame from './components/games/SnakeGame.tsx';
import TicTacToe from './components/games/TicTacToe.tsx';
import Tetris from './components/games/Tetris.tsx';
import Sudoku from './components/games/Sudoku.tsx';
import WhackAMole from './components/games/WhackAMole.tsx';
import TextAdventure from './components/games/TextAdventure.tsx';
import Settings from './components/Settings.tsx';
import { GameType, ThemeMode, FarmingState, SaveData, ThemeColors, Game2048State, ParticleConfig, MinesweeperState, MemoryState, TileMatchState, ThemePreset, TicTacToeState, SnakeState, TetrisState, SudokuState, WhackAMoleState, TextAdventureState } from './types.ts';
import { themes } from './utils/themes.ts';
import { playSound } from './utils/sound.ts';

const INITIAL_FARMING_STATE: FarmingState = {
  money: 50,
  xp: 0,
  level: 1,
  ownedDecorations: [],
  plots: Array(9).fill(null).map((_, i) => ({
    id: i,
    cropId: null,
    plantTime: null,
    isWatered: false,
    isReady: false,
    isUnlocked: i < 3 
  }))
};

const DEFAULT_CUSTOM_COLORS: Partial<ThemeColors> = {
    bgBase: '#1a1a1a',
    bgHeader: '#000000',
    textMain: '#ffffff',
    primary: '#ff0055',
    panel: '#2a2a2a'
};

const DEFAULT_PARTICLE_CONFIG: ParticleConfig = {
    enabled: true,
    density: 40,
    color: 'auto'
};

const App: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false); // Default hidden
  const [currentGame, setCurrentGame] = useState<GameType>(GameType.MENU);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [customColors, setCustomColors] = useState<Partial<ThemeColors>>(DEFAULT_CUSTOM_COLORS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [particleConfig, setParticleConfig] = useState<ParticleConfig>(DEFAULT_PARTICLE_CONFIG);
  const [notification, setNotification] = useState<string | null>(null);
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [fontSettings, setFontSettings] = useState({ url: '', family: '' });
  
  // Game States
  const [farmingState, setFarmingState] = useState<FarmingState>(INITIAL_FARMING_STATE);
  const [game2048State, setGame2048State] = useState<Game2048State | undefined>(undefined);
  const [minesweeperState, setMinesweeperState] = useState<MinesweeperState | undefined>(undefined);
  const [memoryState, setMemoryState] = useState<MemoryState | undefined>(undefined);
  const [tileMatchState, setTileMatchState] = useState<TileMatchState | undefined>(undefined);
  const [ticTacToeState, setTicTacToeState] = useState<TicTacToeState | undefined>(undefined);
  const [snakeState, setSnakeState] = useState<SnakeState | undefined>(undefined);
  const [tetrisState, setTetrisState] = useState<TetrisState | undefined>(undefined);
  const [sudokuState, setSudokuState] = useState<SudokuState | undefined>(undefined);
  const [whackState, setWhackState] = useState<WhackAMoleState | undefined>(undefined);
  const [adventureState, setAdventureState] = useState<TextAdventureState | undefined>(undefined);

  // Toggle Listener
  useEffect(() => {
    const handleToggle = () => {
        setIsVisible(prev => !prev);
        playSound('click', true);
    };
    window.addEventListener('toggle-app', handleToggle);
    return () => window.removeEventListener('toggle-app', handleToggle);
  }, []);

  // Auto Load
  useEffect(() => {
    const saved = localStorage.getItem('tavern_timekiller_autosave');
    if (saved) {
        try {
            const data = JSON.parse(saved) as SaveData;
            if (data.theme) setThemeMode(data.theme);
            if (data.soundEnabled !== undefined) setSoundEnabled(data.soundEnabled);
            if (data.particleConfig) setParticleConfig(data.particleConfig);

            if (data.farming) setFarmingState(data.farming);
            if (data.game2048State) setGame2048State(data.game2048State);
            if (data.minesweeperState) setMinesweeperState(data.minesweeperState);
            if (data.memoryState) setMemoryState(data.memoryState);
            if (data.tileMatchState) setTileMatchState(data.tileMatchState);
            if (data.ticTacToeState) setTicTacToeState(data.ticTacToeState);
            if (data.snakeState) setSnakeState(data.snakeState);
            if (data.tetrisState) setTetrisState(data.tetrisState);
            if (data.sudokuState) setSudokuState(data.sudokuState);
            if (data.whackAMoleState) setWhackState(data.whackAMoleState);
            if (data.textAdventureState) setAdventureState(data.textAdventureState);
            
            if (data.customColors) setCustomColors(data.customColors);
            if (data.presets) setPresets(data.presets);
            
            if (data.fontFamily) {
                 setFontSettings({ url: data.fontUrl || '', family: data.fontFamily });
            }
        } catch (e) { console.error("Auto-load failed", e); }
    }
  }, []);

  // Font Injection
  useEffect(() => {
    if (fontSettings.url) {
        const existing = document.getElementById('custom-font-link');
        if (existing) existing.remove();
        const link = document.createElement('link');
        link.id = 'custom-font-link';
        link.rel = 'stylesheet';
        link.href = fontSettings.url;
        document.head.appendChild(link);
    }
    if (fontSettings.family) document.body.style.setProperty('font-family', fontSettings.family, 'important');
    else document.body.style.removeProperty('font-family');
  }, [fontSettings]);

  // Auto Save
  useEffect(() => {
    const data: SaveData = {
        theme: themeMode, customColors, soundEnabled, particleConfig,
        farming: farmingState, game2048State, minesweeperState, memoryState,
        tileMatchState, ticTacToeState, snakeState, tetrisState, sudokuState,
        whackAMoleState: whackState, textAdventureState: adventureState,
        presets, fontUrl: fontSettings.url, fontFamily: fontSettings.family
    };
    localStorage.setItem('tavern_timekiller_autosave', JSON.stringify(data));
  }, [themeMode, customColors, soundEnabled, particleConfig, farmingState, game2048State, minesweeperState, memoryState, tileMatchState, snakeState, ticTacToeState, tetrisState, sudokuState, whackState, adventureState, presets, fontSettings]);

  const showToast = (msg: string) => {
      setNotification(msg);
      setTimeout(() => setNotification(null), 2000);
  };

  const handleManualSave = () => {
      playSound('success', soundEnabled);
      showToast("✅ 已保存当前状态");
  };

  const handleManualLoad = () => {
      const saved = localStorage.getItem('tavern_timekiller_autosave');
      if (saved) {
        const data = JSON.parse(saved) as SaveData;
        setFarmingState(data.farming);
        setGame2048State(data.game2048State);
        setMinesweeperState(data.minesweeperState);
        setMemoryState(data.memoryState);
        setTileMatchState(data.tileMatchState);
        setTicTacToeState(data.ticTacToeState);
        setSnakeState(data.snakeState);
        setTetrisState(data.tetrisState);
        setSudokuState(data.sudokuState);
        setWhackState(data.whackAMoleState);
        setAdventureState(data.textAdventureState);
        playSound('success', soundEnabled);
        showToast("📂 已读取最近进度");
      }
  };

  const theme = themes[themeMode];
  const changeGame = (type: GameType) => { playSound('click', soundEnabled); setCurrentGame(type); };

  if (!isVisible) return null;

  const renderContent = () => {
    switch (currentGame) {
      case GameType.GAME_2048: return <Game2048 onBack={() => changeGame(GameType.MENU)} currentTheme={themeMode} soundEnabled={soundEnabled} onSave={handleManualSave} onLoad={handleManualLoad} gameState={game2048State} setGameState={setGame2048State} />;
      case GameType.MINESWEEPER: return <Minesweeper onBack={() => changeGame(GameType.MENU)} currentTheme={themeMode} soundEnabled={soundEnabled} gameState={minesweeperState} setGameState={setMinesweeperState} />;
      case GameType.FARMING: return <FarmingGame onBack={() => changeGame(GameType.MENU)} currentTheme={themeMode} gameState={farmingState} setGameState={setFarmingState} soundEnabled={soundEnabled} onSave={handleManualSave} onLoad={handleManualLoad} />;
      case GameType.MEMORY: return <MemoryMatch onBack={() => changeGame(GameType.MENU)} currentTheme={themeMode} soundEnabled={soundEnabled} gameState={memoryState} setGameState={setMemoryState} />;
      case GameType.TILE_MATCH: return <TileMatch onBack={() => changeGame(GameType.MENU)} currentTheme={themeMode} soundEnabled={soundEnabled} gameState={tileMatchState} setGameState={setTileMatchState} />;
      case GameType.SNAKE: return <SnakeGame onBack={() => changeGame(GameType.MENU)} currentTheme={themeMode} soundEnabled={soundEnabled} gameState={snakeState} setGameState={setSnakeState} />;
      case GameType.TIC_TAC_TOE: return <TicTacToe onBack={() => changeGame(GameType.MENU)} currentTheme={themeMode} soundEnabled={soundEnabled} gameState={ticTacToeState} setGameState={setTicTacToeState} />;
      case GameType.TETRIS: return <Tetris onBack={() => changeGame(GameType.MENU)} currentTheme={themeMode} soundEnabled={soundEnabled} gameState={tetrisState} setGameState={setTetrisState} />;
      case GameType.SUDOKU: return <Sudoku onBack={() => changeGame(GameType.MENU)} currentTheme={themeMode} soundEnabled={soundEnabled} gameState={sudokuState} setGameState={setSudokuState} />;
      case GameType.WHACK_A_MOLE: return <WhackAMole onBack={() => changeGame(GameType.MENU)} currentTheme={themeMode} soundEnabled={soundEnabled} gameState={whackState} setGameState={setWhackState} />;
      case GameType.TEXT_ADVENTURE: return <TextAdventure onBack={() => changeGame(GameType.MENU)} currentTheme={themeMode} soundEnabled={soundEnabled} gameState={adventureState} setGameState={setAdventureState} />;
      case GameType.SETTINGS: return <Settings onBack={() => changeGame(GameType.MENU)} currentTheme={themeMode} setTheme={setThemeMode} customColors={customColors} setCustomColors={setCustomColors} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} particleConfig={particleConfig} setParticleConfig={setParticleConfig} presets={presets} setPresets={setPresets} fontSettings={fontSettings} setFontSettings={setFontSettings} />;
      default: return (
          <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <h1 className={`text-lg font-bold mb-4 ${theme.colors.textMain} text-center border-b border-white/10 pb-2 tracking-wide shrink-0`}>游戏中心</h1>
            <div className="flex-1 overflow-y-auto px-1 custom-scrollbar min-h-0 pb-20">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <MenuCard title="像素农场" icon={<PlantIcon className={theme.colors.success} />} desc="经营养成" onClick={() => changeGame(GameType.FARMING)} theme={theme} />
                    <MenuCard title="俄罗斯方块" icon={<TetrisIcon className={theme.colors.primary} />} desc="经典消除" onClick={() => changeGame(GameType.TETRIS)} theme={theme} />
                    <MenuCard title="AI 冒险" icon={<BrainIcon className={theme.colors.accent} />} desc="文字跑团" onClick={() => changeGame(GameType.TEXT_ADVENTURE)} theme={theme} />
                    <MenuCard title="贪吃蛇" icon={<SnakeIcon className={theme.colors.accent} />} desc="反应挑战" onClick={() => changeGame(GameType.SNAKE)} theme={theme} />
                    <MenuCard title="打地鼠" icon={<span className="text-3xl">🐹</span>} desc="手速测试" onClick={() => changeGame(GameType.WHACK_A_MOLE)} theme={theme} />
                    <MenuCard title="方块消消" icon={<TileIcon className="text-purple-400" />} desc="益智三消" onClick={() => changeGame(GameType.TILE_MATCH)} theme={theme} />
                    <MenuCard title="数独" icon={<GridNumberIcon className="text-blue-400" />} desc="逻辑推理" onClick={() => changeGame(GameType.SUDOKU)} theme={theme} />
                    <MenuCard title="2048" icon={<RectGridIcon className="text-yellow-400" />} desc="数字合成" onClick={() => changeGame(GameType.GAME_2048)} theme={theme} />
                    <MenuCard title="扫雷" icon={<BombIcon className="text-red-500" />} desc="排雷解谜" onClick={() => changeGame(GameType.MINESWEEPER)} theme={theme} />
                    <MenuCard title="记忆翻牌" icon={<BrainIcon className="text-pink-400" />} desc="记忆训练" onClick={() => changeGame(GameType.MEMORY)} theme={theme} />
                    <MenuCard title="井字棋" icon={<HashIcon className="text-cyan-400" />} desc="策略对战" onClick={() => changeGame(GameType.TIC_TAC_TOE)} theme={theme} />
                    <MenuCard title="设置" icon={<SettingsIcon className={theme.colors.textDim} />} desc="系统选项" onClick={() => changeGame(GameType.SETTINGS)} theme={theme} />
                </div>
            </div>
          </div>
      );
    }
  };

  return (
    <div className="w-full h-screen relative bg-transparent overflow-hidden">
      <FloatingWindow title="酒馆休闲角" currentTheme={themeMode} customColors={customColors} particleConfig={particleConfig}>
        {renderContent()}
      </FloatingWindow>
      {notification && (
          <div className="fixed top-14 left-1/2 transform -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-top-2">
              <div className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg border border-white/10 flex items-center gap-2">
                  {notification}
              </div>
          </div>
      )}
    </div>
  );
};

const MenuCard: React.FC<{title: string, desc: string, icon: React.ReactNode, onClick: () => void, theme: any}> = ({title, desc, icon, onClick, theme}) => (
    <button onClick={onClick} className={`relative flex flex-col items-center justify-center p-3 rounded-xl h-24 overflow-hidden group transition-all duration-300 ${theme.colors.panel} hover:bg-opacity-80 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-lg`}>
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-white`}></div>
        <div className="mb-2 text-3xl transition-transform group-hover:scale-110 duration-300 drop-shadow-md">{icon}</div>
        <span className={`text-xs font-bold ${theme.colors.textMain} z-10`}>{title}</span>
        <span className={`text-[9px] ${theme.colors.textDim} z-10 opacity-70 group-hover:opacity-100`}>{desc}</span>
    </button>
);

const RectGridIcon = ({ className }: { className?: string }) => (<svg className={`${className} fill-current`} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" opacity=".5"/><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 18H4v-8h8v8zm8 0h-8v-8h8v8zm0-10H4V4h16v8z"/></svg>);
const BombIcon = ({ className }: { className?: string }) => (<svg className={`${className} fill-current`} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M12 2c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1V3c0-.55-.45-1-1-1zm6.36 2.23c-.39-.39-1.02-.39-1.41 0l-1.42 1.42c-.39.39-.39 1.02 0 1.41c.39.39 1.02.39 1.41 0l1.42-1.42c.39-.39.39-1.02 0-1.41zM5.64 4.23c.39-.39.39-1.02 0-1.41s-1.02-.39-1.41 0L2.81 4.24c-.39.39-.39 1.02 0 1.41c.39.39 1.02.39 1.41 0l1.42-1.42zM12 22c5.52 0 10-4.48 10-10S17.52 2 12 2S2 6.48 2 12s4.48 10 10 10zm0-18c4.41 0 8 3.59 8 8s-3.59 8-8 8s-8-3.59-8-8s3.59-8 8-8z" opacity=".3"/><circle cx="12" cy="14" r="6"/></svg>);
const PlantIcon = ({ className }: { className?: string }) => (<svg className={`${className} stroke-current fill-none`} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M12 22c4.97 0 9-4.03 9-9c0-4.97-9-13-9-13S3 8.03 3 13c0 4.97 4.03 9 9 9z" opacity=".4" fill="currentColor" stroke="none"/><path d="M12 22v-6c0-4.5 3-5 3-9c0 4-5 5-5 9v6" strokeWidth="2" strokeLinecap="round"/><path d="M12 16c2 0 3-2 3-4" strokeWidth="2" strokeLinecap="round"/></svg>);
const BrainIcon = ({ className }: { className?: string }) => (<svg className={`${className} fill-current`} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8z" opacity=".3"/><path d="M12 6c-2.5 0-4.5 1.6-5.2 3.8c-.8.5-1.3 1.4-1.3 2.2c0 1.5 1.2 2.8 2.8 2.8c.4 0 .7-.1 1.1-.3c.7 1.5 2.1 2.5 3.6 2.5s2.9-1 3.6-2.5c.3.2.7.3 1.1.3c1.5 0 2.8-1.2 2.8-2.8c0-.9-.5-1.7-1.3-2.2C18.5 7.6 16.5 6 12 6z"/></svg>);
const TileIcon = ({ className }: { className?: string }) => (<svg className={`${className} fill-current`} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><rect x="4" y="4" width="8" height="8" rx="1" opacity=".5"/><rect x="12" y="4" width="8" height="8" rx="1" opacity=".8"/><rect x="4" y="12" width="8" height="8" rx="1" opacity=".8"/><rect x="12" y="12" width="8" height="8" rx="1" opacity=".5"/></svg>);
const SnakeIcon = ({ className }: { className?: string }) => (<svg className={`${className} fill-current`} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" opacity=".3"/><path d="M15 11h-3.5C10.7 11 10 10.3 10 9.5S10.7 8 11.5 8h1c1.4 0 2.5-1.1 2.5-2.5S13.9 3 12.5 3h-1C10.1 3 9 4.1 9 5.5v2C9 9.4 7.4 11 5.5 11v2C7.4 13 9 14.6 9 16.5v2c0 1.4 1.1 2.5 2.5 2.5h1c1.4 0 2.5-1.1 2.5-2.5S13.9 16 12.5 16h-1c-.8 0-1.5-.7-1.5-1.5S10.7 13 11.5 13H15c1.1 0 2-.9 2-2s-.9-2-2-2z"/></svg>);
const HashIcon = ({ className }: { className?: string }) => (<svg className={`${className} fill-current`} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" opacity=".3"/><path d="M7 11h10v2H7zM7 7h10v2H7zM11 7h2v10h-2zM15 7h2v10h-2z"/></svg>);
const TetrisIcon = ({ className }: { className?: string }) => (<svg className={`${className} fill-current`} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M11 5h2v6h-2zM7 11h2v6H7zM15 11h2v6h-2z" opacity=".6"/><path d="M11 11h2v2h-2z" /></svg>);
const GridNumberIcon = ({ className }: { className?: string }) => (<svg className={`${className} fill-current`} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" opacity=".3"/><path d="M11 5h2v2h-2zM5 11h2v2H5zM17 17h2v2h-2z"/></svg>);
const SettingsIcon = ({ className }: { className?: string }) => (<svg className={`${className} fill-current`} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);

export default App;
