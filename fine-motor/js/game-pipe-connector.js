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

        this.isShowingMotivation = false;
        this.motivationMessage = "";
        this.motivationMessages = [
            "Fantastic!", "Keep it up!", "You're a Star!", "Amazing!",
            "Great job!", "Marvelous!", "Well done!", "Superb!",
            "Excellent!", "Brilliant!"
        ];

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
            this.currentLevelPoints = [
                { x: 100, y: safeH / 4 },
                { x: safeW / 2, y: safeH / 4 },
                { x: safeW / 2, y: safeH * 0.75 },
                { x: safeW - 100, y: safeH * 0.75 }
            ];
        } else {
            // Procedural Infinite Generation
            this.currentLevelPoints = [{ x: 100, y: safeH / 2 }];

            // Complexity grows every 4 levels
            const segments = Math.min(6, Math.floor(lvl / 4) + 2);
            for (let i = 0; i < segments; i++) {
                this.currentLevelPoints.push({
                    x: (safeW / (segments + 1)) * (i + 1),
                    y: 150 + Math.random() * (safeH - 300)
                });
            }
            this.currentLevelPoints.push({ x: safeW - 100, y: safeH / 2 });
        }

        this.startPoint = this.currentLevelPoints[0];
        this.endPoint = this.currentLevelPoints[this.currentLevelPoints.length - 1];

        // Tolerant radius scaling, floor at 30px
        this.pathRadius = Math.max(30, 60 - (Math.floor(lvl / 2) * 2));
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
        if (hands && hands.length > 0 && !this.isShowingMotivation) {
            const indexTip = hands[0].landmarks[8];
            const targetX = (1 - indexTip.x) * this.gameCanvas.width; // Mirrored
            const targetY = indexTip.y * this.gameCanvas.height;

            const alpha = 0.2; // Smoothing
            this.cursor.x = alpha * targetX + (1 - alpha) * this.cursor.x;
            this.cursor.y = alpha * targetY + (1 - alpha) * this.cursor.y;
        }

        this.ctx.fillStyle = "#0B0E14"; // Deep space black
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // 1. Draw Pipe Layout (Charming Metallic Style)
        this.ctx.save();
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Outer Glow/Border
        this.ctx.lineWidth = this.pathRadius * 2 + 10;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.beginPath();
        this.ctx.moveTo(this.currentLevelPoints[0].x, this.currentLevelPoints[0].y);
        for (let i = 1; i < this.currentLevelPoints.length; i++) {
            this.ctx.lineTo(this.currentLevelPoints[i].x, this.currentLevelPoints[i].y);
        }
        this.ctx.stroke();

        // Main Pipe Body (Gradient)
        this.ctx.lineWidth = this.pathRadius * 2;
        this.ctx.strokeStyle = '#2D3436';
        this.ctx.beginPath();
        this.ctx.moveTo(this.currentLevelPoints[0].x, this.currentLevelPoints[0].y);
        for (let i = 1; i < this.currentLevelPoints.length; i++) {
            this.ctx.lineTo(this.currentLevelPoints[i].x, this.currentLevelPoints[i].y);
        }
        this.ctx.stroke();
        this.ctx.restore();

        // 2. Draw Start & End Zones (Charming Pulsing Style)
        const time = Date.now() / 1000;

        // Start Zone
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#4ECDC4';
        this.ctx.beginPath();
        this.ctx.arc(this.startPoint.x, this.startPoint.y, this.pathRadius * 0.85, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 18px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("START", this.startPoint.x, this.startPoint.y + 7);

        // Goal Zone (Fast pulse if painting and near)
        const dEnd = Math.hypot(this.cursor.x - this.endPoint.x, this.cursor.y - this.endPoint.y);
        const nearGoal = this.isPainting && dEnd < this.pathRadius * 2;
        const pulse = Math.sin(time * (nearGoal ? 10 : 3)) * 5;

        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.shadowBlur = 20 + pulse;
        this.ctx.shadowColor = '#FF6B6B';
        this.ctx.beginPath();
        this.ctx.arc(this.endPoint.x, this.endPoint.y, (this.pathRadius * 0.85) + pulse, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

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

        if (!this.isShowingMotivation) {
            this.ctx.save();
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = this.isPainting ? '#FFE66D' : '#fff';
            this.ctx.fillStyle = this.isPainting ? '#FFE66D' : '#fff';
            this.ctx.beginPath();
            this.ctx.arc(this.cursor.x, this.cursor.y, 14, 0, Math.PI * 2);
            this.ctx.fill();

            if (this.isPainting && Math.random() > 0.5) {
                this.ctx.fillStyle = `rgba(255, 230, 109, ${Math.random()})`;
                this.ctx.beginPath();
                this.ctx.arc(this.cursor.x + (Math.random() - 0.5) * 30, this.cursor.y + (Math.random() - 0.5) * 30, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
        }

        // 6. Draw Motivation Overlay
        if (this.isShowingMotivation) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

            this.ctx.save();
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#FFE66D';
            this.ctx.font = 'bold 60px Poppins';
            this.ctx.fillStyle = '#FFE66D';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.motivationMessage, this.gameCanvas.width / 2, this.gameCanvas.height / 2);

            this.ctx.font = '24px Poppins';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText("Let's try another maze!", this.gameCanvas.width / 2, this.gameCanvas.height / 2 + 50);
            this.ctx.restore();
        }
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

        // Visual feedback & Motivation
        this.isShowingMotivation = true;
        this.motivationMessage = this.motivationMessages[Math.floor(Math.random() * this.motivationMessages.length)];

        setTimeout(() => {
            if (this.isRunning) {
                this.isShowingMotivation = false;
                this.loadLevel(this.level);
            }
        }, 2500); // 2.5 second pause for motivation
    }
}

window.PipeConnectorGame = PipeConnectorGame;
