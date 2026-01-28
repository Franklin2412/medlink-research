/**
 * Steady Hand Game
 * The "Wire Loop" game - Keep the cursor on the line!
 */

class SteadyHandGame extends BaseGame {
    constructor(canvas) {
        super(canvas);

        this.levels = [
            { id: 1, name: "Straight Line", type: "line" },
            { id: 2, name: "The Hill", type: "curve" },
            { id: 3, name: "Zig Zag", type: "zigzag" },
            { id: 4, name: "Loop de Loop", type: "complex" }
        ];
        this.currentLevelIdx = 0;

        this.pathRadius = 30; // Thickness of the "safe zone"
        this.cursorRadius = 10;

        this.points = []; // The path points
        this.progress = 0; // 0 to 1

        this.isFailed = false;
        this.sparks = [];
    }

    start() {
        super.start();
        this.loadLevel(this.currentLevelIdx);
        console.log("Steady Hand Started");
    }

    restart() {
        this.loadLevel(this.currentLevelIdx);
    }

    loadLevel(idx) {
        this.currentLevelIdx = idx;
        const level = this.levels[idx];
        document.getElementById('current-game-title').textContent = `Steady Hand: ${level.name}`;

        this.generatePath(level.type);
        this.isFailed = false;
        this.progress = 0;
        this.sparks = [];
        document.getElementById('score-display').textContent = 'Safe';
    }

    generatePath(type) {
        this.points = [];
        const w = this.canvas.width;
        const h = this.canvas.height;
        const pad = 100;

        if (type === 'line') {
            const y = h / 2;
            for (let x = pad; x <= w - pad; x += 10) {
                this.points.push({ x, y });
            }
        } else if (type === 'curve') {
            for (let x = pad; x <= w - pad; x += 10) {
                const norm = (x - pad) / (w - pad * 2);
                const y = h / 2 - Math.sin(norm * Math.PI) * 150;
                this.points.push({ x, y });
            }
        } else if (type === 'zigzag') {
            for (let x = pad; x <= w - pad; x += 10) {
                const norm = (x - pad) / (w - pad * 2);
                // Frequency 4
                const y = h / 2 + Math.sin(norm * Math.PI * 8) * 50;
                this.points.push({ x, y });
            }
        } else {
            // Complex
            for (let x = pad; x <= w - pad; x += 5) {
                const norm = (x - pad) / (w - pad * 2);
                const y = h / 2 + Math.sin(norm * Math.PI * 4) * 100 + Math.cos(norm * Math.PI * 2) * 50;
                this.points.push({ x, y });
            }
        }
    }

    update() {
        if (!window.gestureEngine) return;

        // Get cursor pos
        const cursor = document.getElementById('gesture-cursor');
        if (!cursor || cursor.classList.contains('hidden')) return;

        const rect = cursor.getBoundingClientRect();
        const gx = rect.left + rect.width / 2;
        const gy = rect.top + rect.height / 2;

        const canvasRect = this.canvas.getBoundingClientRect();
        const x = gx - canvasRect.left;
        const y = gy - canvasRect.top;

        // Check collision
        if (!this.isFailed) {
            const distInfo = this.getClosestDist(x, y);

            // Check if we are at start
            if (distInfo.index === 0 && distInfo.dist < this.pathRadius) {
                this.hasStarted = true;
            }

            // Check if we reached end
            if (distInfo.index > this.points.length - 10 && distInfo.dist < this.pathRadius) {
                app.showSuccess("Level Complete!");
                this.isFailed = true; // Stop checking
                return;
            }

            // Fail Check
            if (distInfo.dist > this.pathRadius) {
                // FAIL
                soundManager.play('fail');
                this.fail(x, y);
            }

            // Update UI
            if (distInfo.dist < this.pathRadius) {
                const pct = Math.floor((distInfo.index / this.points.length) * 100);
                document.getElementById('score-display').textContent = `Progress: ${pct}%`;
            }
        }

        // Update sparks
        this.sparks.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 0.05;
        });
        this.sparks = this.sparks.filter(s => s.life > 0);
    }

    getClosestDist(x, y) {
        let minDist = Infinity;
        let index = -1;

        for (let i = 0; i < this.points.length; i++) {
            const p = this.points[i];
            const d = Math.hypot(p.x - x, p.y - y);
            if (d < minDist) {
                minDist = d;
                index = i;
            }
        }
        return { dist: minDist, index };
    }

    fail(x, y) {
        this.isFailed = true;
        document.getElementById('score-display').textContent = '⚠️ OUCH!';
        document.body.style.backgroundColor = '#ffcdd2'; // Flash red
        setTimeout(() => document.body.style.backgroundColor = '', 200);

        // FX
        for (let i = 0; i < 20; i++) {
            this.sparks.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color: '#FFEB3B'
            });
        }

        // Auto reset after delay
        setTimeout(() => {
            this.restart();
        }, 1500);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Track (Border)
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.points.forEach((p, i) => {
            if (i === 0) this.ctx.moveTo(p.x, p.y);
            else this.ctx.lineTo(p.x, p.y);
        });
        this.ctx.lineWidth = this.pathRadius * 2;
        this.ctx.strokeStyle = '#dfe6e9'; // track color
        this.ctx.stroke();

        // Draw Track (Inner)
        this.ctx.beginPath();
        this.points.forEach((p, i) => {
            if (i === 0) this.ctx.moveTo(p.x, p.y);
            else this.ctx.lineTo(p.x, p.y);
        });
        this.ctx.lineWidth = this.pathRadius * 2 - 4;
        this.ctx.strokeStyle = 'white';
        this.ctx.stroke();

        // Draw Center Wire
        this.ctx.beginPath();
        this.points.forEach((p, i) => {
            if (i === 0) this.ctx.moveTo(p.x, p.y);
            else this.ctx.lineTo(p.x, p.y);
        });
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#636e72';
        this.ctx.stroke();

        // Start & End zones
        if (this.points.length > 0) {
            const start = this.points[0];
            const end = this.points[this.points.length - 1];

            this.ctx.fillStyle = '#00b894';
            this.ctx.beginPath(); this.ctx.arc(start.x, start.y, 20, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.fillStyle = 'white'; this.ctx.fillText("START", start.x - 15, start.y + 5);

            this.ctx.fillStyle = '#d63031';
            this.ctx.beginPath(); this.ctx.arc(end.x, end.y, 20, 0, Math.PI * 2); this.ctx.fill();
        }

        // Sparks
        this.sparks.forEach(s => {
            this.ctx.globalAlpha = s.life;
            this.ctx.fillStyle = s.color;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
}
