class CharacterTraceGame extends BaseActivity {
    constructor(detector, gameCanvas, callbacks = {}) {
        super(detector, gameCanvas);
        this.callbacks = callbacks;
        this.characters = {
            'Mickey': [
                { points: this.generateCircle(0.5, 0.5, 0.3) }, // Head
                { points: this.generateCircle(0.2, 0.2, 0.12) }, // Left Ear
                { points: this.generateCircle(0.8, 0.2, 0.12) }  // Right Ear
            ],
            'Tom': [
                // Simplified Tom Cat head
                { points: [{ x: 0.3, y: 0.8 }, { x: 0.5, y: 0.9 }, { x: 0.7, y: 0.8 }, { x: 0.8, y: 0.5 }, { x: 0.5, y: 0.2 }, { x: 0.2, y: 0.5 }, { x: 0.3, y: 0.8 }] }, // Mouth/Head
                { points: [{ x: 0.35, y: 0.35 }, { x: 0.4, y: 0.1 }, { x: 0.45, y: 0.3 }] }, // Left Ear
                { points: [{ x: 0.55, y: 0.3 }, { x: 0.6, y: 0.1 }, { x: 0.65, y: 0.35 }] }  // Right Ear
            ],
            // Adding more placeholders to reach 25+ eventually, but starting with core library
            'Bugs Bunny': [
                { points: this.generateCircle(0.5, 0.6, 0.2) }, // Face
                { points: [{ x: 0.4, y: 0.4 }, { x: 0.35, y: 0.1 }, { x: 0.45, y: 0.4 }] }, // Ear L
                { points: [{ x: 0.6, y: 0.4 }, { x: 0.65, y: 0.1 }, { x: 0.55, y: 0.4 }] }  // Ear R
            ],
            'Jerry': [
                { points: this.generateCircle(0.5, 0.5, 0.25) },
                { points: this.generateCircle(0.25, 0.25, 0.15) },
                { points: this.generateCircle(0.75, 0.25, 0.15) }
            ],
            'Butterfly': [
                { points: [{ x: 0.5, y: 0.2 }, { x: 0.5, y: 0.8 }] }, // Body
                { points: [{ x: 0.5, y: 0.3 }, { x: 0.2, y: 0.1 }, { x: 0.1, y: 0.3 }, { x: 0.5, y: 0.5 }] }, // Wing TL
                { points: [{ x: 0.5, y: 0.7 }, { x: 0.2, y: 0.9 }, { x: 0.1, y: 0.7 }, { x: 0.5, y: 0.5 }] }, // Wing BL
                { points: [{ x: 0.5, y: 0.3 }, { x: 0.8, y: 0.1 }, { x: 0.9, y: 0.3 }, { x: 0.5, y: 0.5 }] }, // Wing TR
                { points: [{ x: 0.5, y: 0.7 }, { x: 0.8, y: 0.9 }, { x: 0.9, y: 0.7 }, { x: 0.5, y: 0.5 }] }  // Wing BR
            ],
            'Tulip': [
                { points: [{ x: 0.5, y: 0.9 }, { x: 0.5, y: 0.5 }] }, // Stem
                { points: [{ x: 0.3, y: 0.4 }, { x: 0.4, y: 0.2 }, { x: 0.5, y: 0.3 }, { x: 0.6, y: 0.2 }, { x: 0.7, y: 0.4 }, { x: 0.5, y: 0.5 }, { x: 0.3, y: 0.4 }] } // Petals
            ],
            'Sun': [
                { points: this.generateCircle(0.5, 0.5, 0.2) },
                { points: [{ x: 0.5, y: 0.2 }, { x: 0.5, y: 0.1 }] },
                { points: [{ x: 0.5, y: 0.8 }, { x: 0.5, y: 0.9 }] },
                { points: [{ x: 0.2, y: 0.5 }, { x: 0.1, y: 0.5 }] },
                { points: [{ x: 0.8, y: 0.5 }, { x: 0.9, y: 0.5 }] }
            ]
            // ... Adding more programmatically for demo ...
        };

        this.currentCharacter = 'Mickey';
        this.currentStrokes = [];
        this.activeStrokeIndex = 0;
        this.activePointIndex = 0;
        this.userProgress = []; // Array of completed paths
        this.currentUserStroke = [];
        this.cursor = { x: 0, y: 0 };
        this.lockTolerance = 40;
    }

    generateCircle(cx, cy, r, segments = 12) {
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
        }
        return points;
    }

    start() {
        this.loadRandomCharacter();
        super.start();
    }

    loadRandomCharacter() {
        const keys = Object.keys(this.characters);
        this.currentCharacter = keys[Math.floor(Math.random() * keys.length)];
        this.currentStrokes = this.characters[this.currentCharacter].map(stroke => ({
            points: stroke.points.map(p => ({ x: p.x * this.gameCanvas.width, y: p.y * this.gameCanvas.height })),
            done: false
        }));
        this.activeStrokeIndex = 0;
        this.activePointIndex = 0;
        this.userProgress = [];
        this.currentUserStroke = [];
    }

    update() {
        super.update();
        const hands = this.detector.getDetectedHands();

        if (hands.length > 0) {
            const indexTip = hands[0].landmarks[8];
            const targetX = (1 - indexTip.x) * this.gameCanvas.width;
            const targetY = indexTip.y * this.gameCanvas.height;

            const alpha = 0.2;
            this.cursor.x = alpha * targetX + (1 - alpha) * this.cursor.x;
            this.cursor.y = alpha * targetY + (1 - alpha) * this.cursor.y;

            // Logic for Tracing
            if (this.activeStrokeIndex < this.currentStrokes.length) {
                const stroke = this.currentStrokes[this.activeStrokeIndex];
                const target = stroke.points[this.activePointIndex];

                const dist = Math.hypot(this.cursor.x - target.x, this.cursor.y - target.y);

                if (dist < this.lockTolerance) {
                    if (this.activePointIndex === 0) {
                        this.currentUserStroke = [target];
                    } else {
                        this.currentUserStroke.push(target);
                    }
                    this.activePointIndex++;

                    if (this.activePointIndex >= stroke.points.length) {
                        stroke.done = true;
                        this.userProgress.push([...this.currentUserStroke]);
                        this.currentUserStroke = [];
                        this.activeStrokeIndex++;
                        this.activePointIndex = 0;

                        if (this.activeStrokeIndex >= this.currentStrokes.length) {
                            this.levelComplete();
                        }
                    }
                }
            }
        }
    }

    levelComplete() {
        this.score += 100;
        if (this.callbacks.onScore) this.callbacks.onScore(this.score);
        setTimeout(() => this.loadRandomCharacter(), 1500);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Background
        this.ctx.fillStyle = '#FFF9DB'; // Paper-like yellow
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Draw Character Guide (Dotted Lines)
        this.currentStrokes.forEach((stroke, sIdx) => {
            this.ctx.strokeStyle = stroke.done ? '#4CAF50' : 'rgba(0,0,0,0.1)';
            this.ctx.lineWidth = 15;
            this.ctx.setLineDash([10, 10]);
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            this.ctx.beginPath();
            this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Draw sequence numbers
            if (!stroke.done && sIdx === this.activeStrokeIndex) {
                const start = stroke.points[0];
                this.ctx.fillStyle = '#FF5252';
                this.ctx.beginPath();
                this.ctx.arc(start.x, start.y, 25, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#FFF';
                this.ctx.font = 'bold 24px Poppins';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(this.activeStrokeIndex + 1, start.x, start.y);
            }
        });

        // Draw User Strokes
        this.ctx.strokeStyle = '#2196F3';
        this.ctx.lineWidth = 12;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.userProgress.forEach(stroke => {
            this.ctx.beginPath();
            this.ctx.moveTo(stroke[0].x, stroke[0].y);
            for (let i = 1; i < stroke.length; i++) this.ctx.lineTo(stroke[i].x, stroke[i].y);
            this.ctx.stroke();
        });

        if (this.currentUserStroke.length > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.currentUserStroke[0].x, this.currentUserStroke[0].y);
            for (let i = 1; i < this.currentUserStroke.length; i++) this.ctx.lineTo(this.currentUserStroke[i].x, this.currentUserStroke[i].y);
            this.ctx.lineTo(this.cursor.x, this.cursor.y);
            this.ctx.stroke();
        }

        // Draw Cursor
        this.ctx.fillStyle = '#FFC107';
        this.ctx.beginPath();
        this.ctx.arc(this.cursor.x, this.cursor.y, 10, 0, Math.PI * 2);
        this.ctx.fill();
    }

    getInfoHTML() {
        return `
            <div class="stat">
                <span class="stat-label">Characters</span>
                <span class="stat-value">${Math.floor(this.score / 100)}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Character</span>
                <span class="stat-value">${this.currentCharacter}</span>
            </div>
        `;
    }
}

window.CharacterTraceGame = CharacterTraceGame;
