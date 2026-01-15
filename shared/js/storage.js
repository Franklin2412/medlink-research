/**
 * Local Storage Management for MedLink Research
 * Handles saving and retrieving user progress data
 * All data stays on user's device (privacy-first)
 */

const StorageManager = {
    /**
     * Save progress data for an application
     * @param {string} appName - Name of the application (e.g., 'memory-garden')
     * @param {object} data - Progress data to save
     */
    saveProgress(appName, data) {
        try {
            const key = `medlink-research-${appName}`;
            const timestamp = new Date().toISOString();
            const saveData = {
                ...data,
                lastUpdated: timestamp
            };
            localStorage.setItem(key, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Error saving progress:', error);
            return false;
        }
    },

    /**
     * Load progress data for an application
     * @param {string} appName - Name of the application
     * @returns {object|null} Progress data or null if not found
     */
    loadProgress(appName) {
        try {
            const key = `medlink-research-${appName}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading progress:', error);
            return null;
        }
    },

    /**
     * Clear progress data for an application
     * @param {string} appName - Name of the application
     */
    clearProgress(appName) {
        try {
            const key = `medlink-research-${appName}`;
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error clearing progress:', error);
            return false;
        }
    },

    /**
     * Export all progress data as JSON
     * @returns {string} JSON string of all data
     */
    exportAllData() {
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('medlink-research-')) {
                const appName = key.replace('medlink-research-', '');
                allData[appName] = JSON.parse(localStorage.getItem(key));
            }
        }
        return JSON.stringify(allData, null, 2);
    },

    /**
     * Download progress data as a file
     * @param {string} filename - Name for the download file
     */
    downloadData(filename = 'medlink-research-progress.json') {
        const data = this.exportAllData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Get usage statistics across all apps
     * @returns {object} Statistics object
     */
    getStatistics() {
        const stats = {
            totalAppsUsed: 0,
            totalSessions: 0,
            firstUse: null,
            lastUse: null,
            apps: {}
        };

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('medlink-research-')) {
                const appName = key.replace('medlink-research-', '');
                const data = JSON.parse(localStorage.getItem(key));

                stats.totalAppsUsed++;
                if (data.sessions) stats.totalSessions += data.sessions;

                // Track first and last use
                if (data.lastUpdated) {
                    const lastUpdate = new Date(data.lastUpdated);
                    if (!stats.lastUse || lastUpdate > stats.lastUse) {
                        stats.lastUse = lastUpdate;
                    }
                }

                stats.apps[appName] = {
                    sessions: data.sessions || 0,
                    lastUpdated: data.lastUpdated
                };
            }
        }

        return stats;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
