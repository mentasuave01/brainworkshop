import { onMount } from 'solid-js';
import { gameStore, gameActions } from '../stores/gameStore';
import { audioSystem } from '../utils/audioSystem';
import { GAME_MODE_CONFIGS } from '../types';
import './ResultScreen.css';

const ResultScreen = () => {
  const session = () => gameStore.currentSession;
  const profile = () => gameActions.getActiveProfile();

  onMount(() => {
    const s = session();
    if (s && s.totalScore >= 80) {
      audioSystem.playApplause();
    }
  });

  const handleContinue = () => {
    gameActions.startNewSession(session()?.gameMode, gameStore.isManualMode);
  };

  const handleBackToMenu = () => {
    gameActions.returnToTitleScreen();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 50) return '#FFC107';
    return '#f44336';
  };

  return (
    <div class="result-screen">
      <h1 class="title">Session Complete!</h1>

      <div class="results-container">
        <div class="result-header">
          <h2>{GAME_MODE_CONFIGS[session()?.gameMode || 'dual-nback'].name}</h2>
          <p>Level: {session()?.nBackLevel}-back</p>
        </div>

        <div class="scores">
          <div class="total-score" style={{ color: getScoreColor(session()?.totalScore || 0) }}>
            <div class="score-value">{session()?.totalScore.toFixed(1)}%</div>
            <div class="score-label">Total Score</div>
          </div>

          {session()?.positionScore !== undefined && (
            <div class="modality-score">
              <div class="score-value">{session()!.positionScore!.toFixed(1)}%</div>
              <div class="score-label">Position</div>
            </div>
          )}

          {session()?.soundScore !== undefined && (
            <div class="modality-score">
              <div class="score-value">{session()!.soundScore!.toFixed(1)}%</div>
              <div class="score-label">Sound</div>
            </div>
          )}

          {session()?.colorScore !== undefined && (
            <div class="modality-score">
              <div class="score-value">{session()!.colorScore!.toFixed(1)}%</div>
              <div class="score-label">Color</div>
            </div>
          )}

          {session()?.arithmeticScore !== undefined && (
            <div class="modality-score">
              <div class="score-value">{session()!.arithmeticScore!.toFixed(1)}%</div>
              <div class="score-label">Arithmetic</div>
            </div>
          )}
        </div>

        {!gameStore.isManualMode && (
          <div class="level-change">
            <p>Next session: {profile()?.currentNBackLevel}-back</p>
            {profile()?.strikeCount && profile()!.strikeCount > 0 && (
              <p class="strikes">Strikes: {profile()?.strikeCount} / {profile()?.config.decreaseStrikes}</p>
            )}
          </div>
        )}

        <div class="session-stats">
          <p>Trials: {session()?.trials.length}</p>
          <p>Duration: {session()?.endTime && session()?.startTime ?
            Math.floor((session()!.endTime - session()!.startTime) / 1000) : 0}s</p>
        </div>
      </div>

      <div class="button-group">
        <button onClick={handleContinue}>Next Session</button>
        <button onClick={handleBackToMenu}>Back to Menu</button>
      </div>
    </div>
  );
};

export default ResultScreen;
