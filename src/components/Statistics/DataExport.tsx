import { Component } from 'solid-js';
import { gameActions, gameStore } from '../../stores/gameStore';

const DataExport: Component = () => {
    const handleExport = () => {
        if (!gameStore.activeProfileId) return;

        const csvContent = gameActions.exportStats(gameStore.activeProfileId);
        if (!csvContent) return;

        const blob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `brainworkshop_stats_${new Date().toISOString().split('T')[0]}.tsv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div class="w-full bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <h2 class="text-xl font-bold text-white mb-2">Export Data</h2>
            <p class="text-gray-400 mb-6 max-w-md">
                Download your session history and statistics as a tab-separated values (TSV) file, compatible with Excel and Google Sheets.
            </p>

            <button
                onClick={handleExport}
                class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                Export Statistics
            </button>
        </div>
    );
};

export default DataExport;
