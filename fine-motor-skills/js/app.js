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
        this.resizeCanvas();
        this.ui.banner.classList.add('hidden');
        this.ui.grid.classList.add('hidden');
        this.ui.gameContainer.classList.remove('hidden');
        this.ui.overlay.classList.add('hidden');

        // Reset Score
        this.ui.scoreVal.textContent = '0';
        this.ui.levelVal.textContent = '1';

        // Initialize specific game
        switch (type) {
            case 'spaceracer':
                this.ui.gameTitle.textContent = '🚀 Space Racer';
                if (window.SpaceRacerGame) {
                    this.currentGame = new window.SpaceRacerGame(this.ui.canvas, this.callbacks);
                    this.currentGame.start();
                }
                break;
            case 'airtracing':
                this.ui.gameTitle.textContent = '✨ Air Tracing';
                if (window.AirTracingGame) {
                    this.currentGame = new window.AirTracingGame(this.ui.canvas, this.callbacks);
                    this.currentGame.start();
                }
                break;
            case 'pipeconnector':
                this.ui.gameTitle.textContent = '🔧 Pipe Maze';
                if (window.PipeConnectorGame) {
                    this.currentGame = new window.PipeConnectorGame(this.ui.canvas, this.callbacks);
                    this.currentGame.start();
                }
                break;
        }
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
