/**
 * Game: Pipe Connector (Maze/Steady Hand)
 * Objective: Draw a line from Start to End without touching the walls.
 * Mechanics: Collision detection (walls), "Pinch" to paint (optional, or auto-paint).
 */

class PipeConnectorGame {
    constructor(canvas, callbacks) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.callbacks = callbacks;
        this.isRunning = false;

        this.level = 1;
        this.pathRadius = 30; // Width of the pipe
        this.cursor = { x: 0, y: 0 };
        this.isPainting = false; // Is the user currently trying to solve?
        this.userTrail = [];
        this.startPoint = { x: 50, y: 50 };
        this.endPoint = { x: 0, y: 0 };

        // Level Defs (Simple waypoints)
        this.levels = [
            [{ x: 50, y: 200 }, { x: 800, y: 200 }], // Level 1: Straight line
            [{ x: 50, y: 100 }, { x: 400, y: 100 }, { x: 400, y: 300 }, { x: 800, y: 300 }], // Level 2: Steps
            [{ x: 50, y: 300 }, { x: 200, y: 100 }, { x: 600, y: 400 }, { x: 800, y: 200 }]  // Level 3: ZigZag
        ];

        this.currentLevelPoints = [];

        this.update = this.update.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    start() {
        this.isRunning = true;
        this.level = 1;
        this.loadLevel(1);

        this.canvas.addEventListener('mousemove', this.handleInput);
        this.callbacks.onScore(0);
        this.callbacks.onLevel(1);

        requestAnimationFrame(this.update);
    }

    stop() {
        this.isRunning = false;
        this.canvas.removeEventListener('mousemove', this.handleInput);
    }

    loadLevel(lvl) {
        this.level = lvl;
        // Defaults
        const safeW = this.canvas.width;
        const safeH = this.canvas.height;

        // Generate points based on screen size (responsive-ish)
        if (lvl === 1) {
            this.currentLevelPoints = [{ x: 50, y: safeH / 2 }, { x: safeW - 50, y: safeH / 2 }];
        } else if (lvl === 2) {
            this.currentLevelPoints = [{ x: 50, y: safeH / 3 }, { x: safeW / 2, y: safeH / 3 }, { x: safeW / 2, y: safeH * 0.75 }, { x: safeW - 50, y: safeH * 0.75 }];
        } else {
            // Random-ish curve for higher levels
            this.currentLevelPoints = [{ x: 50, y: safeH / 2 }];
            for (let i = 0; i < 3; i++) {
                this.currentLevelPoints.push({
                    x: (safeW / 4) * (i + 1),
                    y: Math.random() * (safeH - 100) + 50
                });
            }
            this.currentLevelPoints.push({ x: safeW - 50, y: safeH / 2 });
        }

        this.startPoint = this.currentLevelPoints[0];
        this.endPoint = this.currentLevelPoints[this.currentLevelPoints.length - 1];

        this.pathRadius = Math.max(20, 50 - (lvl * 5)); // Get narrower as we go
        this.resetTrial();
    }

    resetTrial() {
        this.isPainting = false;
        this.userTrail = [];
    }

    handleInput(e) {
        if (!this.isRunning) return;
        const rect = this.canvas.getBoundingClientRect();
        this.cursor.x = e.clientX - rect.left;
        this.cursor.y = e.clientY - rect.top;
    }

    update() {
        if (!this.isRunning) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Pipe (The Safety Zone)
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = this.pathRadius * 2;
        this.ctx.strokeStyle = '#333'; // Outer wall

        this.ctx.beginPath();
        this.ctx.moveTo(this.currentLevelPoints[0].x, this.currentLevelPoints[0].y);
        for (let i = 1; i < this.currentLevelPoints.length; i++) {
            this.ctx.lineTo(this.currentLevelPoints[i].x, this.currentLevelPoints[i].y);
        }
        this.ctx.stroke();

        // Inner Pipe
        this.ctx.lineWidth = (this.pathRadius * 2) - 4;
        this.ctx.strokeStyle = '#2D3436'; // Inner path color (dark grey)
        this.ctx.stroke();

        // 2. Draw Start & End Zones
        this.ctx.fillStyle = '#4ECDC4'; // Start Green
        this.ctx.beginPath();
        this.ctx.arc(this.startPoint.x, this.startPoint.y, this.pathRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText("START", this.startPoint.x - 20, this.startPoint.y + 5);

        this.ctx.fillStyle = '#FF6B6B'; // End Red
        this.ctx.beginPath();
        this.ctx.arc(this.endPoint.x, this.endPoint.y, this.pathRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText("END", this.endPoint.x - 15, this.endPoint.y + 5);

        // 3. Logic

        // Check if cursor is on start point to begin
        const dStart = Math.hypot(this.cursor.x - this.startPoint.x, this.cursor.y - this.startPoint.y);
        if (dStart < this.pathRadius && !this.isPainting) {
            this.isPainting = true;
            this.userTrail = [{ x: this.cursor.x, y: this.cursor.y }];
        }

        if (this.isPainting) {
            this.userTrail.push({ x: this.cursor.x, y: this.cursor.y });

            // Check Collision with Walls
            // Simple approach: Check distance to nearest segment
            if (!this.checkSafety(this.cursor.x, this.cursor.y)) {
                // Failed!
                this.resetTrial();
                // Visual feedback? Shake screen?
            }

            // Check Win
            const dEnd = Math.hypot(this.cursor.x - this.endPoint.x, this.cursor.y - this.endPoint.y);
            if (dEnd < this.pathRadius) {
                this.levelComplete();
            }
        }

        // 4. Draw User Trail
        if (this.userTrail.length > 0) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#FFE66D';
            this.ctx.lineWidth = 10;
            this.ctx.moveTo(this.userTrail[0].x, this.userTrail[0].y);
            for (let i = 1; i < this.userTrail.length; i++) {
                this.ctx.lineTo(this.userTrail[i].x, this.userTrail[i].y);
            }
            this.ctx.stroke();
        }

        // 5. Draw Cursor
        this.ctx.beginPath();
        this.ctx.fillStyle = this.isPainting ? '#FFE66D' : '#fff';
        this.ctx.arc(this.cursor.x, this.cursor.y, 8, 0, Math.PI * 2);
        this.ctx.fill();

        requestAnimationFrame(this.update);
    }

    checkSafety(x, y) {
        // Return true if point (x,y) is inside the pipe
        // We check distance to every segment of the pipe
        let safe = false;

        for (let i = 0; i < this.currentLevelPoints.length - 1; i++) {
            const p1 = this.currentLevelPoints[i];
            const p2 = this.currentLevelPoints[i + 1];
            const dist = this.distToSegment(x, y, p1.x, p1.y, p2.x, p2.y);
            if (dist < this.pathRadius) {
                safe = true;
                break;
            }
        }

        // Also allow being in start/end circles
        if (Math.hypot(x - this.startPoint.x, y - this.startPoint.y) < this.pathRadius) safe = true;
        if (Math.hypot(x - this.endPoint.x, y - this.endPoint.y) < this.pathRadius) safe = true;

        return safe;
    }

    // Helper: Distance from point to line segment
    distToSegment(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq != 0) // in case of 0 length line
            param = dot / len_sq;

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    levelComplete() {
        this.callbacks.onScore(this.level * 100);
        this.level++;
        this.callbacks.onLevel(this.level);
        this.loadLevel(this.level);
    }
}

window.PipeConnectorGame = PipeConnectorGame;
