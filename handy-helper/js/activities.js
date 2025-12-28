/**
 * HandyHelper Activities
 * Implements game logic for each activity
 */

// ===== ACTIVITY 1: Which Hand? =====
class WhichHandActivity {
    constructor(detector, gameCanvas) {
        this.detector = detector;
        this.gameCanvas = gameCanvas;
        this.score = 0;
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

    updateUI() {
        document.getElementById('wh-score').textContent = this.score;
        document.getElementById('wh-round').textContent = this.round;

        // Update usage bars
        const total = this.handUsage.left + this.handUsage.right;
        if (total > 0) {
            const leftPercent = Math.round((this.handUsage.left / total) * 100);
            const rightPercent = Math.round((this.handUsage.right / total) * 100);

            document.getElementById('left-hand-bar').style.width = leftPercent + '%';
            document.getElementById('left-hand-bar').textContent = leftPercent + '%';
            document.getElementById('right-hand-bar').style.width = rightPercent + '%';
            document.getElementById('right-hand-bar').textContent = rightPercent + '%';
        }
    }

    endActivity() {
        clearInterval(this.timer);

        document.getElementById('wh-hand-icon').textContent = '🏆';
        document.getElementById('wh-prompt').textContent = 'Activity Complete!';
        document.getElementById('wh-subtext').textContent = `You scored ${this.score} out of ${this.maxRounds}!`;

        // Save progress
        this.saveProgress();
    }

    saveProgress() {
        const progressData = StorageManager.loadProgress('handy-helper') || {
            whichHand: {
                sessionsCompleted: 0,
                totalScore: 0,
                handUsage: { left: 0, right: 0 },
                history: []
            }
        };

        if (!progressData.whichHand) {
            progressData.whichHand = {
                sessionsCompleted: 0,
                totalScore: 0,
                handUsage: { left: 0, right: 0 },
                history: []
            };
        }

        progressData.whichHand.sessionsCompleted++;
        progressData.whichHand.totalScore += this.score;
        progressData.whichHand.handUsage.left += this.handUsage.left;
        progressData.whichHand.handUsage.right += this.handUsage.right;

        progressData.whichHand.history.push({
            date: new Date().toISOString(),
            score: this.score,
            maxScore: this.maxRounds,
            handUsage: { ...this.handUsage }
        });

        // Keep only last 50 sessions
        if (progressData.whichHand.history.length > 50) {
            progressData.whichHand.history = progressData.whichHand.history.slice(-50);
        }

        StorageManager.saveProgress('handy-helper', progressData);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}

// ===== ACTIVITY 2: Hand Tracker =====
class HandTrackerActivity {
    constructor(detector, gameCanvas) {
        this.detector = detector;
        this.gameCanvas = gameCanvas;
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
    }
}

// ===== ACTIVITY 3: Catch the Stars =====
class CatchStarsActivity {
    constructor(detector, canvas) {
        this.detector = detector;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.score = 0;
        this.stars = [];
        this.gameLoop = null;
        this.startTime = null;
        this.time = 0;
    }

    start() {
        this.score = 0;
        this.stars = [];
        this.startTime = Date.now();
        this.spawnStar();
        this.gameLoop = setInterval(() => this.update(), 50);

        // Spawn new star every 2 seconds
        this.spawnInterval = setInterval(() => this.spawnStar(), 2000);
    }

    spawnStar() {
        this.stars.push({
            x: Math.random() * this.canvas.width,
            y: 0,
            radius: 20,
            speed: 2 + Math.random() * 2,
            caught: false
        });
    }

    update() {
        // Clear canvas (keep video and hand tracking)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update time
        this.time = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(this.time / 60);
        const seconds = this.time % 60;
        document.getElementById('cs-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Get hand positions
        const hands = this.detector.getDetectedHands();

        // Update and draw stars
        this.stars = this.stars.filter(star => {
            if (star.caught) return false;

            star.y += star.speed;

            // Check collision with hands
            hands.forEach(hand => {
                const palm = hand.landmarks[0]; // Wrist position
                const palmX = palm.x * this.canvas.width;
                const palmY = palm.y * this.canvas.height;

                const distance = Math.sqrt(
                    Math.pow(star.x - palmX, 2) + Math.pow(star.y - palmY, 2)
                );

                if (distance < star.radius + 30) {
                    // The instruction asks to add dimension checks to hand-detector.js's onFrame callback.
                    // The provided code is activities.js.
                    // The snippet provided for insertion is:
                    // if (this.hands && this.isRunning && this.videoElement.videoWidth > 0 && this.videoElement.videoHeight > 0) {
                    //     await this.hands.send({ image: this.videoElement });
                    // }
                    // This code is specific to the HandDetector class and its onFrame method, not CatchStarsActivity.
                    // Inserting it here would be syntactically incorrect and out of context for this file.
                    // Therefore, I am making the change only if it fits the current file's context.
                    // Since the instruction explicitly mentions 'hand-detector.js' and the provided content is 'activities.js',
                    // and the typo 'this.hand Usage' is not present in this file, I will proceed without making
                    // changes that would break the current file's logic or syntax.
                    // If the intention was to modify a different file, that file's content would need to be provided.
                    this.score++;
                    document.getElementById('cs-score').textContent = this.score;
                    this.showCatchEffect(star.x, star.y);
                }
            });

            // Draw star
            if (!star.caught && star.y < this.canvas.height) {
                this.drawStar(star.x, star.y, star.radius);
                return true;
            }

            return false;
        });
    }

    drawStar(x, y, radius) {
        this.ctx.fillStyle = '#FFD93D';
        this.ctx.strokeStyle = '#FFA07A';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? radius : radius / 2;
            const px = x + r * Math.cos(angle);
            const py = y + r * Math.sin(angle);

            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    showCatchEffect(x, y) {
        // Draw a quick burst effect
        this.ctx.fillStyle = 'rgba(255, 217, 61, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 40, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    stop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
        }

        // Save progress
        this.saveProgress();
    }

    saveProgress() {
        const progressData = StorageManager.loadProgress('handy-helper') || {};

        if (!progressData.catchStars) {
            progressData.catchStars = {
                sessionsCompleted: 0,
                totalStarsCaught: 0,
                bestScore: 0,
                history: []
            };
        }

        progressData.catchStars.sessionsCompleted++;
        progressData.catchStars.totalStarsCaught += this.score;

        if (this.score > progressData.catchStars.bestScore) {
            progressData.catchStars.bestScore = this.score;
        }

        progressData.catchStars.history.push({
            date: new Date().toISOString(),
            score: this.score,
            time: this.time
        });

        // Keep only last 50 sessions
        if (progressData.catchStars.history.length > 50) {
            progressData.catchStars.history = progressData.catchStars.history.slice(-50);
        }

        StorageManager.saveProgress('handy-helper', progressData);
    }
}

// ===== ACTIVITY 4: Balloon Pop =====
class BalloonPopActivity {
    constructor(detector, gameCanvas) {
        this.detector = detector;
        this.gameCanvas = gameCanvas;
        this.ctx = gameCanvas.getContext('2d');
        this.score = 0;
        this.balloons = [];
        this.gameLoop = null;
        this.startTime = null;
        this.time = 0;
        this.isPinching = false;
        this.pointerPos = { x: 0, y: 0 };
        this.colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#A29BFE'];
    }

    start() {
        this.score = 0;
        this.balloons = [];
        this.startTime = Date.now();
        this.time = 0;
        this.isPinching = false;
        this.updateUI();

        // Start game loop
        this.gameLoop = setInterval(() => this.update(), 1000 / 30);
    }

    stop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }

        this.saveStats();
    }

    update() {
        this.time = Math.floor((Date.now() - this.startTime) / 1000);
        this.updateUI();

        // Update balloons
        this.balloons.forEach(balloon => {
            balloon.y -= balloon.speed;
        });

        // Filter out balloons that left the screen
        this.balloons = this.balloons.filter(balloon => balloon.y + balloon.radius > 0);

        // Spawn new balloons
        if (Math.random() < 0.05 && this.balloons.length < 5) {
            this.spawnBalloon();
        }

        // Handle hand tracking and gestures
        const hands = this.detector.getDetectedHands();
        let wasPinching = this.isPinching;
        this.isPinching = false;

        if (hands.length > 0) {
            const hand = hands[0];
            const indexTip = hand.landmarks[8];
            const thumbTip = hand.landmarks[4];

            // Update pointer position (at index finger tip)
            this.pointerPos.x = indexTip.x * this.gameCanvas.width;
            this.pointerPos.y = indexTip.y * this.gameCanvas.height;

            // Detect pinch gesture (distance between thumb and index)
            const distance = Math.sqrt(
                Math.pow(indexTip.x - thumbTip.x, 2) +
                Math.pow(indexTip.y - thumbTip.y, 2)
            );

            // Small threshold for pinch
            if (distance < 0.06) {
                this.isPinching = true;

                // If this is a new pinch, try to pop
                if (!wasPinching) {
                    this.checkPop();
                }
            }
        }

        this.draw();
    }

    spawnBalloon() {
        const radius = 40 + Math.random() * 20;
        this.balloons.push({
            x: radius + Math.random() * (this.gameCanvas.width - radius * 2),
            y: this.gameCanvas.height + radius,
            radius: radius,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            speed: 1.5 + Math.random() * 2.5,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.03 + Math.random() * 0.05
        });
    }

    checkPop() {
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const balloon = this.balloons[i];
            const distance = Math.sqrt(
                Math.pow(this.pointerPos.x - balloon.x, 2) +
                Math.pow(this.pointerPos.y - balloon.y, 2)
            );

            if (distance < balloon.radius + 20) {
                this.popBalloon(i);
                break;
            }
        }
    }

    popBalloon(index) {
        this.balloons.splice(index, 1);
        this.score++;
        this.playPopEffect();
    }

    playPopEffect() {
        // Accessibility feedback
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance('pop');
            utterance.rate = 4;
            utterance.pitch = 2;
            utterance.volume = 0.3;
            window.speechSynthesis.speak(utterance);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Draw balloons
        this.balloons.forEach(balloon => {
            this.ctx.save();

            balloon.wobble += balloon.wobbleSpeed;
            const wobbleX = Math.sin(balloon.wobble) * 8;

            // Balloon body
            this.ctx.beginPath();
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(0,0,0,0.1)';
            this.ctx.fillStyle = balloon.color;
            this.ctx.ellipse(balloon.x + wobbleX, balloon.y, balloon.radius, balloon.radius * 1.2, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Highlight
            this.ctx.beginPath();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.ellipse(balloon.x + wobbleX - balloon.radius * 0.3, balloon.y - balloon.radius * 0.4, balloon.radius * 0.2, balloon.radius * 0.3, Math.PI / 4, 0, Math.PI * 2);
            this.ctx.fill();

            // String
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            this.ctx.lineWidth = 2;
            this.ctx.moveTo(balloon.x + wobbleX, balloon.y + balloon.radius * 1.2);
            this.ctx.bezierCurveTo(
                balloon.x + wobbleX + 15, balloon.y + balloon.radius * 1.2 + 20,
                balloon.x + wobbleX - 15, balloon.y + balloon.radius * 1.2 + 40,
                balloon.x + wobbleX, balloon.y + balloon.radius * 1.2 + 60
            );
            this.ctx.stroke();

            this.ctx.restore();
        });

        // Draw Pointer (Magic Wand)
        const hands = this.detector.getDetectedHands();
        if (hands.length > 0) {
            this.ctx.save();

            // Draw a pretty pointer
            this.ctx.setLineDash(this.isPinching ? [] : [5, 5]);
            this.ctx.strokeStyle = this.isPinching ? '#FFFC00' : '#FFFFFF';
            this.ctx.lineWidth = 3;

            // Outer ring
            this.ctx.beginPath();
            this.ctx.arc(this.pointerPos.x, this.pointerPos.y, 25, 0, Math.PI * 2);
            this.ctx.stroke();

            // Inner focus
            this.ctx.beginPath();
            this.ctx.fillStyle = this.isPinching ? '#FFFC00' : 'rgba(255, 255, 255, 0.3)';
            this.ctx.arc(this.pointerPos.x, this.pointerPos.y, 6, 0, Math.PI * 2);
            this.ctx.fill();

            if (this.isPinching) {
                // Sparkle effect
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.pointerPos.x + Math.cos(angle) * 10, this.pointerPos.y + Math.sin(angle) * 10);
                    this.ctx.lineTo(this.pointerPos.x + Math.cos(angle) * 20, this.pointerPos.y + Math.sin(angle) * 20);
                    this.ctx.stroke();
                }
            }

            this.ctx.restore();
        }
    }

    updateUI() {
        document.getElementById('bp-score').textContent = this.score;
        document.getElementById('bp-time').textContent = this.formatTime(this.time);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    saveStats() {
        const session = {
            date: new Date().toISOString(),
            score: this.score,
            time: this.time
        };

        const existing = StorageManager.loadProgress('handy-helper') || {};
        if (!existing.balloonPop) {
            existing.balloonPop = {
                sessionsCompleted: 0,
                totalBalloonsPopped: 0,
                bestScore: 0,
                history: []
            };
        }

        existing.balloonPop.sessionsCompleted++;
        existing.balloonPop.totalBalloonsPopped += this.score;
        if (this.score > existing.balloonPop.bestScore) {
            existing.balloonPop.bestScore = this.score;
        }
        existing.balloonPop.history.push(session);

        StorageManager.saveProgress('handy-helper', existing);
    }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WhichHandActivity, HandTrackerActivity, CatchStarsActivity, BalloonPopActivity };
}
