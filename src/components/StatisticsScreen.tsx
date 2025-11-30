import { Component, createSignal, Show } from 'solid-js';
import SessionHistory from './Statistics/SessionHistory';
import ProgressGraph from './Statistics/ProgressGraph';
import TrendsAnalysis from './Statistics/TrendsAnalysis';
import DataExport from './Statistics/DataExport';
import SummaryCards from './Statistics/SummaryCards';

interface StatisticsScreenProps {
    onBack: () => void;
}

const StatisticsScreen: Component<StatisticsScreenProps> = (props) => {
    const [activeTab, setActiveTab] = createSignal<'dashboard' | 'history' | 'trends' | 'export'>('dashboard');

    return (
        <div class="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Header - Fixed Top */}
            <div class="bg-gray-800 shadow-md p-4 sticky top-0 z-10">
                <div class="max-w-6xl mx-auto w-full flex items-center justify-between">
                    <button
                        onClick={props.onBack}
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                        </svg>
                        Back to Menu
                    </button>
                    <h1 class="text-2xl font-bold text-white hidden sm:block">Statistics & Progress</h1>
                    <div class="w-32"></div> {/* Spacer for centering */}
                </div>
            </div>

            {/* Main Content Area */}
            <div class="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 flex flex-col">

                {/* Summary Cards - Always visible on Dashboard */}
                <Show when={activeTab() === 'dashboard'}>
                    <SummaryCards />
                </Show>

                {/* Tabs */}
                <div class="flex justify-center mb-6 overflow-x-auto">
                    <div class="bg-gray-800 p-1 rounded-lg inline-flex whitespace-nowrap">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            class={`px-4 md:px-6 py-2 rounded-md transition-colors text-sm md:text-base font-medium ${activeTab() === 'dashboard'
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            class={`px-4 md:px-6 py-2 rounded-md transition-colors text-sm md:text-base font-medium ${activeTab() === 'history'
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                        >
                            History
                        </button>
                        <button
                            onClick={() => setActiveTab('trends')}
                            class={`px-4 md:px-6 py-2 rounded-md transition-colors text-sm md:text-base font-medium ${activeTab() === 'trends'
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                        >
                            Trends
                        </button>
                        <button
                            onClick={() => setActiveTab('export')}
                            class={`px-4 md:px-6 py-2 rounded-md transition-colors text-sm md:text-base font-medium ${activeTab() === 'export'
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                        >
                            Export
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div class="flex-1 overflow-hidden flex flex-col">
                    <Show when={activeTab() === 'dashboard'}>
                        <div class="space-y-8">
                            <ProgressGraph />
                            <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                                <h3 class="text-xl font-bold text-white mb-4">Recent Activity</h3>
                                <p class="text-gray-400 mb-4">Your most recent sessions. Switch to the <strong>History</strong> tab for a full log.</p>
                                {/* We reuse SessionHistory but limit height via CSS or container if needed, 
                     but for now let's just show it. Ideally we'd pass a 'limit' prop. 
                     For this iteration, we'll just show the graph and maybe a tip. 
                     Actually, let's just show the graph here to keep it clean as requested. */}
                            </div>
                        </div>
                    </Show>

                    <Show when={activeTab() === 'history'}>
                        <SessionHistory />
                    </Show>

                    <Show when={activeTab() === 'trends'}>
                        <div class="space-y-8">
                            <TrendsAnalysis />
                            <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                                <h3 class="text-xl font-bold text-white mb-4">About Trends</h3>
                                <p class="text-gray-300">
                                    This chart shows your average performance across different modalities (Position, Sound, Color, etc.).
                                    Use this to identify your strengths and weaknesses. A balanced profile is ideal for Dual N-Back training.
                                </p>
                            </div>
                        </div>
                    </Show>

                    <Show when={activeTab() === 'export'}>
                        <div class="flex justify-center items-center h-full">
                            <DataExport />
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    );
};

export default StatisticsScreen;
