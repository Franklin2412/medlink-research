class MazeExplorerGame extends BaseActivity {
    constructor(detector, gameCanvas, callbacks = {}) {
        super(detector, gameCanvas);
        this.callbacks = callbacks;
        this.gridSize = 13; // Slightly larger cells for kids
        this.grid = [];
        this.cellSize = 0;
        this.startPos = { r: 0, c: 0 };
        this.goalPos = { r: 12, c: 12 };
        this.playerPos = { x: 0, y: 0 };
        this.targetPos = { x: 0, y: 0 };
        this.isResetting = false;
        this.particles = [];
        this.handPos = { x: 0, y: 0 }; // Actual hand position for the pointer

        this.colors = {
            wall: '#6AB04C',    // Vibrant Green
            path: '#F9CA24',    // Sunny Yellow
            player: '#EB4D4B',  // Pure Apple Red
            goal: '#F1C40F',    // Golden Yellow
            pointer: '#7ed6df'  // Sky Blue
        };
    }

    start() {
        this.generateMaze();
        this.resetPlayer();
        super.start();
    }

    generateMaze() {
        this.gridSize = 13;
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(1));
        this.cellSize = this.gameCanvas.width / this.gridSize;

        const stack = [];
        const start = { r: 0, c: 0 };
        this.grid[start.r][start.c] = 0;
        stack.push(start);

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(current.r, current.c);

            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.grid[(current.r + next.r) / 2][(current.c + next.c) / 2] = 0;
                this.grid[next.r][next.c] = 0;
                stack.push(next);
            } else {
                stack.pop();
            }
        }

        this.grid[0][0] = 0;
        this.grid[this.gridSize - 1][this.gridSize - 1] = 0;
        this.startPos = { r: 0, c: 0 };
        this.goalPos = { r: this.gridSize - 1, c: this.gridSize - 1 };
    }

    getUnvisitedNeighbors(r, c) {
        const neighbors = [];
        const dirs = [
            { r: -2, c: 0 }, { r: 2, c: 0 },
            { r: 0, c: -2 }, { r: 0, c: 2 }
        ];

        dirs.forEach(d => {
            const nr = r + d.r;
            const nc = c + d.c;
            if (nr >= 0 && nr < this.gridSize && nc >= 0 && nc < this.gridSize && this.grid[nr][nc] === 1) {
                neighbors.push({ r: nr, c: nc });
            }
        });
        return neighbors;
    }

    resetPlayer() {
        this.playerPos = {
            x: (this.startPos.c + 0.5) * this.cellSize,
            y: (this.startPos.r + 0.5) * this.cellSize
        };
        this.targetPos = { ...this.playerPos };
        this.isResetting = false;
    }

    update() {
        if (this.isResetting) return;
        super.update();

        const hands = this.detector.getDetectedHands();
        if (hands.length > 0) {
            const indexTip = hands[0].landmarks[8];
            const rawX = (1 - indexTip.x) * this.gameCanvas.width;
            const rawY = indexTip.y * this.gameCanvas.height;

            this.handPos = { x: rawX, y: rawY };

            // Emit sparkles from hand pos
            if (Math.random() > 0.6) this.createSparkle(rawX, rawY);

            // Smooth movement for the runner character
            const alpha = 0.15;
            this.targetPos.x = alpha * rawX + (1 - alpha) * this.targetPos.x;
            this.targetPos.y = alpha * rawY + (1 - alpha) * this.targetPos.y;

            // Simple collision check - prevent entering walls
            if (this.checkWallCollision(this.targetPos.x, this.targetPos.y)) {
                this.handleCollision();
            } else {
                this.playerPos = { ...this.targetPos };
            }

            if (this.checkGoalReached()) {
                this.levelComplete();
            }
        }

        // Update sparkles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    createSparkle(x, y) {
        this.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 1.0,
            size: 2 + Math.random() * 4
        });
    }

    checkWallCollision(x, y) {
        const r = Math.floor(y / this.cellSize);
        const c = Math.floor(x / this.cellSize);
        if (r < 0 || r >= this.gridSize || c < 0 || c >= this.gridSize) return true;
        return this.grid[r][c] === 1;
    }

    handleCollision() {
        this.isResetting = true;
        setTimeout(() => this.resetPlayer(), 400);
    }

    checkGoalReached() {
        const dist = Math.hypot(this.playerPos.x - (this.goalPos.c + 0.5) * this.cellSize,
            this.playerPos.y - (this.goalPos.r + 0.5) * this.cellSize);
        return dist < this.cellSize * 0.4;
    }

    levelComplete() {
        this.score += 100;
        if (this.callbacks.onScore) this.callbacks.onScore(this.score);
        this.generateMaze();
        this.resetPlayer();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Draw Walls with Shadow
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = 'rgba(0,0,0,0.2)';
        this.ctx.shadowOffsetY = 4;

        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c] === 1) {
                    this.ctx.fillStyle = this.colors.wall;
                    this.ctx.fillRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);
                } else {
                    this.ctx.fillStyle = this.colors.path;
                    this.ctx.fillRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetY = 0;

        // Draw Trophy Goal
        this.drawTrophy((this.goalPos.c + 0.5) * this.cellSize, (this.goalPos.r + 0.5) * this.cellSize);

        // Draw Hero Runner
        this.drawHero(this.playerPos.x, this.playerPos.y);

        // Draw Hand Pointer & Sparkles
        this.particles.forEach(p => {
            this.ctx.fillStyle = `rgba(126, 214, 223, ${p.life})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.2;
        this.ctx.fillStyle = this.colors.pointer;
        this.ctx.beginPath();
        this.ctx.arc(this.handPos.x, this.handPos.y, 10 * pulse, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawTrophy(x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);
        const scale = (this.cellSize * 0.7) / 40;
        this.ctx.scale(scale, scale);

        const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.1;
        this.ctx.scale(pulse, pulse);

        this.ctx.fillStyle = this.colors.goal;
        // Cup
        this.ctx.beginPath();
        this.ctx.moveTo(-15, -15);
        this.ctx.lineTo(15, -15);
        this.ctx.lineTo(10, 5);
        this.ctx.lineTo(-10, 5);
        this.ctx.closePath();
        this.ctx.fill();
        // Handles
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = this.colors.goal;
        this.ctx.beginPath(); this.ctx.arc(-15, -5, 8, 0, Math.PI * 2); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.arc(15, -5, 8, 0, Math.PI * 2); this.ctx.stroke();
        // Base
        this.ctx.fillRect(-12, 5, 24, 5);
        this.ctx.fillRect(-8, 10, 16, 5);

        this.ctx.restore();
    }

    drawHero(x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);
        const size = this.cellSize * 0.4;

        // Character Body
        this.ctx.fillStyle = this.colors.player;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.fill();

        // Eyes
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(-size * 0.4, -size * 0.2, size * 0.25, 0, Math.PI * 2);
        this.ctx.arc(size * 0.4, -size * 0.2, size * 0.25, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(-size * 0.4, -size * 0.2, size * 0.1, 0, Math.PI * 2);
        this.ctx.arc(size * 0.4, -size * 0.2, size * 0.1, 0, Math.PI * 2);
        this.ctx.fill();

        // Smile
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, size * 0.2, size * 0.4, 0.2, Math.PI - 0.2);
        this.ctx.stroke();

        this.ctx.restore();
    }

    getInfoHTML() {
        return `
            <div class="stat">
                <span class="stat-label">Mazes Solved</span>
                <span class="stat-value">${Math.floor(this.score / 100)}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Hand Signal</span>
                <span class="stat-value">OK</span>
            </div>
        `;
    }
}

window.MazeExplorerGame = MazeExplorerGame;
