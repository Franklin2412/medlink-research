/**
 * Gesture Engine
 * Uses MediaPipe Hands to detect simple gestures and simulate mouse events.
 * Designed for MedLink Research.
 */

class GestureEngine {
    constructor() {
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        this.cursorElement = null;
        this.hands = null;
        this.camera = null;

        // Load preference immediately
        const saved = localStorage.getItem('gesture-control-enabled');
        this.isEnabled = saved === 'true';

        this.isGrabbing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.lastGrabY = 0;
        this.isScrolling = false;
        this.isClicking = false;

        this.waveDetector = {
            history: [],
            threshold: 0.15,
            lastWaveTime: 0
        };

        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        // Load MediaPipe scripts dynamically if not already present
        await this.loadScripts();

        this.createElements();
        this.setupHands();

        this.isInitialized = true;

        if (this.isEnabled) {
            this.enable();
        }
    }

    async loadScripts() {
        const scripts = [
            'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
            'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
            'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js'
        ];

        for (const src of scripts) {
            if (!document.querySelector(`script[src="${src}"]`)) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
        }
    }

    createElements() {
        // Cursor
        this.cursorElement = document.createElement('div');
        this.cursorElement.id = 'gesture-cursor';
        this.cursorElement.classList.add('hidden');
        document.body.appendChild(this.cursorElement);

        // Camera Container
        const container = document.createElement('div');
        container.id = 'gesture-camera-container';
        container.classList.add('hidden');

        this.videoElement = document.createElement('video');
        this.videoElement.id = 'gesture-video';

        this.canvasElement = document.createElement('canvas');
        this.canvasElement.id = 'gesture-canvas';
        this.canvasCtx = this.canvasElement.getContext('2d');

        container.appendChild(this.videoElement);
        container.appendChild(this.canvasElement);

        // Try to dock in the sidebar if it exists
        const dock = document.getElementById('gesture-camera-dock');
        if (dock) {
            dock.appendChild(container);
            container.style.position = 'relative';
        } else {
            document.body.appendChild(container);
        }

        // Toggle Button (Add to menu or float)
        this.addToggleControl();
    }

    addToggleControl() {
        if (this.toggleBtn) return;

        const btn = document.createElement('button');
        btn.className = `btn btn-small ${this.isEnabled ? 'btn-accent' : 'btn-secondary'} gesture-toggle-btn`;
        btn.innerHTML = this.isEnabled ? '🚫 Disable Gestures' : '✋ Enable Gestures';
        btn.onclick = () => this.toggle();

        // Try to find a navigation container for better alignment
        const nav = document.querySelector('.side-controls, .accessibility-toolbar, .nav-links, nav, .header-actions');
        if (nav) {
            // Ensure we insert before the camera dock if it's in the same container
            const dock = nav.querySelector('#gesture-camera-dock');
            if (dock) {
                nav.insertBefore(btn, dock);
            } else {
                nav.appendChild(btn);
            }
        } else {
            // Fallback to fixed positioning if no header container is found
            btn.classList.add('fixed');
            document.body.appendChild(btn);
        }

        this.toggleBtn = btn;
    }

    setupHands() {
        // @ts-ignore
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults((results) => this.onResults(results));
    }

    enable() {
        this.isEnabled = true;
        localStorage.setItem('gesture-control-enabled', 'true');

        if (this.toggleBtn) {
            this.toggleBtn.innerHTML = '🚫 Disable Gestures';
            this.toggleBtn.classList.replace('btn-secondary', 'btn-accent');
        }

        document.getElementById('gesture-camera-container')?.classList.remove('hidden');
        document.body.classList.add('gesture-active');

        if (this.cursorElement) this.cursorElement.classList.remove('hidden');

        if (!this.camera) {
            this.startCamera();
        } else {
            this.camera.start();
        }
    }

    disable() {
        this.isEnabled = false;
        localStorage.setItem('gesture-control-enabled', 'false');

        if (this.toggleBtn) {
            this.toggleBtn.innerHTML = '✋ Enable Gestures';
            this.toggleBtn.classList.replace('btn-accent', 'btn-secondary');
        }

        document.getElementById('gesture-camera-container')?.classList.add('hidden');
        document.body.classList.remove('gesture-active');

        if (this.cursorElement) this.cursorElement.classList.add('hidden');

        if (this.camera) {
            this.camera.stop();
        }
    }

    startCamera() {
        // @ts-ignore
        this.camera = new Camera(this.videoElement, {
            onFrame: async () => {
                await this.hands.send({ image: this.videoElement });
            },
            width: 640,
            height: 480
        });
        this.camera.start();
    }

    toggle() {
        if (this.isEnabled) this.disable();
        else this.enable();
    }

    onResults(results) {
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            // Check for restriction mode
            const isRestricted = document.body.classList.contains('wand-restricted');
            const bottomBarHeight = 144; // Should match --bottom-bar-height
            const screenHeight = window.innerHeight;
            const thresholdY = screenHeight - bottomBarHeight;

            // Draw landmarks for clearer feedback
            // @ts-ignore
            drawConnectors(this.canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#4ECDC4', lineWidth: 4 });
            // @ts-ignore
            drawLandmarks(this.canvasCtx, landmarks, { color: '#FFD93D', lineWidth: 1, radius: 2 });

            // Tracking index finger tip (8)
            const indexTip = landmarks[8];

            // Comfort Zone Scaling: Map central 70% of camera to 100% of screen.
            // This makes it MUCH easier for kids to reach the edges and improves calibration.
            const margin = 0.15; // 15% margin on each side

            let nx = (indexTip.x - margin) / (1 - 2 * margin);
            let ny = (indexTip.y - margin) / (1 - 2 * margin);

            // Clamp to [0, 1]
            nx = Math.max(0, Math.min(1, nx));
            ny = Math.max(0, Math.min(1, ny));

            // nx is the normalized horizontal position (0-1)
            // Flip it (1 - nx) to match mirrored camera behavior
            const x = (1 - nx) * window.innerWidth;
            const y = ny * window.innerHeight;

            if (isRestricted) {
                // If restricted, only show wand when in the bottom bar area
                if (y >= thresholdY) {
                    document.body.classList.add('wand-restricted-active');
                    this.cursorElement.classList.remove('restricted');
                    this.updateCursor(x, y);
                    this.detectGestures(landmarks, x, y);
                } else {
                    document.body.classList.remove('wand-restricted-active');
                    this.cursorElement.classList.add('restricted');
                }
            } else {
                this.updateCursor(x, y);
                this.detectGestures(landmarks, x, y);
            }
        } else {
            // Reset wave history when hand is lost to prevent jumps
            this.waveDetector.history = [];
        }
        this.canvasCtx.restore();
    }

    updateCursor(x, y) {
        // Smooth cursor movement (Lerp)
        const lerp = 0.4;
        const targetX = x;
        const targetY = y;

        const curX = parseFloat(this.cursorElement.style.left) || targetX;
        const curY = parseFloat(this.cursorElement.style.top) || targetY;

        const finalX = curX + (targetX - curX) * lerp;
        const finalY = curY + (targetY - curY) * lerp;

        this.cursorElement.style.left = `${finalX}px`;
        this.cursorElement.style.top = `${finalY}px`;
        this.lastX = finalX;
        this.lastY = finalY;
    }

    detectGestures(landmarks, x, y) {
        // 1. Click Detection (Fist OR Pinch)

        // Fist Detection
        const palmBase = landmarks[0];
        const fingertips = [8, 12, 16, 20].map(i => landmarks[i]);
        const distances = fingertips.map(f => Math.hypot(f.x - palmBase.x, f.y - palmBase.y));
        const avgDistance = distances.reduce((a, b) => a + b) / 4;
        const isFist = avgDistance < 0.14;

        // Pinch Detection (Thumb tip to Index tip)
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
        const isPinch = pinchDist < 0.055; // Threshold for pinch

        // 1. Interaction Logic (Pinch to Click)
        const isCurrentlyClicking = isPinch;
        if (isCurrentlyClicking && !this.isClicking) {
            this.startClick(x, y);
        } else if (!isCurrentlyClicking && this.isClicking) {
            this.stopClick(x, y);
        }

        // 2. Scrolling Logic (Fist to Scroll) - only if NOT restricted and NOT clicking
        const isCurrentlyScrolling = isFist && !isCurrentlyClicking && !document.body.classList.contains('wand-restricted');
        if (isCurrentlyScrolling) {
            if (!this.isScrolling) {
                this.startScroll(y);
            }
            this.handleScroll(y);
        } else if (this.isScrolling) {
            this.stopScroll();
        }

        this.lastGrabY = y;

        // 3. Wave Detection (Back)
        this.detectWave(landmarks);
    }

    startClick(x, y) {
        this.isClicking = true;
        this.cursorElement.classList.add('grabbing');
        this.simulateMouseEvent('mousedown', x, y);
    }

    stopClick(x, y) {
        this.isClicking = false;
        this.cursorElement.classList.remove('grabbing');
        this.simulateMouseEvent('mouseup', x, y);
        this.simulateMouseEvent('click', x, y);
    }

    startScroll(y) {
        this.isScrolling = true;
        this.lastGrabY = y;
        this.cursorElement.classList.add('scrolling');
        // Visual feedback for scrolling
        this.cursorElement.setAttribute('data-content', '👆');
    }

    handleScroll(y) {
        const deltaY = y - this.lastGrabY;
        const sensitivity = 1.5;
        const scrollAmount = deltaY * sensitivity;

        const scrollContainer = document.querySelector('.playing-area');
        if (scrollContainer) {
            scrollContainer.scrollTop += scrollAmount;
        } else {
            window.scrollBy(0, scrollAmount);
        }
        this.lastGrabY = y;
    }

    stopScroll() {
        this.isScrolling = false;
        this.cursorElement.classList.remove('scrolling');
        this.cursorElement.removeAttribute('data-content');
    }

    detectWave(landmarks) {
        const wrist = landmarks[0];
        this.waveDetector.history.push(wrist.x);
        if (this.waveDetector.history.length > 25) this.waveDetector.history.shift();

        if (this.waveDetector.history.length === 25) {
            const min = Math.min(...this.waveDetector.history);
            const max = Math.max(...this.waveDetector.history);
            const range = max - min;

            let directionChanges = 0;
            let lastDir = 0;
            for (let i = 1; i < this.waveDetector.history.length; i++) {
                let dir = Math.sign(this.waveDetector.history[i] - this.waveDetector.history[i - 1]);
                if (dir !== 0 && dir !== lastDir) {
                    if (lastDir !== 0) directionChanges++;
                    lastDir = dir;
                }
            }

            // Stricter Wave: Larger range and more direction changes
            if (range > 0.35 && directionChanges >= 3) {
                const now = Date.now();
                if (now - this.waveDetector.lastWaveTime > 3000) {
                    this.onWaveDetected();
                    this.waveDetector.lastWaveTime = now;
                    this.waveDetector.history = []; // Reset history
                }
            }
        }
    }

    onWaveDetected() {
        // Prevent accidental triggers if already on a menu or index page
        const isMenu = document.getElementById('welcome-screen')?.classList.contains('active') ||
            window.location.pathname.endsWith('index.html');
        if (isMenu) return;

        document.body.classList.add('wave-active');
        setTimeout(() => document.body.classList.remove('wave-active'), 1000);

        // Trigger back navigation
        const backBtn = document.querySelector('.btn-secondary[href*="index.html"], #back-to-menu, .back-to-menu-btn, #back-to-menu-btn');
        if (backBtn) {
            backBtn.click();
        } else {
            console.log('Wave detected! No back button found.');
        }
    }


    simulateMouseEvent(type, x, y) {
        // If restricted and above bottom bar, ignore events
        if (document.body.classList.contains('wand-restricted')) {
            const bottomBarHeight = 144;
            if (y < window.innerHeight - bottomBarHeight) return;
        }

        const element = document.elementFromPoint(x, y);
        if (element) {
            const event = new MouseEvent(type, {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y
            });
            element.dispatchEvent(event);
        }
    }
}

// Global instance
const gestureEngine = new GestureEngine();
document.addEventListener('DOMContentLoaded', () => {
    gestureEngine.init();
});
