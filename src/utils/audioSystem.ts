/**
 * Audio system for Brain Workshop
 * Uses Web Speech API for text-to-speech
 * Follows MDN patterns: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
 */

const synthesis = window.speechSynthesis;
let enabled = true;
let audioContext: AudioContext | null = null;
let voices: SpeechSynthesisVoice[] = [];

const loadVoices = () => {
  voices = synthesis.getVoices();
  console.log(`[Audio] Loaded ${voices.length} voices`);
};

export const FALLBACK_SOUNDS = [
  // Numbers 0-13
  ...Array.from({ length: 14 }, (_, i) => `/sounds/numbers/${i}.wav`),
  // Operations
  '/sounds/operations/add.wav',
  '/sounds/operations/subtract.wav',
  '/sounds/operations/multiply.wav',
  '/sounds/operations/divide.wav',
  // Letters (only specific ones have files, others use nato)
  ...['c', 'h', 'k', 'l', 'q', 'r', 's', 't'].map(l => `/sounds/letters/${l}.wav`),
  // NATO alphabet (a-z)
  ...['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel',
    'india', 'juliett', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa',
    'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey',
    'x-ray', 'yankee', 'zulu'].map(w => `/sounds/nato/${w.charAt(0)}.wav`)
];

// Initialize voices
loadVoices();
if (synthesis.onvoiceschanged !== undefined) {
  synthesis.onvoiceschanged = loadVoices;
}

const initAudioContext = () => {
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch (e) {
    console.warn('AudioContext not supported:', e);
  }
};

/**
 * Initializes or resumes the AudioContext.
 * Should be called on user interaction.
 */
const resume = async (): Promise<void> => {
  if (!enabled) return;

  if (!audioContext) {
    initAudioContext();
  }

  if (audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch (e) {
      console.warn('Failed to resume AudioContext:', e);
    }
  }
};

/**
 * Plays a beep sound (for feedback)
 */
const playBeep = (frequency: number = 440, duration: number = 100): void => {
  if (!enabled) return;

  if (!audioContext) {
    initAudioContext();
  }

  if (!audioContext) return;

  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    const currentTime = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.3, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      currentTime + duration / 1000
    );

    oscillator.start(currentTime);
    oscillator.stop(currentTime + duration / 1000);
  } catch (e) {
    console.warn('Error playing beep:', e);
  }
};

/**
 * Maps text to a sound file path for fallback
 */
const getFallbackSoundPath = (text: string): string | null => {
  const lowerText = text.toLowerCase();

  // Numbers
  if (!isNaN(Number(text))) {
    // Check if we have the number file (0-13 based on file list)
    const num = Number(text);
    if (num >= 0 && num <= 13) {
      return `/sounds/numbers/${num}.wav`;
    }
    return null;
  }

  // Operations
  if (['+', 'plus', 'add'].includes(lowerText)) return '/sounds/operations/add.wav';
  if (['-', 'minus', 'subtract'].includes(lowerText)) return '/sounds/operations/subtract.wav';
  if (['*', 'x', 'times', 'multiply'].includes(lowerText)) return '/sounds/operations/multiply.wav';
  if (['/', 'divide'].includes(lowerText)) return '/sounds/operations/divide.wav';

  // Single letters
  if (text.length === 1 && /^[a-z]$/i.test(text)) {
    // Known files in letters directory
    const lettersWithFiles = ['c', 'h', 'k', 'l', 'q', 'r', 's', 't'];
    if (lettersWithFiles.includes(lowerText)) {
      return `/sounds/letters/${lowerText}.wav`;
    }
    // Fallback to nato for others
    return `/sounds/nato/${lowerText}.wav`;
  }

  // NATO words (assume they start with the letter they represent)
  // e.g. "Alpha" -> "a.wav"
  const natoWords = [
    'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel',
    'india', 'juliett', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa',
    'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey',
    'x-ray', 'yankee', 'zulu'
  ];

  if (natoWords.includes(lowerText)) {
    return `/sounds/nato/${lowerText.charAt(0)}.wav`;
  }

  return null;
};

/**
 * Speaks the given text using standard SpeechSynthesis pattern
 */
const speak = (text: string): void => {
  if (!enabled) return;

  // Always cancel before speaking to prevent queue buildup
  synthesis.cancel();

  // Check for voices
  if (voices.length === 0) {
    voices = synthesis.getVoices();
  }

  // Fallback if no voices available
  if (voices.length === 0) {
    const soundPath = getFallbackSoundPath(text);
    if (soundPath) {
      console.log(`[Audio] Fallback playing: ${soundPath}`);
      const audio = new Audio(soundPath);
      audio.play().catch(e => console.warn('Fallback audio playback failed:', e));
      return;
    } else {
      console.warn(`[Audio] No voice and no fallback for: "${text}"`);
      // Fallback to beep if we can't speak it
      playBeep(440, 200);
      return;
    }
  }

  const utterance = new SpeechSynthesisUtterance(text);
  const lang = 'en-US';
  utterance.lang = lang;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  if (voices.length > 0) {
    let selectedVoice = voices.find(v => v.lang === 'en-US');
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('en'));
    if (!selectedVoice && navigator.language) selectedVoice = voices.find(v => v.lang === navigator.language);
    if (!selectedVoice) selectedVoice = voices[0];

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`[Audio] Using voice: ${selectedVoice.name}`);
    }
  }

  utterance.onerror = (event) => {
    console.warn('[Audio] Speech synthesis error:', event.error);
    playBeep(440, 200);
  };

  synthesis.speak(utterance);
};

const speakLetter = (letter: string) => speak(letter);
const speakNumber = (number: string) => speak(number);
const speakNATO = (word: string) => speak(word);
const speakOperation = (operation: string) => speak(operation);

const playSuccess = () => playBeep(800, 150);
const playError = () => playBeep(200, 150);

const cancel = () => synthesis.cancel();

const setEnabled = (newEnabled: boolean) => {
  enabled = newEnabled;
  if (!enabled) {
    synthesis.cancel();
    if (audioContext) {
      audioContext.suspend();
    }
  } else {
    resume();
  }
};

const playApplause = () => {
  if (!enabled) return;
  const audio = new Audio('/sounds/misc/applause.wav');
  audio.volume = 0.5;
  audio.play().catch(e => console.warn('Applause playback failed:', e));
};

const hasVoices = () => voices.length > 0;

export const audioSystem = {
  resume,
  speak,
  speakLetter,
  speakNumber,
  speakNATO,
  speakOperation,
  playBeep,
  playSuccess,
  playError,
  playApplause,
  cancel,
  setEnabled,
  hasVoices
};

