/**
 * Fine Motor Gesture Lab - Unified Controller
 * Handles navigation between Fun Activities and Precision Training
 */

// Global state
let currentDetector = null;
let currentActivity = null;
let selectedActivity = null;

// DOM Elements
const screens = {
    welcome: document.getElementById('welcome-screen'),
    cameraSetup: document.getElementById('camera-setup-screen'),
    trajectory: document.getElementById('trajectory-screen'),
    // Fun Activity screens
    'which-hand': document.getElementById('which-hand-screen'),
    'catch-stars': document.getElementById('catch-stars-screen'),
    'balloon-pop': document.getElementById('balloon-pop-screen'),
    'duck-catch': document.getElementById('duck-catch-screen'),
    'feather-flyer': document.getElementById('feather-flyer-screen')
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    showWelcomeScreen();
});

function setupEventListeners() {
    // Activity start buttons (Grid clicks)
    document.querySelectorAll('.start-activity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.activity-card');
            selectedActivity = card.dataset.activity;
            console.log(`[App] Selected: ${selectedActivity}`);

            // Auto-trigger camera
            showCameraSetup();
        });
    });

    // Camera setup "Ready" button
    const readyBtn = document.getElementById('start-activity-btn');
    if (readyBtn) {
        readyBtn.addEventListener('click', () => {
            startSelectedActivity();
        });
    }

    const cancelBtn = document.getElementById('cancel-setup-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            stopCamera();
            showWelcomeScreen();
        });
    }

    // Universal Stop button
    const exitBtn = document.getElementById('universal-exit-btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', () => stopActivity());
    }

    // Stats
    const statsBtn = document.getElementById('view-stats-btn');
    if (statsBtn) {
        statsBtn.addEventListener('click', () => {
            if (window.StorageManager && window.StorageManager.showSessionStats) {
                window.StorageManager.showSessionStats();
            } else {
                // Fallback to the activity score modal if StorageManager helper isn't present
                showStatsModal();
            }
        });
    }

    // Trajectory Game Over restart
    const tjRestart = document.getElementById('tj-restart-btn');
    if (tjRestart) {
        tjRestart.addEventListener('click', () => {
            document.getElementById('tj-game-over').classList.add('hidden');
            if (currentActivity) currentActivity.start();
        });
    }
}

function showScreen(screenName) {
    console.log(`[App] Showing screen: ${screenName}`);
    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.remove('active');
    });

    const target = screens[screenName] || document.getElementById(`${screenName}-screen`);
    if (target) {
        target.classList.add('active');
    }
}

function showWelcomeScreen() {
    showScreen('welcome');
    document.body.classList.remove('no-gesture-scroll');
}

async function showCameraSetup() {
    showScreen('cameraSetup');

    const statusElement = document.getElementById('camera-status');
    const startBtn = document.getElementById('start-activity-btn');

    try {
        if (statusElement) {
            statusElement.querySelector('.status-text').textContent = 'Initializing camera...';
            statusElement.classList.remove('hidden');
        }
        if (startBtn) startBtn.disabled = true;

        // Initialize hand detector (Shared across all games)
        const video = document.getElementById('camera-video');
        const handCanvas = document.getElementById('camera-hand-canvas');

        if (!currentDetector) {
            currentDetector = new HandDetector();
            await currentDetector.initialize(video, handCanvas);
        }

        if (statusElement) statusElement.querySelector('.status-text').textContent = 'Camera ready!';
        setTimeout(() => {
            if (statusElement) statusElement.classList.add('hidden');
            if (startBtn) startBtn.disabled = false;
        }, 1000);

    } catch (error) {
        console.error('Camera setup failed:', error);
        if (statusElement) statusElement.querySelector('.status-text').textContent = 'Camera error! Please check permissions.';
    }
}

function startSelectedActivity() {
    document.getElementById('universal-exit-btn').classList.remove('hidden');
    document.body.classList.add('no-gesture-scroll');

    const activityMap = {
        'which-hand': startWhichHand,
        'catch-stars': startCatchStars,
        'balloon-pop': startBalloonPop,
        'duck-catch': startDuckCatch,
        'feather-flyer': startFeatherFlyer,
        'spaceracer': () => startTrajectory('spaceracer'),
        'airtracing': () => startTrajectory('airtracing'),
        'pipeconnector': () => startTrajectory('pipeconnector')
    };

    if (activityMap[selectedActivity]) {
        activityMap[selectedActivity]();
    } else {
        console.error(`Unknown activity: ${selectedActivity}`);
    }
}

// --- Fun Activities Runners ---

function startWhichHand() {
    showScreen('which-hand');
    const tc = getTransferRefs('wh');
    transferCamera(tc.video, tc.hand, tc.game);
    currentActivity = new WhichHandActivity(currentDetector, tc.game);
    currentActivity.start();
}

function startCatchStars() {
    showScreen('catch-stars');
    const tc = getTransferRefs('cs');
    transferCamera(tc.video, tc.hand, tc.game);
    currentActivity = new CatchStarsActivity(currentDetector, tc.game);
    currentActivity.start();
}

function startBalloonPop() {
    showScreen('balloon-pop');
    const tc = getTransferRefs('bp');
    transferCamera(tc.video, tc.hand, tc.game);
    currentActivity = new BalloonPopActivity(currentDetector, tc.game);
    currentActivity.start();
}

function startDuckCatch() {
    showScreen('duck-catch');
    const tc = getTransferRefs('dc');
    transferCamera(tc.video, tc.hand, tc.game);
    currentActivity = new DuckCatchActivity(currentDetector, tc.game);
    currentActivity.start();
}

function startFeatherFlyer() {
    showScreen('feather-flyer');
    const tc = getTransferRefs('ff');
    transferCamera(tc.video, tc.hand, tc.game);
    currentActivity = new FeatherFlyerActivity(currentDetector, tc.game);
    currentActivity.start();
}

// --- Precision Training (Trajectory) Runner ---

function startTrajectory(type) {
    showScreen('trajectory');
    const tc = getTransferRefs('tj');
    transferCamera(tc.video, tc.hand, tc.game);

    const scoreVal = document.getElementById('tj-score');
    const levelVal = document.getElementById('tj-level');
    const overlay = document.getElementById('tj-game-over');

    const callbacks = {
        onScore: (s) => { if (scoreVal) scoreVal.textContent = s; },
        onLevel: (l) => { if (levelVal) levelVal.textContent = l; },
        onGameOver: (msg, title) => {
            const overTitle = document.getElementById('tj-over-title');
            const overMsg = document.getElementById('tj-over-msg');
            if (overTitle) overTitle.textContent = title || 'Mission Complete!';
            if (overMsg) overMsg.textContent = msg;
            if (overlay) overlay.classList.remove('hidden');
        }
    };

    if (type === 'spaceracer') currentActivity = new SpaceRacerGame(tc.game, callbacks);
    else if (type === 'airtracing') currentActivity = new AirTracingGame(tc.game, callbacks);
    else if (type === 'pipeconnector') currentActivity = new PipeConnectorGame(tc.game, callbacks);

    // Update detector for trajectory games
    currentActivity.detector = currentDetector;

    currentActivity.start();
}

// --- Helpers ---

function getTransferRefs(prefix) {
    return {
        video: document.getElementById(`${prefix}-video`),
        hand: document.getElementById(`${prefix}-hand-canvas`),
        game: document.getElementById(`${prefix}-game-canvas`)
    };
}

function transferCamera(newVideo, newHandCanvas, newGameCanvas) {
    if (!newVideo || !newHandCanvas || !newGameCanvas) return;

    const stream = currentDetector.videoElement.srcObject;
    newVideo.srcObject = stream;
    newVideo.play();

    currentDetector.videoElement = newVideo;
    currentDetector.canvasElement = newHandCanvas;
    currentDetector.canvasCtx = newHandCanvas.getContext('2d');

    // Standard game resolution
    newHandCanvas.width = 800;
    newHandCanvas.height = 600;
    newGameCanvas.width = 800;
    newGameCanvas.height = 600;
}

function stopActivity() {
    if (currentActivity) {
        if (currentActivity.stop) currentActivity.stop();
        currentActivity = null;
    }
    const exitBtn = document.getElementById('universal-exit-btn');
    if (exitBtn) exitBtn.classList.add('hidden');
    document.body.classList.remove('no-gesture-scroll');
    showWelcomeScreen();
}

function stopCamera() {
    if (currentDetector) {
        currentDetector.stop();
        currentDetector = null;
    }
}

// Fallback Stats Modal logic (copied from old app.js if needed)
function showStatsModal() {
    const modal = document.getElementById('stats-modal');
    if (modal) modal.classList.add('active');
}
function closeStatsModal() {
    const modal = document.getElementById('stats-modal');
    if (modal) modal.classList.remove('active');
}
