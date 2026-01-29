class CatchStarsActivity extends BaseActivity {
    constructor(detector, gameCanvas) {
        super(detector, gameCanvas);
        this.stars = [];
        this.particles = [];
        this.trail = [];
        this.spawnInterval = null;
        this.maxTrailLength = 10;
    }

    start() {
        this.stars = [];
        this.particles = [];
        this.trail = [];
        super.start();

        this.spawnInterval = setInterval(() => this.spawnStar(), 1500); // Slightly faster
        this.spawnStar();
    }

    spawnStar() {
        this.stars.push({
            x: 50 + Math.random() * (this.gameCanvas.width - 100),
            y: -50,
            radius: 20 + Math.random() * 10,
            speed: 1.5 + Math.random() * 2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            glow: 0,
            glowDir: 1,
            caught: false
        });
    }

    update() {
        super.update();
        const hands = this.detector.getDetectedHands();

        // 1. Update Hand Trail
        if (hands.length > 0) {
            const index = hands[0].landmarks[8];
            const x = (1 - index.x) * this.gameCanvas.width;
            const y = index.y * this.gameCanvas.height;

            this.trail.unshift({ x, y, life: 1.0 });
            if (this.trail.length > this.maxTrailLength) this.trail.pop();
        } else {
            if (this.trail.length > 0) this.trail.pop();
        }

        // 2. Update Stars
        this.stars.forEach(star => {
            star.y += star.speed;
            star.rotation += star.rotationSpeed;

            // Pulsing glow
            star.glow += 0.05 * star.glowDir;
            if (star.glow > 1 || star.glow < 0) star.glowDir *= -1;

            hands.forEach(hand => {
                const index = hand.landmarks[8];
                const hx = (1 - index.x) * this.gameCanvas.width;
                const hy = index.y * this.gameCanvas.height;

                const distance = Math.hypot(star.x - hx, star.y - hy);
                if (distance < star.radius + 35) {
                    this.catchStar(star);
                }
            });
        });

        // 3. Update Particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Gravity
            p.life -= 0.02;
            p.size *= 0.98;
        });

        this.stars = this.stars.filter(s => !s.caught && s.y < this.gameCanvas.height + 50);
        this.particles = this.particles.filter(p => p.life > 0);
        this.trail.forEach(t => t.life -= 0.05);

        this.draw();
    }

    catchStar(star) {
        this.score++;
        star.caught = true;
        this.createBurst(star.x, star.y, '#FFD93D');

        // Sound effect (optional, subtle)
        if (window.speechSynthesis && this.score % 5 === 0) {
            const utterance = new SpeechSynthesisUtterance('Yay!');
            utterance.rate = 2;
            utterance.pitch = 2;
            utterance.volume = 0.2;
            // window.speechSynthesis.speak(utterance);
        }
    }

    createBurst(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                life: 1.0,
                size: 4 + Math.random() * 4
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Background
        this.drawScenery();

        // 1. Draw Hand Trail (Magical Sparkles)
        this.trail.forEach((point, i) => {
            this.ctx.globalAlpha = point.life * (1 - i / this.maxTrailLength);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 4 * (1 - i / this.maxTrailLength), 0, Math.PI * 2);
            this.ctx.fill();

            // Add a little glow to the lead of the trail
            if (i === 0) {
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#FFF';
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
        this.ctx.globalAlpha = 1.0;

        // 2. Draw Stars
        this.stars.forEach(star => {
            this.drawGlowStar(star);
        });

        // 3. Draw Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;
    }

    drawScenery() {
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.gameCanvas.height);
        grad.addColorStop(0, '#0D47A1');
        grad.addColorStop(1, '#000000');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Nebula Effect
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        const nebulaGrad = this.ctx.createRadialGradient(
            this.gameCanvas.width * 0.7, this.gameCanvas.height * 0.3, 0,
            this.gameCanvas.width * 0.7, this.gameCanvas.height * 0.3, 300
        );
        nebulaGrad.addColorStop(0, 'rgba(103, 58, 183, 0.3)');
        nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = nebulaGrad;
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.ctx.restore();

        // Stars
        this.ctx.fillStyle = '#FFF';
        for (let i = 0; i < 40; i++) {
            const tx = ((Math.sin(i * 123) + 1) / 2) * this.gameCanvas.width;
            const ty = ((Math.cos(i * 456) + 1) / 2) * this.gameCanvas.height;
            const size = Math.random() * 2;
            this.ctx.globalAlpha = 0.2 + Math.random() * 0.5;
            this.ctx.fillRect(tx, ty, size, size);
        }

        // Moon
        this.ctx.save();
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fillStyle = '#EEE';
        this.ctx.beginPath();
        this.ctx.arc(80, 80, 40, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        this.ctx.globalAlpha = 1.0;
    }

    drawGlowStar(star) {
        this.ctx.save();
        this.ctx.translate(star.x, star.y);
        this.ctx.rotate(star.rotation);

        // Radial gradient for core glow
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, star.radius);
        gradient.addColorStop(0, '#FFF');
        gradient.addColorStop(0.4, '#FFD93D');
        gradient.addColorStop(1, 'rgba(255, 217, 61, 0)');

        this.ctx.shadowBlur = 10 + (star.glow * 15);
        this.ctx.shadowColor = '#FFD93D';

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? star.radius : star.radius / 2.2;
            const angle = (i * Math.PI) / 5;
            this.ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
        }
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
    }

    getInfoHTML() {
        return `
            <div class="stat">
                <span class="stat-label">Stars Caught</span>
                <span class="stat-value pulse">${this.score}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Time</span>
                <span class="stat-value">${this.formatTime(this.time)}</span>
            </div>
        `;
    }

    saveStats() {
        super.saveStats('catchStars');
    }

    stop() {
        if (this.spawnInterval) clearInterval(this.spawnInterval);
        super.stop();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CatchStarsActivity;
}
window.CatchStarsActivity = CatchStarsActivity;
