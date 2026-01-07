/**
 * Gesture Engine
 * Uses MediaPipe Hands to detect simple gestures and simulate mouse events.
 * Designed for NMDA Therapy Tools.
 */

class GestureEngine {
    constructor() {
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        this.cursorElement = null;
        this.hands = null;
        this.camera = null;

        this.isEnabled = false;
        this.isGrabbing = false;
        this.lastX = 0;
        this.lastY = 0;

        this.waveDetector = {
            history: [],
            threshold: 0.15,
            lastWaveTime: 0
        };
    }

    async init() {
        if (this.hands) return;

        // Load MediaPipe scripts dynamically if not already present
        await this.loadScripts();

        this.createElements();
        this.setupHands();

        // Load preference
        const saved = localStorage.getItem('gesture-control-enabled');
        if (saved === 'true') {
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
        document.body.appendChild(container);

        // Toggle Button (Add to menu or float)
        this.addToggleControl();
    }

    addToggleControl() {
        const btn = document.createElement('button');
        btn.className = 'btn btn-small btn-secondary gesture-toggle-btn';
        btn.innerHTML = '✋ Enable Gestures';
        btn.onclick = () => this.toggle();
        document.body.appendChild(btn);
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

    async enable() {
        this.isEnabled = true;
        localStorage.setItem('gesture-control-enabled', 'true');
        this.toggleBtn.innerHTML = '🚫 Disable Gestures';
        this.toggleBtn.classList.replace('btn-secondary', 'btn-accent');

        document.getElementById('gesture-camera-container').classList.remove('hidden');
        this.cursorElement.classList.remove('hidden');

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

    disable() {
        this.isEnabled = false;
        localStorage.setItem('gesture-control-enabled', 'false');
        this.toggleBtn.innerHTML = '✋ Enable Gestures';
        this.toggleBtn.classList.replace('btn-accent', 'btn-secondary');

        document.getElementById('gesture-camera-container').classList.add('hidden');
        this.cursorElement.classList.add('hidden');

        if (this.camera) {
            this.camera.stop();
        }
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

            // Draw landmarks for debugging/feedback
            // @ts-ignore
            drawConnectors(this.canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#4ECDC4', lineWidth: 5 });
            // @ts-ignore
            drawLandmarks(this.canvasCtx, landmarks, { color: '#FFD93D', lineWidth: 2 });

            // Tracking index finger tip (8)
            const indexTip = landmarks[8];
            const x = (1 - indexTip.x) * window.innerWidth;
            const y = indexTip.y * window.innerHeight;

            this.updateCursor(x, y);
            this.detectGestures(landmarks, x, y);
        }
        this.canvasCtx.restore();
    }

    updateCursor(x, y) {
        this.cursorElement.style.left = `${x}px`;
        this.cursorElement.style.top = `${y}px`;
        this.lastX = x;
        this.lastY = y;
    }

    detectGestures(landmarks, x, y) {
        // 1. Grab Detection (Fist)
        // Check distance between fingertips and palm base
        const palmBase = landmarks[0];
        const fingertips = [8, 12, 16, 20].map(i => landmarks[i]);
        const distances = fingertips.map(f => Math.hypot(f.x - palmBase.x, f.y - palmBase.y));
        const avgDistance = distances.reduce((a, b) => a + b) / 4;

        // Threshold for a fist (fingers tucked in)
        if (avgDistance < 0.12 && !this.isGrabbing) {
            this.startGrab(x, y);
        } else if (avgDistance > 0.18 && this.isGrabbing) {
            this.stopGrab(x, y);
        }

        // 2. Wave Detection (Back)
        this.detectWave(landmarks);
    }

    startGrab(x, y) {
        this.isGrabbing = true;
        this.cursorElement.classList.add('grabbing');
        this.simulateMouseEvent('mousedown', x, y);
    }

    stopGrab(x, y) {
        this.isGrabbing = false;
        this.cursorElement.classList.remove('grabbing');
        this.simulateMouseEvent('mouseup', x, y);
        this.simulateMouseEvent('click', x, y);
    }

    detectWave(landmarks) {
        const wrist = landmarks[0];
        this.waveDetector.history.push(wrist.x);
        if (this.waveDetector.history.length > 20) this.waveDetector.history.shift();

        if (this.waveDetector.history.length === 20) {
            const min = Math.min(...this.waveDetector.history);
            const max = Math.max(...this.waveDetector.history);
            const range = max - min;

            // Check for direction changes (back and forth motion)
            let directionChanges = 0;
            let lastDir = 0;
            for (let i = 1; i < this.waveDetector.history.length; i++) {
                let dir = Math.sign(this.waveDetector.history[i] - this.waveDetector.history[i - 1]);
                if (dir !== 0 && dir !== lastDir) {
                    if (lastDir !== 0) directionChanges++;
                    lastDir = dir;
                }
            }

            // A wave needs a significant range AND at least 2 direction changes
            if (range > 0.25 && directionChanges >= 2) {
                const now = Date.now();
                if (now - this.waveDetector.lastWaveTime > 2000) {
                    this.onWaveDetected();
                    this.waveDetector.lastWaveTime = now;
                }
            }
        }
    }

    onWaveDetected() {
        document.body.classList.add('wave-active');
        setTimeout(() => document.body.classList.remove('wave-active'), 1000);

        // Trigger back navigation
        const backBtn = document.querySelector('.btn-secondary[href*="index.html"], #back-to-menu, .back-to-menu-btn');
        if (backBtn) {
            backBtn.click();
        } else {
            console.log('Wave detected! No back button found.');
        }
    }

    simulateMouseEvent(type, x, y) {
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
