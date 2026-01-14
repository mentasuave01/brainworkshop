import type {
  Trial,
  GameMode,
  GameConfig,
  Session,
  ModalityType,
} from '../types';
import {
  LETTERS,
  NUMBERS,
  NATO,
  COLORS,
  POSITIONS,
  ARITHMETIC_OPERATIONS,
  GAME_MODE_CONFIGS,
} from '../types';

/**
 * Generates a sequence of trials for an n-back session
 */
export function generateTrials(
  gameMode: GameMode,
  nBackLevel: number,
  config: GameConfig
): Trial[] {
  const trials: Trial[] = [];
  const numTrials = config.trialsPerSession;
  const modalities = GAME_MODE_CONFIGS[gameMode].modalities;

  // Get sound set
  const soundSet = getSoundSet(config.soundSets[0] || 'letters');

  // For Jaeggi mode, we need exactly 4 visual, 4 audio, and 2 simultaneous matches
  const matchPatterns = config.jaeggiMode
    ? generateJaeggiMatchPattern(numTrials, nBackLevel)
    : generateRandomMatchPattern(numTrials, nBackLevel, config.interferenceLevel);

  for (let i = 0; i < numTrials; i++) {
    const trial: Trial = {
      index: i,
      position: Math.floor(Math.random() * POSITIONS),
      sound: soundSet[Math.floor(Math.random() * soundSet.length)],
      nBackLevel: config.variableNBack
        ? Math.floor(Math.random() * nBackLevel) + 1
        : nBackLevel,
      positionMatch: null,
      soundMatch: null,
      colorMatch: null,
      visualMatch: null,
      positionShouldMatch: false,
      soundShouldMatch: false,
      timestamp: 0,
    };

    // Add color for triple/quadruple modes
    if (modalities.includes('color')) {
      trial.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      trial.colorShouldMatch = false;
    }

    // Add visual cue for combination modes
    if (modalities.includes('visual')) {
      trial.visualCue = soundSet[Math.floor(Math.random() * soundSet.length)];
      trial.visualShouldMatch = false;
    }

    // Add arithmetic for arithmetic modes
    if (gameMode.includes('arithmetic')) {
      const operations = getEnabledOperations(config.arithmeticOperations);
      trial.arithmeticOperation = operations[Math.floor(Math.random() * operations.length)];
      trial.arithmeticNumber = Math.floor(
        Math.random() * (config.arithmeticMaxNumber + 1)
      );
    }

    // Apply match patterns
    if (i >= trial.nBackLevel) {
      const nBackTrial = trials[i - trial.nBackLevel];

      if (matchPatterns.position[i]) {
        trial.position = nBackTrial.position;
        trial.positionShouldMatch = true;
      }

      if (matchPatterns.sound[i]) {
        trial.sound = nBackTrial.sound;
        trial.soundShouldMatch = true;
      }

      if (matchPatterns.color?.[i] && trial.color && nBackTrial.color) {
        trial.color = nBackTrial.color;
        trial.colorShouldMatch = true;
      }

      if (matchPatterns.visual?.[i] && trial.visualCue && nBackTrial.visualCue) {
        trial.visualCue = nBackTrial.visualCue;
        trial.visualShouldMatch = true;
      }
    }

    // Calculate arithmetic answer
    if (trial.arithmeticOperation && trial.arithmeticNumber !== undefined && i >= trial.nBackLevel) {
      const nBackTrial = trials[i - trial.nBackLevel];
      if (nBackTrial.arithmeticNumber !== undefined) {
        trial.arithmeticCorrectAnswer = calculateArithmetic(
          nBackTrial.arithmeticNumber,
          trial.arithmeticNumber,
          trial.arithmeticOperation
        ).toString();
      }
    }

    trials.push(trial);
  }

  return trials;
}

/**
 * Generates match pattern for Jaeggi mode (fixed number of matches)
 */
function generateJaeggiMatchPattern(
  numTrials: number,
  nBackLevel: number
): {
  position: boolean[];
  sound: boolean[];
  color?: boolean[];
  visual?: boolean[];
} {
  const pattern = {
    position: Array(numTrials).fill(false),
    sound: Array(numTrials).fill(false),
  };

  // Generate 4 position matches, 4 sound matches, 2 simultaneous
  const availableIndices = Array.from(
    { length: numTrials - nBackLevel },
    (_, i) => i + nBackLevel
  );

  // 2 simultaneous matches
  for (let i = 0; i < 2; i++) {
    const idx = availableIndices.splice(
      Math.floor(Math.random() * availableIndices.length),
      1
    )[0];
    pattern.position[idx] = true;
    pattern.sound[idx] = true;
  }

  // 2 more position-only matches
  for (let i = 0; i < 2; i++) {
    const idx = availableIndices.splice(
      Math.floor(Math.random() * availableIndices.length),
      1
    )[0];
    pattern.position[idx] = true;
  }

  // 2 more sound-only matches
  for (let i = 0; i < 2; i++) {
    const idx = availableIndices.splice(
      Math.floor(Math.random() * availableIndices.length),
      1
    )[0];
    pattern.sound[idx] = true;
  }

  return pattern;
}

/**
 * Generates random match pattern with optional interference
 */
function generateRandomMatchPattern(
  numTrials: number,
  nBackLevel: number,
  interferenceLevel: number
): {
  position: boolean[];
  sound: boolean[];
  color?: boolean[];
  visual?: boolean[];
} {
  const pattern = {
    position: Array(numTrials).fill(false),
    sound: Array(numTrials).fill(false),
    color: Array(numTrials).fill(false),
    visual: Array(numTrials).fill(false),
  };

  for (let i = nBackLevel; i < numTrials; i++) {
    // Random matches (about 25-30% chance)
    if (Math.random() < 0.25) {
      pattern.position[i] = true;
    }
    if (Math.random() < 0.25) {
      pattern.sound[i] = true;
    }
    if (Math.random() < 0.25) {
      pattern.color[i] = true;
    }
    if (Math.random() < 0.25) {
      pattern.visual[i] = true;
    }

    // Add interference (trick trials)
    if (Math.random() < interferenceLevel) {
      // Make it match n-1 or n+1 instead (but not n)
      const offset = Math.random() < 0.5 ? -1 : 1;
      if (i + offset >= 0 && i + offset < numTrials) {
        // Don't actually implement the trick here; this would be done in generation
      }
    }
  }

  return pattern;
}

/**
 * Gets the sound set based on configuration
 */
function getSoundSet(soundSetName: string): string[] {
  switch (soundSetName) {
    case 'numbers':
      return NUMBERS.slice(0, 8);
    case 'nato':
      return NATO;
    case 'letters':
    default:
      return LETTERS;
  }
}

/**
 * Gets enabled arithmetic operations
 */
function getEnabledOperations(operations: {
  addition: boolean;
  subtraction: boolean;
  multiplication: boolean;
  division: boolean;
}): string[] {
  const enabled: string[] = [];
  if (operations.addition) enabled.push('plus');
  if (operations.subtraction) enabled.push('minus');
  if (operations.multiplication) enabled.push('times');
  if (operations.division) enabled.push('divide');
  return enabled.length > 0 ? enabled : ['plus'];
}

/**
 * Calculates arithmetic result
 */
function calculateArithmetic(
  nBackNumber: number,
  currentNumber: number,
  operation: string
): number {
  switch (operation) {
    case 'plus':
      return nBackNumber + currentNumber;
    case 'minus':
      return nBackNumber - currentNumber;
    case 'times':
      return nBackNumber * currentNumber;
    case 'divide':
      return currentNumber !== 0
        ? Math.round((nBackNumber / currentNumber) * 100) / 100
        : 0;
    default:
      return 0;
  }
}

/**
 * Checks if user response is correct for a trial
 */
export function checkTrialResponse(trial: Trial): {
  positionCorrect: boolean;
  soundCorrect: boolean;
  colorCorrect?: boolean;
  visualCorrect?: boolean;
  arithmeticCorrect?: boolean;
} {
  return {
    positionCorrect:
      trial.positionMatch === trial.positionShouldMatch,
    soundCorrect:
      trial.soundMatch === trial.soundShouldMatch,
    colorCorrect:
      trial.colorShouldMatch !== undefined
        ? trial.colorMatch === trial.colorShouldMatch
        : undefined,
    visualCorrect:
      trial.visualShouldMatch !== undefined
        ? trial.visualMatch === trial.visualShouldMatch
        : undefined,
    arithmeticCorrect:
      trial.arithmeticCorrectAnswer
        ? trial.arithmeticAnswer === trial.arithmeticCorrectAnswer
        : undefined,
  };
}

/**
 * Calculates session score
 */
export function calculateSessionScore(session: Session): {
  positionScore?: number;
  soundScore?: number;
  colorScore?: number;
  visualScore?: number;
  arithmeticScore?: number;
  totalScore: number;
} {
  const modalities = GAME_MODE_CONFIGS[session.gameMode].modalities;
  
  // Track stats per modality
  const stats = {
    position: { correct: 0, total: 0 },
    sound: { correct: 0, total: 0 },
    color: { correct: 0, total: 0 },
    visual: { correct: 0, total: 0 },
    arithmetic: { correct: 0, total: 0 },
  };

  for (const trial of session.trials) {
    // Skip the first n trials as they cannot be matches
    if (trial.index < session.nBackLevel) continue;

    const check = checkTrialResponse(trial);
    const isJaeggi = session.config.jaeggiMode;

    // Helper to process modality scoring
    const processModality = (
      modality: 'position' | 'sound' | 'color' | 'visual' | 'arithmetic',
      shouldMatch: boolean | undefined,
      match: boolean | null | undefined,
      isCorrect: boolean | undefined
    ) => {
      // In Jaeggi mode, we count every trial and verify accuracy (True Positive + True Negative)
      if (isJaeggi) {
        stats[modality].total++;
        // User response is true if they pressed match, false otherwise
        const userResponse = match === true;
        // Correct if response matches expectation
        // If shouldMatch is undefined (e.g. arithmetic not active), we shouldn't be here really,
        // but for safety treat undefined as false.
        if (userResponse === (shouldMatch || false)) {
          stats[modality].correct++;
        }
      } else {
        // Standard mode: Signal Detection Theory (SDT) simplified
        // Count trial ONLY if:
        // 1. It was a Target (shouldMatch is true) -> Checks for Hit (Correct) or Miss (Wrong)
        // 2. OR User claimed it was a Target (match is true) -> Checks for False Alarm (Wrong) or Hit (Correct)
        // Correct Rejections (shouldMatch=false, match=null/false) are NOT counted in the total.
        
        const userSaidYes = match === true;
        
        if ((shouldMatch === true) || userSaidYes) {
          stats[modality].total++;
          if (isCorrect === true) {
            stats[modality].correct++;
          }
        }
      }
    };

    if (modalities.includes('position')) {
      processModality('position', trial.positionShouldMatch, trial.positionMatch, check.positionCorrect);
    }

    if (modalities.includes('sound')) {
      processModality('sound', trial.soundShouldMatch, trial.soundMatch, check.soundCorrect);
    }

    if (modalities.includes('color') && check.colorCorrect !== undefined) {
      processModality('color', trial.colorShouldMatch, trial.colorMatch, check.colorCorrect);
    }

    if (modalities.includes('visual') && check.visualCorrect !== undefined) {
      processModality('visual', trial.visualShouldMatch, trial.visualMatch, check.visualCorrect);
    }

    if (trial.arithmeticCorrectAnswer && check.arithmeticCorrect !== undefined) {
      // Arithmetic is special, usually always requires answer? 
      // Current logic treats it like others.
      // Assuming Standard mode logic applies (only count if answer provided or needed)
      stats.arithmetic.total++;
      if (check.arithmeticCorrect) stats.arithmetic.correct++;
    }
  }

  const scores: any = {};

  // Calculate individual modality scores
  if (stats.position.total > 0) scores.positionScore = (stats.position.correct / stats.position.total) * 100;
  if (stats.sound.total > 0) scores.soundScore = (stats.sound.correct / stats.sound.total) * 100;
  if (stats.color.total > 0) scores.colorScore = (stats.color.correct / stats.color.total) * 100;
  if (stats.visual.total > 0) scores.visualScore = (stats.visual.correct / stats.visual.total) * 100;
  if (stats.arithmetic.total > 0) scores.arithmeticScore = (stats.arithmetic.correct / stats.arithmetic.total) * 100;

  // Total score calculation
  if (session.config.jaeggiMode) {
    // Jaeggi mode: use minimum of position and sound scores (or whatever modalities are active)
    const activeScores = [];
    if (modalities.includes('position')) activeScores.push(scores.positionScore !== undefined ? scores.positionScore : 0);
    if (modalities.includes('sound')) activeScores.push(scores.soundScore !== undefined ? scores.soundScore : 0);
    if (modalities.includes('color')) activeScores.push(scores.colorScore !== undefined ? scores.colorScore : 0);
    if (modalities.includes('visual')) activeScores.push(scores.visualScore !== undefined ? scores.visualScore : 0);
    
    scores.totalScore = activeScores.length > 0 ? Math.min(...activeScores) : 0;
  } else {
    // Standard mode: Sum of all Rights / Sum of all Wrongs (Total Considered)
    // Score = TotalCorrect / TotalConsidered
    
    let grandTotalCorrect = 0;
    let grandTotalConsidered = 0;

    // Only sum for active modalities
    if (modalities.includes('position')) {
        grandTotalCorrect += stats.position.correct;
        grandTotalConsidered += stats.position.total;
    }
    if (modalities.includes('sound')) {
        grandTotalCorrect += stats.sound.correct;
        grandTotalConsidered += stats.sound.total;
    }
    if (modalities.includes('color')) {
        grandTotalCorrect += stats.color.correct;
        grandTotalConsidered += stats.color.total;
    }
    if (modalities.includes('visual')) {
        grandTotalCorrect += stats.visual.correct;
        grandTotalConsidered += stats.visual.total;
    }
    // Arithmetic might be mixed in
    if (modalities.includes('arithmetic') || session.gameMode.includes('arithmetic')) {
         grandTotalCorrect += stats.arithmetic.correct;
         grandTotalConsidered += stats.arithmetic.total;
    }

    scores.totalScore =
      grandTotalConsidered > 0
        ? (grandTotalCorrect / grandTotalConsidered) * 100
        : 0;
  }

  return scores;
}

/**
 * Determines the next n-back level based on performance
 */
export function determineNextLevel(
  currentLevel: number,
  score: number,
  strikeCount: number,
  config: GameConfig
): {
  nextLevel: number;
  newStrikeCount: number;
} {
  let nextLevel = currentLevel;
  let newStrikeCount = strikeCount;

  if (score >= config.increaseThreshold) {
    // Increase level
    nextLevel = currentLevel + 1;
    newStrikeCount = 0;
  } else if (score < config.maintainThreshold) {
    // Add a strike
    newStrikeCount++;
    if (newStrikeCount >= config.decreaseStrikes) {
      // Decrease level
      nextLevel = Math.max(1, currentLevel - 1);
      newStrikeCount = 0;
    }
  } else {
    // Maintain level
    // Don't reset strike count in standard mode
  }

  return { nextLevel, newStrikeCount };
}
