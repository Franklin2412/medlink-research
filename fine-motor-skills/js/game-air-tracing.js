/**
 * Game: Air Tracing
 * Objective: Trace the shape displayed on screen.
 * Mechanics: Path following, tolerance checking, point-to-point progression.
 */

class AirTracingGame {
    constructor(canvas, callbacks) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
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
        this.pathPoints = []; // Scaled points
        this.userPath = []; // Where user has traced
        this.nextPointIndex = 1;
        this.cursor = { x: 0, y: 0 };
        this.tolerance = 40;

        this.update = this.update.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    start() {
        this.isRunning = true;
        this.loadShape('Square');
        this.canvas.addEventListener('mousemove', this.handleInput);
        this.callbacks.onScore(0);
        this.callbacks.onLevel(1);
        requestAnimationFrame(this.update);
    }

    stop() {
        this.isRunning = false;
        this.canvas.removeEventListener('mousemove', this.handleInput);
    }

    loadShape(name) {
        this.currentShapeName = name;
        const normalized = this.shapes[name];
        this.pathPoints = normalized.map(p => ({
            x: p.x * this.canvas.width,
            y: p.y * this.canvas.height
        }));
        this.userPath = [];
        this.nextPointIndex = 1;
        // Start user path at the first point
        this.userPath.push(this.pathPoints[0]);
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

        // 1. Draw Target Path (Dotted Line)
        this.ctx.strokeStyle = '#E0E0E0';
        this.ctx.lineWidth = 10;
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
                // Point Reached!
                this.userPath.push(target);
                this.nextPointIndex++;

                // Check Win
                if (this.nextPointIndex >= this.pathPoints.length) {
                    this.triggerWin();
                }
            }
        }

        // 3. Draw User Path (Gold)
        this.ctx.strokeStyle = '#FFD93D';
        this.ctx.lineWidth = 8;
        this.ctx.beginPath();
        if (this.userPath.length > 0) {
            this.ctx.moveTo(this.userPath[0].x, this.userPath[0].y);
            for (let i = 1; i < this.userPath.length; i++) {
                this.ctx.lineTo(this.userPath[i].x, this.userPath[i].y);
            }
            // Draw line to current cursor if valid
            const lastFixed = this.userPath[this.userPath.length - 1];
            // Only draw to cursor if close to expected path segment? 
            // For kids, just draw to cursor to visually connect
            this.ctx.lineTo(this.cursor.x, this.cursor.y);
        }
        this.ctx.stroke();

        // 4. Draw Guide Dot (Next Target)
        if (this.nextPointIndex < this.pathPoints.length) {
            const guide = this.pathPoints[this.nextPointIndex];
            this.ctx.fillStyle = '#4ECDC4';
            this.ctx.beginPath();
            this.ctx.arc(guide.x, guide.y, 15, 0, Math.PI * 2);
            this.ctx.fill();

            // Pulse ring
            const pulse = (Date.now() % 1000) / 1000;
            this.ctx.strokeStyle = `rgba(78, 205, 196, ${1 - pulse})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(guide.x, guide.y, 15 + pulse * 20, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // 5. Draw Cursor
        this.ctx.fillStyle = '#FF6B9D';
        this.ctx.beginPath();
        this.ctx.arc(this.cursor.x, this.cursor.y, 10, 0, Math.PI * 2);
        this.ctx.fill();

        requestAnimationFrame(this.update);
    }

    triggerWin() {
        this.callbacks.onScore(100);
        // Confetti / Particles here?
        setTimeout(() => {
            if (this.currentShapeName === 'Square') this.loadShape('Triangle');
            else if (this.currentShapeName === 'Triangle') this.loadShape('Star');
            else this.callbacks.onGameOver("You traced all the shapes! Amazing!", "Master Artist");
        }, 1000);
    }
}

window.AirTracingGame = AirTracingGame;
