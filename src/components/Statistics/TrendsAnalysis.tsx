import { Component, createEffect, onCleanup, createMemo } from 'solid-js';
import { BarChart } from 'chartist';
import { gameStore } from '../../stores/gameStore';
import { Session } from '../../types';

const TrendsAnalysis: Component = () => {
    let chartContainer: HTMLDivElement | undefined;
    let chartInstance: BarChart | null = null;

    const activeProfile = createMemo(() =>
        gameStore.profiles.find(p => p.id === gameStore.activeProfileId)
    );

    const trendsData = createMemo(() => {
        const profile = activeProfile();
        if (!profile) return { labels: [], series: [] };

        // Aggregate scores by modality
        const modalityStats = {
            position: { total: 0, count: 0 },
            sound: { total: 0, count: 0 },
            color: { total: 0, count: 0 },
            visual: { total: 0, count: 0 },
            arithmetic: { total: 0, count: 0 },
        };

        // Iterate through all sessions in dailyStats
        Object.values(profile.dailyStats).forEach(daily => {
            daily.sessions.forEach((session: Session) => {
                if (session.positionScore !== undefined) {
                    modalityStats.position.total += session.positionScore;
                    modalityStats.position.count++;
                }
                if (session.soundScore !== undefined) {
                    modalityStats.sound.total += session.soundScore;
                    modalityStats.sound.count++;
                }
                if (session.colorScore !== undefined) {
                    modalityStats.color.total += session.colorScore;
                    modalityStats.color.count++;
                }
                if (session.visualScore !== undefined) {
                    modalityStats.visual.total += session.visualScore;
                    modalityStats.visual.count++;
                }
                if (session.arithmeticScore !== undefined) {
                    modalityStats.arithmetic.total += session.arithmeticScore;
                    modalityStats.arithmetic.count++;
                }
            });
        });

        const labels = ['Position', 'Sound', 'Color', 'Visual', 'Arithmetic'];
        const data = [
            modalityStats.position.count > 0 ? modalityStats.position.total / modalityStats.position.count : 0,
            modalityStats.sound.count > 0 ? modalityStats.sound.total / modalityStats.sound.count : 0,
            modalityStats.color.count > 0 ? modalityStats.color.total / modalityStats.color.count : 0,
            modalityStats.visual.count > 0 ? modalityStats.visual.total / modalityStats.visual.count : 0,
            modalityStats.arithmetic.count > 0 ? modalityStats.arithmetic.total / modalityStats.arithmetic.count : 0,
        ];

        return { labels, series: [data] };
    });

    createEffect(() => {
        if (!chartContainer) return;

        const { labels, series } = trendsData();

        if (chartInstance) {
            chartInstance.detach();
        }

        chartInstance = new BarChart(chartContainer, {
            labels: labels,
            series: series
        }, {
            high: 100,
            low: 0,
            axisY: {
                onlyInteger: true,
                offset: 20
            },
            chartPadding: {
                right: 40
            }
        });
    });

    onCleanup(() => {
        if (chartInstance) {
            chartInstance.detach();
        }
    });

    return (
        <div class="w-full h-96 bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 class="text-xl font-bold text-white mb-4">Performance by Modality</h2>
            <div class="relative h-80 w-full">
                <div ref={chartContainer} class="ct-chart ct-perfect-fourth" />
            </div>
        </div>
    );
};

export default TrendsAnalysis;
