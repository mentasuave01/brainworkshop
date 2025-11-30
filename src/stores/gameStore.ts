import { createStore } from 'solid-js/store';
import type { Profile, Session, Trial, GameMode, GameConfig } from '../types';
import { DEFAULT_CONFIG, GAME_MODE_CONFIGS } from '../types';
import {
  generateTrials,
  calculateSessionScore,
  determineNextLevel,
} from '../utils/gameEngine';

interface GameStore {
  // Profiles
  profiles: Profile[];
  activeProfileId: string | null;

  // Current session
  currentSession: Session | null;
  currentTrialIndex: number;

  // UI state
  isPlaying: boolean;
  isPaused: boolean;
  showingResult: boolean;
  isManualMode: boolean;

  // Timing
  trialStartTime: number;
  timeRemaining: number;
}

const [gameStore, setGameStore] = createStore<GameStore>({
  profiles: [],
  activeProfileId: null,
  currentSession: null,
  currentTrialIndex: 0,
  isPlaying: false,
  isPaused: false,
  showingResult: false,
  isManualMode: false,
  trialStartTime: 0,
  timeRemaining: 0,
});

// Game actions
export const gameActions = {
  // Profile management
  createProfile(name: string): string {
    const id = `profile-${Date.now()}`;
    const newProfile: Profile = {
      id,
      name,
      createdAt: Date.now(),
      currentNBackLevel: 2,
      currentGameMode: 'dual-nback',
      strikeCount: 0,
      dailyStats: {},
      config: { ...DEFAULT_CONFIG },
    };

    setGameStore('profiles', (profiles) => [...profiles, newProfile]);
    gameActions.saveToLocalStorage();
    return id;
  },

  setActiveProfile(profileId: string) {
    setGameStore('activeProfileId', profileId);
    gameActions.saveToLocalStorage();
  },

  getActiveProfile(): Profile | null {
    const profile = gameStore.profiles.find(
      (p) => p.id === gameStore.activeProfileId
    );
    return profile || null;
  },

  updateProfileConfig(profileId: string, config: Partial<GameConfig>) {
    setGameStore(
      'profiles',
      (p) => p.id === profileId,
      'config',
      (c) => ({ ...c, ...config })
    );
    gameActions.saveToLocalStorage();
  },

  deleteProfile(profileId: string) {
    setGameStore('profiles', (profiles) => profiles.filter((p) => p.id !== profileId));

    // If active profile is deleted, switch to another one or null
    if (gameStore.activeProfileId === profileId) {
      const remainingProfiles = gameStore.profiles;
      if (remainingProfiles.length > 0) {
        setGameStore('activeProfileId', remainingProfiles[0].id);
      } else {
        setGameStore('activeProfileId', null);
      }
    }
    gameActions.saveToLocalStorage();
  },

  // Session management
  startNewSession(gameMode?: GameMode, manualMode: boolean = false) {
    const profile = gameActions.getActiveProfile();
    if (!profile) return;

    const mode = gameMode || profile.currentGameMode;
    const nBackLevel = manualMode
      ? profile.currentNBackLevel
      : GAME_MODE_CONFIGS[mode].startingNBack;

    const trials = generateTrials(mode, nBackLevel, profile.config);

    const session: Session = {
      id: `session-${Date.now()}`,
      profileId: profile.id,
      gameMode: mode,
      nBackLevel,
      trials,
      startTime: Date.now(),
      totalScore: 0,
      isManualMode: manualMode,
      config: { ...profile.config },
    };

    setGameStore({
      currentSession: session,
      currentTrialIndex: 0,
      isPlaying: true,
      isPaused: false,
      showingResult: false,
      isManualMode: manualMode,
      trialStartTime: Date.now(),
      timeRemaining: profile.config.timePerTrial,
    });
  },

  recordResponse(
    modality: 'position' | 'sound' | 'color' | 'visual',
    value: boolean
  ) {
    if (!gameStore.currentSession) return;

    const trial =
      gameStore.currentSession.trials[gameStore.currentTrialIndex];
    if (!trial) return;

    setGameStore(
      'currentSession',
      'trials',
      gameStore.currentTrialIndex,
      `${modality}Match`,
      value
    );
  },

  recordArithmeticAnswer(answer: string) {
    if (!gameStore.currentSession) return;

    setGameStore(
      'currentSession',
      'trials',
      gameStore.currentTrialIndex,
      'arithmeticAnswer',
      answer
    );
  },

  nextTrial() {
    if (!gameStore.currentSession) return;

    const nextIndex = gameStore.currentTrialIndex + 1;

    if (nextIndex >= gameStore.currentSession.trials.length) {
      // Session complete
      gameActions.endSession();
    } else {
      setGameStore({
        currentTrialIndex: nextIndex,
        trialStartTime: Date.now(),
        timeRemaining: gameStore.currentSession.config.timePerTrial,
      });
    }
  },

  endSession() {
    if (!gameStore.currentSession) return;

    // Set end time
    setGameStore('currentSession', 'endTime', Date.now());

    // Calculate scores
    const scores = calculateSessionScore(gameStore.currentSession!);
    setGameStore('currentSession', (current) => ({
      ...current!,
      ...scores,
    }));

    // Update profile stats
    const profile = gameActions.getActiveProfile();
    if (profile && !gameStore.isManualMode) {
      // Determine next level
      const { nextLevel, newStrikeCount } = determineNextLevel(
        gameStore.currentSession!.nBackLevel,
        scores.totalScore,
        profile.strikeCount,
        gameStore.currentSession!.config
      );

      // Update profile
      const today = new Date().toISOString().split('T')[0];
      setGameStore(
        'profiles',
        (p) => p.id === profile.id,
        (prof) => {
          const updatedProfile = { ...prof };
          updatedProfile.currentNBackLevel = nextLevel;
          updatedProfile.strikeCount = newStrikeCount;

          // Update daily stats
          if (!updatedProfile.dailyStats[today]) {
            updatedProfile.dailyStats[today] = {
              date: today,
              sessions: [],
              averageNBack: 0,
              totalSessions: 0,
            };
          }

          updatedProfile.dailyStats[today].sessions.push(gameStore.currentSession!);
          const sessions = updatedProfile.dailyStats[today].sessions;
          updatedProfile.dailyStats[today].totalSessions = sessions.length;
          updatedProfile.dailyStats[today].averageNBack =
            sessions.reduce((sum, s) => sum + s.nBackLevel, 0) /
            sessions.length;

          return updatedProfile;
        }
      );
    }

    setGameStore({
      isPlaying: false,
      showingResult: true,
    });

    // Save to localStorage
    gameActions.saveToLocalStorage();
  },

  pauseSession() {
    setGameStore('isPaused', true);
  },

  resumeSession() {
    setGameStore('isPaused', false);
    setGameStore('trialStartTime', Date.now());
  },

  getCurrentTrial(): Trial | null {
    if (!gameStore.currentSession) return null;
    return gameStore.currentSession.trials[gameStore.currentTrialIndex] || null;
  },

  // Manual mode controls
  setManualMode(enabled: boolean) {
    setGameStore('isManualMode', enabled);
  },

  adjustNBackLevel(delta: number) {
    if (!gameStore.isManualMode) return;

    const profile = gameActions.getActiveProfile();
    if (!profile) return;

    const newLevel = Math.max(1, profile.currentNBackLevel + delta);
    setGameStore(
      'profiles',
      (p) => p.id === profile.id,
      'currentNBackLevel',
      newLevel
    );
  },

  setGameMode(mode: GameMode) {
    const profile = gameActions.getActiveProfile();
    if (!profile) return;

    setGameStore(
      'profiles',
      (p) => p.id === profile.id,
      'currentGameMode',
      mode
    );
    gameActions.saveToLocalStorage();
  },

  // Stats management
  clearSessionHistory(profileId: string) {
    setGameStore(
      'profiles',
      (p) => p.id === profileId,
      'dailyStats',
      {}
    );
    gameActions.saveToLocalStorage();
  },

  exportStats(profileId: string): string {
    const profile = gameStore.profiles.find((p) => p.id === profileId);
    if (!profile) return '';

    const lines: string[] = ['Date\tAverage N-Back\tSessions'];

    Object.entries(profile.dailyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, stats]) => {
        lines.push(
          `${date}\t${stats.averageNBack.toFixed(2)}\t${stats.totalSessions}`
        );
      });

    return lines.join('\n');
  },

  // Load/save to localStorage
  saveToLocalStorage() {
    localStorage.setItem('brainworkshop-profiles', JSON.stringify(gameStore.profiles));
    localStorage.setItem('brainworkshop-activeProfile', gameStore.activeProfileId || '');
  },

  loadFromLocalStorage() {
    const profilesData = localStorage.getItem('brainworkshop-profiles');
    const activeProfileId = localStorage.getItem('brainworkshop-activeProfile');

    if (profilesData) {
      try {
        const profiles = JSON.parse(profilesData);
        setGameStore('profiles', profiles);
      } catch (e) {
        console.error('Failed to load profiles:', e);
      }
    }

    if (activeProfileId) {
      setGameStore('activeProfileId', activeProfileId);
    }
  },

  // Reset to title screen
  returnToTitleScreen() {
    setGameStore({
      currentSession: null,
      currentTrialIndex: 0,
      isPlaying: false,
      isPaused: false,
      showingResult: false,
      trialStartTime: 0,
      timeRemaining: 0,
    });
  },
};

export { gameStore };
