import { createEffect, onMount, onCleanup, For, Show, createSignal } from 'solid-js';
import { gameStore, gameActions } from '../stores/gameStore';
import { audioSystem } from '../utils/audioSystem';
import { musicSystem } from '../utils/musicSystem';
import { GAME_MODE_CONFIGS } from '../types';
import PauseModal from './PauseModal';
import './GameBoard.css';

const GameBoard = () => {
  let trialTimer: number | undefined;

  const currentTrial = () => gameActions.getCurrentTrial();
  const profile = () => gameActions.getActiveProfile();

  // Input handler
  const handleInput = (type: 'position' | 'sound' | 'color' | 'visual' | 'pause') => {
    // Resume audio context on first interaction
    audioSystem.resume();

    if (gameStore.isPaused) {
      if (type === 'pause') {
        // If we wanted to toggle pause here, we could.
        // But currently pause is handled by ESC or the modal.
      }
      return;
    }

    switch (type) {
      case 'position':
        gameActions.recordResponse('position', true);
        break;
      case 'sound':
        gameActions.recordResponse('sound', true);
        break;
      case 'color':
        gameActions.recordResponse('color', true);
        break;
      case 'visual':
        gameActions.recordResponse('visual', true);
        break;
      case 'pause':
        gameActions.pauseSession();
        break;
    }
  };

  // Keyboard handler
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key.toUpperCase()) {
      case 'A':
        handleInput('position');
        break;
      case 'L':
        handleInput('sound');
        break;
      case 'F':
        handleInput('color');
        break;
      case 'S':
        handleInput('visual');
        break;
      case 'ESCAPE':
        handleInput('pause');
        break;
    }
  };

  const [isStimulusVisible, setIsStimulusVisible] = createSignal(true);
  let stimulusTimer: number | undefined;

  // Start trial
  createEffect(() => {
    const trial = currentTrial();
    if (!trial || gameStore.isPaused) return;

    // Clear previous timer if any
    if (stimulusTimer) clearTimeout(stimulusTimer);

    // Show stimulus
    setIsStimulusVisible(true);

    // Play sound
    audioSystem.speak(trial.sound);

    // Hide stimulus after duration
    const duration = profile()?.config.stimulusDuration || 1000;
    stimulusTimer = window.setTimeout(() => {
      setIsStimulusVisible(false);
    }, duration);

    // Auto-advance after time limit
    if (trialTimer) clearTimeout(trialTimer);
    trialTimer = window.setTimeout(() => {
      gameActions.nextTrial();
    }, profile()?.config.timePerTrial || 3000);
  });

  // Update music settings when profile changes
  createEffect(() => {
    const p = profile();
    if (p) {
      musicSystem.setEnabled(p.config.useMusic);
      musicSystem.setVolume(p.config.musicVolume);
    }
  });

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    // Also resume on click
    window.addEventListener('click', () => audioSystem.resume());

    // Start music
    // Music is now handled in ResultScreen.tsx as per user request
    // const p = profile();
    // if (p && p.config.useMusic) {
    //   const categories = ['advance', 'good', 'great'] as const;
    //   const category = categories[Math.floor(Math.random() * categories.length)];
    //   musicSystem.play(category);
    // }
  });

  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('click', () => audioSystem.resume());
    if (trialTimer) clearTimeout(trialTimer);
    if (stimulusTimer) clearTimeout(stimulusTimer);
    musicSystem.stop();
  });

  return (
    <div class="game-board">
      <Show when={gameStore.isPaused}>
        <PauseModal
          onResume={() => gameActions.resumeSession()}
          onQuit={() => {
            gameActions.returnToTitleScreen();
          }}
        />
      </Show>

      <div class="game-grid">
        <For each={Array(9).fill(0)}>
          {(_, index) => {
            // Map grid index (0-8) to game position (0-7)
            // Grid indices:
            // 0 1 2
            // 3 4 5
            // 6 7 8
            // Center is 4.
            // If index < 4, gamePos = index
            // If index > 4, gamePos = index - 1
            // If index === 4, it's the center (no game pos)

            const isCenter = index() === 4;
            const gamePos = index() < 4 ? index() : index() - 1;

            return (
              <div
                class="grid-square"
                classList={{
                  active: !isCenter && currentTrial()?.position === gamePos && isStimulusVisible(),
                  center: isCenter
                }}
                style={{
                  visibility: isCenter && !profile()?.config.auditoryImpairment ? 'hidden' : 'visible'
                }}
              >
                {!isCenter && currentTrial()?.position === gamePos && currentTrial()?.color && isStimulusVisible() && (
                  <div
                    class="colored-square"
                    style={{ 'background-color': currentTrial()?.color }}
                  />
                )}
              </div>
            );
          }}
        </For>

        <div class="center-display">
          {/* Show current sound as text only if auditory impairment is enabled */}
          {currentTrial()?.sound && !currentTrial()?.visualCue && profile()?.config.auditoryImpairment && (
            <div class="sound-indicator">{currentTrial()?.sound}</div>
          )}

          {currentTrial()?.visualCue && (
            <div class="visual-cue">{currentTrial()?.visualCue}</div>
          )}
          {currentTrial()?.arithmeticNumber !== undefined && (
            <div class="arithmetic-display">
              <div class="number">{currentTrial()?.arithmeticNumber}</div>
              <div class="operation">{currentTrial()?.arithmeticOperation}</div>
            </div>
          )}
        </div>
      </div>


      <div class="controls-hint">
        <span
          classList={{ active: !profile()?.config.disableVisualInputConfirmation && !!currentTrial()?.positionMatch }}
          onClick={() => handleInput('position')}
        >
          A: Position
        </span>
        <span
          classList={{ active: !profile()?.config.disableVisualInputConfirmation && !!currentTrial()?.soundMatch }}
          onClick={() => handleInput('sound')}
        >
          L: Sound
        </span>
        {GAME_MODE_CONFIGS[gameStore.currentSession?.gameMode || 'dual-nback'].modalities.includes('color') && (
          <span
            classList={{ active: !profile()?.config.disableVisualInputConfirmation && !!currentTrial()?.colorMatch }}
            onClick={() => handleInput('color')}
          >
            F: Color
          </span>
        )}
        <span onClick={() => handleInput('pause')}>ESC: Pause</span>
      </div>
    </div >
  );
};

export default GameBoard;
