import { onCleanup, onMount, createSignal } from 'solid-js';
import './PauseModal.css';

interface PauseModalProps {
    onResume: () => void;
    onQuit: () => void;
}

const PauseModal = (props: PauseModalProps) => {
    const [selectedOption, setSelectedOption] = createSignal(0); // 0: Resume, 1: Quit

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            props.onResume();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            setSelectedOption(prev => (prev === 0 ? 1 : 0));
        } else if (e.key === 'Enter') {
            if (selectedOption() === 0) {
                props.onResume();
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
                        class="quit-btn"
                        classList={{ selected: selectedOption() === 1 }}
                        onClick={props.onQuit}
                        onMouseEnter={() => setSelectedOption(1)}
                    >
                        Quit Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PauseModal;
