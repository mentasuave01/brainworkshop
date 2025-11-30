import { createSignal, For, Show, onMount } from 'solid-js';
import { gameStore, gameActions } from '../stores/gameStore';
import { GAME_MODE_CONFIGS, type GameMode, type GameConfig } from '../types';
import ProfileManager from './ProfileManager';
import './Settings.css';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'game' | 'profiles';
  forceCreateProfile?: boolean;
}

const Settings = (props: SettingsProps) => {
  const [activeTab, setActiveTab] = createSignal<'game' | 'profiles'>('game');
  const profile = () => gameActions.getActiveProfile();

  // Update active tab when prop changes or modal opens
  onMount(() => {
    if (props.initialTab) {
      setActiveTab(props.initialTab);
    }
  });

  // Also watch for prop changes if the modal stays mounted but props update
  // (though usually it's conditionally rendered)

  const handleGameModeChange = (mode: GameMode) => {
    if (profile()) {
      gameActions.setGameMode(mode);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    if (profile()) {
      gameActions.updateProfileConfig(profile()!.id, { [key]: value });
    }
  };

  return (
    <Show when={props.isOpen}>
      <div class="settings-overlay" onClick={() => !props.forceCreateProfile && props.onClose()}>
        <div class="settings-modal" onClick={(e) => e.stopPropagation()}>
          <div class="settings-header">
            <div class="settings-tabs">
              <button
                class={`tab-button ${activeTab() === 'game' ? 'active' : ''}`}
                onClick={() => setActiveTab('game')}
                disabled={props.forceCreateProfile}
              >
                Game Settings
              </button>
              <button
                class={`tab-button ${activeTab() === 'profiles' ? 'active' : ''}`}
                onClick={() => setActiveTab('profiles')}
              >
                Profiles
              </button>
            </div>
            <Show when={!props.forceCreateProfile}>
              <button class="close-button" onClick={props.onClose}>×</button>
            </Show>
          </div>

          <div class="settings-content">
            <Show when={activeTab() === 'game'}>
              {/* Game Mode Selection */}
              <div class="settings-section">
                <h3>Game Mode</h3>
                <select
                  value={profile()?.currentGameMode || 'dual-nback'}
                  onChange={(e) => handleGameModeChange(e.currentTarget.value as GameMode)}
                >
                  <For each={Object.entries(GAME_MODE_CONFIGS)}>
                    {([mode, config]) => (
                      <option value={mode}>{config.name}</option>
                    )}
                  </For>
                </select>
                <p class="description">
                  {GAME_MODE_CONFIGS[profile()?.currentGameMode || 'dual-nback'].description}
                </p>
              </div>

              {/* Session Parameters */}
              <div class="settings-section">
                <h3>Session Parameters</h3>

                <label>
                  <span>Trials per Session:</span>
                  <input
                    type="number"
                    min="10"
                    max="50"
                    value={profile()?.config.trialsPerSession || 20}
                    onChange={(e) => handleConfigChange('trialsPerSession', parseInt(e.currentTarget.value))}
                  />
                </label>

                <label>
                  <span>Time per Trial (seconds):</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={(profile()?.config.timePerTrial || 3000) / 1000}
                    onChange={(e) => handleConfigChange('timePerTrial', parseFloat(e.currentTarget.value) * 1000)}
                  />
                </label>

                <label>
                  <span>Stimulus Duration (ms):</span>
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    step="50"
                    value={profile()?.config.stimulusDuration || 1000}
                    onChange={(e) => handleConfigChange('stimulusDuration', parseInt(e.currentTarget.value))}
                  />
                </label>
              </div>

              {/* Thresholds */}
              <div class="settings-section">
                <h3>Level Adjustment Thresholds</h3>

                <label>
                  <span>Increase Threshold (%):</span>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={profile()?.config.increaseThreshold || 80}
                    onChange={(e) => handleConfigChange('increaseThreshold', parseInt(e.currentTarget.value))}
                  />
                </label>

                <label>
                  <span>Maintain Threshold (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={profile()?.config.maintainThreshold || 50}
                    onChange={(e) => handleConfigChange('maintainThreshold', parseInt(e.currentTarget.value))}
                  />
                </label>

                <label>
                  <span>Strikes before Decrease:</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={profile()?.config.decreaseStrikes || 3}
                    onChange={(e) => handleConfigChange('decreaseStrikes', parseInt(e.currentTarget.value))}
                  />
                </label>
              </div>

              {/* Audio Options */}
              <div class="settings-section">
                <h3>Audio</h3>

                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile()?.config.useMusic ?? true}
                    onChange={(e) => handleConfigChange('useMusic', e.currentTarget.checked)}
                  />
                  <span>Enable Music</span>
                </label>

                <label>
                  <span>Music Volume:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={profile()?.config.musicVolume ?? 0.5}
                    onChange={(e) => handleConfigChange('musicVolume', parseFloat(e.currentTarget.value))}
                  />
                  <span class="range-value">{((profile()?.config.musicVolume ?? 0.5) * 100).toFixed(0)}%</span>
                </label>

                <div class="sound-sets-container">
                  <h4>Sound Sets</h4>
                  <div class="checkbox-group">
                    <For each={['letters', 'numbers', 'nato', 'piano', 'morse']}>
                      {(soundSet) => (
                        <label class="checkbox-label">
                          <input
                            type="checkbox"
                            checked={profile()?.config.soundSets.includes(soundSet as any)}
                            onChange={(e) => {
                              const currentSets = profile()?.config.soundSets || [];
                              let newSets;
                              if (e.currentTarget.checked) {
                                newSets = [...currentSets, soundSet];
                              } else {
                                newSets = currentSets.filter(s => s !== soundSet);
                              }
                              // Ensure at least one sound set is selected
                              if (newSets.length === 0) newSets = ['letters'];
                              handleConfigChange('soundSets', newSets);
                            }}
                          />
                          <span style={{ "text-transform": "capitalize" }}>{soundSet}</span>
                        </label>
                      )}
                    </For>
                  </div>
                </div>
              </div>

              {/* Display Options */}
              <div class="settings-section">
                <h3>Display</h3>

                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile()?.config.blackBackground || false}
                    onChange={(e) => handleConfigChange('blackBackground', e.currentTarget.checked)}
                  />
                  <span>Black Background</span>
                </label>

                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile()?.config.windowFullscreen || false}
                    onChange={(e) => handleConfigChange('windowFullscreen', e.currentTarget.checked)}
                  />
                  <span>Fullscreen Mode (requires restart)</span>
                </label>

                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile()?.config.showManualMode || false}
                    onChange={(e) => handleConfigChange('showManualMode', e.currentTarget.checked)}
                  />
                  <span>Show Manual Mode Button</span>
                </label>

                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile()?.config.disableVisualInputConfirmation || false}
                    onChange={(e) => handleConfigChange('disableVisualInputConfirmation', e.currentTarget.checked)}
                  />
                  <span>Disable Visual Input Confirmation</span>
                </label>
              </div>

              {/* Accessibility Options */}
              <div class="settings-section">
                <h3>Accessibility</h3>

                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile()?.config.auditoryImpairment || false}
                    onChange={(e) => handleConfigChange('auditoryImpairment', e.currentTarget.checked)}
                  />
                  <span>Auditory Impairment (Show visual text for sounds)</span>
                </label>
              </div>

              {/* Arithmetic Settings */}
              <div class="settings-section">
                <h3>Arithmetic Settings</h3>

                <label>
                  <span>Max Number:</span>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={profile()?.config.arithmeticMaxNumber || 12}
                    onChange={(e) => handleConfigChange('arithmeticMaxNumber', parseInt(e.currentTarget.value))}
                  />
                </label>

                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile()?.config.arithmeticUseNegatives || false}
                    onChange={(e) => handleConfigChange('arithmeticUseNegatives', e.currentTarget.checked)}
                  />
                  <span>Use Negative Numbers</span>
                </label>

                <div class="operations-container">
                  <h4>Operations</h4>
                  <div class="checkbox-group">
                    <For each={['addition', 'subtraction', 'multiplication', 'division']}>
                      {(op) => (
                        <label class="checkbox-label">
                          <input
                            type="checkbox"
                            checked={profile()?.config.arithmeticOperations[op as keyof GameConfig['arithmeticOperations']]}
                            onChange={(e) => {
                              const currentOps = profile()?.config.arithmeticOperations;
                              if (currentOps) {
                                handleConfigChange('arithmeticOperations', {
                                  ...currentOps,
                                  [op]: e.currentTarget.checked
                                });
                              }
                            }}
                          />
                          <span style={{ "text-transform": "capitalize" }}>{op}</span>
                        </label>
                      )}
                    </For>
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div class="settings-section">
                <h3>Advanced</h3>

                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile()?.config.jaeggiMode || false}
                    onChange={(e) => handleConfigChange('jaeggiMode', e.currentTarget.checked)}
                  />
                  <span>Jaeggi Mode (research protocol)</span>
                </label>

                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile()?.config.variableNBack || false}
                    onChange={(e) => handleConfigChange('variableNBack', e.currentTarget.checked)}
                  />
                  <span>Variable N-Back</span>
                </label>

                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile()?.config.crabBack || false}
                    onChange={(e) => handleConfigChange('crabBack', e.currentTarget.checked)}
                  />
                  <span>Crab Back (N-Back with interference)</span>
                </label>

                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile()?.config.multiStimMode || false}
                    onChange={(e) => handleConfigChange('multiStimMode', e.currentTarget.checked)}
                  />
                  <span>Multi-Stim Mode</span>
                </label>

                <label>
                  <span>Interference Level:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={profile()?.config.interferenceLevel || 0}
                    onChange={(e) => handleConfigChange('interferenceLevel', parseFloat(e.currentTarget.value))}
                  />
                  <span class="range-value">{((profile()?.config.interferenceLevel || 0) * 100).toFixed(0)}%</span>
                </label>
              </div>
            </Show>

            <Show when={activeTab() === 'profiles'}>
              <ProfileManager
                onClose={props.onClose}
                forceCreate={props.forceCreateProfile}
              />
            </Show>
          </div>

          <div class="settings-footer">
            <Show when={!props.forceCreateProfile}>
              <button onClick={props.onClose}>Done</button>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default Settings;
