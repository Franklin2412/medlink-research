/**
 * ACTIVITY 3: Catch the Stars
 * Hand-eye coordination practice.
 */
class CatchStarsActivity extends BaseActivity {
    constructor(detector, gameCanvas) {
        super(detector, gameCanvas);
        this.stars = [];
        this.spawnInterval = null;
    }

    start() {
        this.stars = [];
        super.start();

        // Custom spawn interval for this game
        this.spawnInterval = setInterval(() => this.spawnStar(), 2000);
        this.spawnStar(); // Spawn first one immediately
    }

    spawnStar() {
        this.stars.push({
            x: Math.random() * this.gameCanvas.width,
            y: 0,
            radius: 20,
            speed: 2 + Math.random() * 2,
            caught: false
        });
    }

    update() {
        super.update();

        // Update time and score in UI
        document.getElementById('cs-time').textContent = this.formatTime(this.time);
        document.getElementById('cs-score').textContent = this.score;

        // Get hand positions
        const hands = this.detector.getDetectedHands();

        // Update and draw stars
        this.stars = this.stars.filter(star => {
            if (star.caught) return false;

            star.y += star.speed;

            // Check collision with hands
            hands.forEach(hand => {
                const palm = hand.landmarks[0]; // Wrist position
                const palmX = palm.x * this.gameCanvas.width;
                const palmY = palm.y * this.gameCanvas.height;

                const distance = Math.sqrt(
                    Math.pow(star.x - palmX, 2) + Math.pow(star.y - palmY, 2)
                );

                if (distance < star.radius + 30) {
                    this.score++;
                    this.showCatchEffect(star.x, star.y);
                    star.caught = true;
                }
            });

            // Draw star
            if (!star.caught && star.y < this.gameCanvas.height) {
                this.drawStar(star.x, star.y, star.radius);
                return true;
            }

            return false;
        });
    }

    drawStar(x, y, radius) {
        this.ctx.save();
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
        this.ctx.restore();
    }

    showCatchEffect(x, y) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 217, 61, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 40, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.restore();
    }

    saveStats() {
        super.saveStats('catchStars');
    }

    stop() {
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
        }
        super.stop();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CatchStarsActivity;
}
window.CatchStarsActivity = CatchStarsActivity;
