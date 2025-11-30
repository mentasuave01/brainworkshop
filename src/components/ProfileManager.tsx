import { createSignal, For, Show } from 'solid-js';
import { gameStore, gameActions } from '../stores/gameStore';
import './ProfileManager.css';

interface ProfileManagerProps {
    onClose: () => void;
    forceCreate?: boolean; // If true, user cannot close without creating/selecting a profile
}

const ProfileManager = (props: ProfileManagerProps) => {
    const [newProfileName, setNewProfileName] = createSignal('');

    const handleCreateProfile = (e: Event) => {
        e.preventDefault();
        if (newProfileName().trim()) {
            const id = gameActions.createProfile(newProfileName().trim());
            gameActions.setActiveProfile(id);
            setNewProfileName('');
            if (!props.forceCreate) {
                // Optional: auto-close on create? Maybe not, let them see it created.
            } else {
                props.onClose();
            }
        }
    };

    const handleSwitchProfile = (profileId: string) => {
        gameActions.setActiveProfile(profileId);
        if (props.forceCreate) {
            props.onClose();
        }
    };

    const handleDeleteProfile = (e: Event, profileId: string, name: string) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete profile "${name}"? This cannot be undone.`)) {
            gameActions.deleteProfile(profileId);
        }
    };

    return (
        <div class="profile-manager-container">
            <Show when={props.forceCreate}>
                <div class="force-create-message">
                    <p>Please create a profile to start tracking your progress.</p>
                </div>
            </Show>

            <div class="profile-list">
                <For each={gameStore.profiles} fallback={<div class="empty-state">No profiles found</div>}>
                    {(profile) => (
                        <div
                            class={`profile-item ${gameStore.activeProfileId === profile.id ? 'active' : ''}`}
                            onClick={() => handleSwitchProfile(profile.id)}
                        >
                            <div class="profile-info-left">
                                <span class="profile-name">{profile.name}</span>
                                <span class="profile-details">
                                    Level {profile.currentNBackLevel} • {Object.keys(profile.dailyStats).length} sessions
                                </span>
                            </div>

                            <div class="profile-actions">
                                <Show when={gameStore.profiles.length > 1 || !props.forceCreate}>
                                    <button
                                        class="delete-button"
                                        onClick={(e) => handleDeleteProfile(e, profile.id, profile.name)}
                                        title="Delete Profile"
                                    >
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                        </svg>
                                    </button>
                                </Show>
                            </div>
                        </div>
                    )}
                </For>
            </div>

            <div class="create-profile-section">
                <h3>Create New Profile</h3>
                <form class="create-profile-form" onSubmit={handleCreateProfile}>
                    <input
                        type="text"
                        placeholder="Enter profile name..."
                        value={newProfileName()}
                        onInput={(e) => setNewProfileName(e.currentTarget.value)}
                        maxLength={20}
                    />
                    <button
                        type="submit"
                        class="create-button"
                        disabled={!newProfileName().trim()}
                    >
                        Create
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileManager;
