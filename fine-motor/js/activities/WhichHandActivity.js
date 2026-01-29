/**
 * ACTIVITY 1: Which Hand?
 * Practice left/right differentiation.
 */
class WhichHandActivity extends BaseActivity {
    constructor(detector, gameCanvas) {
        super(detector, gameCanvas);
        this.round = 1;
        this.maxRounds = 10;
        this.currentHand = null;
        this.isWaitingForResponse = false;
        this.countdown = 3;
        this.handUsage = { left: 0, right: 0 };
        this.timer = null;
    }

    start() {
        this.score = 0;
        this.round = 1;
        this.handUsage = { left: 0, right: 0 };
        this.updateUI();
        this.nextRound();
    }

    nextRound() {
        if (this.round > this.maxRounds) {
            this.endActivity();
            return;
        }

        // Countdown before showing prompt
        document.getElementById('wh-prompt').textContent = 'Get Ready!';
        document.getElementById('wh-subtext').textContent = `Starting in ${this.countdown} seconds...`;
        document.getElementById('wh-hand-icon').textContent = '⏳';

        this.countdown = 3;
        const countdownInterval = setInterval(() => {
            this.countdown--;
            if (this.countdown > 0) {
                document.getElementById('wh-subtext').textContent = `Starting in ${this.countdown}...`;
            } else {
                clearInterval(countdownInterval);
                this.showPrompt();
            }
        }, 1000);
    }

    showPrompt() {
        // Randomly choose left or right
        this.currentHand = Math.random() > 0.5 ? 'Right' : 'Left';
        this.isWaitingForResponse = true;

        const icon = this.currentHand === 'Right' ? '👉' : '👈';
        document.getElementById('wh-hand-icon').textContent = icon;
        document.getElementById('wh-prompt').textContent = `Show me your ${this.currentHand} hand!`;
        document.getElementById('wh-subtext').textContent = 'Hold it up for 2 seconds...';

        // Start checking for hand
        this.checkForHand();
    }

    checkForHand() {
        let detectionStart = null;
        const requiredDuration = 2000; // 2 seconds

        this.timer = setInterval(() => {
            const hands = this.detector.getDetectedHands();

            // Check if the correct hand is detected
            const correctHand = hands.find(h => h.handedness === this.currentHand);

            if (correctHand) {
                if (!detectionStart) {
                    detectionStart = Date.now();
                }

                const elapsed = Date.now() - detectionStart;
                const remaining = Math.ceil((requiredDuration - elapsed) / 1000);

                if (remaining > 0) {
                    document.getElementById('wh-subtext').textContent = `Great! Keep holding... ${remaining}`;
                }

                if (elapsed >= requiredDuration) {
                    this.correctResponse();
                }
            } else {
                detectionStart = null;
                if (this.isWaitingForResponse) {
                    document.getElementById('wh-subtext').textContent = 'Hold it up for 2 seconds...';
                }
            }
        }, 100);
    }

    correctResponse() {
        clearInterval(this.timer);
        this.isWaitingForResponse = false;
        this.score++;
        this.handUsage[this.currentHand.toLowerCase()]++;

        // Success feedback
        document.getElementById('wh-hand-icon').textContent = '🎉';
        document.getElementById('wh-prompt').textContent = 'Excellent!';
        document.getElementById('wh-subtext').textContent = `That's your ${this.currentHand} hand!`;

        this.round++;
        this.updateUI();

        setTimeout(() => {
            this.nextRound();
        }, 2000);
    }

    getInfoHTML() {
        return `
            <div class="stat">
                <span class="stat-label">Score</span>
                <span class="stat-value">${this.score}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Round</span>
                <span class="stat-value">${this.round}/${this.maxRounds}</span>
            </div>
        `;
    }

    endActivity() {
        clearInterval(this.timer);

        document.getElementById('wh-hand-icon').textContent = '🏆';
        document.getElementById('wh-prompt').textContent = 'Activity Complete!';
        document.getElementById('wh-subtext').textContent = `You scored ${this.score} out of ${this.maxRounds}!`;

        // Save progress
        this.saveStats();
    }

    saveStats() {
        super.saveStats('whichHand', {
            maxScore: this.maxRounds,
            handUsage: { ...this.handUsage }
        });
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        super.stop();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WhichHandActivity;
}
window.WhichHandActivity = WhichHandActivity;
