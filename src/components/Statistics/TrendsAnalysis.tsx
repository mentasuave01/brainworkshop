import { Component, createEffect, onCleanup, createMemo } from 'solid-js';
import Chart from 'chart.js/auto';
import { gameStore } from '../../stores/gameStore';
import { Session } from '../../types';

const TrendsAnalysis: Component = () => {
    let canvasRef: HTMLCanvasElement | undefined;
    let chartInstance: Chart | null = null;

    const activeProfile = createMemo(() =>
        gameStore.profiles.find(p => p.id === gameStore.activeProfileId)
    );

    const trendsData = createMemo(() => {
        const profile = activeProfile();
        if (!profile) return { labels: [], data: [] };

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

        return { labels, data };
    });

    createEffect(() => {
        if (!canvasRef) return;

        const { labels, data } = trendsData();

        if (chartInstance) {
            chartInstance.destroy();
        }

        const ctx = canvasRef.getContext('2d');
        if (!ctx) return;

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Score (%)',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Score (%)',
                            color: '#9ca3af'
                        },
                        grid: {
                            color: '#374151'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    });

    onCleanup(() => {
        if (chartInstance) {
            chartInstance.destroy();
        }
    });

    return (
        <div class="w-full h-96 bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 class="text-xl font-bold text-white mb-4">Performance by Modality</h2>
            <div class="relative h-80 w-full">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};

export default TrendsAnalysis;
