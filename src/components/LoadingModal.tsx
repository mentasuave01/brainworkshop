import { Component } from 'solid-js';
import './LoadingModal.css';

interface LoadingModalProps {
    progress: number;
}

const LoadingModal: Component<LoadingModalProps> = (props) => {
    return (
        <div class="loading-modal-overlay">
            <div class="loading-modal">
                <h2>Loading Assets</h2>
                <div class="progress-bar-container">
                    <div
                        class="progress-bar-fill"
                        style={{ width: `${props.progress}%` }}
                    />
                </div>
                <p>{props.progress}%</p>
                <p class="loading-hint">Please wait while we download game audio...</p>
            </div>
        </div>
    );
};

export default LoadingModal;
