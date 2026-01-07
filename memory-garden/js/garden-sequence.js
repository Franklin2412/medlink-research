/**
 * Garden Sequence Game Logic
 * Sequential memory game - remember the order flowers bloom
 */

class GardenSequenceGame {
    constructor() {
        this.sequence = [];
        this.playerSequence = [];
        this.level = 1;
        this.score = 0;
        this.isPlaying = false;
        this.isShowingSequence = false;

        // Flower types for the sequence
        this.flowers = [
            { emoji: '🌷', color: '#FF6B9D', name: 'Tulip' },
            { emoji: '🌻', color: '#FFD93D', name: 'Sunflower' },
            { emoji: '🌸', color: '#FF9FF3', name: 'Cherry Blossom' },
            { emoji: '🌺', color: '#FF4757', name: 'Hibiscus' },
            { emoji: '🌼', color: '#FFA502', name: 'Daisy' },
            { emoji: '🏵️', color: '#A29BFE', name: 'Rosette' }
        ];
    }

    start() {
        this.hideGameOver();
        this.sequence = [];
        this.playerSequence = [];
        this.level = 1;
        this.score = 0;
        this.isPlaying = true;
        this.updateUI();
        this.nextLevel();
    }

    nextLevel() {
        this.playerSequence = [];
        this.addToSequence();
        this.playSequence();
    }

    addToSequence() {
        const randomFlower = this.flowers[Math.floor(Math.random() * this.flowers.length)];
        this.sequence.push(randomFlower);
    }

    async playSequence() {
        this.isShowingSequence = true;
        this.updateStatus('Watch the sequence...');
        this.disableFlowers();

        await this.sleep(1000);

        for (let i = 0; i < this.sequence.length; i++) {
            await this.highlightFlower(this.sequence[i]);
            await this.sleep(200);
        }

        this.isShowingSequence = false;
        this.updateStatus('Now repeat the sequence!');
        this.enableFlowers();
    }

    async highlightFlower(flower) {
        const flowerElement = document.querySelector(`.sequence-flower[data-flower="${flower.name}"]`);

        // Highlight
        flowerElement.style.transform = 'scale(1.2)';
        flowerElement.style.boxShadow = `0 0 30px ${flower.color}`;

        // Play sound (optional - you can add sound later)

        await this.sleep(600);

        // Un-highlight
        flowerElement.style.transform = 'scale(1)';
        flowerElement.style.boxShadow = 'var(--shadow-md)';
    }

    handleFlowerClick(flower) {
        if (!this.isPlaying || this.isShowingSequence) return;

        this.playerSequence.push(flower);
        this.highlightFlower(flower);

        const currentIndex = this.playerSequence.length - 1;

        // Check if player's choice matches the sequence
        if (this.playerSequence[currentIndex].name !== this.sequence[currentIndex].name) {
            this.gameOver();
            return;
        }

        // Check if player completed the sequence
        if (this.playerSequence.length === this.sequence.length) {
            this.score += this.level * 10;
            this.level++;
            this.updateUI();
            this.updateStatus('Great! Next level...');

            setTimeout(() => {
                this.nextLevel();
            }, 1500);
        }
    }

    gameOver() {
        this.isPlaying = false;
        this.updateStatus('Oops! Wrong sequence. Try again!');
        this.disableFlowers();

        // Save progress
        this.saveProgress();

        // Show game over after a delay
        setTimeout(() => {
            this.showGameOver();
        }, 1500);
    }

    showGameOver() {
        const gameOverDiv = document.getElementById('gs-game-over');
        document.getElementById('gs-final-score').textContent = this.score;
        document.getElementById('gs-final-level').textContent = this.level - 1;
        gameOverDiv.classList.remove('hidden');
    }

    hideGameOver() {
        const gameOverDiv = document.getElementById('gs-game-over');
        gameOverDiv.classList.add('hidden');
    }

    updateUI() {
        const infoDisplay = document.getElementById('game-info-display');
        if (infoDisplay) {
            infoDisplay.innerHTML = `
                <div class="stat">
                    <span class="stat-label">Level</span>
                    <span class="stat-value">${this.level}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Score</span>
                    <span class="stat-value">${this.score}</span>
                </div>
            `;
        }
    }

    updateStatus(message) {
        document.getElementById('gs-status').textContent = message;
    }

    disableFlowers() {
        document.querySelectorAll('.sequence-flower').forEach(flower => {
            flower.style.pointerEvents = 'none';
            flower.style.opacity = '0.6';
        });
    }

    enableFlowers() {
        document.querySelectorAll('.sequence-flower').forEach(flower => {
            flower.style.pointerEvents = 'auto';
            flower.style.opacity = '1';
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    saveProgress() {
        const progressData = StorageManager.loadProgress('memory-garden') || {};

        if (!progressData.gardenSequence) {
            progressData.gardenSequence = {
                gamesPlayed: 0,
                bestScore: 0,
                bestLevel: 0,
                history: []
            };
        }

        progressData.gardenSequence.gamesPlayed++;

        if (this.score > progressData.gardenSequence.bestScore) {
            progressData.gardenSequence.bestScore = this.score;
        }

        if (this.level - 1 > progressData.gardenSequence.bestLevel) {
            progressData.gardenSequence.bestLevel = this.level - 1;
        }

        progressData.gardenSequence.history.push({
            date: new Date().toISOString(),
            score: this.score,
            level: this.level - 1
        });

        // Keep only last 50 games
        if (progressData.gardenSequence.history.length > 50) {
            progressData.gardenSequence.history = progressData.gardenSequence.history.slice(-50);
        }

        StorageManager.saveProgress('memory-garden', progressData);
    }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GardenSequenceGame;
}
