/**
 * Treasure Hunt Game Logic
 * Spatial memory game - remember where treasures are hidden
 */

class TreasureHuntGame {
    constructor() {
        this.gridSize = 4; // 4x4 grid
        this.treasures = [];
        this.revealedTreasures = [];
        this.studyTime = 3000; // 3 seconds to memorize
        this.foundTreasures = 0;
        this.attempts = 0;
        this.maxAttempts = 10;
        this.score = 0;
        this.isStudying = true;
        this.treasureCount = 4; // number of treasures to find

        // Treasure types
        this.treasureTypes = ['💎', '🏆', '⭐', '👑', '💰', '🎁'];
    }

    start(difficulty = 'easy') {
        this.hideGameOver();
        // Adjust difficulty
        switch (difficulty) {
            case 'easy':
                this.gridSize = 4;
                this.treasureCount = 4;
                this.studyTime = 4000;
                break;
            case 'medium':
                this.gridSize = 5;
                this.treasureCount = 6;
                this.studyTime = 3000;
                break;
            case 'hard':
                this.gridSize = 6;
                this.treasureCount = 8;
                this.studyTime = 2000;
                break;
        }

        this.maxAttempts = this.treasureCount + 6;
        this.foundTreasures = 0;
        this.attempts = 0;
        this.score = 0;
        this.revealedTreasures = [];
        this.isStudying = true;

        this.generateTreasures();
        this.renderGrid();
        this.startStudyPhase();
        this.updateUI();
    }

    generateTreasures() {
        this.treasures = [];
        const totalCells = this.gridSize * this.gridSize;
        const positions = new Set();

        // Generate unique random positions
        while (positions.size < this.treasureCount) {
            positions.add(Math.floor(Math.random() * totalCells));
        }

        // Assign treasure types
        Array.from(positions).forEach((pos, index) => {
            this.treasures.push({
                position: pos,
                type: this.treasureTypes[index % this.treasureTypes.length],
                found: false
            });
        });
    }

    renderGrid() {
        const gridContainer = document.getElementById('th-grid');
        gridContainer.innerHTML = '';
        gridContainer.className = `treasure-grid size-${this.gridSize}`;

        const totalCells = this.gridSize * this.gridSize;

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'treasure-cell';
            cell.dataset.position = i;

            const treasure = this.treasures.find(t => t.position === i);

            if (treasure) {
                cell.dataset.hasTreasure = 'true';
                const treasureIcon = document.createElement('div');
                treasureIcon.className = 'treasure-icon hidden';
                treasureIcon.textContent = treasure.type;
                cell.appendChild(treasureIcon);
            }

            const cover = document.createElement('div');
            cover.className = 'cell-cover';
            cover.textContent = '🌿';
            cell.appendChild(cover);

            cell.addEventListener('click', () => this.handleCellClick(i));

            gridContainer.appendChild(cell);
        }
    }

    async startStudyPhase() {
        this.updateStatus(`Memorize the treasure locations! ${this.studyTime / 1000} seconds...`);

        // Show all treasures
        document.querySelectorAll('.treasure-cell').forEach(cell => {
            const cover = cell.querySelector('.cell-cover');
            const icon = cell.querySelector('.treasure-icon');
            if (icon) {
                cover.classList.add('revealed');
                icon.classList.remove('hidden');
            }
        });

        // Countdown
        let remaining = this.studyTime / 1000;
        const countdownInterval = setInterval(() => {
            remaining--;
            if (remaining > 0) {
                this.updateStatus(`Memorize the treasure locations! ${remaining} seconds...`);
            }
        }, 1000);

        await this.sleep(this.studyTime);

        clearInterval(countdownInterval);

        // Hide all treasures
        document.querySelectorAll('.treasure-cell').forEach(cell => {
            const cover = cell.querySelector('.cell-cover');
            const icon = cell.querySelector('.treasure-icon');
            if (icon && !cell.classList.contains('found')) {
                cover.classList.remove('revealed');
                icon.classList.add('hidden');
            }
        });

        this.isStudying = false;
        this.updateStatus('Find all the treasures!');
    }

    handleCellClick(position) {
        if (this.isStudying) return;

        const cell = document.querySelector(`.treasure-cell[data-position="${position}"]`);
        if (cell.classList.contains('found') || cell.classList.contains('revealed')) return;

        this.attempts++;
        this.updateUI();

        const treasure = this.treasures.find(t => t.position === position);

        if (treasure && !treasure.found) {
            // Found a treasure!
            treasure.found = true;
            this.foundTreasures++;
            this.score += 100;

            cell.classList.add('found');
            const cover = cell.querySelector('.cell-cover');
            const icon = cell.querySelector('.treasure-icon');
            cover.classList.add('revealed');
            icon.classList.remove('hidden');

            // Celebration animation
            cell.style.animation = 'treasureFound 0.6s ease-in-out';

            this.updateUI();

            // Check if all treasures found
            if (this.foundTreasures === this.treasureCount) {
                this.gameWon();
            }
        } else {
            // Wrong cell
            cell.classList.add('revealed');
            const cover = cell.querySelector('.cell-cover');
            cover.textContent = '❌';
            cover.style.background = '#FF6B9D';

            setTimeout(() => {
                cell.classList.remove('revealed');
                cover.textContent = '🌿';
                cover.style.background = '';
            }, 500);

            // Check if out of attempts
            if (this.attempts >= this.maxAttempts) {
                this.gameOver();
            }
        }
    }

    gameWon() {
        this.updateStatus('🎉 Amazing! You found all the treasures!');
        this.saveProgress(true);
        StorageManager.recordSessionActivity('Memory Garden', 'Treasure Hunt', `Victory! ${this.foundTreasures}/${this.treasureCount}`, 'N/A');

        setTimeout(() => {
            this.showGameOver(true);
        }, 1500);
    }

    gameOver() {
        this.updateStatus('Out of attempts! Game Over.');

        // Reveal remaining treasures
        document.querySelectorAll('.treasure-cell').forEach(cell => {
            if (cell.dataset.hasTreasure === 'true' && !cell.classList.contains('found')) {
                const cover = cell.querySelector('.cell-cover');
                const icon = cell.querySelector('.treasure-icon');
                cover.classList.add('revealed');
                icon.classList.remove('hidden');
                cell.style.opacity = '0.5';
            }
        });

        this.saveProgress(false);
        StorageManager.recordSessionActivity('Memory Garden', 'Treasure Hunt', `Failed (${this.foundTreasures}/${this.treasureCount})`, 'N/A');

        setTimeout(() => {
            this.showGameOver(false);
        }, 2000);
    }

    showGameOver(won) {
        const gameOverDiv = document.getElementById('th-game-over');
        document.getElementById('th-result-title').textContent = won ? '🎉 Victory!' : '😊 Good Try!';
        document.getElementById('th-final-score').textContent = this.score;
        document.getElementById('th-treasures-found').textContent = `${this.foundTreasures}/${this.treasureCount}`;
        document.getElementById('th-attempts-used').textContent = `${this.attempts}/${this.maxAttempts}`;
        gameOverDiv.classList.remove('hidden');
    }

    hideGameOver() {
        const gameOverDiv = document.getElementById('th-game-over');
        gameOverDiv.classList.add('hidden');
    }

    updateUI() {
        const infoDisplay = document.getElementById('game-info-display');
        if (infoDisplay) {
            infoDisplay.innerHTML = `
                <div class="stat">
                    <span class="stat-label">Found</span>
                    <span class="stat-value">${this.foundTreasures}/${this.treasureCount}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Attempts</span>
                    <span class="stat-value">${this.attempts}/${this.maxAttempts}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Score</span>
                    <span class="stat-value">${this.score}</span>
                </div>
            `;
        }
    }

    updateStatus(message) {
        document.getElementById('th-status').textContent = message;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    saveProgress(won) {
        const progressData = StorageManager.loadProgress('memory-garden') || {};

        if (!progressData.treasureHunt) {
            progressData.treasureHunt = {
                gamesPlayed: 0,
                gamesWon: 0,
                bestScore: 0,
                totalTreasuresFound: 0,
                history: []
            };
        }

        progressData.treasureHunt.gamesPlayed++;
        if (won) progressData.treasureHunt.gamesWon++;
        progressData.treasureHunt.totalTreasuresFound += this.foundTreasures;

        if (this.score > progressData.treasureHunt.bestScore) {
            progressData.treasureHunt.bestScore = this.score;
        }

        progressData.treasureHunt.history.push({
            date: new Date().toISOString(),
            score: this.score,
            treasuresFound: this.foundTreasures,
            totalTreasures: this.treasureCount,
            won: won
        });

        // Keep only last 50 games
        if (progressData.treasureHunt.history.length > 50) {
            progressData.treasureHunt.history = progressData.treasureHunt.history.slice(-50);
        }

        StorageManager.saveProgress('memory-garden', progressData);
    }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TreasureHuntGame;
}
