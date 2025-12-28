/**
 * ACTIVITY 4: Balloon Pop
 * Fine motor skills practice (pinch gesture).
 */
class BalloonPopActivity extends BaseActivity {
    constructor(detector, gameCanvas) {
        super(detector, gameCanvas);
        this.balloons = [];
        this.isPinching = false;
        this.pointerPos = { x: 0, y: 0 };
        this.colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#A29BFE'];
    }

    update() {
        super.update();

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

            this.ctx.beginPath();
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(0,0,0,0.1)';
            this.ctx.fillStyle = balloon.color;
            this.ctx.ellipse(balloon.x + wobbleX, balloon.y, balloon.radius, balloon.radius * 1.2, 0, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.ellipse(balloon.x + wobbleX - balloon.radius * 0.3, balloon.y - balloon.radius * 0.4, balloon.radius * 0.2, balloon.radius * 0.3, Math.PI / 4, 0, Math.PI * 2);
            this.ctx.fill();

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

        // Pointer
        const hands = this.detector.getDetectedHands();
        if (hands.length > 0) {
            this.ctx.save();
            this.ctx.setLineDash(this.isPinching ? [] : [5, 5]);
            this.ctx.strokeStyle = this.isPinching ? '#FFFC00' : '#FFFFFF';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.pointerPos.x, this.pointerPos.y, 25, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.fillStyle = this.isPinching ? '#FFFC00' : 'rgba(255, 255, 255, 0.3)';
            this.ctx.arc(this.pointerPos.x, this.pointerPos.y, 6, 0, Math.PI * 2);
            this.ctx.fill();

            if (this.isPinching) {
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

    saveStats() {
        super.saveStats('balloonPop');
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BalloonPopActivity;
}
window.BalloonPopActivity = BalloonPopActivity;
