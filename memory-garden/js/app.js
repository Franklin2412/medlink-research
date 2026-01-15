/**
 * Memory Garden Main Application
 * Handles screen navigation, UI interactions, and game initialization
 */

// Global state
let currentGame = null;
let currentDifficulty = 'easy';

// DOM Elements
const screens = {
    welcome: document.getElementById('welcome-screen'),
    game: document.getElementById('game-screen'),
    victory: document.getElementById('victory-screen'),
    sequence: document.getElementById('sequence-screen'),
    treasure: document.getElementById('treasure-screen')
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    showWelcomeScreen();
});

function setupEventListeners() {
    // Activity card clicks
    const activityCards = document.querySelectorAll('.activity-card');
    activityCards.forEach(card => {
        const activity = card.dataset.activity;

        if (activity === 'memory-match') {
            // Difficulty badge clicks
            const badges = card.querySelectorAll('.badge[data-difficulty]');
            badges.forEach(badge => {
                badge.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const difficulty = badge.dataset.difficulty;
                    startMemoryMatch(difficulty);
                });
            });
        }
    });

    // Navigation buttons
    document.getElementById('uni-back-to-menu-btn').addEventListener('click', () => {
        showWelcomeScreen();
    });

    // Victory screen buttons
    document.getElementById('play-again-btn').addEventListener('click', () => {
        if (currentGame instanceof MemoryMatchGame) {
            startMemoryMatch(currentDifficulty);
        } else if (currentGame instanceof GardenSequenceGame) {
            startGardenSequence();
        } else if (currentGame instanceof TreasureHuntGame) {
            startTreasureHunt(currentDifficulty);
        }
    });

    // Back to menu is handled by the universal bottom bar button

    // Progress modal
    document.getElementById('view-progress-btn').addEventListener('click', () => {
        showProgressModal();
    });

    document.getElementById('close-progress-modal').addEventListener('click', () => {
        closeProgressModal();
    });

    document.getElementById('close-progress-btn').addEventListener('click', () => {
        closeProgressModal();
    });

    document.getElementById('export-progress-btn').addEventListener('click', () => {
        exportProgress();
    });

    // Close modal on backdrop click
    document.getElementById('progress-modal').addEventListener('click', (e) => {
        if (e.target.id === 'progress-modal') {
            closeProgressModal();
        }
    });

    // Keyboard navigation (Escape to close modal)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('progress-modal');
            if (modal.classList.contains('active')) {
                closeProgressModal();
            }
        }
    });

    // Garden Sequence event listeners
    document.querySelector('.start-sequence-btn')?.addEventListener('click', () => {
        startGardenSequence();
    });

    document.getElementById('sequence-back-btn')?.addEventListener('click', () => {
        showWelcomeScreen();
    });

    document.getElementById('gs-play-again')?.addEventListener('click', () => {
        startGardenSequence();
    });

    document.getElementById('gs-back-menu')?.addEventListener('click', () => {
        showWelcomeScreen();
    });

    // Treasure Hunt event listeners
    const treasureCard = document.querySelector('[data-activity="treasure-hunt"]');
    if (treasureCard) {
        const badges = treasureCard.querySelectorAll('.badge[data-difficulty]');
        badges.forEach(badge => {
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                const difficulty = badge.dataset.difficulty;
                startTreasureHunt(difficulty);
            });
        });
    }

    document.getElementById('treasure-back-btn')?.addEventListener('click', () => {
        showWelcomeScreen();
    });

    document.getElementById('gs-back-menu')?.addEventListener('click', () => {
        showWelcomeScreen();
    });

    document.getElementById('th-back-menu')?.addEventListener('click', () => {
        showWelcomeScreen();
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
    document.getElementById('uni-back-to-menu-btn').classList.add('hidden');
    document.getElementById('game-info-display').innerHTML = '';
}

function startMemoryMatch(difficulty) {
    currentDifficulty = difficulty;
    document.getElementById('difficulty-label').textContent = capitalizeFirst(difficulty);
    currentGame = new MemoryMatchGame(difficulty);
    showScreen('game');
    document.getElementById('uni-back-to-menu-btn').classList.remove('hidden');
}

function startGardenSequence() {
    // Reset sequence UI if needed
    const container = document.getElementById('sequence-flowers');
    container.innerHTML = '';

    // Create flower elements
    const flowers = [
        { emoji: '🌷', name: 'Tulip' },
        { emoji: '🌻', name: 'Sunflower' },
        { emoji: '🌸', name: 'Cherry Blossom' },
        { emoji: '🌺', name: 'Hibiscus' },
        { emoji: '🌼', name: 'Daisy' },
        { emoji: '🏵️', name: 'Rosette' }
    ];

    flowers.forEach(flower => {
        const btn = document.createElement('div');
        btn.className = 'sequence-flower';
        btn.dataset.flower = flower.name;
        btn.textContent = flower.emoji;
        btn.addEventListener('click', () => {
            if (currentGame instanceof GardenSequenceGame) {
                currentGame.handleFlowerClick(flower);
            }
        });
        container.appendChild(btn);
    });

    currentGame = new GardenSequenceGame();
    showScreen('sequence');
    document.getElementById('uni-back-to-menu-btn').classList.remove('hidden');
    currentGame.start();
}

function startTreasureHunt(difficulty) {
    currentDifficulty = difficulty;
    currentGame = new TreasureHuntGame();
    showScreen('treasure');
    document.getElementById('uni-back-to-menu-btn').classList.remove('hidden');
    currentGame.start(difficulty);
}

function showProgressModal() {
    const modal = document.getElementById('progress-modal');
    const progressContent = document.getElementById('progressContent');

    const progressData = StorageManager.loadProgress('memory-garden');

    if (!progressData) {
        progressContent.innerHTML = `
      <div class="no-progress">
        <div class="no-progress-icon">🌱</div>
        <p>No games played yet. Start playing to track your progress!</p>
      </div>
    `;
    } else {
        progressContent.innerHTML = generateProgressHTML(progressData);
    }

    modal.classList.add('active');
}

function closeProgressModal() {
    const modal = document.getElementById('progress-modal');
    modal.classList.remove('active');
}

function generateProgressHTML(data) {
    let html = '';

    // Current Session Stats
    const sessionData = StorageManager.getSessionStats();
    if (sessionData && sessionData.length > 0) {
        html += `
      <div class="progress-section current-session">
        <h3>✨ Current Session Activity</h3>
        <p style="font-size: 0.8rem; color: var(--text-light); margin-top: -10px; margin-bottom: 15px;">
          Resets on page refresh or tab close
        </p>
    `;

        sessionData.slice().reverse().forEach(activity => {
            const time = new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            html += `
        <div class="progress-stat">
          <span>${activity.activity} (${time})</span>
          <strong>${activity.score}</strong>
        </div>
      `;
        });

        html += `</div>`;
    }

    // Overall Stats
    html += `
    <div class="progress-section">
      <h3>🎮 Overall Statistics</h3>
      <div class="progress-stat">
        <span>Total Games Played</span>
        <strong>${data.totalGames}</strong>
      </div>
      <div class="progress-stat">
        <span>Games Completed</span>
        <strong>${data.gamesWon}</strong>
      </div>
    </div>
  `;

    // Best Scores by Difficulty
    html += `
    <div class="progress-section">
      <h3>🏆 Best Scores</h3>
  `;

    const difficulties = ['easy', 'medium', 'hard'];
    difficulties.forEach(diff => {
        if (data.bestMoves[diff]) {
            const timeStr = formatTime(data.bestTimes[diff] || 0);
            html += `
        <div class="progress-stat">
          <span>${capitalizeFirst(diff)}</span>
          <strong>${data.bestMoves[diff]} moves in ${timeStr}</strong>
        </div>
      `;
        }
    });

    html += `</div>`;

    // Recent Games
    if (data.history && data.history.length > 0) {
        html += `
      <div class="progress-section">
        <h3>📅 Recent Games (Last 10)</h3>
    `;

        const recentGames = data.history.slice(-10).reverse();
        recentGames.forEach(game => {
            const date = new Date(game.date);
            const dateStr = date.toLocaleDateString();
            const timeStr = formatTime(game.time);

            html += `
        <div class="progress-stat">
          <span>${capitalizeFirst(game.difficulty)} - ${dateStr}</span>
          <strong>${game.moves} moves, ${timeStr}</strong>
        </div>
      `;
        });

        html += `</div>`;
    }

    return html;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function exportProgress() {
    const data = StorageManager.loadProgress('memory-garden');

    if (!data) {
        alert('No progress data to export yet!');
        return;
    }

    // Create formatted CSV
    let csv = 'Date,Difficulty,Moves,Time (seconds)\n';

    if (data.history) {
        data.history.forEach(game => {
            const date = new Date(game.date).toLocaleString();
            csv += `"${date}","${game.difficulty}",${game.moves},${game.time}\n`;
        });
    }

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-garden-progress-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Progress data exported successfully!');
}

// Accessibility: Announce screen changes to screen readers
function announceScreenChange(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}
