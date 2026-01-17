import { onCleanup, onMount, createSignal, Show } from 'solid-js';
import Settings from './Settings';
import './PauseModal.css';

interface PauseModalProps {
    onResume: () => void;
    onQuit: () => void;
}

const PauseModal = (props: PauseModalProps) => {
    const [selectedOption, setSelectedOption] = createSignal(0); // 0: Resume, 1: Settings, 2: Quit
    const [showSettings, setShowSettings] = createSignal(false);

    const handleKeyDown = (e: KeyboardEvent) => {
        // Don't handle keyboard navigation when settings is open
        if (showSettings()) return;

        if (e.key === 'Escape') {
            props.onResume();
        } else if (e.key === 'ArrowUp') {
            setSelectedOption(prev => (prev === 0 ? 2 : prev - 1));
        } else if (e.key === 'ArrowDown') {
            setSelectedOption(prev => (prev === 2 ? 0 : prev + 1));
        } else if (e.key === 'Enter') {
            if (selectedOption() === 0) {
                props.onResume();
            } else if (selectedOption() === 1) {
                setShowSettings(true);
            } else {
                props.onQuit();
            }
        }
    };

    onMount(() => {
        window.addEventListener('keydown', handleKeyDown);
    });

    onCleanup(() => {
        window.removeEventListener('keydown', handleKeyDown);
    });

    return (
        <div class="pause-modal-overlay">
            <div class="pause-modal">
                <h2>Game Paused</h2>
                <div class="pause-modal-buttons">
                    <button
                        class="resume-btn"
                        classList={{ selected: selectedOption() === 0 }}
                        onClick={props.onResume}
                        onMouseEnter={() => setSelectedOption(0)}
                    >
                        Resume Game
                    </button>
                    <button
                        class="settings-btn"
                        classList={{ selected: selectedOption() === 1 }}
                        onClick={() => setShowSettings(true)}
                        onMouseEnter={() => setSelectedOption(1)}
                    >
                        Settings
                    </button>
                    <button
                        class="quit-btn"
                        classList={{ selected: selectedOption() === 2 }}
                        onClick={props.onQuit}
                        onMouseEnter={() => setSelectedOption(2)}
                    >
                        Quit Session
                    </button>
                </div>
            </div>
            <Show when={showSettings()}>
                <Settings
                    isOpen={showSettings()}
                    onClose={() => setShowSettings(false)}
                    initialTab="game"
                />
            </Show>
        </div>
    );
};

export default PauseModal;
