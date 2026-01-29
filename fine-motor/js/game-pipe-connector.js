class PipeConnectorGame extends BaseActivity {
    constructor(canvas, callbacks) {
        super({ videoElement: {} }, canvas);
        this.callbacks = callbacks;
        this.isRunning = false;

        this.level = 1;
        this.pathRadius = 45; // Broad path for tolerance
        this.cursor = { x: canvas.width / 2, y: canvas.height / 2 };
        this.isPainting = false;
        this.userTrail = [];
        this.startPoint = { x: 50, y: 50 };
        this.endPoint = { x: 0, y: 0 };

        this.currentLevelPoints = [];

        this.update = this.update.bind(this);
    }

    start() {
        super.start();
        this.isRunning = true;
        this.level = 1;
        this.loadLevel(1);

        if (this.callbacks.onScore) this.callbacks.onScore(0);
        if (this.callbacks.onLevel) this.callbacks.onLevel(1);
    }

    stop() {
        this.isRunning = false;
        super.stop();
        this.saveStats('pipeconnector', { level: this.level });
    }

    loadLevel(lvl) {
        this.level = lvl;
        const safeW = this.gameCanvas.width;
        const safeH = this.gameCanvas.height;

        if (lvl === 1) {
            this.currentLevelPoints = [{ x: 100, y: safeH / 2 }, { x: safeW - 100, y: safeH / 2 }];
        } else if (lvl === 2) {
            this.currentLevelPoints = [{ x: 100, y: safeH / 4 }, { x: safeW / 2, y: safeH / 4 }, { x: safeW / 2, y: safeH * 0.75 }, { x: safeW - 100, y: safeH * 0.75 }];
        } else {
            this.currentLevelPoints = [{ x: 100, y: safeH / 2 }];
            for (let i = 0; i < 2; i++) {
                this.currentLevelPoints.push({
                    x: (safeW / 3) * (i + 1),
                    y: Math.random() * (safeH - 200) + 100
                });
            }
            this.currentLevelPoints.push({ x: safeW - 100, y: safeH / 2 });
        }

        this.startPoint = this.currentLevelPoints[0];
        this.endPoint = this.currentLevelPoints[this.currentLevelPoints.length - 1];

        // Tolerant radius scaling
        this.pathRadius = Math.max(35, 60 - (lvl * 3));
        this.resetTrial();
    }

    resetTrial() {
        this.isPainting = false;
        this.userTrail = [];
    }

    update() {
        if (!this.isRunning) return;

        super.update();

        // 1. Hand Tracking (Direct)
        const hands = this.detector.getDetectedHands();
        if (hands && hands.length > 0) {
            const indexTip = hands[0].landmarks[8];
            const targetX = (1 - indexTip.x) * this.gameCanvas.width; // Mirrored
            const targetY = indexTip.y * this.gameCanvas.height;

            const alpha = 0.2; // Smoothing
            this.cursor.x = alpha * targetX + (1 - alpha) * this.cursor.x;
            this.cursor.y = alpha * targetY + (1 - alpha) * this.cursor.y;
        }

        this.ctx.fillStyle = "#0B0E14"; // Deep space black
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // 1. Draw Pipe
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = this.pathRadius * 2;
        this.ctx.strokeStyle = '#2D3436';

        this.ctx.beginPath();
        this.ctx.moveTo(this.currentLevelPoints[0].x, this.currentLevelPoints[0].y);
        for (let i = 1; i < this.currentLevelPoints.length; i++) {
            this.ctx.lineTo(this.currentLevelPoints[i].x, this.currentLevelPoints[i].y);
        }
        this.ctx.stroke();

        // 2. Draw Start & End Zones
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.beginPath();
        this.ctx.arc(this.startPoint.x, this.startPoint.y, this.pathRadius * 0.8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 20px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("START", this.startPoint.x, this.startPoint.y + 7);

        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.beginPath();
        this.ctx.arc(this.endPoint.x, this.endPoint.y, this.pathRadius * 0.8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText("GOAL", this.endPoint.x, this.endPoint.y + 7);

        // 3. Logic
        const dStart = Math.hypot(this.cursor.x - this.startPoint.x, this.cursor.y - this.startPoint.y);
        if (dStart < this.pathRadius && !this.isPainting) {
            this.isPainting = true;
            this.userTrail = [{ x: this.cursor.x, y: this.cursor.y }];
        }

        if (this.isPainting) {
            this.userTrail.push({ x: this.cursor.x, y: this.cursor.y });

            // Check Safety
            if (!this.checkSafety(this.cursor.x, this.cursor.y)) {
                this.resetTrial();
            }

            // Check Win
            const dEnd = Math.hypot(this.cursor.x - this.endPoint.x, this.cursor.y - this.endPoint.y);
            if (dEnd < this.pathRadius * 0.8) {
                this.levelComplete();
            }
        }

        // 4. Draw User Trail
        if (this.userTrail.length > 0) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#FFE66D';
            this.ctx.lineWidth = 12;
            this.ctx.moveTo(this.userTrail[0].x, this.userTrail[0].y);
            for (let i = 1; i < this.userTrail.length; i++) {
                this.ctx.lineTo(this.userTrail[i].x, this.userTrail[i].y);
            }
            this.ctx.stroke();
        }

        // 5. Draw Cursor (Wand/Brush)
        this.ctx.beginPath();
        this.ctx.fillStyle = this.isPainting ? '#FFE66D' : '#fff';
        this.ctx.arc(this.cursor.x, this.cursor.y, 10, 0, Math.PI * 2);
        this.ctx.fill();
    }

    checkSafety(x, y) {
        let safe = false;
        // Liberal check: add 10px virtual width
        const effectiveRadius = this.pathRadius + 10;

        for (let i = 0; i < this.currentLevelPoints.length - 1; i++) {
            const p1 = this.currentLevelPoints[i];
            const p2 = this.currentLevelPoints[i + 1];
            const dist = this.distToSegment(x, y, p1.x, p1.y, p2.x, p2.y);
            if (dist < effectiveRadius) {
                safe = true;
                break;
            }
        }

        if (Math.hypot(x - this.startPoint.x, y - this.startPoint.y) < effectiveRadius) safe = true;
        if (Math.hypot(x - this.endPoint.x, y - this.endPoint.y) < effectiveRadius) safe = true;

        return safe;
    }

    distToSegment(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq != 0) param = dot / len_sq;
        let xx, yy;
        if (param < 0) {
            xx = x1; yy = y1;
        } else if (param > 1) {
            xx = x2; yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    levelComplete() {
        this.score += 100;
        if (this.callbacks.onScore) this.callbacks.onScore(this.score);
        this.level++;
        if (this.callbacks.onLevel) this.callbacks.onLevel(this.level);

        if (this.level > 3) {
            if (this.callbacks.onGameOver) {
                this.callbacks.onGameOver("You navigated the maze! Steady hands!", "Maze Master");
            }
            this.stop();
        } else {
            this.loadLevel(this.level);
        }
    }
}

window.PipeConnectorGame = PipeConnectorGame;
