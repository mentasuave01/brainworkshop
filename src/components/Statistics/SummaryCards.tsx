import { Component, createMemo } from 'solid-js';
import { gameStore } from '../../stores/gameStore';

const SummaryCards: Component = () => {
    const stats = createMemo(() => {
        const profile = gameStore.profiles.find(p => p.id === gameStore.activeProfileId);
        if (!profile) return null;

        let totalSessions = 0;
        let totalScoreSum = 0;
        let maxNBack = 0;
        let currentStreak = 0; // This would need more complex logic, skipping for now or simple implementation

        const dates = Object.keys(profile.dailyStats).sort((a, b) => b.localeCompare(a)); // Newest first

        dates.forEach(date => {
            const dayStats = profile.dailyStats[date];
            totalSessions += dayStats.totalSessions;

            dayStats.sessions.forEach(session => {
                totalScoreSum += session.totalScore;
                if (session.nBackLevel > maxNBack) {
                    maxNBack = session.nBackLevel;
                }
            });
        });

        const averageScore = totalSessions > 0 ? Math.round(totalScoreSum / totalSessions) : 0;

        return {
            totalSessions,
            averageScore,
            maxNBack,
            currentLevel: profile.currentNBackLevel
        };
    });

    return (
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
                <div class="text-gray-400 text-sm uppercase tracking-wider">Current Level</div>
                <div class="text-3xl font-bold text-white">{stats()?.currentLevel || 1}<span class="text-lg text-gray-500 ml-1">-back</span></div>
            </div>

            <div class="bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 border-green-500">
                <div class="text-gray-400 text-sm uppercase tracking-wider">Best N-Back</div>
                <div class="text-3xl font-bold text-white">{stats()?.maxNBack || 0}</div>
            </div>

            <div class="bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
                <div class="text-gray-400 text-sm uppercase tracking-wider">Total Sessions</div>
                <div class="text-3xl font-bold text-white">{stats()?.totalSessions || 0}</div>
            </div>

            <div class="bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 border-yellow-500">
                <div class="text-gray-400 text-sm uppercase tracking-wider">Avg Score</div>
                <div class="text-3xl font-bold text-white">{stats()?.averageScore || 0}<span class="text-lg text-gray-500 ml-1">%</span></div>
            </div>
        </div>
    );
};

export default SummaryCards;
