/**
 * Pinch & Place Game
 * Kids grab items with a pinch gesture and drag them to the matching silhouette.
 */

class PinchPlaceGame extends BaseGame {
    constructor(canvas) {
        super(canvas);

        // Game State
        this.levels = [
            { id: 1, type: 'shapes', count: 3 },
            { id: 2, type: 'colors', count: 4 },
            { id: 3, type: 'mixed', count: 5 }
        ];
        this.currentLevelIdx = 0;

        this.items = [];   // Draggable items
        this.targets = []; // Drop zones

        this.draggedItem = null;
        this.dragOffset = { x: 0, y: 0 };

        // Bind events
        this.handleDown = this.handleDown.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleUp = this.handleUp.bind(this);

        // Colors
        this.palette = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#A29BFE'];
    }

    start() {
        super.start();
        console.log("Pinch Game Started");

        // Add event listeners (GestureEngine simulates Mouse events)
        this.canvas.addEventListener('mousedown', this.handleDown);
        window.addEventListener('mousemove', this.handleMove);
        window.addEventListener('mouseup', this.handleUp);

        this.loadLevel(this.currentLevelIdx);
        document.getElementById('score-display').textContent = 'Placed: 0/3';
    }

    stop() {
        super.stop();
        this.canvas.removeEventListener('mousedown', this.handleDown);
        window.removeEventListener('mousemove', this.handleMove);
        window.removeEventListener('mouseup', this.handleUp);
    }

    restart() {
        this.loadLevel(this.currentLevelIdx);
    }

    loadLevel(idx) {
        this.currentLevelIdx = idx;
        const level = this.levels[idx];
        document.getElementById('current-game-title').textContent = `Pinch: Level ${idx + 1}`;

        this.items = [];
        this.targets = [];

        const shapes = ['circle', 'square', 'triangle', 'pentagon', 'star'];

        // Create items
        for (let i = 0; i < level.count; i++) {
            const shape = shapes[i % shapes.length];
            const color = this.palette[i % this.palette.length];
            const size = 40;

            // Random start positions (bottom half)
            const x = 50 + Math.random() * (this.canvas.width - 100);
            const y = this.canvas.height / 2 + 50 + Math.random() * (this.canvas.height / 2 - 100);

            // Target positions (top half)
            // Distribute evenly
            const tx = (this.canvas.width / (level.count + 1)) * (i + 1);
            const ty = 100;

            this.items.push({
                id: i,
                x: x,
                y: y,
                width: size * 2,
                height: size * 2,
                shape: shape,
                color: color,
                isDragging: false,
                isPlaced: false,
                scale: 1
            });

            this.targets.push({
                id: i,
                x: tx,
                y: ty,
                width: size * 2,
                height: size * 2,
                shape: shape,
                color: 'rgba(0,0,0,0.1)' // Shadow color
            });
        }
    }

    handleDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Find clicked item (reverse order to pick top-most)
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            if (item.isPlaced) continue;

            if (this.hitTest(mx, my, item)) {
                this.draggedItem = item;
                this.draggedItem.isDragging = true;
                this.dragOffset.x = mx - item.x;
                this.dragOffset.y = my - item.y;

                // Pop effect
                this.draggedItem.scale = 1.2;
                soundManager.play('pop');
                return;
            }
        }
    }

    handleMove(e) {
        if (!this.draggedItem) return;

        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        this.draggedItem.x = mx - this.dragOffset.x;
        this.draggedItem.y = my - this.dragOffset.y;
    }

    handleUp(e) {
        if (!this.draggedItem) return;

        // Check for drop target
        const target = this.targets.find(t => t.id === this.draggedItem.id);
        if (target) {
            const dx = this.draggedItem.x - target.x;
            const dy = this.draggedItem.y - target.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 50) { // Snap threshold
                // Success!
                this.draggedItem.x = target.x;
                this.draggedItem.y = target.y;
                this.draggedItem.isPlaced = true;
                this.draggedItem.scale = 1;
                soundManager.play('pop'); // Success pop
                this.checkWin();
            } else {
                // Return to scale
                this.draggedItem.scale = 1;
                soundManager.play('tick'); // Drop sound
            }
        }

        this.draggedItem.isDragging = false;
        this.draggedItem = null;
    }

    hitTest(mx, my, item) {
        // Simple circle/box hit test
        const r = item.width / 2; // radius roughly
        return Math.hypot(mx - item.x, my - item.y) < r + 10; // +10 padding
    }

    checkWin() {
        const placedCount = this.items.filter(i => i.isPlaced).length;
        document.getElementById('score-display').textContent = `Placed: ${placedCount}/${this.items.length}`;

        if (placedCount === this.items.length) {
            setTimeout(() => {
                app.showSuccess("Puzzle Complete!");
            }, 500);
        }
    }

    update() {
        // Animation logic (e.g. slight bobbing for unplaced items)
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Zones (Targets)
        this.targets.forEach(t => {
            this.drawShape(t.x, t.y, t.width, t.shape, t.color, true); // true for outline/shadow style
        });

        // 2. Draw Connectors (optional hint lines if dragging)
        if (this.draggedItem) {
            const target = this.targets.find(t => t.id === this.draggedItem.id);
            if (target) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.draggedItem.x, this.draggedItem.y);
                this.ctx.lineTo(target.x, target.y);
                this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                this.ctx.setLineDash([5, 5]);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        }

        // 3. Draw Items (placed items at bottom of stack, dragging on top)
        // Sort: unplaced static, placed, dragging
        const sortedItems = [...this.items].sort((a, b) => {
            if (a.isDragging) return 1;
            if (b.isDragging) return -1;
            if (a.isPlaced && !b.isPlaced) return -1; // Placed go behind? Actually placed go to target z-index
            return 0;
        });

        sortedItems.forEach(item => {
            this.drawShape(item.x, item.y, item.width * item.scale, item.shape, item.color, false);

            // Add a little 'pinch' indicator if dragging
            if (item.isDragging) {
                this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
                this.ctx.beginPath();
                this.ctx.arc(item.x, item.y, 10, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    drawShape(x, y, size, type, color, isShadow) {
        this.ctx.save();
        this.ctx.translate(x, y);

        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#2d3436';
        this.ctx.lineWidth = 2;

        if (isShadow) {
            this.ctx.strokeStyle = '#b2bec3';
            this.ctx.setLineDash([5, 5]);
        }

        this.ctx.beginPath();
        const r = size / 2;

        if (type === 'circle') {
            this.ctx.arc(0, 0, r, 0, Math.PI * 2);
        } else if (type === 'square') {
            this.ctx.rect(-r, -r, size, size);
        } else if (type === 'triangle') {
            this.ctx.moveTo(0, -r);
            this.ctx.lineTo(r, r);
            this.ctx.lineTo(-r, r);
            this.ctx.closePath();
        } else if (type === 'pentagon') {
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;
                if (i === 0) this.ctx.moveTo(px, py);
                else this.ctx.lineTo(px, py);
            }
            this.ctx.closePath();
        } else if (type === 'star') {
            const inner = r * 0.4;
            const spikes = 5;
            for (let i = 0; i < spikes * 2; i++) {
                const angle = (i * Math.PI) / spikes - Math.PI / 2;
                const radius = (i % 2 === 0) ? r : inner;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                if (i === 0) this.ctx.moveTo(px, py);
                else this.ctx.lineTo(px, py);
            }
            this.ctx.closePath();
        }

        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
    }
}
