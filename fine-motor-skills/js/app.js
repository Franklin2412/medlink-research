/**
 * Fine Motor Skills - Main Application Logic
 * coordinates game launching, overlays, and gesture engine state.
 */

const app = {
    currentGame: null,
    pendingGameType: null,

    init() {
        console.log('Fine Motor Skills Module Initialized');
        // We do NOT auto-init gesture engine here anymore.
        // We wait for the user to select a game, mimicking the "Balloon Pop" flow.
    },

    launchGame(gameType) {
        console.log(`Preparing to launch: ${gameType}`);
        this.pendingGameType = gameType;
        this.showCameraSetup();
    },

    showCameraSetup() {
        const modal = document.getElementById('camera-setup-modal');
        modal.classList.remove('hidden');

        const status = document.getElementById('setup-status');
        const btn = document.getElementById('btn-start-game');
        const preview = document.getElementById('setup-preview-container');

        status.textContent = "waking up camera...";
        btn.disabled = true;

        // Initialize Gesture Engine
        if (window.gestureEngine) {
            // First ensure it's initialized
            const startPromise = window.gestureEngine.isInitialized
                ? Promise.resolve()
                : window.gestureEngine.init();

            startPromise.then(() => {
                // Ensure enabled
                if (!window.gestureEngine.isEnabled) {
                    window.gestureEngine.enable();
                }

                // Wait a moment for camera to actually start
                setTimeout(() => {
                    // Check if we can find the video element to mirror it?
                    // The gesture engine creates its own video element.
                    // We can try to append it or clone it? 
                    // Actually, GestureEngine docks it into 'gesture-camera-dock'.
                    // For setup, we might want to temporarily move it or just trust the status.

                    // Let's rely on the dock.
                    // But strictly speaking, the user wants a "Setup" screen.
                    // Let's verify readiness.
                    const video = document.getElementById('gesture-video');
                    if (video && video.readyState >= 2) {
                        this.onCameraReady();
                    } else {
                        // Polling check
                        const checkInt = setInterval(() => {
                            const v = document.getElementById('gesture-video');
                            if (v && v.readyState >= 2) {
                                clearInterval(checkInt);
                                this.onCameraReady();
                            }
                        }, 500);
                    }
                }, 1000);
            });
        }
    },

    onCameraReady() {
        const status = document.getElementById('setup-status');
        const btn = document.getElementById('btn-start-game');
        status.textContent = "Camera Ready! Wave to test 👋";
        btn.disabled = false;
        btn.classList.add('pulse'); // Add some visual cue

        // Move the camera preview to the modal if possible?
        // The shared engine puts it in the navbar. 
        // Let's just clone the stream to our preview box for a cool effect
        const sourceVideo = document.getElementById('gesture-video');
        if (sourceVideo) {
            let previewVideo = document.getElementById('setup-preview-video');
            if (!previewVideo) {
                previewVideo = document.createElement('video');
                previewVideo.id = 'setup-preview-video';
                previewVideo.className = 'setup-video-mirror';
                previewVideo.autoplay = true;
                document.getElementById('setup-preview-container').innerHTML = ''; // Clear spinner
                document.getElementById('setup-preview-container').appendChild(previewVideo);
            }
            previewVideo.srcObject = sourceVideo.srcObject;
        }
    },

    startGame() {
        if (!this.pendingGameType) return;

        // Hide setup
        document.getElementById('camera-setup-modal').classList.add('hidden');

        // Launch actual game
        this.runGame(this.pendingGameType);
    },

    cancelSetup() {
        document.getElementById('camera-setup-modal').classList.add('hidden');
        this.pendingGameType = null;
        // Optionally disable camera to save battery?
        // window.gestureEngine.disable(); 
        // But maybe keep it warm if they just clicked wrong.
    },

    runGame(gameType) {
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
        document.body.classList.remove('wand-restricted');
    },

    showSuccess(message) {
        const modal = document.getElementById('success-modal');
        document.getElementById('level-complete-msg').textContent = message || "You did it!";
        modal.classList.remove('hidden');

        // Play success sound
        soundManager.play('success');

        // Trigger Confetti
        confetti.explode(window.innerWidth / 2, window.innerHeight / 2);
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

/**
 * Sound Manager using Web Audio API for synthesized sounds
 * (No external assets required!)
 */
const soundManager = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),

    init() {
        // Resume context if suspended (browser policy)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    play(type) {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        if (type === 'pop') {
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'success') {
            // Arpeggio
            [440, 554, 659, 880].forEach((freq, i) => {
                const o = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                o.connect(g);
                g.connect(this.ctx.destination);
                o.frequency.value = freq;
                g.gain.setValueAtTime(0.1, now + (i * 0.1));
                g.gain.linearRampToValueAtTime(0, now + (i * 0.1) + 0.3);
                o.start(now + (i * 0.1));
                o.stop(now + (i * 0.1) + 0.3);
            });
        } else if (type === 'fail') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.3);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'tick') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        }
    }
};

/**
 * Simple Particle Confetti System
 */
const confetti = {
    explode(x, y) {
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#A29BFE'];
        const el = document.getElementById('game-overlay');

        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.style.position = 'absolute';
            p.style.width = '10px';
            p.style.height = '10px';
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            p.style.left = x + 'px';
            p.style.top = y + 'px';
            p.style.borderRadius = '50%';
            p.style.pointerEvents = 'none';
            p.style.zIndex = '2001'; // Above modal

            // Random velocity
            const angle = Math.random() * Math.PI * 2;
            const velocity = 5 + Math.random() * 10;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            el.appendChild(p);

            // Animate
            let posX = x;
            let posY = y;
            let velX = vx;
            let velY = vy;
            let opacity = 1;

            const animate = () => {
                posX += velX;
                posY += velY;
                velY += 0.5; // Gravity
                opacity -= 0.02;

                p.style.left = posX + 'px';
                p.style.top = posY + 'px';
                p.style.opacity = opacity;

                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    p.remove();
                }
            };
            requestAnimationFrame(animate);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
