/**
 * ACTIVITY 5: Duck Catch
 * Lateral coordination practice with custom Scenery Mode.
 */
class DuckCatchActivity extends BaseActivity {
    constructor(detector, gameCanvas) {
        super(detector, gameCanvas);
        this.ducks = [];
        this.items = [];
        this.basketPos = { x: gameCanvas.width / 2, y: gameCanvas.height - 60 };
        this.targetBasketX = gameCanvas.width / 2;
        this.basketWidth = 80;
        this.basketHeight = 40;
        this.sceneryMode = true; // Use scenery instead of camera feed
    }

    start() {
        this.items = [];
        this.setupDucks();
        super.start();

        // Hide the video element if in scenery mode to reduce distraction
        if (this.sceneryMode) {
            const videoElement = document.getElementById('dc-video');
            if (videoElement) videoElement.style.opacity = '0';
        }
    }

    setupDucks() {
        this.ducks = [];
        const padding = 60;
        const availableWidth = this.gameCanvas.width - padding * 2;
        const spacing = availableWidth / 5;

        for (let i = 0; i < 6; i++) {
            this.ducks.push({
                x: padding + i * spacing,
                y: 80,
                color: ['#FFD700', '#FFA500', '#FF8C00'][i % 3],
                wobble: Math.random() * Math.PI * 2,
                lastDropTime: Date.now() + Math.random() * 2000
            });
        }
    }

    update() {
        super.update();

        // Update basket position based on hand tracking
        const hands = this.detector.getDetectedHands();
        if (hands.length > 0) {
            const hand = hands[0];
            const indexTip = hand.landmarks[8];
            this.targetBasketX = indexTip.x * this.gameCanvas.width;
        }

        // Smoothly interpolate basket position
        this.basketPos.x += (this.targetBasketX - this.basketPos.x) * 0.3;

        // Keep basket within bounds
        const halfWidth = this.basketWidth / 2;
        if (this.basketPos.x < halfWidth) this.basketPos.x = halfWidth;
        if (this.basketPos.x > this.gameCanvas.width - halfWidth) this.basketPos.x = this.gameCanvas.width - halfWidth;

        // Update items
        this.items.forEach(item => {
            item.y += item.speed;
            item.rotation += item.rotationSpeed;
        });

        // Check for catches
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            const inXRange = Math.abs(item.x - this.basketPos.x) < this.basketWidth / 2 + 10;
            const inYRange = item.y > this.basketPos.y - 10 && item.y < this.basketPos.y + 20;

            if (inXRange && inYRange) {
                this.handleCatch(item);
                this.items.splice(i, 1);
                continue;
            }

            if (item.y > this.gameCanvas.height + 20) {
                this.items.splice(i, 1);
            }
        }

        // Spawn items
        const now = Date.now();
        if (this.items.length < 3) {
            this.ducks.forEach(duck => {
                if (now - duck.lastDropTime > 3000 + Math.random() * 4000) {
                    this.spawnItem(duck);
                    duck.lastDropTime = now;
                }
            });
        }
    }

    spawnItem(duck) {
        const isEgg = Math.random() > 0.3;
        this.items.push({
            x: duck.x,
            y: duck.y + 20,
            type: isEgg ? 'egg' : 'waste',
            speed: 3 + Math.random() * 3,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        });
    }

    handleCatch(item) {
        if (item.type === 'egg') {
            this.score += 5;
            this.playCatchEffect(true);
        } else {
            this.score = Math.max(0, this.score - 1);
            this.playCatchEffect(false);
        }
    }

    playCatchEffect(isGood) {
        if (window.speechSynthesis) {
            const voice = isGood ? 'yay' : 'oh no';
            const utterance = new SpeechSynthesisUtterance(voice);
            utterance.rate = 4;
            utterance.pitch = isGood ? 2 : 1;
            utterance.volume = 0.3;
            // window.speechSynthesis.speak(utterance);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        if (this.sceneryMode) {
            this.drawScenery();
        }

        // Draw Branch
        this.ctx.save();
        this.ctx.strokeStyle = '#5D4037';
        this.ctx.lineWidth = 15;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(20, 85);
        this.ctx.lineTo(this.gameCanvas.width - 20, 85);
        this.ctx.stroke();
        this.ctx.restore();

        // Draw Ducks
        this.ducks.forEach(duck => {
            this.ctx.save();
            duck.wobble += 0.05;
            const wobbleY = Math.sin(duck.wobble) * 3;

            this.ctx.beginPath();
            this.ctx.fillStyle = duck.color;
            this.ctx.arc(duck.x, duck.y + wobbleY, 20, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.arc(duck.x + 15, duck.y - 10 + wobbleY, 12, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.fillStyle = '#000';
            this.ctx.arc(duck.x + 18, duck.y - 12 + wobbleY, 2, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.fillStyle = '#FF9800';
            this.ctx.moveTo(duck.x + 25, duck.y - 10 + wobbleY);
            this.ctx.lineTo(duck.x + 35, duck.y - 8 + wobbleY);
            this.ctx.lineTo(duck.x + 25, duck.y - 6 + wobbleY);
            this.ctx.fill();

            this.ctx.restore();
        });

        // Draw Items
        this.items.forEach(item => {
            this.ctx.save();
            this.ctx.translate(item.x, item.y);
            this.ctx.rotate(item.rotation);

            if (item.type === 'egg') {
                this.ctx.beginPath();
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.ellipse(0, 0, 12, 18, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#E0E0E0';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            } else {
                this.ctx.beginPath();
                this.ctx.fillStyle = '#795548';
                this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(0, -5, 5, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
        });

        // Draw Basket
        this.ctx.save();
        this.ctx.translate(this.basketPos.x, this.basketPos.y);
        this.ctx.fillStyle = '#8D6E63';
        this.ctx.beginPath();
        this.ctx.roundRect(-this.basketWidth / 2, 0, this.basketWidth, this.basketHeight, [0, 0, 20, 20]);
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        this.ctx.lineWidth = 2;
        for (let i = -this.basketWidth / 2 + 10; i < this.basketWidth / 2; i += 15) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.basketHeight);
            this.ctx.stroke();
        }
        this.ctx.fillStyle = '#6D4C41';
        this.ctx.beginPath();
        this.ctx.roundRect(-this.basketWidth / 2 - 5, -5, this.basketWidth + 10, 10, 5);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawScenery() {
        // Sky
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.gameCanvas.height);
        gradient.addColorStop(0, '#87CEEB'); // Sky Blue
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Grass/Ground
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.beginPath();
        this.ctx.ellipse(this.gameCanvas.width / 2, this.gameCanvas.height + 50, this.gameCanvas.width, 200, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Sun
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(this.gameCanvas.width - 60, 60, 40, 0, Math.PI * 2);
        this.ctx.fill();

        // Clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.drawCloud(100, 100, 30);
        this.drawCloud(400, 150, 40);
        this.drawCloud(250, 50, 25);
    }

    drawCloud(x, y, r) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.arc(x + r, y - 10, r * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + r, y + 10, r * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + r * 2, y, r, 0, Math.PI * 2);
        this.ctx.fill();
    }

    updateUI() {
        document.getElementById('dc-score').textContent = this.score;
        document.getElementById('dc-time').textContent = this.formatTime(this.time);
    }

    saveStats() {
        super.saveStats('duckCatch');
    }

    stop() {
        // Restore video opacity if hidden
        if (this.sceneryMode) {
            const videoElement = document.getElementById('dc-video');
            if (videoElement) videoElement.style.opacity = '1';
        }
        super.stop();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DuckCatchActivity;
}
window.DuckCatchActivity = DuckCatchActivity;
