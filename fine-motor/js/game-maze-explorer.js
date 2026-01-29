class MazeExplorerGame extends BaseActivity {
    constructor(detector, gameCanvas, callbacks = {}) {
        super(detector, gameCanvas);
        this.callbacks = callbacks;
        this.gridSize = 15;
        this.grid = [];
        this.cellSize = 0;
        this.startPos = { r: 0, c: 0 };
        this.goalPos = { r: 14, c: 14 };
        this.playerPos = { x: 0, y: 0 };
        this.targetPos = { x: 0, y: 0 };
        this.isResetting = false;

        this.colors = {
            wall: '#2D3436',
            path: '#F5F6FA',
            start: '#00B894',
            goal: '#D63031',
            player: '#0984E3'
        };
    }

    start() {
        this.generateMaze();
        this.resetPlayer();
        super.start();
    }

    generateMaze() {
        // Initialize grid (all walls)
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
                // Remove wall between current and next
                this.grid[(current.r + next.r) / 2][(current.c + next.c) / 2] = 0;
                this.grid[next.r][next.c] = 0;
                stack.push(next);
            } else {
                stack.pop();
            }
        }

        // Ensure start and goal are clear
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

            // Smooth movement
            const alpha = 0.2;
            this.targetPos.x = alpha * rawX + (1 - alpha) * this.targetPos.x;
            this.targetPos.y = alpha * rawY + (1 - alpha) * this.targetPos.y;

            // Check Collision
            if (this.checkWallCollision(this.targetPos.x, this.targetPos.y)) {
                this.handleCollision();
            } else {
                this.playerPos = { ...this.targetPos };
            }

            // Check Win
            if (this.checkGoalReached()) {
                this.levelComplete();
            }
        }
    }

    checkWallCollision(x, y) {
        const r = Math.floor(y / this.cellSize);
        const c = Math.floor(x / this.cellSize);

        if (r < 0 || r >= this.gridSize || c < 0 || c >= this.gridSize) return true;
        return this.grid[r][c] === 1;
    }

    handleCollision() {
        this.isResetting = true;
        // Visual shake or flash could go here
        setTimeout(() => {
            this.resetPlayer();
        }, 500);
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

        // Draw Walls and Paths
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                this.ctx.fillStyle = this.grid[r][c] === 1 ? this.colors.wall : this.colors.path;
                this.ctx.fillRect(c * this.cellSize, r * this.cellSize, this.cellSize + 1, this.cellSize + 1);
            }
        }

        // Draw Goal
        const goalX = (this.goalPos.c + 0.5) * this.cellSize;
        const goalY = (this.goalPos.r + 0.5) * this.cellSize;
        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.1;
        this.ctx.fillStyle = this.colors.goal;
        this.ctx.beginPath();
        this.ctx.arc(goalX, goalY, (this.cellSize * 0.3) * pulse, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw Player
        this.ctx.fillStyle = this.colors.player;
        this.ctx.beginPath();
        this.ctx.arc(this.playerPos.x, this.playerPos.y, this.cellSize * 0.25, 0, Math.PI * 2);
        this.ctx.fill();

        // Add a small glow to player
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.colors.player;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    getInfoHTML() {
        return `
            <div class="stat">
                <span class="stat-label">Mazes Solved</span>
                <span class="stat-value">${Math.floor(this.score / 100)}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Time</span>
                <span class="stat-value">${this.formatTime(this.time)}</span>
            </div>
        `;
    }
}

window.MazeExplorerGame = MazeExplorerGame;
