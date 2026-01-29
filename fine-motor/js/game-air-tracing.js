class AirTracingGame extends BaseActivity {
    constructor(canvas, callbacks) {
        super({ videoElement: {} }, canvas);
        this.callbacks = callbacks;
        this.isRunning = false;

        this.shapes = {
            'Square': [{ x: 0.3, y: 0.3 }, { x: 0.7, y: 0.3 }, { x: 0.7, y: 0.7 }, { x: 0.3, y: 0.7 }, { x: 0.3, y: 0.3 }],
            'Triangle': [{ x: 0.5, y: 0.2 }, { x: 0.8, y: 0.8 }, { x: 0.2, y: 0.8 }, { x: 0.5, y: 0.2 }],
            'Star': [
                { x: 0.5, y: 0.1 }, { x: 0.6, y: 0.4 }, { x: 0.9, y: 0.4 }, { x: 0.7, y: 0.6 },
                { x: 0.8, y: 0.9 }, { x: 0.5, y: 0.75 }, { x: 0.2, y: 0.9 }, { x: 0.3, y: 0.6 },
                { x: 0.1, y: 0.4 }, { x: 0.4, y: 0.4 }, { x: 0.5, y: 0.1 }
            ]
        };

        this.currentShapeName = 'Square';
        this.pathPoints = [];
        this.userPath = [];
        this.nextPointIndex = 1;
        this.cursor = { x: 0, y: 0 };
        this.tolerance = 70; // Increased tolerance (previously 40) for better accessibility

        this.update = this.update.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    start() {
        super.start();
        this.isRunning = true;
        this.loadShape('Square');
        this.gameCanvas.addEventListener('mousemove', this.handleInput);
        if (this.callbacks.onScore) this.callbacks.onScore(0);
        if (this.callbacks.onLevel) this.callbacks.onLevel(1);
        requestAnimationFrame(this.update);
    }

    stop() {
        this.isRunning = false;
        this.gameCanvas.removeEventListener('mousemove', this.handleInput);
        super.stop();
        this.saveStats('airtracing', { shape: this.currentShapeName });
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

    handleInput(e) {
        if (!this.isRunning) return;
        const rect = this.gameCanvas.getBoundingClientRect();
        this.cursor.x = e.clientX - rect.left;
        this.cursor.y = e.clientY - rect.top;
    }

    update() {
        if (!this.isRunning) return;

        this.ctx.fillStyle = "#0B0E14"; // Deep space black
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // 1. Draw Target Path (Dotted Line)
        this.ctx.strokeStyle = 'rgba(224, 224, 224, 0.5)';
        this.ctx.lineWidth = 15;
        this.ctx.setLineDash([10, 10]);
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
        if (this.nextPointIndex < this.pathPoints.length) {
            const target = this.pathPoints[this.nextPointIndex];
            const dx = this.cursor.x - target.x;
            const dy = this.cursor.y - target.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.tolerance) {
                this.userPath.push(target);
                this.nextPointIndex++;

                if (this.nextPointIndex >= this.pathPoints.length) {
                    this.triggerWin();
                }
            }
        }

        // 3. Draw User Path (Gold)
        this.ctx.strokeStyle = '#FFD93D';
        this.ctx.lineWidth = 10;
        this.ctx.beginPath();
        if (this.userPath.length > 0) {
            this.ctx.moveTo(this.userPath[0].x, this.userPath[0].y);
            for (let i = 1; i < this.userPath.length; i++) {
                this.ctx.lineTo(this.userPath[i].x, this.userPath[i].y);
            }
            this.ctx.lineTo(this.cursor.x, this.cursor.y);
        }
        this.ctx.stroke();

        // 4. Draw Guide Dot (Next Target)
        if (this.nextPointIndex < this.pathPoints.length) {
            const guide = this.pathPoints[this.nextPointIndex];
            this.ctx.fillStyle = '#4ECDC4';
            this.ctx.beginPath();
            this.ctx.arc(guide.x, guide.y, 20, 0, Math.PI * 2);
            this.ctx.fill();

            const pulse = (Date.now() % 1000) / 1000;
            this.ctx.strokeStyle = `rgba(78, 205, 196, ${1 - pulse})`;
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(guide.x, guide.y, 20 + pulse * 25, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // 5. Draw Cursor
        this.ctx.fillStyle = '#FF6B9D';
        this.ctx.beginPath();
        this.ctx.arc(this.cursor.x, this.cursor.y, 12, 0, Math.PI * 2);
        this.ctx.fill();

        requestAnimationFrame(this.update);
    }

    triggerWin() {
        this.score += 100;
        if (this.callbacks.onScore) this.callbacks.onScore(this.score);

        setTimeout(() => {
            if (this.currentShapeName === 'Square') this.loadShape('Triangle');
            else if (this.currentShapeName === 'Triangle') this.loadShape('Star');
            else {
                if (this.callbacks.onGameOver) {
                    this.callbacks.onGameOver("You traced all the shapes! Amazing!", "Master Artist");
                }
                this.stop();
            }
        }, 1000);
    }
}

window.AirTracingGame = AirTracingGame;
