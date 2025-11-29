import { onCleanup, onMount } from 'solid-js';
import './PauseModal.css';

interface PauseModalProps {
    onResume: () => void;
    onQuit: () => void;
}

const PauseModal = (props: PauseModalProps) => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            // If already paused and modal is open, pressing ESC again could either resume or do nothing.
            // Let's make it resume for convenience, acting as a toggle.
            props.onResume();
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
                    <button class="resume-btn" onClick={props.onResume}>
                        Resume Game
                    </button>
                    <button class="quit-btn" onClick={props.onQuit}>
                        Quit Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PauseModal;
