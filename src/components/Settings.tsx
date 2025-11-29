import { createSignal, For, Show } from 'solid-js';
import { gameStore, gameActions } from '../stores/gameStore';
import { GAME_MODE_CONFIGS, type GameMode } from '../types';
import './Settings.css';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings = (props: SettingsProps) => {
  const profile = () => gameActions.getActiveProfile();

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
      <div class="settings-overlay" onClick={props.onClose}>
        <div class="settings-modal" onClick={(e) => e.stopPropagation()}>
          <div class="settings-header">
            <h2>Settings</h2>
            <button class="close-button" onClick={props.onClose}>×</button>
          </div>

          <div class="settings-content">
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

            {/* Profile Info */}
            <div class="settings-section">
              <h3>Profile</h3>
              <div class="profile-info">
                <p><strong>Name:</strong> {profile()?.name}</p>
                <p><strong>Current Level:</strong> {profile()?.currentNBackLevel}-back</p>
                <p><strong>Sessions Today:</strong> {Object.keys(profile()?.dailyStats || {}).length > 0 ?
                  profile()!.dailyStats[new Date().toISOString().split('T')[0]]?.totalSessions || 0 : 0}</p>
              </div>
            </div>
          </div>

          <div class="settings-footer">
            <button onClick={props.onClose}>Done</button>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default Settings;
