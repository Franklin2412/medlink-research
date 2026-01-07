/**
 * ACTIVITY 2: Hand Tracker
 * Real-time visualization of finger and palm movements.
 */
class HandTrackerActivity extends BaseActivity {
    constructor(detector, gameCanvas) {
        super(detector, gameCanvas);
        this.updateInterval = null;
    }

    getInfoHTML() {
        const hands = this.detector.getDetectedHands();
        let status = 'No hands detected';
        if (hands.length === 1) status = `✅ ${hands[0].handedness} hand detected`;
        if (hands.length > 1) status = `✅ Both hands detected`;

        return `
            <div class="stat">
                <span class="stat-label">Status</span>
                <span class="stat-value">${status}</span>
            </div>
        `;
    }

    start() {
        super.start();
    }

    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        super.stop();
    }

    // HandTracker doesn't need stats saving as it's a visualization tool
    saveStats() { }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HandTrackerActivity;
}
window.HandTrackerActivity = HandTrackerActivity;
