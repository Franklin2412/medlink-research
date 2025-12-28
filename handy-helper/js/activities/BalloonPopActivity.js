/**
 * ACTIVITY 4: Balloon Pop
 * Fine motor skills practice (pinch gesture).
 */
class BalloonPopActivity extends BaseActivity {
    constructor(detector, gameCanvas) {
        super(detector, gameCanvas);
        this.balloons = [];
        this.particles = []; // Particle burst effect
        this.isPinching = false;
        this.pointerPos = { x: 0, y: 0 };
        this.colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#A29BFE'];
        this.sceneryMode = true; // Use scenery instead of camera
        this.shakeTime = 0; // Screen shake effect
    }

    start() {
        this.balloons = [];
        this.particles = [];
        this.shakeTime = 0;
        super.start();

        if (this.sceneryMode) {
            const videoElement = document.getElementById('bp-video');
            if (videoElement) videoElement.style.opacity = '0';
        }
    }

    stop() {
        if (this.sceneryMode) {
            const videoElement = document.getElementById('bp-video');
            if (videoElement) videoElement.style.opacity = '1';
        }
        super.stop();
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
                if (!wasPinching) {
                    this.checkPop();
                }
            }
        }

        // Update particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // Gravity
            p.life -= 0.02;
        });
        this.particles = this.particles.filter(p => p.life > 0);

        if (this.shakeTime > 0) this.shakeTime--;

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
        const balloon = this.balloons[index];
        this.createParticles(balloon.x, balloon.y, balloon.color);
        this.balloons.splice(index, 1);
        this.score++;
        this.shakeTime = 5;
        this.playPopEffect();
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                life: 1.0,
                size: 3 + Math.random() * 4
            });
        }
    }

    playPopEffect() {
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance('pop!');
            utterance.rate = 5;
            utterance.pitch = 2;
            utterance.volume = 0.5;
            window.speechSynthesis.speak(utterance);
        }
    }

    draw() {
        this.ctx.save();
        if (this.shakeTime > 0) {
            const dx = (Math.random() - 0.5) * 10;
            const dy = (Math.random() - 0.5) * 10;
            this.ctx.translate(dx, dy);
        }

        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        if (this.sceneryMode) {
            this.drawScenery();
        }

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

        // Draw Particles
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        // Pointer (Crosshair)
        const hands = this.detector.getDetectedHands();
        if (hands.length > 0) {
            this.drawCrosshair(this.pointerPos.x, this.pointerPos.y, this.isPinching);
        }

        this.ctx.restore();
    }

    drawScenery() {
        // Sky
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.gameCanvas.height);
        gradient.addColorStop(0, '#E1F5FE');
        gradient.addColorStop(1, '#B3E5FC');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Ground/Meadow
        this.ctx.fillStyle = '#C8E6C9';
        this.ctx.beginPath();
        this.ctx.ellipse(this.gameCanvas.width / 2, this.gameCanvas.height + 100, this.gameCanvas.width, 300, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.drawCloud(100, 150, 30);
        this.drawCloud(500, 100, 40);
        this.drawCloud(300, 200, 25);
    }

    drawCloud(x, y, r) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.arc(x + r, y - 10, r * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + r, y + 10, r * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + r * 2, y, r, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawCrosshair(x, y, isPinching) {
        this.ctx.save();
        this.ctx.translate(x, y);

        const size = isPinching ? 20 : 25;
        const color = isPinching ? '#FF5252' : '#2196F3';
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;

        // Outer Circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.stroke();

        // Cross lines
        this.ctx.beginPath();
        this.ctx.moveTo(-size - 10, 0); this.ctx.lineTo(-5, 0);
        this.ctx.moveTo(size + 10, 0); this.ctx.lineTo(5, 0);
        this.ctx.moveTo(0, -size - 10); this.ctx.lineTo(0, -5);
        this.ctx.moveTo(0, size + 10); this.ctx.lineTo(0, 5);
        this.ctx.stroke();

        // Center Dot
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    updateUI() {
        if (document.getElementById('bp-score')) {
            document.getElementById('bp-score').textContent = this.score;
        }
        if (document.getElementById('bp-time')) {
            document.getElementById('bp-time').textContent = this.formatTime(this.time);
        }
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
