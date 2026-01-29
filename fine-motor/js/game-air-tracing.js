class AirTracingGame extends BaseActivity {
    constructor(canvas, callbacks) {
        super({ videoElement: {} }, canvas);
        this.callbacks = callbacks;
        this.isRunning = false;

        this.shapes = {
            // Basic Geometric
            'Square': [{ x: 0.3, y: 0.3 }, { x: 0.7, y: 0.3 }, { x: 0.7, y: 0.7 }, { x: 0.3, y: 0.7 }, { x: 0.3, y: 0.3 }],
            'Triangle': [{ x: 0.5, y: 0.2 }, { x: 0.8, y: 0.8 }, { x: 0.2, y: 0.8 }, { x: 0.5, y: 0.2 }],
            'Star': [
                { x: 0.5, y: 0.1 }, { x: 0.6, y: 0.4 }, { x: 0.9, y: 0.4 }, { x: 0.7, y: 0.6 },
                { x: 0.8, y: 0.9 }, { x: 0.5, y: 0.75 }, { x: 0.2, y: 0.9 }, { x: 0.3, y: 0.6 },
                { x: 0.1, y: 0.4 }, { x: 0.4, y: 0.4 }, { x: 0.5, y: 0.1 }
            ],
            // Numbers
            'Number 1': [{ x: 0.4, y: 0.2 }, { x: 0.5, y: 0.1 }, { x: 0.5, y: 0.9 }],
            'Number 2': [{ x: 0.3, y: 0.3 }, { x: 0.5, y: 0.1 }, { x: 0.7, y: 0.3 }, { x: 0.3, y: 0.8 }, { x: 0.7, y: 0.8 }],
            'Number 3': [{ x: 0.3, y: 0.2 }, { x: 0.7, y: 0.2 }, { x: 0.5, y: 0.5 }, { x: 0.7, y: 0.8 }, { x: 0.3, y: 0.8 }],
            'Number 7': [{ x: 0.3, y: 0.2 }, { x: 0.7, y: 0.2 }, { x: 0.4, y: 0.9 }],
            // Letters
            'Letter A': [{ x: 0.2, y: 0.9 }, { x: 0.5, y: 0.1 }, { x: 0.8, y: 0.9 }, { x: 0.5, y: 0.5 }, { x: 0.2, y: 0.5 }], // Cross bar hack for simplicity
            'Letter L': [{ x: 0.3, y: 0.1 }, { x: 0.3, y: 0.8 }, { x: 0.7, y: 0.8 }],
            'Letter V': [{ x: 0.2, y: 0.2 }, { x: 0.5, y: 0.9 }, { x: 0.8, y: 0.2 }],
            // Cartoon/Symbols
            'Heart': [
                { x: 0.5, y: 0.4 }, { x: 0.6, y: 0.2 }, { x: 0.8, y: 0.3 }, { x: 0.5, y: 0.9 },
                { x: 0.2, y: 0.3 }, { x: 0.4, y: 0.2 }, { x: 0.5, y: 0.4 }
            ],
            'Diamond': [{ x: 0.5, y: 0.1 }, { x: 0.8, y: 0.5 }, { x: 0.5, y: 0.9 }, { x: 0.2, y: 0.5 }, { x: 0.5, y: 0.1 }],
            'Cloud': [
                { x: 0.2, y: 0.6 }, { x: 0.3, y: 0.4 }, { x: 0.5, y: 0.3 }, { x: 0.7, y: 0.4 },
                { x: 0.8, y: 0.6 }, { x: 0.7, y: 0.8 }, { x: 0.3, y: 0.8 }, { x: 0.2, y: 0.6 }
            ]
        };

        this.currentShapeName = 'Square';
        this.pathPoints = [];
        this.userPath = [];
        this.nextPointIndex = 1;
        this.cursor = { x: canvas.width / 2, y: canvas.height / 2 };
        this.tolerance = 85;
        this.lockTolerance = 30; // Require closer hit for destination

        this.update = this.update.bind(this);
    }

    start() {
        super.start();
        this.isRunning = true;
        this.loadRandomShape(); // Start with a random shape
        if (this.callbacks.onScore) this.callbacks.onScore(0);
        if (this.callbacks.onLevel) this.callbacks.onLevel(1);
    }

    stop() {
        this.isRunning = false;
        super.stop();
        this.saveStats('airtracing', { shape: this.currentShapeName });
    }

    loadRandomShape() {
        const keys = Object.keys(this.shapes);
        let next;
        do {
            next = keys[Math.floor(Math.random() * keys.length)];
        } while (next === this.currentShapeName && keys.length > 1);

        this.loadShape(next);
    }

    loadShape(name) {
        this.currentShapeName = name;
        const normalized = this.shapes[name];
        this.pathPoints = normalized.map(p => ({
            x: p.x * this.gameCanvas.width,
            y: p.y * this.gameCanvas.height
        }));
        this.userPath = [];
        this.nextPointIndex = 1;
        this.userPath.push(this.pathPoints[0]);
    }

    update() {
        if (!this.isRunning) return;

        super.update();

        // 1. Hand Tracking (Slower, smoother response)
        const hands = this.detector.getDetectedHands();
        if (hands && hands.length > 0) {
            const indexTip = hands[0].landmarks[8];
            const targetX = (1 - indexTip.x) * this.gameCanvas.width;
            const targetY = indexTip.y * this.gameCanvas.height;

            const alpha = 0.12; // Slower response for stability
            this.cursor.x = alpha * targetX + (1 - alpha) * this.cursor.x;
            this.cursor.y = alpha * targetY + (1 - alpha) * this.cursor.y;
        }

        this.ctx.fillStyle = "#0B0E14"; // Deep space black
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // 1. Draw Target Path (Charming Neon Purple)
        this.ctx.strokeStyle = 'rgba(187, 134, 252, 0.3)';
        this.ctx.lineWidth = 18;
        this.ctx.setLineDash([15, 12]);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        if (this.pathPoints.length > 0) {
            this.ctx.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);
            for (let i = 1; i < this.pathPoints.length; i++) {
                this.ctx.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
            }
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // 2. Logic: Check progress
        let isNear = false;
        if (this.nextPointIndex < this.pathPoints.length) {
            const target = this.pathPoints[this.nextPointIndex];
            const dx = this.cursor.x - target.x;
            const dy = this.cursor.y - target.y;
            const dist = Math.hypot(dx, dy);

            isNear = dist < this.tolerance;

            if (dist < this.lockTolerance) {
                this.userPath.push(target);
                this.nextPointIndex++;

                if (this.nextPointIndex >= this.pathPoints.length) {
                    this.triggerWin();
                }
            }
        }

        // 3. Draw User Path (Charming Glowing Neon)
        this.ctx.save();
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#FF07A3'; // Pink Glow
        this.ctx.strokeStyle = '#FF6B9D';
        this.ctx.lineWidth = 12;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        if (this.userPath.length > 0) {
            this.ctx.moveTo(this.userPath[0].x, this.userPath[0].y);
            for (let i = 1; i < this.userPath.length; i++) {
                this.ctx.lineTo(this.userPath[i].x, this.userPath[i].y);
            }
            this.ctx.lineTo(this.cursor.x, this.cursor.y);
        }
        this.ctx.stroke();
        this.ctx.restore();

        // 4. Draw Guide Dot (Charming Pulsing Star)
        if (this.nextPointIndex < this.pathPoints.length) {
            const guide = this.pathPoints[this.nextPointIndex];
            const pulseRate = isNear ? 500 : 1200;
            const pulse = (Date.now() % pulseRate) / pulseRate;
            const size = 20 + Math.sin(pulse * Math.PI * 2) * 6;

            // Draw a star shape
            this.drawStar(guide.x, guide.y, 5, size, size / 2, '#4ECDC4');

            // Outer Ring
            this.ctx.strokeStyle = `rgba(78, 205, 196, ${1 - pulse})`;
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(guide.x, guide.y, 25 + pulse * 30, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // 5. Draw Cursor (Beautiful Magical Orb)
        this.ctx.save();
        const gradient = this.ctx.createRadialGradient(this.cursor.x, this.cursor.y, 2, this.cursor.x, this.cursor.y, 22);
        gradient.addColorStop(0, '#FFF');
        gradient.addColorStop(0.3, '#FFE66D');
        gradient.addColorStop(1, 'rgba(255, 230, 109, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.cursor.x, this.cursor.y, 22, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#FFD93D';
        this.ctx.beginPath();
        this.ctx.arc(this.cursor.x, this.cursor.y, 10, 0, Math.PI * 2);
        this.ctx.fill();

        // Sparkles
        if (Math.random() > 0.6) {
            const sx = this.cursor.x + (Math.random() - 0.5) * 45;
            const sy = this.cursor.y + (Math.random() - 0.5) * 45;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
            this.ctx.beginPath();
            this.ctx.arc(sx, sy, 2 + Math.random() * 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius, color) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }
        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    triggerWin() {
        this.score += 100;
        if (this.callbacks.onScore) this.callbacks.onScore(this.score);

        // Visual feedback
        this.ctx.font = 'bold 40px Poppins';
        this.ctx.fillStyle = '#FFE66D';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("AMAZING!", this.gameCanvas.width / 2, this.gameCanvas.height / 2);

        setTimeout(() => {
            if (this.isRunning) {
                this.loadRandomShape();
            }
        }, 1200);
    }
}

window.AirTracingGame = AirTracingGame;
