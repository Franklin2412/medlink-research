/**
 * ACTIVITY 6: Feather Flyer
 * Flappy Bird style game where the bird follows the index finger vertically.
 */
class FeatherFlierActivity extends BaseActivity {
    constructor(detector, gameCanvas) {
        super(detector, gameCanvas);
        this.bird = {
            x: 100,
            y: 240,
            size: 40,
            emoji: '🐦'
        };
        this.obstacles = [];
        this.scrollSpeed = 4;
        this.spawnTimer = 0;
        this.spawnRate = 60; // Spawn every 60 frames (~2 seconds)
        this.isGameOver = false;

        // Background elements (clouds)
        this.backgrounds = [];
        for (let i = 0; i < 5; i++) {
            this.backgrounds.push({
                x: Math.random() * gameCanvas.width,
                y: Math.random() * gameCanvas.height,
                size: 30 + Math.random() * 50,
                speed: 1 + Math.random() * 1.5
            });
        }
    }

    start() {
        super.start();
        this.bird.y = this.gameCanvas.height / 2;
        this.obstacles = [];
        this.isGameOver = false;
        this.score = 0;
    }

    update() {
        if (this.isGameOver) return;

        super.update();

        // 1. Map bird Y to index finger
        const hands = this.detector.getDetectedHands();
        if (hands && hands.length > 0) {
            const indexTip = hands[0].landmarks[8];
            // Normalize and scale to canvas height (MediaPipe coords are 0-1)
            const targetY = indexTip.y * this.gameCanvas.height;

            // Smoothing (Lerp)
            const lerp = 0.3;
            this.bird.y += (targetY - this.bird.y) * lerp;
        }

        // 2. Update Background
        this.backgrounds.forEach(bg => {
            bg.x -= bg.speed;
            if (bg.x < -100) bg.x = this.gameCanvas.width + 50;
        });

        // 3. Update Obstacles
        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnObstacle();
            this.spawnTimer = 0;
        }

        this.obstacles.forEach((obs, index) => {
            obs.x -= this.scrollSpeed;

            // Check Collision (Very forgiving for toddlers)
            if (this.checkCollision(obs)) {
                this.handleCollision();
            }

            // Score point
            if (!obs.passed && obs.x < this.bird.x) {
                obs.passed = true;
                this.score++;
                this.updateUI();
            }

            // Remove off-screen
            if (obs.x < -100) {
                this.obstacles.splice(index, 1);
            }
        });
    }

    spawnObstacle() {
        const gapSize = 180;
        const minGapY = 50;
        const maxGapY = this.gameCanvas.height - gapSize - 50;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

        this.obstacles.push({
            x: this.gameCanvas.width,
            gapY: gapY,
            gapSize: gapSize,
            width: 60,
            passed: false
        });
    }

    checkCollision(obs) {
        // Only check if bird is within the x-range of the obstacle
        if (this.bird.x + this.bird.size > obs.x && this.bird.x < obs.x + obs.width) {
            // Check if bird is OUTSIDE the gap
            if (this.bird.y < obs.gapY || this.bird.y + this.bird.size > obs.gapY + obs.gapSize) {
                return true;
            }
        }
        return false;
    }

    handleCollision() {
        // Visual feedback (Flash/Shake)
        this.bird.emoji = '💥';
        setTimeout(() => {
            this.bird.emoji = '🐦';
        }, 300);

        // For toddlers, we don't end the game immediately. 
        // Maybe just a small score penalty or pause?
        // For now, let's keep it very gentle - just a visual alert.
    }

    draw() {
        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Draw sky background
        this.ctx.fillStyle = '#E1F5FE';
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Draw clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.backgrounds.forEach(bg => {
            this.ctx.font = `${bg.size}px Arial`;
            this.ctx.fillText('☁️', bg.x, bg.y);
        });

        // Draw obstacles (Pillars/Trees)
        this.ctx.fillStyle = '#81C784'; // Green trees/pillars
        this.obstacles.forEach(obs => {
            // Top pillar
            this.ctx.fillRect(obs.x, 0, obs.width, obs.gapY);
            // Bottom pillar
            this.ctx.fillRect(obs.x, obs.gapY + obs.gapSize, obs.width, this.gameCanvas.height);

            // Pillar edges
            this.ctx.strokeStyle = '#2E7D32';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(obs.x, 0, obs.width, obs.gapY);
            this.ctx.strokeRect(obs.x, obs.gapY + obs.gapSize, obs.width, this.gameCanvas.height);
        });

        // Draw bird
        this.ctx.font = '50px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(0,0,0,0.2)';
        this.ctx.fillText(this.bird.emoji, this.bird.x, this.bird.y);
        this.ctx.shadowBlur = 0;
    }

    getInfoHTML() {
        return `
            <div class="stat">
                <span class="stat-label">Score</span>
                <span class="stat-value">${this.score}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Time</span>
                <span class="stat-value">${this.formatTime(this.time)}</span>
            </div>
        `;
    }
}

// Export for global scope
window.FeatherFlierActivity = FeatherFlierActivity;
