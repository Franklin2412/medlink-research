class DuckCatchActivity extends BaseActivity {
    constructor(detector, gameCanvas) {
        super(detector, gameCanvas);
        this.ducks = [];
        this.items = [];
        this.particles = [];
        this.basketPos = { x: gameCanvas.width / 2, y: gameCanvas.height - 70 };
        this.targetBasketX = gameCanvas.width / 2;
        this.basketWidth = 100;
        this.basketHeight = 50;
        this.sceneryMode = true;
        this.brokenItems = [];
        this.waveOffset = 0;
        this.basketGlow = 0; // 0.0 to 1.0 glow effect
    }

    start() {
        this.items = [];
        this.particles = [];
        this.setupDucks();
        super.start();

        if (this.sceneryMode) {
            const videoElement = document.getElementById('dc-video');
            if (videoElement) videoElement.style.opacity = '0';
        }
    }

    setupDucks() {
        this.ducks = [];
        const padding = 80;
        const availableWidth = this.gameCanvas.width - padding * 2;
        const count = 5;
        const spacing = availableWidth / (count - 1);

        for (let i = 0; i < count; i++) {
            this.ducks.push({
                x: padding + i * spacing,
                y: 100,
                color: ['#FFEB3B', '#FFC107', '#FF9800'][i % 3],
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.03 + Math.random() * 0.04,
                blinkTimer: Math.random() * 100,
                isBlinking: false,
                lastDropTime: Date.now() + Math.random() * 2000
            });
        }
    }

    update() {
        super.update();
        const now = Date.now();
        this.waveOffset += 0.05;

        // 1. Update basket (Hand Tracking)
        const hands = this.detector.getDetectedHands();
        if (hands.length > 0) {
            const indexTip = hands[0].landmarks[8];
            this.targetBasketX = (1 - indexTip.x) * this.gameCanvas.width;
        }
        this.basketPos.x += (this.targetBasketX - this.basketPos.x) * 0.25;

        // Bounds
        this.basketPos.x = Math.max(this.basketWidth / 2, Math.min(this.gameCanvas.width - this.basketWidth / 2, this.basketPos.x));

        // 2. Update Ducks (Animations)
        this.ducks.forEach(duck => {
            duck.wobble += duck.wobbleSpeed;
            duck.blinkTimer--;
            if (duck.blinkTimer <= 0) {
                duck.isBlinking = !duck.isBlinking;
                duck.blinkTimer = duck.isBlinking ? 5 : 60 + Math.random() * 100;
            }

            if (now - duck.lastDropTime > 4000 + Math.random() * 3000) {
                this.spawnItem(duck);
                duck.lastDropTime = now;
            }
        });

        // 3. Update Items & Collisions
        this.items.forEach(item => {
            item.y += item.speed;
            item.rotation += item.rotationSpeed;

            // Catch Logic
            const inX = Math.abs(item.x - this.basketPos.x) < this.basketWidth / 2;
            const inY = item.y > this.basketPos.y - 10 && item.y < this.basketPos.y + 20;

            if (inX && inY) {
                this.handleCatch(item);
                item.dead = true;
            } else if (item.y > this.gameCanvas.height - 40) {
                this.handleMiss(item);
                item.dead = true;
            }
        });
        this.items = this.items.filter(i => !i.dead);

        // 4. Update Particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // gravity
            p.life -= 0.02;
        });
        this.particles = this.particles.filter(p => p.life > 0);
        this.brokenItems = this.brokenItems.filter(s => now - s.timestamp < 1200);

        // Fade out basket glow
        if (this.basketGlow > 0) {
            this.basketGlow -= 0.05;
            if (this.basketGlow < 0) this.basketGlow = 0;
        }

        this.draw();
    }

    spawnItem(duck) {
        const type = Math.random() > 0.25 ? 'egg' : 'waste';
        this.items.push({
            x: duck.x,
            y: duck.y + 25,
            type,
            speed: 2.5 + Math.random() * 2,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            dead: false
        });
    }

    handleCatch(item) {
        if (item.type === 'egg') {
            this.score += 10;
            this.basketGlow = 1.0; // Trigger glow for eggs
        } else {
            this.score = Math.max(0, this.score - 5);
            this.createSplash(item.x, this.basketPos.y, '#795548'); // Keep splash for waste
        }
    }

    handleMiss(item) {
        if (item.type === 'egg') {
            this.brokenItems.push({ x: item.x, y: this.gameCanvas.height - 30, timestamp: Date.now() });
            this.createSplash(item.x, this.gameCanvas.height - 30, '#4FC3F7');
        }
    }

    createSplash(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 6,
                vy: -Math.random() * 8,
                color,
                life: 1.0,
                size: 3 + Math.random() * 5
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.drawScenery();

        // 1. Draw Ducks on Branch
        this.drawBranch();
        this.ducks.forEach(duck => this.drawDuck(duck));

        // 2. Draw Items
        this.items.forEach(item => {
            this.ctx.save();
            this.ctx.translate(item.x, item.y);
            this.ctx.rotate(item.rotation);
            if (item.type === 'egg') {
                this.drawEgg();
            } else {
                this.drawWaste();
            }
            this.ctx.restore();
        });

        // 3. Draw Broken Egg Splats
        this.brokenItems.forEach(splat => {
            this.ctx.save();
            this.ctx.translate(splat.x, splat.y);
            this.drawSplat();
            this.ctx.restore();
        });

        // 4. Draw Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;

        // 5. Draw Basket
        this.drawBasket();
    }

    drawScenery() {
        // Sky
        const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.gameCanvas.height);
        skyGrad.addColorStop(0, '#B3E5FC');
        skyGrad.addColorStop(0.6, '#E1F5FE');
        this.ctx.fillStyle = skyGrad;
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Sun
        this.ctx.fillStyle = '#FFF59D';
        this.ctx.beginPath();
        this.ctx.arc(this.gameCanvas.width - 80, 80, 45, 0, Math.PI * 2);
        this.ctx.fill();

        // Water Pond
        this.ctx.fillStyle = '#0288D1';
        this.ctx.fillRect(0, this.gameCanvas.height - 80, this.gameCanvas.width, 80);

        // Animated Ripples
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            const y = this.gameCanvas.height - 60 + i * 20;
            for (let x = 0; x <= this.gameCanvas.width; x += 20) {
                const dy = Math.sin(x * 0.02 + this.waveOffset + i) * 5;
                if (x === 0) this.ctx.moveTo(x, y + dy);
                else this.ctx.lineTo(x, y + dy);
            }
            this.ctx.stroke();
        }
    }

    drawBranch() {
        this.ctx.save();
        this.ctx.fillStyle = '#5D4037';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.roundRect(40, 95, this.gameCanvas.width - 80, 20, 10);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawDuck(duck) {
        this.ctx.save();
        const bob = Math.sin(duck.wobble) * 4;
        this.ctx.translate(duck.x, duck.y + bob);

        // Body
        this.ctx.fillStyle = duck.color;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 22, 18, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Head
        this.ctx.beginPath();
        this.ctx.arc(18, -10, 14, 0, Math.PI * 2);
        this.ctx.fill();

        // Eye
        this.ctx.fillStyle = '#000';
        if (!duck.isBlinking) {
            this.ctx.beginPath();
            this.ctx.arc(22, -12, 2.5, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(20, -12); this.ctx.lineTo(24, -12);
            this.ctx.stroke();
        }

        // Beak
        this.ctx.fillStyle = '#FF5722';
        this.ctx.beginPath();
        this.ctx.moveTo(30, -10);
        this.ctx.lineTo(42, -8);
        this.ctx.lineTo(30, -4);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawEgg() {
        const grad = this.ctx.createRadialGradient(-3, -5, 2, 0, 0, 15);
        grad.addColorStop(0, '#FFF');
        grad.addColorStop(1, '#F5F5F5');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 12, 16, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#E0E0E0';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    drawWaste() {
        this.ctx.fillStyle = '#795548';
        this.ctx.beginPath();
        this.ctx.arc(0, 5, 8, 0, Math.PI * 2);
        this.ctx.arc(0, -2, 6, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawSplat() {
        this.ctx.fillStyle = '#FFEB3B'; // Yolk
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 15, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#FFF'; // Shell
        for (let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            const angle = (i * Math.PI) / 2;
            this.ctx.moveTo(Math.cos(angle) * 10, Math.sin(angle) * 5);
            this.ctx.lineTo(Math.cos(angle + 0.5) * 18, Math.sin(angle + 0.5) * 10);
            this.ctx.lineTo(Math.cos(angle - 0.5) * 12, Math.sin(angle - 0.5) * 8);
            this.ctx.fill();
        }
    }

    drawBasket() {
        this.ctx.save();
        this.ctx.translate(this.basketPos.x, this.basketPos.y);

        // Base Shadow
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = 'rgba(0,0,0,0.3)';

        // Catch Glow Effect
        if (this.basketGlow > 0) {
            this.ctx.save();
            this.ctx.shadowBlur = 30 * this.basketGlow;
            this.ctx.shadowColor = `rgba(255, 215, 0, ${this.basketGlow})`;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${this.basketGlow})`;
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.roundRect(-this.basketWidth / 2 - 5, -5, this.basketWidth + 10, this.basketHeight + 10, 15);
            this.ctx.stroke();
            this.ctx.restore();
        }

        // Basket Body
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.basketHeight);
        grad.addColorStop(0, '#A1887F');
        grad.addColorStop(1, '#5D4037');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.roundRect(-this.basketWidth / 2, 0, this.basketWidth, this.basketHeight, [0, 0, 15, 15]);
        this.ctx.fill();

        // Woven lines
        this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        this.ctx.lineWidth = 2;
        for (let i = -this.basketWidth / 2 + 10; i < this.basketWidth / 2; i += 15) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0); this.ctx.lineTo(i, this.basketHeight);
            this.ctx.stroke();
        }

        // Rim
        this.ctx.fillStyle = this.basketGlow > 0.5 ? '#FFD700' : '#4E342E';
        this.ctx.beginPath();
        this.ctx.roundRect(-this.basketWidth / 2 - 5, -5, this.basketWidth + 10, 12, 6);
        this.ctx.fill();

        this.ctx.restore();
    }

    getInfoHTML() {
        return `
            <div class="stat">
                <span class="stat-label">Score</span>
                <span class="stat-value pulse">${this.score}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Time</span>
                <span class="stat-value">${this.formatTime(this.time)}</span>
            </div>
        `;
    }

    saveStats() {
        super.saveStats('duckCatch');
    }

    stop() {
        if (this.sceneryMode) {
            const videoElement = document.getElementById('dc-video');
            if (videoElement) videoElement.style.opacity = '1';
        }
        super.stop();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DuckCatchActivity;
}
window.DuckCatchActivity = DuckCatchActivity;
