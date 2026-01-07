/**
 * HandyHelper Main Application
 * Handles UI navigation, camera setup, and activity management
 */

// Global state
let currentDetector = null;
let currentActivity = null;
let selectedActivity = null;

// DOM Elements
const screens = {
    welcome: document.getElementById('welcome-screen'),
    cameraSetup: document.getElementById('camera-setup-screen'),
    whichHand: document.getElementById('which-hand-screen'),
    handTracker: document.getElementById('hand-tracker-screen'),
    catchStars: document.getElementById('catch-stars-screen'),
    balloonPop: document.getElementById('balloon-pop-screen'),
    duckCatch: document.getElementById('duck-catch-screen'),
    featherFlyer: document.getElementById('feather-flyer-screen')
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    showWelcomeScreen();
});

function setupEventListeners() {
    // Activity start buttons
    document.querySelectorAll('.start-activity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.activity-card');
            selectedActivity = card.dataset.activity;
            showCameraSetup();
        });
    });

    // Camera setup buttons
    document.getElementById('start-activity-btn').addEventListener('click', () => {
        startSelectedActivity();
    });

    document.getElementById('cancel-setup-btn').addEventListener('click', () => {
        stopCamera();
        showWelcomeScreen();
    });

    // Activity stop buttons
    document.getElementById('universal-exit-btn').addEventListener('click', () => stopActivity());

    // Statistics modal
    document.getElementById('view-stats-btn').addEventListener('click', () => showStatsModal());
    document.getElementById('close-stats-modal').addEventListener('click', () => closeStatsModal());
    document.getElementById('close-stats-btn').addEventListener('click', () => closeStatsModal());
    document.getElementById('export-stats-btn').addEventListener('click', () => exportStats());

    // Close modal on backdrop click
    document.getElementById('stats-modal').addEventListener('click', (e) => {
        if (e.target.id === 'stats-modal') {
            closeStatsModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('stats-modal');
            if (modal.classList.contains('active')) {
                closeStatsModal();
            }
        }
    });
}

function showScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });

    // Show requested screen
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
    }
}

function showWelcomeScreen() {
    showScreen('welcome');
    document.body.classList.remove('wand-restricted');
}

async function showCameraSetup() {
    showScreen('cameraSetup');
    document.body.classList.remove('wand-restricted');

    const statusElement = document.getElementById('camera-status');
    const startBtn = document.getElementById('start-activity-btn');

    try {
        statusElement.querySelector('.status-icon').textContent = '⏳';
        statusElement.querySelector('.status-text').textContent = 'Initializing camera...';
        statusElement.classList.remove('hidden');
        startBtn.disabled = true;

        // Initialize hand detector
        const video = document.getElementById('camera-video');
        const handCanvas = document.getElementById('camera-hand-canvas');
        const gameCanvas = document.getElementById('camera-game-canvas');

        currentDetector = new HandDetector();
        await currentDetector.initialize(video, handCanvas);

        // Set game canvas size
        gameCanvas.width = 640;
        gameCanvas.height = 480;

        // Camera ready
        statusElement.querySelector('.status-icon').textContent = '✅';
        statusElement.querySelector('.status-text').textContent = 'Camera ready! Wave your hands to test.';

        setTimeout(() => {
            statusElement.classList.add('hidden');
            startBtn.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('Camera setup failed:', error);
        statusElement.querySelector('.status-icon').textContent = '❌';
        statusElement.querySelector('.status-text').textContent =
            'Camera access denied or not available. Please allow camera access and try again.';

        setTimeout(() => {
            stopCamera();
            showWelcomeScreen();
        }, 4000);
    }
}

function startSelectedActivity() {
    if (!currentDetector) {
        alert('Camera not initialized!');
        return;
    }

    document.getElementById('universal-exit-btn').classList.remove('hidden');
    document.getElementById('game-info-display').innerHTML = 'Initializing...';
    document.body.classList.add('wand-restricted');

    switch (selectedActivity) {
        case 'which-hand':
            startWhichHandActivity();
            break;
        case 'hand-tracker':
            break;
        case 'catch-stars':
            startCatchStarsActivity();
            break;
        case 'balloon-pop':
            startBalloonPopActivity();
            break;
        case 'duck-catch':
            startDuckCatchActivity();
            break;
        case 'feather-flyer':
            startFeatherFlierActivity();
            break;
        default:
            alert('Unknown activity!');
    }
}

function startWhichHandActivity() {
    showScreen('whichHand');

    // Transfer camera to activity screen
    const video = document.getElementById('wh-video');
    const handCanvas = document.getElementById('wh-hand-canvas');
    const gameCanvas = document.getElementById('wh-game-canvas');

    transferCamera(video, handCanvas, gameCanvas);

    // Create and start activity
    currentActivity = new WhichHandActivity(currentDetector, gameCanvas);
    currentActivity.start();
}

function startHandTrackerActivity() {
    showScreen('handTracker');

    // Transfer camera to activity screen
    const video = document.getElementById('ht-video');
    const handCanvas = document.getElementById('ht-hand-canvas');
    const gameCanvas = document.getElementById('ht-game-canvas');

    transferCamera(video, handCanvas, gameCanvas);

    // Create and start activity
    currentActivity = new HandTrackerActivity(currentDetector, gameCanvas);
    currentActivity.start();
}

function startCatchStarsActivity() {
    showScreen('catchStars');

    // Transfer camera to activity screen
    const video = document.getElementById('cs-video');
    const handCanvas = document.getElementById('cs-hand-canvas');
    const gameCanvas = document.getElementById('cs-game-canvas');

    transferCamera(video, handCanvas, gameCanvas);

    // Create and start activity
    currentActivity = new CatchStarsActivity(currentDetector, gameCanvas);
    currentActivity.start();
}

function startBalloonPopActivity() {
    showScreen('balloonPop');

    // Transfer camera to activity screen
    const video = document.getElementById('bp-video');
    const handCanvas = document.getElementById('bp-hand-canvas');
    const gameCanvas = document.getElementById('bp-game-canvas');

    transferCamera(video, handCanvas, gameCanvas);

    // Create and start activity
    currentActivity = new BalloonPopActivity(currentDetector, gameCanvas);
    currentActivity.start();
}

function startDuckCatchActivity() {
    showScreen('duckCatch');

    // Transfer camera to activity screen
    const video = document.getElementById('dc-video');
    const handCanvas = document.getElementById('dc-hand-canvas');
    const gameCanvas = document.getElementById('dc-game-canvas');

    transferCamera(video, handCanvas, gameCanvas);

    // Create and start activity
    currentActivity = new DuckCatchActivity(currentDetector, gameCanvas);
    currentActivity.start();
}

function startFeatherFlierActivity() {
    showScreen('featherFlyer');

    // Transfer camera to activity screen
    const video = document.getElementById('ff-video');
    const handCanvas = document.getElementById('ff-hand-canvas');
    const gameCanvas = document.getElementById('ff-game-canvas');

    transferCamera(video, handCanvas, gameCanvas);

    // Create and start activity
    currentActivity = new FeatherFlierActivity(currentDetector, gameCanvas);
    currentActivity.start();
}

function transferCamera(newVideo, newHandCanvas, newGameCanvas) {
    // Get current video stream
    const oldVideo = currentDetector.videoElement;
    const stream = oldVideo.srcObject;

    // Transfer to new video element
    newVideo.srcObject = stream;
    newVideo.play();

    // Update detector references
    currentDetector.videoElement = newVideo;
    currentDetector.canvasElement = newHandCanvas;
    currentDetector.canvasCtx = newHandCanvas.getContext('2d');

    // Set canvas sizes
    newHandCanvas.width = 640;
    newHandCanvas.height = 480;
    newGameCanvas.width = 640;
    newGameCanvas.height = 480;
}

function stopActivity() {
    if (currentActivity) {
        currentActivity.stop();
        currentActivity = null;
    }

    document.getElementById('universal-exit-btn').classList.add('hidden');
    document.getElementById('game-info-display').innerHTML = '';
    document.body.classList.remove('wand-restricted');

    stopCamera();
    showWelcomeScreen();
}

function stopCamera() {
    if (currentDetector) {
        currentDetector.stop();
        currentDetector = null;
    }
}

function showStatsModal() {
    const modal = document.getElementById('stats-modal');
    const statsContent = document.getElementById('stats-content');

    const progressData = StorageManager.loadProgress('handy-helper');

    if (!progressData) {
        statsContent.innerHTML = `
      <div class="no-stats">
        <div class="no-stats-icon">👋</div>
        <p>No activities completed yet. Start playing to track your progress!</p>
      </div>
    `;
    } else {
        statsContent.innerHTML = generateStatsHTML(progressData);
    }

    modal.classList.add('active');
}

function closeStatsModal() {
    const modal = document.getElementById('stats-modal');
    modal.classList.remove('active');
}

function generateStatsHTML(data) {
    let html = '';

    // Which Hand Stats
    if (data.whichHand && data.whichHand.sessionsCompleted > 0) {
        const whData = data.whichHand;
        const totalUsage = whData.handUsage.left + whData.handUsage.right;
        const leftPercent = totalUsage > 0 ? Math.round((whData.handUsage.left / totalUsage) * 100) : 0;
        const rightPercent = totalUsage > 0 ? Math.round((whData.handUsage.right / totalUsage) * 100) : 0;
        const avgScore = Math.round(whData.totalScore / whData.sessionsCompleted);

        html += `
      <div class="stats-section">
        <h3>🖐️ Which Hand Activity</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-card-value">${whData.sessionsCompleted}</span>
            <span class="stat-card-label">Sessions Completed</span>
          </div>
          <div class="stat-card">
            <span class="stat-card-value">${avgScore}/10</span>
            <span class="stat-card-label">Average Score</span>
          </div>
          <div class="stat-card">
            <span class="stat-card-value">${leftPercent}%</span>
            <span class="stat-card-label">Left Hand Usage</span>
          </div>
          <div class="stat-card">
            <span class="stat-card-value">${rightPercent}%</span>
            <span class="stat-card-label">Right Hand Usage</span>
          </div>
        </div>
      </div>
    `;
    }

    // Catch Stars Stats
    if (data.catchStars && data.catchStars.sessionsCompleted > 0) {
        const csData = data.catchStars;
        const avgScore = Math.round(csData.totalStarsCaught / csData.sessionsCompleted);

        html += `
      <div class="stats-section">
        <h3>⭐ Catch the Stars</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-card-value">${csData.sessionsCompleted}</span>
            <span class="stat-card-label">Sessions Completed</span>
          </div>
          <div class="stat-card">
            <span class="stat-card-value">${csData.totalStarsCaught}</span>
            <span class="stat-card-label">Total Stars Caught</span>
          </div>
          <div class="stat-card">
            <span class="stat-card-value">${csData.bestScore}</span>
            <span class="stat-card-label">Best Score</span>
          </div>
          <div class="stat-card">
            <span class="stat-card-value">${avgScore}</span>
            <span class="stat-card-label">Average Stars/Session</span>
          </div>
        </div>
      </div>
    `;
    }

    if (!html) {
        html = `
      <div class="no-stats">
        <div class="no-stats-icon">👋</div>
        <p>No activities completed yet. Start playing to track your progress!</p>
      </div>
    `;
    }

    return html;
}

function exportStats() {
    const data = StorageManager.loadProgress('handy-helper');

    if (!data) {
        alert('No statistics to export yet!');
        return;
    }

    // Create formatted CSV
    let csv = 'Activity,Date,Score,Details\n';

    // Which Hand history
    if (data.whichHand && data.whichHand.history) {
        data.whichHand.history.forEach(session => {
            const date = new Date(session.date).toLocaleString();
            const details = `Left: ${session.handUsage.left}, Right: ${session.handUsage.right}`;
            csv += `"Which Hand","${date}",${session.score},"${details}"\n`;
        });
    }

    // Catch Stars history
    if (data.catchStars && data.catchStars.history) {
        data.catchStars.history.forEach(session => {
            const date = new Date(session.date).toLocaleString();
            csv += `"Catch Stars","${date}",${session.score},"Time: ${session.time}s"\n`;
        });
    }

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `handyhelper-stats-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Statistics exported successfully!');
}
