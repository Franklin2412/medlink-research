/**
 * Game: Space Racer
 * Objective: Steer the rocket to avoid asteroids.
 * Mechanics: Vertical scrolling, X-axis control, collision detection.
 */

class SpaceRacerGame extends BaseActivity {
    constructor(canvas, callbacks) {
        super({ videoElement: {} }, canvas); // Dummy detector placeholder, will be updated in transferCamera
        this.callbacks = callbacks;
        this.isRunning = false;

        // Game State
        this.speed = 1.5; // Very slow for tolerance
        this.player = { x: canvas.width / 2, y: 0, width: 40, height: 60 };
        this.asteroids = [];
        this.stars = [];
        this.spawnRate = 0.015; // Lower spawn rate

        // Bind methods
        this.update = this.update.bind(this);
    }

    start() {
        console.log("[SpaceRacer] Starting game loop");
        super.start();
        this.isRunning = true;
        this.score = 0;
        this.level = 1;
        this.asteroids = [];
        this.spawnTimer = 0;
        this.spawnRateLimit = 45; // Minimum frames between spawns

        // Setup Player Position (Bottom Center)
        this.player.x = this.gameCanvas.width / 2;
        this.player.y = this.gameCanvas.height - 100;

        // Initialize Stars
        this.stars = [];
        for (let i = 0; i < 30; i++) {
            this.stars.push({
                x: Math.random() * this.gameCanvas.width,
                y: Math.random() * this.gameCanvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 1
            });
        }

        this.lastTime = Date.now();
    }

    stop() {
        console.log("[SpaceRacer] Stopping game loop");
        this.isRunning = false;
        super.stop();
        // Save stats to unified storage
        this.saveStats('spaceracer', { level: this.level });
    }

    spawnAsteroid() {
        const types = [
            { emoji: '🕷️' }, { emoji: '👻' }, { emoji: '🦇' },
            { emoji: '🧟' }, { emoji: '💀' }, { emoji: '🕸️' }
        ];
        const type = types[Math.floor(Math.random() * types.length)];

        this.asteroids.push({
            x: Math.random() * (this.gameCanvas.width - 60) + 30,
            y: -50,
            label: type.emoji
        });
    }

    update() {
        if (!this.isRunning) return;

        super.update(); // Updates timer and UI

        const now = Date.now();
        const dt = (now - this.lastTime) / 33.3; // Normalized to 30fps
        this.lastTime = now;

        // 1. Hand Tracking (Direct)
        const hands = this.detector.getDetectedHands();
        if (hands && hands.length > 0) {
            const indexTip = hands[0].landmarks[8];
            const targetX = (1 - indexTip.x) * this.gameCanvas.width; // Mirrored
            const alpha = 0.2; // Smoothing
            this.player.x = alpha * targetX + (1 - alpha) * this.player.x;
        }
        // Clamp to screen
        this.player.x = Math.max(40, Math.min(this.gameCanvas.width - 40, this.player.x));

        this.ctx.fillStyle = "#0B0E14"; // Deep space black
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // 2. Draw Background (Stars)
        this.ctx.fillStyle = "#FFFFFF";
        this.stars.forEach(star => {
            star.y += star.speed * dt;
            if (star.y > this.gameCanvas.height) {
                star.y = 0;
                star.x = Math.random() * this.gameCanvas.width;
            }
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // 3. Spawn Asteroids (Paced: One every ~2.5 seconds)
        this.spawnTimer++;
        if (this.spawnTimer > 80) {
            this.spawnAsteroid();
            this.spawnTimer = 0;
        }

        // 4. Update & Draw Asteroids
        this.ctx.font = '40px serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const a = this.asteroids[i];
            a.y += (this.speed + (this.level * 0.2)) * dt;

            // Draw Emoji
            this.ctx.fillText(a.label, a.x, a.y);

            // Collision Check (Forgiving circle)
            const dx = a.x - this.player.x;
            const dy = a.y - this.player.y;
            const distance = Math.hypot(dx, dy);

            if (distance < 35) {
                this.gameOver();
                return;
            }

            // Cleanup
            if (a.y > this.gameCanvas.height + 50) {
                this.asteroids.splice(i, 1);
                this.score += 1;
                if (this.callbacks.onScore) this.callbacks.onScore(this.score);
                this.checkLevel();
            }
        }

        // 5. Draw Player (Rocket)
        this.drawRocket(this.player.x, this.player.y);
    }

    drawRocket(x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);

        // Flames
        this.ctx.fillStyle = `rgba(255, 100, 0, ${Math.random()})`;
        this.ctx.beginPath();
        this.ctx.moveTo(-10, 30);
        this.ctx.lineTo(0, 45);
        this.ctx.lineTo(10, 30);
        this.ctx.fill();

        // Body
        this.ctx.fillStyle = "#F72585"; // Bright Pink
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 15, 30, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Window
        this.ctx.fillStyle = "#4CC9F0"; // Cyan
        this.ctx.beginPath();
        this.ctx.arc(0, -5, 8, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    checkLevel() {
        if (this.score > 0 && this.score % 20 === 0) {
            this.level++;
            this.speed = Math.min(3, this.speed + 0.1);
            if (this.callbacks.onLevel) this.callbacks.onLevel(this.level);
        }
    }

    gameOver() {
        this.isRunning = false;
        const msg = `You dodged the creepy monsters and scored ${this.score}!`;
        if (this.callbacks.onGameOver) this.callbacks.onGameOver(msg, "Mission Complete");
        this.stop();
    }
}

window.SpaceRacerGame = SpaceRacerGame;
