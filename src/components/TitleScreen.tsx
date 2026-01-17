import { createSignal, onMount, onCleanup, Show, createEffect, For } from 'solid-js';
import { gameStore, gameActions } from '../stores/gameStore';
import { GAME_MODE_CONFIGS, type GameMode } from '../types';
import { assetLoader } from '../utils/assetLoader';
import Settings from './Settings';
import LoadingModal from './LoadingModal';
import StatisticsScreen from './StatisticsScreen';
import './TitleScreen.css';

const TitleScreen = () => {
  const [showSettings, setShowSettings] = createSignal(false);
  const [showStats, setShowStats] = createSignal(false);
  const [settingsTab, setSettingsTab] = createSignal<'game' | 'profiles'>('game');
  const [showLoading, setShowLoading] = createSignal(false);
  const [isManualMode, setIsManualMode] = createSignal(false);
  const [fixLevel, setFixLevel] = createSignal(false);

  const handleGameModeChange = (mode: GameMode) => {
    const currentProfile = profile();
    if (currentProfile) {
      gameActions.setGameMode(mode);
    }
  };

  const handleLevelChange = (delta: number) => {
    const currentProfile = profile();
    if (currentProfile) {
      const newLevel = Math.max(1, Math.min(9, currentProfile.currentNBackLevel + delta));
      gameActions.setNBackLevel(newLevel);
    }
  };

  onMount(() => {
    // Start loading assets in background immediately
    assetLoader.startLoading();
    window.addEventListener('keydown', handleKeyDown);

    // Check if we need to force create a profile
    if (gameStore.profiles.length === 0) {
      setSettingsTab('profiles');
      setShowSettings(true);
    }
  });

  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't handle keys if modals are open or stats screen is showing
    if (showSettings() || showStats()) return;

    if (e.key === 'Enter') {
      handleStart();
    } else if (e.key === 'Escape') {
      setSettingsTab('game');
      setShowSettings(true);
    }
  };

  const handleStart = () => {
    if (!assetLoader.isReady()) {
      setShowLoading(true);
      return;
    }

    const currentProfile = gameActions.getActiveProfile();
    if (currentProfile) {
      gameActions.startNewSession(currentProfile.currentGameMode, isManualMode(), fixLevel());
    } else {
      setSettingsTab('profiles');
      setShowSettings(true);
    }
  };



  const profile = () => gameActions.getActiveProfile();

  const openSettings = (tab: 'game' | 'profiles') => {
    setSettingsTab(tab);
    setShowSettings(true);
  };

  return (
    <div class="title-screen">
      <Show when={!showStats()} fallback={<StatisticsScreen onBack={() => setShowStats(false)} />}>

        <div class="title-header">
          <h1 class="title">Brain Workshop</h1>



          {/* Settings Gear Icon */}
          <button class="icon-button" onClick={() => openSettings('game')} title="Settings">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
            </svg>
          </button>



        </div>
        <h2 class="subtitle">N-Back Training</h2>

        {/* Game Mode Selection */}
        <div class="game-mode-selector">
          <label for="game-mode-select">Mode</label>
          <select
            id="game-mode-select"
            value={profile()?.currentGameMode || 'dual-nback'}
            onChange={(e) => handleGameModeChange(e.currentTarget.value as GameMode)}
          >
            <For each={Object.entries(GAME_MODE_CONFIGS).sort(([modeA], [modeB]) => {
              const enabledModes = ['dual-nback', 'triple-nback', 'quadruple-combination'];
              const aEnabled = enabledModes.includes(modeA);
              const bEnabled = enabledModes.includes(modeB);
              if (aEnabled && !bEnabled) return -1;
              if (!aEnabled && bEnabled) return 1;
              return 0;
            })}>
              {([mode, config]) => {
                const enabledModes = ['dual-nback', 'triple-nback', 'quadruple-combination'];
                const isEnabled = enabledModes.includes(mode);
                return (
                  <option
                    value={mode}
                    disabled={!isEnabled}
                    class={!isEnabled ? 'coming-soon' : ''}
                  >
                    {config.name}{!isEnabled ? ' (Coming Soon)' : ''}
                  </option>
                );
              }}
            </For>
          </select>
          <p class="game-mode-description">
            {GAME_MODE_CONFIGS[profile()?.currentGameMode || 'dual-nback'].description}
          </p>

          {/* Mode Toggle */}
          <div class="mode-toggle-container">
            <span class={`mode-label ${!isManualMode() ? 'active' : ''}`}>Auto</span>
            <button
              class={`mode-toggle ${isManualMode() ? 'manual' : ''}`}
              onClick={() => setIsManualMode(!isManualMode())}
              title={isManualMode() ? 'Switch to Auto mode' : 'Switch to Manual mode'}
            >
              <span class="toggle-thumb" />
            </button>
            <span class={`mode-label ${isManualMode() ? 'active' : ''}`}>Manual</span>
          </div>

          {/* Level Controls - Only visible in Manual mode */}
          <Show when={isManualMode()}>
            <div class="nback-level-control">
              <Show when={!fixLevel()}>
                <button class="level-button" onClick={() => handleLevelChange(-1)} title="Decrease level">−</button>
              </Show>
              <span class="nback-level-value">{profile()?.currentNBackLevel || 2}-Back</span>
              <Show when={!fixLevel()}>
                <button class="level-button" onClick={() => handleLevelChange(1)} title="Increase level">+</button>
              </Show>
            </div>
            <div class="fix-level-toggle">
              <button
                class={`mode-toggle ${fixLevel() ? 'manual' : ''}`}
                onClick={() => setFixLevel(!fixLevel())}
                title={fixLevel() ? 'Level will stay fixed' : 'Level will adjust automatically'}
              >
                <span class="toggle-thumb" />
              </button>
              <span class={`mode-label ${fixLevel() ? 'active' : ''}`}>Fixed</span>
            </div>
          </Show>

          {/* Show current level in Auto mode */}
          <Show when={!isManualMode()}>
            <p class="nback-level-info">
              <strong>{profile()?.currentNBackLevel || 2}-Back</strong> (adjusts automatically)
            </p>
          </Show>
        </div>

        <div class="button-group">
          <button class="primary-button" onClick={handleStart}>Start Session</button>
        </div>
        <a href="#" onClick={() => setShowStats(true)} >Statistics</a>


        <div class="instructions">
          <h3>Quick Guide</h3>
          <ul>
            <Show when={GAME_MODE_CONFIGS[profile()?.currentGameMode || 'dual-nback'].modalities.includes('position')}>
              <li><strong>A</strong> - Position matches</li>
            </Show>
            <Show when={GAME_MODE_CONFIGS[profile()?.currentGameMode || 'dual-nback'].modalities.includes('sound')}>
              <li><strong>L</strong> - Sound matches</li>
            </Show>
            <Show when={GAME_MODE_CONFIGS[profile()?.currentGameMode || 'dual-nback'].modalities.includes('color')}>
              <li><strong>F</strong> - Color matches</li>
            </Show>
            <Show when={GAME_MODE_CONFIGS[profile()?.currentGameMode || 'dual-nback'].modalities.includes('shape')}>
              <li><strong>J</strong> - Shape matches</li>
            </Show>
            <li><strong>ESC</strong> - Pause/Quit</li>
            <li><strong>Gear Icon</strong> - Settings | Statistics | Profile </li>
          </ul>
          <p class="help-text">
            Press the key when the current stimulus matches the one from N trials ago.
          </p>
        </div>

        <div class="footer">
          <p>Made with <span class="heart">♥</span> by <strong>mentasuave01</strong></p>
          <a href="https://github.com/mentasuave01/brainworkshop" target="_blank" rel="noopener noreferrer" class="github-link">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>

        <Settings
          isOpen={showSettings()}
          onClose={() => setShowSettings(false)}
          initialTab={settingsTab()}
          forceCreateProfile={gameStore.profiles.length === 0}
        />

        <Show when={showLoading() && !assetLoader.isReady()}>
          <LoadingModal progress={assetLoader.progress()} />
        </Show>

        {(() => {
          if (showLoading() && assetLoader.isReady()) {
            setShowLoading(false);
          }
          return null;
        })()}
      </Show>
    </div>
  );
};

export default TitleScreen;
