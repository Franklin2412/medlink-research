/**
 * Game: Space Racer
 * Objective: Steer the rocket to avoid asteroids.
 * Mechanics: Vertical scrolling, X-axis control, collision detection.
 */

class SpaceRacerGame {
    constructor(canvas, callbacks) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.callbacks = callbacks;
        this.isRunning = false;

        // Game State
        this.score = 0;
        this.level = 1;
        this.speed = 3;
        this.player = { x: canvas.width / 2, y: 0, width: 40, height: 60 };
        this.asteroids = [];
        this.stars = [];
        this.lastObstacleTime = 0;
        this.obstacleInterval = 1500; // ms

        // Bind methods
        this.update = this.update.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    start() {
        console.log("[SpaceRacer] Starting game loop");
        this.isRunning = true;
        this.score = 0;
        this.level = 1;
        this.speed = 2; // Slower constant speed for kids
        this.asteroids = [];
        this.callbacks.onScore(0);
        this.callbacks.onLevel(1);

        // Setup Player Position (Bottom Center)
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 100;

        // Ensure spawnRate is set
        this.spawnRate = 0.02;

        // Initialize Stars
        this.stars = [];
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 0.5
            });
        }

        // Add Input Listener
        this.canvas.addEventListener('mousemove', this.handleInput);

        // Start Loop
        this.lastTime = Date.now();
        requestAnimationFrame(this.update);
    }

    stop() {
        console.log("[SpaceRacer] Stopping game loop");
        this.isRunning = false;
        this.canvas.removeEventListener('mousemove', this.handleInput);
    }

    handleInput(e) {
        if (!this.isRunning) return;
        const rect = this.canvas.getBoundingClientRect();
        this.player.x = e.clientX - rect.left;

        // Clamp to screen
        this.player.x = Math.max(20, Math.min(this.canvas.width - 20, this.player.x));
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
                x: Math.random() * (this.canvas.width - 40) + 20,
                y: -50,
                radius: 20,
                label: type.emoji
            });
        }
    }

    update() {
        if (!this.isRunning) return;

        const now = Date.now();
        const dt = (now - this.lastTime) / 16; // Normalized delta time
        this.lastTime = now;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Background (Stars)
        this.ctx.fillStyle = "#FFFFFF";
        this.stars.forEach(star => {
            star.y += star.speed * dt;
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
            this.ctx.globalAlpha = Math.random() * 0.5 + 0.5; // Twinkle
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;

        // 2. Spawn Asteroids (Funny Obstacles)
        this.spawnAsteroid();

        // 3. Update & Draw Asteroids
        this.ctx.font = '40px serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const a = this.asteroids[i];
            a.y += this.speed * dt;

            // Draw Emoji
            this.ctx.fillText(a.label, a.x, a.y);

            // Collision Check (Simple distance check)
            const dx = a.x - this.player.x;
            const dy = a.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 40) { // Emoji size approximation
                this.gameOver();
                return;
            }

            // Cleanup
            if (a.y > this.canvas.height + 50) {
                this.asteroids.splice(i, 1);
                this.score += 1;
                this.callbacks.onScore(this.score);
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
        this.ctx.lineTo(0, 50 + Math.random() * 10);
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

        // Fins
        this.ctx.fillStyle = "#7209B7"; // Purple
        this.ctx.beginPath();
        this.ctx.moveTo(-15, 10);
        this.ctx.lineTo(-25, 30);
        this.ctx.lineTo(-10, 25);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(15, 10);
        this.ctx.lineTo(25, 30);
        this.ctx.lineTo(10, 25);
        this.ctx.fill();

        this.ctx.restore();
    }

    checkLevel() {
        if (this.score > 0 && this.score % 20 === 0) {
            this.level++;
            this.spawnRate = Math.min(0.05, this.spawnRate + 0.005);
            this.callbacks.onLevel(this.level);
        }
    }

    gameOver() {
        this.isRunning = false;
        this.callbacks.onGameOver(`You dodged cosmic snacks and scored ${this.score}!`, "Mission Complete");
    }
}

window.SpaceRacerGame = SpaceRacerGame;
