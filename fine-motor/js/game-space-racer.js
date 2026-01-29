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
        this.handleInput = this.handleInput.bind(this);
    }

    start() {
        console.log("[SpaceRacer] Starting game loop");
        super.start();
        this.isRunning = true;
        this.score = 0;
        this.level = 1;
        this.asteroids = [];

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
                speed: Math.random() * 1 + 0.5
            });
        }

        // Add Input Listener
        this.gameCanvas.addEventListener('mousemove', this.handleInput);

        // Game loop is handled by requestAnimationFrame in update() which we call once
        this.lastTime = Date.now();
        requestAnimationFrame(this.update);
    }

    stop() {
        console.log("[SpaceRacer] Stopping game loop");
        this.isRunning = false;
        this.gameCanvas.removeEventListener('mousemove', this.handleInput);
        super.stop();
        // Save stats to unified storage
        this.saveStats('spaceracer', { level: this.level });
    }

    handleInput(e) {
        if (!this.isRunning) return;
        const rect = this.gameCanvas.getBoundingClientRect();
        this.player.x = e.clientX - rect.left;

        // Clamp to screen
        this.player.x = Math.max(20, Math.min(this.gameCanvas.width - 20, this.player.x));
    }

    spawnAsteroid() {
        if (Math.random() < this.spawnRate) {
            const types = [
                { emoji: '🕷️', name: 'Spider' },
                { emoji: '👻', name: 'Ghost' },
                { emoji: '🦇', name: 'Bat' },
                { emoji: '🧟', name: 'Zombie' },
                { emoji: '💀', name: 'Skull' },
                { emoji: '🕸️', name: 'Spider Web' }
            ];
            const type = types[Math.floor(Math.random() * types.length)];

            this.asteroids.push({
                x: Math.random() * (this.gameCanvas.width - 40) + 20,
                y: -50,
                radius: 12, // Reduced hitbox for tolerance (previously 20)
                label: type.emoji
            });
        }
    }

    update() {
        if (!this.isRunning) return;

        const now = Date.now();
        const dt = (now - this.lastTime) / 16; // Normalized delta time
        this.lastTime = now;

        this.ctx.fillStyle = "#0B0E14"; // Deep space black
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // 1. Draw Background (Stars)
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

        // 2. Spawn Asteroids
        this.spawnAsteroid();

        // 3. Update & Draw Asteroids
        this.ctx.font = '40px serif';
        this.ctx.textAlign = 'center';

        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const a = this.asteroids[i];
            a.y += this.speed * dt;

            // Draw Emoji
            this.ctx.fillText(a.label, a.x, a.y);

            // Collision Check (Tolerant: very small effective radius)
            const dx = a.x - this.player.x;
            const dy = a.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 25) { // Very forgiving collision (previously 40)
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

        // 4. Draw Player (Rocket)
        this.drawRocket(this.player.x, this.player.y);

        requestAnimationFrame(this.update);
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
