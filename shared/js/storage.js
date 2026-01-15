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
    },

    /**
     * Session-based storage (resets on tab close or refresh if logic added)
     */
    recordSessionActivity(appName, activity, score, time) {
        try {
            const sessionKey = 'medlink-session-log';
            let sessionData = JSON.parse(sessionStorage.getItem(sessionKey) || '[]');
            sessionData.push({
                app: appName,
                activity: activity,
                score: score,
                time: time,
                timestamp: new Date().toISOString()
            });
            sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
            return true;
        } catch (e) {
            console.error('Error recording session activity:', e);
            return false;
        }
    },

    getSessionStats() {
        try {
            return JSON.parse(sessionStorage.getItem('medlink-session-log') || '[]');
        } catch (e) {
            return [];
        }
    },

    clearSession() {
        sessionStorage.removeItem('medlink-session-log');
    },

    showSessionStats() {
        const stats = this.getSessionStats();

        // Remove existing modal if any
        const existing = document.getElementById('session-stats-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'session-stats-modal';
        modal.style = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 10001;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Poppins', sans-serif;
        `;

        let rows = stats.length === 0 ?
            '<tr><td colspan="4" style="padding: 20px; text-align: center;">No activities recorded yet this session.</td></tr>' :
            stats.slice().reverse().map(s => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${s.app}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${s.activity}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${s.score}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
            `).join('');

        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; position: relative;">
                <button onclick="this.closest('#session-stats-modal').remove()" style="position: absolute; top: 10px; right: 15px; border: none; background: none; font-size: 24px; cursor: pointer;">&times;</button>
                <h2 style="color: #4ECDC4; margin-top: 0;">📊 Current Session Progress</h2>
                <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px;">Detailed log of your activities since you joined or refreshed.</p>
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead style="background: #f8f9fa;">
                        <tr>
                            <th style="padding: 10px; border-bottom: 2px solid #4ECDC4;">App</th>
                            <th style="padding: 10px; border-bottom: 2px solid #4ECDC4;">Activity</th>
                            <th style="padding: 10px; border-bottom: 2px solid #4ECDC4;">Result</th>
                            <th style="padding: 10px; border-bottom: 2px solid #4ECDC4;">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
                <div style="margin-top: 30px; text-align: center;">
                    <button onclick="this.closest('#session-stats-modal').remove()" class="btn btn-primary" style="padding: 10px 30px;">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }
};

// Reset session on page refresh if the user just landed or reloaded
// This satisfies the "reset to 0 on refresh" requirement
if (performance.navigation.type === 1) { // Type 1 is RELOAD
    StorageManager.clearSession();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
