/**
 * ACTIVITY 6: Feather Flyer
 * Flappy Bird style game where the bird follows the index finger vertically.
 */
class FeatherFlyerActivity extends BaseActivity {
    constructor(detector, gameCanvas) {
        super(detector, gameCanvas);
        this.bird = {
            x: 100,
            y: 240,
            size: 40,
            emoji: '🐦'
        };
        this.obstacles = [];
        this.items = []; // New collectibles
        this.scrollSpeed = 4;
        this.spawnTimer = 0;
        this.spawnRate = 120; // Increased distance (2s at 60fps)
        this.isGameOver = false;
        this.leafWobble = 0;

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
        this.bird.emoji = '🐦';
        this.obstacles = [];
        this.items = [];
        this.isGameOver = false;
        this.score = 0;
        this.leafWobble = 0;

        // Hide overlay
        const overlay = document.getElementById('ff-game-over');
        if (overlay) overlay.classList.add('hidden');

        // Setup restart button listener (if not already set)
        if (!this.restartListenerSet) {
            const restartBtn = document.getElementById('ff-restart-btn');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => this.start());
            }
            this.restartListenerSet = true;
        }
    }

    update() {
        if (this.isGameOver) return;

        super.update();
        this.leafWobble += 0.05;

        // 1. Map bird Y to index finger with EMA smoothing
        const hands = this.detector.getDetectedHands();
        if (hands && hands.length > 0) {
            const indexTip = hands[0].landmarks[8];
            const targetY = indexTip.y * this.gameCanvas.height;
            const alpha = 0.15; // Stronger smoothing
            this.bird.y = alpha * targetY + (1 - alpha) * this.bird.y;
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

            if (this.checkCollision(obs)) {
                this.handleCollision();
            }

            if (!obs.passed && obs.x < this.bird.x) {
                obs.passed = true;
                this.score++;
                this.updateUI();
            }

            if (obs.x < -200) {
                this.obstacles.splice(index, 1);
            }
        });

        // 4. Update Items (Collectibles)
        this.items.forEach((item, index) => {
            item.x -= this.scrollSpeed;

            // Floating animation
            item.yOffset = Math.sin(Date.now() * 0.005) * 10;

            const dist = Math.hypot(item.x - this.bird.x, (item.y + item.yOffset) - this.bird.y);
            if (dist < 40) {
                this.score += 5;
                this.items.splice(index, 1);
                this.updateUI();
                // Add sparkle particles (using base particle system if available)
                if (this.createSplash) this.createSplash(item.x, item.y, '#FFD700');
            }

            if (item.x < -100) {
                this.items.splice(index, 1);
            }
        });

        // 5. Update Particles (inherited or local)
        if (this.particles) {
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1;
                p.life -= 0.02;
            });
            this.particles = this.particles.filter(p => p.life > 0);
        }
    }

    spawnObstacle() {
        const gapSize = 220; // Increased gap size
        const minGapY = 50;
        const maxGapY = this.gameCanvas.height - gapSize - 50;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

        this.obstacles.push({
            x: this.gameCanvas.width,
            gapY: gapY,
            gapSize: gapSize,
            width: 80,
            passed: false
        });

        // Spawn item occasionally
        if (Math.random() > 0.6) {
            this.items.push({
                x: this.gameCanvas.width + 100,
                y: gapY + gapSize / 2,
                emoji: ['🍎', '🍌', '🍒', '🥕', '🥦', '🍓'][Math.floor(Math.random() * 6)],
                yOffset: 0
            });
        }
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
        this.isGameOver = true;
        this.bird.emoji = '💥';

        // Show overlay
        document.getElementById('ff-final-score').textContent = this.score;
        document.getElementById('ff-game-over').classList.remove('hidden');

        this.stop(); // Stop game loop
    }

    draw() {
        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Draw sky background
        const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.gameCanvas.height);
        skyGrad.addColorStop(0, '#B3E5FC');
        skyGrad.addColorStop(1, '#E1F5FE');
        this.ctx.fillStyle = skyGrad;
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Draw clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.backgrounds.forEach(bg => {
            this.ctx.font = `${bg.size}px Arial`;
            this.ctx.fillText('☁️', bg.x, bg.y);
        });

        // Draw obstacles (Trees)
        this.obstacles.forEach(obs => this.drawTree(obs));

        // Draw Items
        this.ctx.font = '35px Arial';
        this.items.forEach(item => {
            this.ctx.fillText(item.emoji, item.x, item.y + item.yOffset);
        });

        // Draw bird
        this.ctx.font = '50px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.save();
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
        this.ctx.fillText(this.bird.emoji, this.bird.x, this.bird.y);
        this.ctx.restore();

        // Draw Splash Particles
        if (this.particles) {
            this.particles.forEach(p => {
                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                this.ctx.fill();
            });
            this.ctx.globalAlpha = 1.0;
        }
    }

    drawTree(obs) {
        this.ctx.save();

        // 1. Trunk
        this.ctx.fillStyle = '#795548';
        // Top trunk
        this.ctx.fillRect(obs.x + 20, 0, obs.width - 40, obs.gapY);
        // Bottom trunk
        this.ctx.fillRect(obs.x + 20, obs.gapY + obs.gapSize, obs.width - 40, this.gameCanvas.height);

        // 2. Leaf Clusters (Animated)
        const wobble = Math.sin(this.leafWobble) * 5;
        this.ctx.fillStyle = '#4CAF50';

        // Top Cluster
        this.drawLeafCluster(obs.x + obs.width / 2 + wobble, obs.gapY - 10, obs.width + 20);
        // Bottom Cluster
        this.drawLeafCluster(obs.x + obs.width / 2 - wobble, obs.gapY + obs.gapSize + 10, obs.width + 20);

        this.ctx.restore();
    }

    drawLeafCluster(x, y, width) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, width / 2, 0, Math.PI * 2);
        this.ctx.arc(x - 20, y, width / 3, 0, Math.PI * 2);
        this.ctx.arc(x + 20, y, width / 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Highlights
        this.ctx.fillStyle = '#81C784';
        this.ctx.beginPath();
        this.ctx.arc(x - 10, y - 10, width / 5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    createSplash(x, y, color) {
        if (!this.particles) this.particles = [];
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color,
                life: 1.0
            });
        }
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

    stop() {
        super.stop();
        // Ensure overlay is hidden if exiting mid-game
        document.getElementById('ff-game-over').classList.add('hidden');
        this.bird.emoji = '🐦';
    }
}

// Export for global scope
window.FeatherFlyerActivity = FeatherFlyerActivity;
