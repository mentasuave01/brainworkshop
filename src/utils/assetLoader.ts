import { createSignal, createRoot } from 'solid-js';
import { audioSystem, FALLBACK_SOUNDS } from './audioSystem';
import { MUSIC_FILES } from './musicSystem';

class AssetLoaderService {
    private _isReady = createSignal(false);
    private _progress = createSignal(0);
    private _totalAssets = 0;
    private _loadedAssets = 0;
    private _loadingStarted = false;

    get isReady() {
        return this._isReady[0];
    }

    get progress() {
        return this._progress[0];
    }

    constructor() {
        // We can start loading immediately or wait for explicit call.
        // Let's wait for explicit call to control when it happens (e.g. app mount).
    }

    startLoading() {
        if (this._loadingStarted) return;
        this._loadingStarted = true;

        const assetsToLoad: string[] = [];

        // Always load music
        Object.values(MUSIC_FILES).forEach(files => {
            assetsToLoad.push(...files);
        });

        // Check if we need fallback sounds
        // Note: voices might load asynchronously, so this check might be early.
        // However, if we download them anyway, it's safer.
        // The user requirement says: "audioSystem did not detect any voices pre download the sounds"
        // We can check audioSystem.hasVoices().
        // If voices appear later, we just downloaded sounds for nothing, which is fine (cache).

        if (!audioSystem.hasVoices()) {
            console.log('[AssetLoader] No voices detected, adding fallback sounds to download queue.');
            assetsToLoad.push(...FALLBACK_SOUNDS);
        } else {
            console.log('[AssetLoader] Voices detected, skipping fallback sounds download.');
        }

        this._totalAssets = assetsToLoad.length;

        if (this._totalAssets === 0) {
            this._isReady[1](true);
            this._progress[1](100);
            return;
        }

        console.log(`[AssetLoader] Starting download of ${this._totalAssets} assets...`);

        let loadedCount = 0;
        const updateProgress = () => {
            loadedCount++;
            const percent = Math.floor((loadedCount / this._totalAssets) * 100);
            this._progress[1](percent);

            if (loadedCount >= this._totalAssets) {
                console.log('[AssetLoader] All assets loaded.');
                this._isReady[1](true);
            }
        };

        assetsToLoad.forEach(url => {
            fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error(`Failed to load ${url}`);
                    return response.blob(); // We just need to cache it in browser
                })
                .then(() => {
                    updateProgress();
                })
                .catch(err => {
                    console.warn(`[AssetLoader] Failed to load asset: ${url}`, err);
                    // Still count as processed so we don't hang
                    updateProgress();
                });
        });
    }
}

// Create a singleton instance inside a root to hold signals
export const assetLoader = createRoot(() => new AssetLoaderService());
