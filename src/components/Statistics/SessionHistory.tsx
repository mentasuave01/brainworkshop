import { Component, For, Show, createMemo } from 'solid-js';
import { gameStore } from '../../stores/gameStore';
import { Session } from '../../types';

const SessionHistory: Component = () => {
    const activeProfile = createMemo(() =>
        gameStore.profiles.find(p => p.id === gameStore.activeProfileId)
    );

    const sessionsByDate = createMemo(() => {
        const profile = activeProfile();
        if (!profile) return [];

        // Sort dates descending
        const dates = Object.keys(profile.dailyStats).sort((a, b) => b.localeCompare(a));

        return dates.map(date => ({
            date,
            sessions: profile.dailyStats[date].sessions.slice().reverse() // Show newest first
        }));
    });

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div class="w-full max-w-4xl mx-auto p-4 bg-gray-800 rounded-lg shadow-lg h-full overflow-y-auto">
            <h2 class="text-2xl font-bold text-white mb-6">Session History</h2>

            <Show when={activeProfile()} fallback={<div class="text-gray-400">No profile selected</div>}>
                <Show when={sessionsByDate().length > 0} fallback={
                    <div class="text-center py-12 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="text-lg font-medium">No sessions recorded yet</p>
                        <p class="text-sm">Start a game to build your history!</p>
                    </div>
                }>
                    <div class="space-y-8">
                        <For each={sessionsByDate()}>
                            {(dayGroup) => (
                                <div class="bg-gray-700/50 rounded-lg p-4">
                                    <h3 class="text-xl font-semibold text-blue-300 mb-4 border-b border-gray-600 pb-2">
                                        {new Date(dayGroup.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </h3>

                                    <div class="space-y-2">
                                        <For each={dayGroup.sessions}>
                                            {(session: Session) => (
                                                <div class="bg-gray-800 p-3 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-gray-750 transition-colors">
                                                    <div class="flex items-center gap-4">
                                                        <span class="text-gray-400 font-mono text-sm">{formatTime(session.startTime)}</span>
                                                        <div>
                                                            <div class="font-bold text-white">
                                                                {session.gameMode.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                            </div>
                                                            <div class="text-xs text-gray-400">
                                                                {session.nBackLevel}-Back • {session.isManualMode ? 'Manual' : 'Adaptive'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div class="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                                        <div class="text-right">
                                                            <div class={`font-bold text-lg ${getScoreColor(session.totalScore)}`}>
                                                                {session.totalScore}%
                                                            </div>
                                                            <div class="text-xs text-gray-500">Total Score</div>
                                                        </div>

                                                        {/* Detailed scores tooltip or expansion could go here */}
                                                        <div class="text-xs text-gray-400 grid grid-cols-2 gap-x-4 gap-y-1">
                                                            <Show when={session.positionScore !== undefined}>
                                                                <span>Pos: {session.positionScore}%</span>
                                                            </Show>
                                                            <Show when={session.soundScore !== undefined}>
                                                                <span>Aud: {session.soundScore}%</span>
                                                            </Show>
                                                            <Show when={session.colorScore !== undefined}>
                                                                <span>Col: {session.colorScore}%</span>
                                                            </Show>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </For>
                                    </div>
                                </div>
                            )}
                        </For>
                    </div>
                </Show>
            </Show>
        </div>
    );
};

export default SessionHistory;
