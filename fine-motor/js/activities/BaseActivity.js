/**
 * Base class for all HandyHelper activities.
 * Provides shared functionality for game loops, time tracking, and stats.
 */
class BaseActivity {
    constructor(detector, gameCanvas) {
        this.detector = detector;
        this.gameCanvas = gameCanvas;
        this.ctx = gameCanvas.getContext('2d');
        this.score = 0;
        this.startTime = null;
        this.time = 0;
        this.gameLoop = null;
        this.fps = 30;
    }

    /**
     * Start the activity
     */
    start() {
        this.score = 0;
        this.startTime = Date.now();
        this.time = 0;
        this.updateUI();

        // Start game loop
        if (this.update) {
            this.gameLoop = setInterval(() => this.update(), 1000 / this.fps);
        }
    }

    /**
     * Stop the activity
     */
    stop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        this.saveStats();
    }

    /**
     * Update loop (to be overridden)
     */
    update() {
        this.time = Math.floor((Date.now() - this.startTime) / 1000);
        this.updateUI();
        if (this.draw) this.draw();
    }

    /**
     * UI Updates (to be overridden)
     */
    updateUI() {
        const infoDisplay = document.getElementById('game-info-display');
        if (infoDisplay) {
            infoDisplay.innerHTML = this.getInfoHTML ? this.getInfoHTML() : '';
        }
    }

    /**
     * Format time in MM:SS
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Save statistics to LocalStorage
     */
    saveStats(activityKey, sessionData = {}) {
        if (!activityKey) return;

        const session = {
            date: new Date().toISOString(),
            score: this.score,
            time: this.time,
            ...sessionData
        };

        const existing = StorageManager.loadProgress('handy-helper') || {};
        if (!existing[activityKey]) {
            existing[activityKey] = {
                sessionsCompleted: 0,
                bestScore: 0,
                history: []
            };
        }

        const stats = existing[activityKey];
        stats.sessionsCompleted++;
        if (this.score > (stats.bestScore || 0)) {
            stats.bestScore = this.score;
        }

        // Add to history and keep last 50
        stats.history.push(session);
        if (stats.history.length > 50) {
            stats.history.shift();
        }

        StorageManager.saveProgress('handy-helper', existing);
    }
}

// Export for potential node use or global scope
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseActivity;
}
window.BaseActivity = BaseActivity;
