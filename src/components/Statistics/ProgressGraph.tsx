import { Component, createEffect, onCleanup, createMemo, Show } from 'solid-js';
import { LineChart, Svg } from 'chartist';
import { gameStore } from '../../stores/gameStore';

const ProgressGraph: Component = () => {
    let chartContainer: HTMLDivElement | undefined;
    let chartInstance: LineChart | null = null;

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
        if (!chartContainer) return;

        const { labels, data } = graphData();

        if (chartInstance) {
            chartInstance.detach();
        }

        // Chartist requires a container element, not a canvas
        // We'll need to change the ref to a div in the JSX
        // But for now let's assume we change the JSX too.
        // Wait, I need to change the JSX to use a div instead of canvas.
        // Let's do that in a separate step or handle it here if I can replace the whole return.
        // The tool allows replacing a chunk.
        // I will replace the effect first, then the JSX.

        // Actually, Chartist needs a selector or a DOM element.
        // I can pass the element directly.

        const chart = new LineChart(chartContainer, {
            labels: labels,
            series: [data.map(d => d.y)]
        }, {
            low: 0,
            showArea: true,
            showPoint: true,
            fullWidth: true,
            axisY: {
                onlyInteger: true,
                offset: 20
            },
            chartPadding: {
                right: 40
            }
        });

        // Animation
        chart.on('draw', function (data: any) {
            if (data.type === 'line' || data.type === 'area') {
                data.element.animate({
                    d: {
                        begin: 2000 * data.index,
                        dur: 2000,
                        from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
                        to: data.path.clone().stringify(),
                        easing: Svg.Easing.easeOutQuint
                    }
                });
            }
        });

        chartInstance = chart;
    });

    onCleanup(() => {
        if (chartInstance) {
            chartInstance.detach();
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
                    <div ref={chartContainer} class="ct-chart ct-perfect-fourth" />
                </div>
            </Show>
        </div>
    );
};

export default ProgressGraph;

