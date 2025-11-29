/**
 * Music System for Brain Workshop
 * Handles background music playback
 */

type MusicCategory = 'advance' | 'good' | 'great';

export const MUSIC_FILES: Record<MusicCategory, string[]> = {
    advance: [
        '/music/advance/Concert.ogg',
        '/music/advance/Hot Swing.ogg',
        '/music/advance/Victory.ogg'
    ],
    good: [
        '/music/good/Corncob.ogg',
        '/music/good/Emptiness.ogg',
        '/music/good/Sea Song.ogg'
    ],
    great: [
        '/music/great/Butterfly Tea - Cavern of Time.ogg',
        '/music/great/Human Beat.ogg',
        '/music/great/Lachaim.ogg'
    ]
};

class MusicSystem {
    private currentAudio: HTMLAudioElement | null = null;
    private enabled: boolean = true;
    private volume: number = 0.5;

    constructor() {
        // Attempt to restore volume from storage if we had it, but for now default is 0.5
    }

    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (!enabled) {
            this.stop();
        }
    }

    public setVolume(volume: number) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.currentAudio) {
            this.currentAudio.volume = this.volume;
        }
    }

    public play(category: MusicCategory) {
        if (!this.enabled) return;

        // Stop current music if playing
        this.stop();

        const files = MUSIC_FILES[category];
        if (!files || files.length === 0) {
            console.warn(`[Music] No files found for category: ${category}`);
            return;
        }

        // Pick random track
        const randomFile = files[Math.floor(Math.random() * files.length)];

        console.log(`[Music] Playing: ${randomFile}`);
        this.currentAudio = new Audio(randomFile);
        this.currentAudio.volume = this.volume;
        this.currentAudio.loop = true; // Loop the track? Or play next? Original likely looped or played random. Let's loop for now as it's background.

        this.currentAudio.play().catch(e => {
            console.warn('[Music] Playback failed (likely autoplay policy):', e);
        });
    }

    public stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
    }
}

export const musicSystem = new MusicSystem();
