/**
 * Fine Motor Skills - Main Application Logic
 * coordinates game launching, overlays, and gesture engine state.
 */

const app = {
    currentGame: null,

    init() {
        console.log('Fine Motor Skills Module Initialized');
        // Ensure gesture engine is ready
        if (window.gestureEngine) {
            window.gestureEngine.init();
        }
    },

    launchGame(gameType) {
        console.log(`Launching game: ${gameType}`);

        // Show overlay
        const overlay = document.getElementById('game-overlay');
        overlay.classList.remove('hidden');

        // title setup
        const titles = {
            'tracing': 'Air Tracing ✍️',
            'pinch': 'Pinch & Place 🤏',
            'steady': 'Steady Hand ⚡'
        };
        document.getElementById('current-game-title').textContent = titles[gameType];
        document.getElementById('score-display').classList.remove('hidden');

        // Clear previous canvas
        const container = document.getElementById('game-canvas-container');
        container.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.id = 'game-canvas';
        // Make canvas fill the container
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        container.appendChild(canvas);

        // Initialize specific game logic
        switch (gameType) {
            case 'tracing':
                this.currentGame = new TracingGame(canvas);
                break;
            case 'pinch':
                this.currentGame = new PinchPlaceGame(canvas);
                break;
            case 'steady':
                this.currentGame = new SteadyHandGame(canvas);
                break;
        }

        if (this.currentGame) {
            this.currentGame.start();
        }
    },

    exitGame() {
        if (this.currentGame) {
            this.currentGame.stop();
            this.currentGame = null;
        }

        document.getElementById('game-overlay').classList.add('hidden');
        document.getElementById('success-modal').classList.add('hidden');

        // Re-enable main menu gestures if needed
        // (Gesture engine is global, so it keeps running, but we might want to reset its mode)
        document.body.classList.remove('wand-restricted');
    },

    showSuccess(message) {
        const modal = document.getElementById('success-modal');
        document.getElementById('level-complete-msg').textContent = message || "You did it!";
        modal.classList.remove('hidden');

        // Confetti could go here!
    },

    restartLevel() {
        document.getElementById('success-modal').classList.add('hidden');
        if (this.currentGame) {
            this.currentGame.restart();
        }
    }
};

// Base class for Games to ensure consistent API
class BaseGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.animationFrame = null;
    }

    start() {
        this.isRunning = true;
        this.loop();
    }

    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationFrame);
    }

    restart() {
        // Override me
    }

    loop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        this.animationFrame = requestAnimationFrame(() => this.loop());
    }

    update() {
        // Override me
    }

    draw() {
        // Override me
    }
}

// Game classes are loaded from separate files

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
