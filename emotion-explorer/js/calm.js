class BreathingGame {
    constructor() {
        this.isActive = false;
        this.timer = null;
        this.circle = document.getElementById('breathing-circle');
        this.label = document.getElementById('breath-instruction');
        this.phases = [
            { text: 'Inhale...', size: '300px', duration: 4000 },
            { text: 'Hold...', size: '300px', duration: 2000 },
            { text: 'Exhale...', size: '100px', duration: 4000 },
            { text: 'Hold...', size: '100px', duration: 2000 }
        ];
        this.currentPhase = 0;
    }

    start() {
        this.isActive = true;
        this.currentPhase = 0;
        this.runPhase();
    }

    stop() {
        this.isActive = false;
        clearTimeout(this.timer);
        this.circle.style.width = '100px';
        this.circle.style.height = '100px';
    }

    runPhase() {
        if (!this.isActive) return;

        const phase = this.phases[this.currentPhase];
        this.label.textContent = phase.text;
        this.circle.style.width = phase.size;
        this.circle.style.height = phase.size;

        this.timer = setTimeout(() => {
            this.currentPhase = (this.currentPhase + 1) % this.phases.length;
            this.runPhase();
        }, phase.duration);
    }
}

class BubbleGame {
    constructor() {
        this.container = document.getElementById('bubble-container');
        this.isActive = false;
        this.interval = null;
    }

    start() {
        this.isActive = true;
        this.container.innerHTML = '';
        this.interval = setInterval(() => this.createBubble(), 1000);
    }

    stop() {
        this.isActive = false;
        clearInterval(this.interval);
        this.container.innerHTML = '';
    }

    createBubble() {
        if (!this.isActive) return;

        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        const size = Math.random() * 60 + 40;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 90}%`;

        const duration = Math.random() * 4 + 4;
        bubble.style.animationDuration = `${duration}s`;

        bubble.onclick = () => {
            bubble.style.transform = 'scale(1.5)';
            bubble.style.opacity = '0';
            setTimeout(() => bubble.remove(), 200);

            // Subtle sound
            const osc = window.speechSynthesis.getVoices(); // Just to trigger a "ping" if we had audio context
            // For now, no sound to keep it simple and silent/calm
        };

        this.container.appendChild(bubble);

        // Auto remove if not popped
        setTimeout(() => {
            if (bubble.parentNode) bubble.remove();
        }, duration * 1000);
    }
}
