/**
 * Fine Motor Skills - Main Controller
 */

const App = {
    currentGame: null,

    init() {
        this.cacheDOM();
        this.bindEvents();

        // Check gesture engine status
        setInterval(() => this.checkGestureStatus(), 1000);
    },

    cacheDOM() {
        this.ui = {
            banner: document.querySelector('.welcome-banner'),
            grid: document.querySelector('.games-grid'),
            gameContainer: document.getElementById('game-container'),
            gameTitle: document.getElementById('active-game-title'),
            canvas: document.getElementById('game-canvas'),
            overlay: document.getElementById('game-overlay'),
            overlayTitle: document.getElementById('overlay-title'),
            overlayMsg: document.getElementById('overlay-msg'),
            enableBtn: document.getElementById('enable-gestures-btn'),
            statusIndicator: document.getElementById('gesture-status'),
            scoreVal: document.getElementById('score-value'),
            levelVal: document.getElementById('level-value')
        };

        window.addEventListener('resize', () => this.resizeCanvas());
    },

    bindEvents() {
        if (this.ui.enableBtn) {
            this.ui.enableBtn.addEventListener('click', () => {
                if (window.gestureEngine) window.gestureEngine.enable();
            });
        }

        window.loadGame = (type) => this.loadGame(type);
        window.closeGame = () => this.closeGame();
        window.restartGame = () => {
            this.ui.overlay.classList.add('hidden');
            if (this.currentGame && this.currentGame.start) this.currentGame.start();
        };
    },

    resizeCanvas() {
        if (this.ui.canvas) {
            const rect = this.ui.canvas.parentElement.getBoundingClientRect();
            this.ui.canvas.width = rect.width;
            this.ui.canvas.height = rect.height;
        }
    },

    checkGestureStatus() {
        if (!window.gestureEngine) return;
        const isActive = window.gestureEngine.isEnabled;
        if (isActive) {
            this.ui.statusIndicator.textContent = '📷 Camera On';
            this.ui.statusIndicator.className = 'badge badge-success';
            this.ui.enableBtn.classList.add('hidden');
        } else {
            this.ui.statusIndicator.textContent = '❌ Camera Off';
            this.ui.statusIndicator.className = 'badge badge-warning';
            this.ui.enableBtn.classList.remove('hidden');
        }
    },

    loadGame(type) {
        console.log(`[App] Loading game: ${type}`);
        // Original UI state changes
        this.ui.banner.classList.add('hidden');
        this.ui.grid.classList.add('hidden');
        this.ui.gameContainer.classList.remove('hidden');
        this.ui.overlay.classList.add('hidden');

        // Reset Score
        this.ui.scoreVal.textContent = '0';
        this.ui.levelVal.textContent = '1';

        // Wait for layout to calculate dimensions
        requestAnimationFrame(() => {
            const canvas = this.ui.canvas; // Use cached canvas
            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;

            console.log(`[App] Canvas dimensions: ${width}x${height}`);

            if (width === 0 || height === 0) {
                console.warn("[App] Canvas dimension is 0! Retrying layout check...");
                // Fallback attempt
                setTimeout(() => this.loadGame(type), 100);
                return;
            }

            canvas.width = width;
            canvas.height = height;

            // Use existing callbacks structure
            const callbacks = this.callbacks;

            if (this.currentGame) this.currentGame.stop();

            // Initialize specific game
            switch (type) {
                case 'spaceracer': // Changed from 'space-racer' to match original
                    this.ui.gameTitle.textContent = '🚀 Space Racer';
                    if (window.SpaceRacerGame) {
                        this.currentGame = new window.SpaceRacerGame(canvas, callbacks);
                    }
                    break;
                case 'airtracing': // Changed from 'air-tracing' to match original
                    this.ui.gameTitle.textContent = '✨ Air Tracing';
                    if (window.AirTracingGame) {
                        this.currentGame = new window.AirTracingGame(canvas, callbacks);
                    }
                    break;
                case 'pipeconnector': // Changed from 'pipe-connector' to match original
                    this.ui.gameTitle.textContent = '🔧 Pipe Maze';
                    if (window.PipeConnectorGame) {
                        this.currentGame = new window.PipeConnectorGame(canvas, callbacks);
                    }
                    break;
            }

            if (this.currentGame) {
                console.log(`[App] Starting ${type}`);
                this.currentGame.start();
            }
        });
    },

    // Callbacks to update UI from within games
    get callbacks() {
        return {
            onScore: (score) => this.ui.scoreVal.textContent = score,
            onLevel: (level) => this.ui.levelVal.textContent = level,
            onGameOver: (msg, title = "Game Over") => {
                this.ui.overlayTitle.textContent = title;
                this.ui.overlayMsg.textContent = msg;
                this.ui.overlay.classList.remove('hidden');
            }
        };
    },

    closeGame() {
        if (this.currentGame) {
            this.currentGame.stop();
            this.currentGame = null;
        }
        this.ui.banner.classList.remove('hidden');
        this.ui.grid.classList.remove('hidden');
        this.ui.gameContainer.classList.add('hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
