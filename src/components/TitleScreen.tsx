import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import { gameActions } from '../stores/gameStore';
import { GAME_MODE_CONFIGS } from '../types';
import { assetLoader } from '../utils/assetLoader';
import Settings from './Settings';
import LoadingModal from './LoadingModal';
import './TitleScreen.css';

const TitleScreen = () => {
  const [showSettings, setShowSettings] = createSignal(false);
  const [showLoading, setShowLoading] = createSignal(false);

  onMount(() => {
    // Start loading assets in background immediately
    assetLoader.startLoading();
    window.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !showSettings()) {
      handleStart();
    } else if (e.key === 'Escape') {
      setShowSettings(!showSettings());
    }
  };

  const handleStart = () => {
    if (!assetLoader.isReady()) {
      setShowLoading(true);
      return;
    }

    const profile = gameActions.getActiveProfile();
    if (profile) {
      gameActions.startNewSession(profile.currentGameMode, false);
    }
  };

  const handleManualMode = () => {
    if (!assetLoader.isReady()) {
      setShowLoading(true);
      return;
    }

    const profile = gameActions.getActiveProfile();
    if (profile) {
      gameActions.startNewSession(profile.currentGameMode, true);
    }
  };

  const profile = () => gameActions.getActiveProfile();

  return (
    <div class="title-screen">
      {/* Settings Gear Icon */}
      <button class="settings-icon" onClick={() => setShowSettings(true)} title="Settings">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
        </svg>
      </button>

      <h1 class="title">Brain Workshop</h1>
      <h2 class="subtitle">N-Back Training</h2>

      <div class="profile-info">
        <p><strong>Profile:</strong> {profile()?.name}</p>
        <p><strong>Current Level:</strong> {profile()?.currentNBackLevel}-back</p>
        <p><strong>Game Mode:</strong> {GAME_MODE_CONFIGS[profile()?.currentGameMode || 'dual-nback'].name}</p>
      </div>

      <div class="button-group">
        <button class="primary-button" onClick={handleStart}>Start Session</button>
        <Show when={profile()?.config.showManualMode}>
          <button class="secondary-button" onClick={handleManualMode}>Manual Mode</button>
        </Show>
      </div>

      <div class="instructions">
        <h3>Quick Guide</h3>
        <ul>
          <li><strong>A</strong> - Position matches</li>
          <li><strong>L</strong> - Sound matches</li>
          <li><strong>F</strong> - Color matches (Triple N-Back)</li>
          <li><strong>ESC</strong> - Pause/Quit</li>
        </ul>
        <p class="help-text">
          Press the key when the current stimulus matches the one from N trials ago.
        </p>
      </div>

      <Settings isOpen={showSettings()} onClose={() => setShowSettings(false)} />

      <Show when={showLoading() && !assetLoader.isReady()}>
        <LoadingModal progress={assetLoader.progress()} />
      </Show>

      {/* Auto-close loading modal when ready and start game if it was triggered by start button? 
          Actually, if user clicked start, they want to start. 
          Let's just hide modal when ready. 
          The user will have to click start again? Or we can auto-start.
          Let's auto-start if the modal is open.
      */}
      {(() => {
        if (showLoading() && assetLoader.isReady()) {
          // Reset loading state
          setShowLoading(false);
          // We don't know which button was clicked (Start or Manual), 
          // but typically users click Start. 
          // For now, let's just close the modal and let them click again to avoid complexity 
          // of tracking pending action. Or we can just leave it as "Loading finished" 
          // and they see the button again.
          // BUT, better UX: if they clicked start, it should start.
          // Let's keep it simple: just close modal.
        }
        return null;
      })()}
    </div>
  );
};

export default TitleScreen;
