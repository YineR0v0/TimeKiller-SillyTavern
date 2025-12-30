
export enum GameType {
  MENU = 'MENU',
  SETTINGS = 'SETTINGS',
  GAME_2048 = 'GAME_2048',
  MINESWEEPER = 'MINESWEEPER',
  FARMING = 'FARMING',
  MEMORY = 'MEMORY',
  TILE_MATCH = 'TILE_MATCH',
  SNAKE = 'SNAKE',
  TIC_TAC_TOE = 'TIC_TAC_TOE',
  TETRIS = 'TETRIS',
  SUDOKU = 'SUDOKU',
  WHACK_A_MOLE = 'WHACK_A_MOLE',
  TEXT_ADVENTURE = 'TEXT_ADVENTURE'
}

export interface Coordinates {
  x: number;
  y: number;
}

// 2048 Types
export type Grid2048 = number[][];
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Game2048State {
  grid: Grid2048;
  score: number;
  gameOver: boolean;
}

// Minesweeper Types
export interface MineCell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
}

export interface MinesweeperState {
  board: MineCell[];
  gameOver: boolean;
  win: boolean;
  isGenerated: boolean; 
}

// Memory Types
export interface MemoryCard {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MemoryState {
  cards: MemoryCard[];
  flippedCards: number[];
  matches: number;
  moves: number;
  isGenerated: boolean;
}

// Tile Match Types
export interface MatchTile {
  id: number;
  type: string;
  gridX: number;
  gridY: number;
  layer: number;
  isClickable: boolean;
  visX: number;
  visY: number;
}

export interface TileMatchState {
  tiles: MatchTile[];
  dock: MatchTile[];
  status: 'playing' | 'won' | 'lost';
  isGenerated: boolean;
}

// Snake Types
export interface SnakeState {
  snake: Coordinates[];
  food: Coordinates;
  direction: Direction;
  score: number;
  gameOver: boolean;
  highScore: number;
  isPlaying: boolean;
}

// Tic Tac Toe Types
export interface TicTacToeState {
  board: (string | null)[];
  isXNext: boolean;
  winner: string | null;
  difficulty: 'easy' | 'hard';
  scores: { player: number; ai: number; draw: number };
}

// Tetris Types
export interface TetrisState {
  grid: (string | null)[][];
  activePiece: {
    shape: number[][];
    color: string;
    x: number;
    y: number;
  } | null;
  score: number;
  gameOver: boolean;
  isPaused: boolean;
  nextPiece: { shape: number[][]; color: string } | null;
}

// Sudoku Types
export interface SudokuState {
  board: number[][]; 
  initialBoard: number[][]; 
  solution: number[][]; 
  selectedCell: Coordinates | null;
  mistakes: number;
  isWon: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  notes: number[][][]; 
  isNoteMode: boolean;
}

// Whack-a-Mole Types
export interface WhackAMoleState {
  score: number;
  timeLeft: number;
  activeMole: number | null; 
  isPlaying: boolean;
  difficulty: 'easy' | 'hard';
  highScore: number;
}

// Text Adventure Types
export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
}

export interface TextAdventureState {
  messages: ChatMessage[];
  isLoading: boolean;
  inventory: string[];
  health: number;
  location: string;
}

// Theme Types
export type ThemeMode = 'dark' | 'light' | 'retro' | 'cyberpunk' | 'sakura' | 'custom';

export interface ThemeColors {
  bgBase: string;
  bgHeader: string;
  textMain: string;
  textDim: string;
  border: string;
  primary: string;
  primaryHover: string;
  accent: string;
  panel: string;
  success: string;
  danger: string;
}

export interface ThemeConfig {
  name: string;
  isCustom?: boolean;
  effect?: string; 
  colors: ThemeColors;
}

export interface ThemePreset {
  id: string;
  name: string;
  colors: Partial<ThemeColors>;
}

// Farming Types
export interface Crop {
  id: string;
  name: string;
  icon: string;
  cost: number;
  sellPrice: number;
  xp: number;
  growthTime: number; 
  unlockLevel: number;
}

export interface Decoration {
    id: string;
    name: string;
    icon: string;
    cost: number;
    xpBonus: number;
    desc: string;
}

export interface Plot {
  id: number;
  cropId: string | null;
  plantTime: number | null; 
  isWatered: boolean;
  isReady: boolean;
  isUnlocked: boolean;
}

export interface FarmingState {
  money: number;
  xp: number;
  level: number;
  plots: Plot[];
  ownedDecorations: string[];
}

export interface ParticleConfig {
  enabled: boolean;
  density: number; 
  color: string; 
}

// Global Save Data
export interface SaveData {
  theme: ThemeMode;
  customColors?: Partial<ThemeColors>;
  soundEnabled: boolean;
  particleConfig: ParticleConfig;
  farming: FarmingState;
  game2048State?: Game2048State;
  minesweeperState?: MinesweeperState;
  memoryState?: MemoryState;
  tileMatchState?: TileMatchState;
  snakeState?: SnakeState;
  ticTacToeState?: TicTacToeState;
  tetrisState?: TetrisState;
  sudokuState?: SudokuState;
  whackAMoleState?: WhackAMoleState;
  textAdventureState?: TextAdventureState;
  
  snakeHighScore?: number;
  tetrisHighScore?: number;
  whackHighScore?: number;
  
  presets?: ThemePreset[];
  fontUrl?: string;
  fontFamily?: string;
}
