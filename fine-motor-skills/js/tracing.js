/**
 * Air Tracing Game
 * Kids trace shapes in the air using their index finger.
 */

class TracingGame extends BaseGame {
    constructor(canvas) {
        super(canvas);
        this.ctx = canvas.getContext('2d');

        this.levels = [
            { id: 1, name: "The Circle", type: "circle" },
            { id: 2, name: "The Square", type: "rect" },
            { id: 3, name: "The Star", type: "star" },
            { id: 4, name: "The Infinity", type: "infinity" }
        ];

        this.currentLevelIdx = 0;
        this.isDrawing = false;
        this.pathPoints = []; // The target path
        this.userPath = [];   // The path drawn by user
        this.particles = [];  // Visual effects

        this.score = 0;
        this.totalPoints = 0;
        this.missedPoints = 0;

        // Configuration
        this.lineWidth = 40; // Allow some margin of error
        this.colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43'];
    }

    start() {
        super.start();
        this.loadLevel(this.currentLevelIdx);
        console.log("Tracing Game Started");

        // Reset score display
        document.getElementById('score-display').textContent = 'Accuracy: 0%';
    }

    loadLevel(idx) {
        this.currentLevelIdx = idx;
        const level = this.levels[idx];
        document.getElementById('current-game-title').textContent = `Tracing: ${level.name}`;

        this.pathPoints = this.generatePath(level.type);
        this.userPath = [];
        this.particles = [];
        this.totalPoints = 0;
        this.missedPoints = 0;

        // Intro animation or delay could go here
    }

    generatePath(type) {
        const points = [];
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const steps = 200;

        if (type === 'circle') {
            const r = Math.min(w, h) * 0.35;
            for (let i = 0; i <= steps; i++) {
                const angle = (i / steps) * Math.PI * 2;
                points.push({
                    x: cx + Math.cos(angle) * r,
                    y: cy + Math.sin(angle) * r
                });
            }
        } else if (type === 'rect') {
            const size = Math.min(w, h) * 0.6;
            const half = size / 2;
            // Top
            for (let i = 0; i <= 50; i++) points.push({ x: cx - half + (size * i / 50), y: cy - half });
            // Right
            for (let i = 0; i <= 50; i++) points.push({ x: cx + half, y: cy - half + (size * i / 50) });
            // Bottom
            for (let i = 0; i <= 50; i++) points.push({ x: cx + half - (size * i / 50), y: cy + half });
            // Left
            for (let i = 0; i <= 50; i++) points.push({ x: cx - half, y: cy + half - (size * i / 50) });
        } else if (type === 'infinity') {
            const scale = Math.min(w, h) * 0.3;
            for (let i = 0; i <= steps; i++) {
                const t = (i / steps) * Math.PI * 2;
                const x = (scale * Math.sqrt(2) * Math.cos(t)) / (Math.sin(t) * Math.sin(t) + 1);
                const y = (scale * Math.sqrt(2) * Math.cos(t) * Math.sin(t)) / (Math.sin(t) * Math.sin(t) + 1);
                points.push({ x: cx + x, y: cy + y });
            }
        } else if (type === 'star') {
            const outer = Math.min(w, h) * 0.4;
            const inner = outer * 0.4;
            const spikes = 5;
            for (let i = 0; i <= steps; i++) {
                const t = (i / steps) * Math.PI * 2 * spikes;
                // Parametric star approximation or just connecting vertices?
                // Let's do vertices for cleaner drawing
            }
            // Simple vertex connection
            const vertices = [];
            for (let i = 0; i < spikes * 2; i++) {
                const r = (i % 2 === 0) ? outer : inner;
                const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
                vertices.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
            }
            vertices.push(vertices[0]); // Close loop

            for (let i = 0; i < vertices.length - 1; i++) {
                const p1 = vertices[i];
                const p2 = vertices[i + 1];
                for (let j = 0; j <= 20; j++) {
                    const t = j / 20;
                    points.push({
                        x: p1.x + (p2.x - p1.x) * t,
                        y: p1.y + (p2.y - p1.y) * t
                    });
                }
            }
        }
        return points;
    }

    update() {
        if (!window.gestureEngine) return;

        // Get cursor position from gesture engine
        // We'll read the DOM element position as a quick way to get the mapped coordinates
        const cursor = document.getElementById('gesture-cursor');
        if (!cursor) return;

        const rect = cursor.getBoundingClientRect();
        // Center of cursor
        const gx = rect.left + rect.width / 2;
        const gy = rect.top + rect.height / 2;

        // Convert global client coords to canvas local coords
        const canvasRect = this.canvas.getBoundingClientRect();
        const x = gx - canvasRect.left;
        const y = gy - canvasRect.top;

        // Check if cursor is active/detected by looking for 'hidden' class on cursor or body state
        const isActive = !cursor.classList.contains('hidden');

        if (isActive) {
            // Add to user path
            this.userPath.push({ x, y });
            if (this.userPath.length > 500) this.userPath.shift(); // Limit trail length

            // accuracy check
            this.checkAccuracy(x, y);

            // Spawn particles
            if (Math.random() > 0.5) {
                this.particles.push({
                    x: x + (Math.random() - 0.5) * 10,
                    y: y + (Math.random() - 0.5) * 10,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 1,
                    color: this.colors[Math.floor(Math.random() * this.colors.length)]
                });
            }
        }

        // Update particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
        });
        this.particles = this.particles.filter(p => p.life > 0);

        // Check win condition (if user has filled enough of the path)
        // For now, let's just make it time-based or "fill" based
        // Simple completion check: 5 seconds of good accuracy? 
        // Or tracking how far along the path they projected?
        // Let's go with "coverage".
    }

    checkAccuracy(x, y) {
        // Find closest point on path
        let minDist = Infinity;
        for (const p of this.pathPoints) {
            const d = Math.hypot(p.x - x, p.y - y);
            if (d < minDist) minDist = d;
        }

        this.totalPoints++;
        if (minDist < this.lineWidth / 2) {
            // Good!
        } else {
            this.missedPoints++;
        }

        // Update UI
        if (this.totalPoints % 10 === 0) {
            const acc = Math.max(0, 100 - Math.floor((this.missedPoints / this.totalPoints) * 100));
            document.getElementById('score-display').textContent = `Accuracy: ${acc}%`;

            // Win condition: High accuracy over time?
            // Actually, let's auto-advance if they "complete" the loop.
            // Simplified: If user path covers the bounds of the shape?
            if (this.totalPoints > 300) { // Enough points collected
                const acc = Math.max(0, 100 - Math.floor((this.missedPoints / this.totalPoints) * 100));
                if (acc > 70) {
                    app.showSuccess(`Accuracy: ${acc}%`);
                    this.userPath = []; // reset to prevent double trigger
                    this.totalPoints = 0;
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Target Path (Background)
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Draw outline
        this.ctx.beginPath();
        this.pathPoints.forEach((p, i) => {
            if (i === 0) this.ctx.moveTo(p.x, p.y);
            else this.ctx.lineTo(p.x, p.y);
        });
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.stroke();

        // Draw Center line (dashed)
        this.ctx.beginPath();
        this.pathPoints.forEach((p, i) => {
            if (i === 0) this.ctx.moveTo(p.x, p.y);
            else this.ctx.lineTo(p.x, p.y);
        });
        this.ctx.strokeStyle = '#b2bec3';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // 2. Draw User Path (Trail)
        if (this.userPath.length > 1) {
            this.ctx.beginPath();
            this.userPath.forEach((p, i) => {
                if (i === 0) this.ctx.moveTo(p.x, p.y);
                else {
                    // Smooth quadratic curve could be better but Lineto is fast
                    this.ctx.lineTo(p.x, p.y);
                }
            });
            this.ctx.strokeStyle = 'rgba(78, 205, 196, 0.5)';
            this.ctx.lineWidth = 15;
            this.ctx.stroke();
        }

        // 3. Draw Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;

        // 4. Draw Guide Cursor (optional visual aid)
        // (The system cursor handles the main visual, but we can add a 'glow')
    }
}
