import { Component, createEffect, onCleanup, createMemo, Show } from 'solid-js';
import Chart from 'chart.js/auto';
import { gameStore } from '../../stores/gameStore';

const ProgressGraph: Component = () => {
    let canvasRef: HTMLCanvasElement | undefined;
    let chartInstance: Chart | null = null;

    const activeProfile = createMemo(() =>
        gameStore.profiles.find(p => p.id === gameStore.activeProfileId)
    );

    const graphData = createMemo(() => {
        const profile = activeProfile();
        if (!profile) return { labels: [], data: [] };

        // Sort dates ascending for the graph
        const dates = Object.keys(profile.dailyStats).sort((a, b) => a.localeCompare(b));

        const data = dates.map(date => ({
            x: date,
            y: profile.dailyStats[date].averageNBack
        }));

        return { labels: dates, data };
    });

    createEffect(() => {
        if (!canvasRef) return;

        const { labels, data } = graphData();

        if (chartInstance) {
            chartInstance.destroy();
        }

        const ctx = canvasRef.getContext('2d');
        if (!ctx) return;

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average N-Back Level',
                    data: data.map(d => d.y),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                    fill: true,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'N-Back Level',
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
                        title: {
                            display: true,
                            text: 'Date',
                            color: '#9ca3af'
                        },
                        grid: {
                            color: '#374151'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e5e7eb'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
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
            <h2 class="text-xl font-bold text-white mb-4">Daily Progress</h2>
            <Show when={graphData().data.length > 0} fallback={
                <div class="h-80 w-full flex flex-col items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <p class="text-lg font-medium">No data yet</p>
                    <p class="text-sm">Complete a session to see your progress graph!</p>
                </div>
            }>
                <div class="relative h-80 w-full">
                    <canvas ref={canvasRef} />
                </div>
            </Show>
        </div>
    );
};

export default ProgressGraph;

