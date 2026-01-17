// Core types for Brain Workshop

export type GameMode =
  | 'dual-nback'
  | 'triple-nback'
  | 'position-nback'
  | 'audio-nback'
  | 'dual-combination'
  | 'triple-combination'
  | 'quadruple-combination'
  | 'arithmetic-nback'
  | 'dual-arithmetic'
  | 'triple-arithmetic';

export type SoundSet = 'letters' | 'numbers' | 'nato' | 'piano' | 'morse';

export type ModalityType = 'position' | 'sound' | 'color' | 'visual' | 'shape';

export type ShapeType = 'circle' | 'triangle' | 'square' | 'diamond';

export interface GameConfig {
  // Window settings
  windowFullscreen: boolean;
  blackBackground: boolean;

  // Game settings
  trialsPerSession: number;
  timePerTrial: number; // in milliseconds
  stimulusDuration: number; // in milliseconds

  // Jaeggi mode settings
  jaeggiMode: boolean;

  // Thresholds
  increaseThreshold: number; // percentage (e.g., 80 for 80%)
  maintainThreshold: number; // percentage (e.g., 50 for 50%)
  decreaseStrikes: number; // number of failures before decrease

  // Audio settings
  useMusic: boolean;
  musicVolume: number; // 0 to 1
  soundSets: SoundSet[];

  // Advanced features
  variableNBack: boolean;
  crabBack: boolean;
  multiStimMode: boolean;
  interferenceLevel: number; // 0 to 1
  auditoryImpairment: boolean;

  // Arithmetic settings (for arithmetic modes)
  arithmeticMaxNumber: number;
  arithmeticUseNegatives: boolean;
  arithmeticOperations: {
    addition: boolean;
    subtraction: boolean;
    multiplication: boolean;
    division: boolean;
  };

  // UI settings
  showManualMode: boolean;
  disableVisualInputConfirmation: boolean;
}

export interface Trial {
  index: number;
  position: number; // 0-7 for the 8 positions
  sound: string;
  color?: string;
  shape?: ShapeType;
  visualCue?: string;
  arithmeticOperation?: string;
  arithmeticNumber?: number;
  nBackLevel: number; // for variable n-back

  // User responses
  positionMatch: boolean | null;
  soundMatch: boolean | null;
  colorMatch: boolean | null;
  visualMatch: boolean | null;
  shapeMatch: boolean | null;
  arithmeticAnswer?: string;

  // Correctness
  positionShouldMatch: boolean;
  soundShouldMatch: boolean;
  colorShouldMatch?: boolean;
  visualShouldMatch?: boolean;
  shapeShouldMatch?: boolean;
  arithmeticCorrectAnswer?: string;

  timestamp: number;
}

export interface Session {
  id: string;
  profileId: string;
  gameMode: GameMode;
  nBackLevel: number;
  trials: Trial[];
  startTime: number;
  endTime?: number;

  // Scoring
  positionScore?: number; // percentage
  soundScore?: number; // percentage
  colorScore?: number; // percentage
  visualScore?: number; // percentage
  arithmeticScore?: number; // percentage
  totalScore: number; // percentage

  // Session metadata
  isManualMode: boolean;
  config: GameConfig;
}

export interface DailyStats {
  date: string; // ISO date string
  sessions: Session[];
  averageNBack: number;
  totalSessions: number;
}

export interface Profile {
  id: string;
  name: string;
  createdAt: number;

  // Current state
  currentNBackLevel: number;
  currentGameMode: GameMode;
  strikeCount: number; // for tracking failures

  // Stats
  dailyStats: Record<string, DailyStats>; // keyed by date

  // Config
  config: GameConfig;
}

export interface GameState {
  // Current session
  currentSession: Session | null;
  currentTrial: Trial | null;
  trialIndex: number;

  // Timing
  trialStartTime: number;
  timeRemaining: number;

  // UI state
  isPlaying: boolean;
  isPaused: boolean;
  showingResult: boolean;

  // Current profile
  activeProfile: Profile | null;
}

export interface MatchCheck {
  position: boolean;
  sound: boolean;
  color?: boolean;
  visual?: boolean;
  shape?: boolean;
}

// Scoring types
export interface ModalityScore {
  correct: number;
  total: number;
  percentage: number;
}

export interface SessionScore {
  position?: ModalityScore;
  sound?: ModalityScore;
  color?: ModalityScore;
  visual?: ModalityScore;
  shape?: ModalityScore;
  arithmetic?: ModalityScore;
  total: number;
}

// Default configuration
export const DEFAULT_CONFIG: GameConfig = {
  windowFullscreen: false,
  blackBackground: false,
  trialsPerSession: 20,
  timePerTrial: 3000,
  stimulusDuration: 1000,
  jaeggiMode: false,
  increaseThreshold: 80,
  maintainThreshold: 50,
  decreaseStrikes: 3,
  useMusic: true,
  musicVolume: 0.5,
  soundSets: ['letters'],
  variableNBack: false,
  crabBack: false,
  multiStimMode: false,
  interferenceLevel: 0,
  auditoryImpairment: false,
  arithmeticMaxNumber: 12,
  arithmeticUseNegatives: false,
  arithmeticOperations: {
    addition: true,
    subtraction: true,
    multiplication: true,
    division: true,
  },
  showManualMode: false,
  disableVisualInputConfirmation: false,
};

// Game mode configurations
export interface GameModeConfig {
  name: string;
  description: string;
  modalities: ModalityType[];
  startingNBack: number;
  supportsJaeggi: boolean;
}

export const GAME_MODE_CONFIGS: Record<GameMode, GameModeConfig> = {
  'position-nback': {
    name: 'Position N-Back',
    description: 'Visual position matching only',
    modalities: ['position'],
    startingNBack: 1,
    supportsJaeggi: false,
  },
  'audio-nback': {
    name: 'Audio N-Back',
    description: 'Audio sound matching only',
    modalities: ['sound'],
    startingNBack: 1,
    supportsJaeggi: false,
  },
  'dual-nback': {
    name: 'Dual N-Back',
    description: 'Position and sound matching',
    modalities: ['position', 'sound'],
    startingNBack: 2,
    supportsJaeggi: true,
  },
  'triple-nback': {
    name: 'Triple N-Back',
    description: 'Position, color, and sound matching',
    modalities: ['position', 'color', 'sound'],
    startingNBack: 2,
    supportsJaeggi: false,
  },
  'dual-combination': {
    name: 'Dual Combination N-Back',
    description: 'Visual and auditory cues with cross-matching',
    modalities: ['visual', 'sound'],
    startingNBack: 1,
    supportsJaeggi: false,
  },
  'triple-combination': {
    name: 'Triple Combination N-Back',
    description: 'Position, visual, and auditory with cross-matching',
    modalities: ['position', 'visual', 'sound'],
    startingNBack: 1,
    supportsJaeggi: false,
  },
  'quadruple-combination': {
    name: 'Quad N-Back',
    description: 'Position, sound, color, and shape matching',
    modalities: ['position', 'sound', 'color', 'shape'],
    startingNBack: 1,
    supportsJaeggi: false,
  },
  'arithmetic-nback': {
    name: 'Arithmetic N-Back',
    description: 'Mathematical operations on n-back numbers',
    modalities: ['sound'],
    startingNBack: 1,
    supportsJaeggi: false,
  },
  'dual-arithmetic': {
    name: 'Dual Arithmetic N-Back',
    description: 'Position and arithmetic operations',
    modalities: ['position', 'sound'],
    startingNBack: 1,
    supportsJaeggi: false,
  },
  'triple-arithmetic': {
    name: 'Triple Arithmetic N-Back',
    description: 'Position, color, and arithmetic operations',
    modalities: ['position', 'color', 'sound'],
    startingNBack: 1,
    supportsJaeggi: false,
  },
};

// Sound and visual constants
export const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];
export const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
export const NATO = ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL'];
export const COLORS = ['blue', 'green', 'yellow', 'red'];
export const SHAPES: ShapeType[] = ['circle', 'triangle', 'square', 'diamond'];
export const POSITIONS = 8; // Number of grid positions
export const ARITHMETIC_OPERATIONS = ['plus', 'minus', 'times', 'divide'];
