class PinchDropGame extends BaseActivity {
    constructor(detector, gameCanvas, callbacks = {}) {
        super(detector, gameCanvas);
        this.callbacks = callbacks;
        this.objects = [];
        this.slots = [];
        this.grabbedObject = null;
        this.isPinching = false;
        this.pinchDist = 1.0;
        this.cursor = { x: 0, y: 0 };
        this.colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#A29BFE'];
        this.shapes = ['Circle', 'Square', 'Triangle', 'Star'];
    }

    start() {
        this.setupLevel();
        super.start();
    }

    setupLevel() {
        this.objects = [];
        this.slots = [];
        this.grabbedObject = null;

        const count = 3;
        const spacing = this.gameCanvas.width / (count + 1);

        for (let i = 0; i < count; i++) {
            const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
            const color = this.colors[i % this.colors.length];

            this.slots.push({
                x: spacing * (i + 1),
                y: 150,
                shape,
                color,
                matched: false
            });

            // Randomize starting positions for objects
            this.objects.push({
                x: 100 + Math.random() * (this.gameCanvas.width - 200),
                y: this.gameCanvas.height - 150,
                shape,
                color,
                grabbed: false,
                id: i
            });
        }
    }

    update() {
        super.update();
        const hands = this.detector.getDetectedHands();

        if (hands.length > 0) {
            const hand = hands[0];
            const index = hand.landmarks[8];
            const thumb = hand.landmarks[4];

            const tx = (1 - index.x) * this.gameCanvas.width;
            const ty = index.y * this.gameCanvas.height;

            const alpha = 0.3;
            this.cursor.x = alpha * tx + (1 - alpha) * this.cursor.x;
            this.cursor.y = alpha * ty + (1 - alpha) * this.cursor.y;

            const currentDist = Math.hypot(index.x - thumb.x, index.y - thumb.y);
            this.pinchDist = this.pinchDist * 0.7 + currentDist * 0.3;

            const pinchThreshold = 0.055;
            const releaseThreshold = 0.085;

            if (this.pinchDist < pinchThreshold) {
                if (!this.isPinching) {
                    this.isPinching = true;
                    this.tryGrab();
                }
            } else if (this.pinchDist > releaseThreshold) {
                if (this.isPinching) {
                    this.isPinching = false;
                    this.tryDrop();
                }
            }

            if (this.grabbedObject) {
                this.grabbedObject.x = this.cursor.x;
                this.grabbedObject.y = this.cursor.y;
            }
        }
    }

    tryGrab() {
        for (const obj of this.objects) {
            const d = Math.hypot(this.cursor.x - obj.x, this.cursor.y - obj.y);
            if (d < 60) {
                this.grabbedObject = obj;
                obj.grabbed = true;
                break;
            }
        }
    }

    tryDrop() {
        if (!this.grabbedObject) return;

        let matched = false;
        for (const slot of this.slots) {
            if (!slot.matched && slot.shape === this.grabbedObject.shape) {
                const d = Math.hypot(this.grabbedObject.x - slot.x, this.grabbedObject.y - slot.y);
                if (d < 80) {
                    slot.matched = true;
                    this.objects = this.objects.filter(o => o.id !== this.grabbedObject.id);
                    matched = true;
                    this.score += 50;
                    if (this.callbacks.onScore) this.callbacks.onScore(this.score);
                    break;
                }
            }
        }

        if (!matched) {
            this.grabbedObject.grabbed = false;
            // Snap back effect could go here
        }

        this.grabbedObject = null;

        if (this.slots.every(s => s.matched)) {
            setTimeout(() => this.setupLevel(), 1000);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Background
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.gameCanvas.height);
        grad.addColorStop(0, '#fdfcfb');
        grad.addColorStop(1, '#e2d1c3');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Draw Slots
        this.slots.forEach(slot => {
            this.ctx.save();
            this.ctx.translate(slot.x, slot.y);
            this.ctx.globalAlpha = slot.matched ? 1.0 : 0.2;
            this.drawShape(slot.shape, slot.color, 50);

            if (!slot.matched) {
                this.ctx.strokeStyle = '#000';
                this.ctx.setLineDash([5, 5]);
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
            this.ctx.restore();
        });

        // Draw Objects
        this.objects.forEach(obj => {
            this.ctx.save();
            this.ctx.translate(obj.x, obj.y);
            if (obj.grabbed) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
                this.ctx.scale(1.1, 1.1);
            }
            this.drawShape(obj.shape, obj.color, 45);
            this.ctx.restore();
        });

        // Draw Cursor
        this.ctx.fillStyle = this.isPinching ? '#FF5252' : '#2196F3';
        this.ctx.beginPath();
        this.ctx.arc(this.cursor.x, this.cursor.y, 8, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawShape(type, color, size) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        if (type === 'Circle') {
            this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        } else if (type === 'Square') {
            this.ctx.rect(-size, -size, size * 2, size * 2);
        } else if (type === 'Triangle') {
            this.ctx.moveTo(0, -size);
            this.ctx.lineTo(size, size);
            this.ctx.lineTo(-size, size);
            this.ctx.closePath();
        } else if (type === 'Star') {
            for (let i = 0; i < 5; i++) {
                this.ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * size,
                    Math.sin((18 + i * 72) / 180 * Math.PI) * size);
                this.ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * size / 2,
                    Math.sin((54 + i * 72) / 180 * Math.PI) * size / 2);
            }
            this.ctx.closePath();
        }
        this.ctx.fill();
    }

    getInfoHTML() {
        return `
            <div class="stat">
                <span class="stat-label">Matches</span>
                <span class="stat-value">${Math.floor(this.score / 50)}</span>
            </div>
            <div class="stat">
                <span class="stat-label">State</span>
                <span class="stat-value">${this.isPinching ? 'GRABBING' : 'OPEN'}</span>
            </div>
        `;
    }
}

window.PinchDropGame = PinchDropGame;
