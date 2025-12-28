/**
 * ACTIVITY 2: Hand Tracker
 * Real-time visualization of finger and palm movements.
 */
class HandTrackerActivity extends BaseActivity {
    constructor(detector, gameCanvas) {
        super(detector, gameCanvas);
        this.updateInterval = null;
    }

    start() {
        const infoElement = document.getElementById('ht-info');

        this.updateInterval = setInterval(() => {
            const hands = this.detector.getDetectedHands();

            if (hands.length === 0) {
                infoElement.innerHTML = '<p>No hands detected. Try waving your hands!</p>';
                infoElement.classList.remove('hidden');
            } else if (hands.length === 1) {
                infoElement.innerHTML = `<p>✅ ${hands[0].handedness} hand detected!</p>`;
                infoElement.classList.remove('hidden');
            } else {
                infoElement.innerHTML = `<p>✅ Both hands detected! ${hands[0].handedness} & ${hands[1].handedness}</p>`;
                infoElement.classList.remove('hidden');
            }
        }, 500);
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
