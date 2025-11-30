import { Show, onMount } from 'solid-js';
import { gameStore, gameActions } from './stores/gameStore';
import TitleScreen from './components/TitleScreen';
import GameBoard from './components/GameBoard';
import ResultScreen from './components/ResultScreen';
import './App.css';

const App = () => {
  onMount(() => {
    // Load saved data from localStorage
    gameActions.loadFromLocalStorage();

    // If profiles exist but none is active, set the first one as active
    if (!gameStore.activeProfileId && gameStore.profiles.length > 0) {
      gameActions.setActiveProfile(gameStore.profiles[0].id);
    }
  });

  return (
    <div class="app">
      <Show
        when={gameStore.isPlaying}
        fallback={
          <Show
            when={gameStore.showingResult}
            fallback={<TitleScreen />}
          >
            <ResultScreen />
          </Show>
        }
      >
        <GameBoard />
      </Show>
    </div>
  );
};

export default App;
