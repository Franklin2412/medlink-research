/**
 * Memory Match Game Logic
 * Handles card generation, game state, and matching logic
 */

class MemoryMatchGame {
    constructor(difficulty = 'easy') {
        this.difficulty = difficulty;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.endTime = null;
        this.isProcessing = false;

        // Flower emojis for cards
        this.flowers = [
            '🌸', '🌺', '🌻', '🌷', '🌹', '🏵️',
            '💐', '🌼', '🥀', '🪷', '🌽', '🪻'
        ];

        this.init();
    }

    init() {
        this.generateCards();
        this.shuffleCards();
        this.render();
        this.startTime = Date.now();
    }

    generateCards() {
        const cardCounts = {
            'easy': 8,      // 4 pairs
            'medium': 12,   // 6 pairs
            'hard': 16      // 8 pairs
        };

        const totalCards = cardCounts[this.difficulty] || 8;
        const pairsNeeded = totalCards / 2;

        // Select random flowers for this game
        const selectedFlowers = this.flowers.slice(0, pairsNeeded);

        // Create pairs
        this.cards = [];
        selectedFlowers.forEach((flower, index) => {
            this.cards.push({
                id: `card-${index}-a`,
                flower: flower,
                matched: false,
                flipped: false
            });
            this.cards.push({
                id: `card-${index}-b`,
                flower: flower,
                matched: false,
                flipped: false
            });
        });
    }

    shuffleCards() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    render() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        gameBoard.className = `game-board difficulty-${this.difficulty}`;

        this.cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            gameBoard.appendChild(cardElement);
        });

        this.updateStats();
    }

    createCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'memory-card';
        cardDiv.dataset.index = index;

        // Front of card (flower) - add first
        const cardFront = document.createElement('div');
        cardFront.className = 'card-face card-front';
        cardFront.textContent = card.flower;
        cardFront.setAttribute('aria-label', `Flower card`);

        // Back of card (question mark) - add second
        const cardBack = document.createElement('div');
        cardBack.className = 'card-face card-back';

        cardDiv.appendChild(cardFront);
        cardDiv.appendChild(cardBack);

        // Add click handler
        cardDiv.addEventListener('click', () => this.handleCardClick(index));

        // Keyboard accessibility
        cardDiv.setAttribute('tabindex', '0');
        cardDiv.setAttribute('role', 'button');
        cardDiv.setAttribute('aria-label', 'Memory card');

        cardDiv.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleCardClick(index);
            }
        });

        return cardDiv;
    }

    handleCardClick(index) {
        const card = this.cards[index];

        // Prevent clicking if:
        // - Card is already flipped
        // - Card is already matched
        // - Currently processing a pair
        // - Already have 2 cards flipped
        if (card.flipped || card.matched || this.isProcessing || this.flippedCards.length >= 2) {
            return;
        }

        // Flip the card
        this.flipCard(index);
        this.flippedCards.push(index);

        // Check if two cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            this.checkForMatch();
        }
    }

    flipCard(index) {
        this.cards[index].flipped = true;
        const cardElement = document.querySelector(`.memory-card[data-index="${index}"]`);
        cardElement.classList.add('flipped');
    }

    unflipCard(index) {
        this.cards[index].flipped = false;
        const cardElement = document.querySelector(`.memory-card[data-index="${index}"]`);
        cardElement.classList.remove('flipped');
    }

    checkForMatch() {
        this.isProcessing = true;

        const [index1, index2] = this.flippedCards;
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];

        if (card1.flower === card2.flower) {
            // Match found!
            setTimeout(() => {
                this.markAsMatched(index1, index2);
                this.flippedCards = [];
                this.isProcessing = false;

                // Check if game is complete
                if (this.matchedPairs === this.cards.length / 2) {
                    this.endGame();
                }
            }, 600);
        } else {
            // No match
            setTimeout(() => {
                this.unflipCard(index1);
                this.unflipCard(index2);
                this.flippedCards = [];
                this.isProcessing = false;
            }, 1000);
        }
    }

    markAsMatched(index1, index2) {
        this.cards[index1].matched = true;
        this.cards[index2].matched = true;

        const card1Element = document.querySelector(`.memory-card[data-index="${index1}"]`);
        const card2Element = document.querySelector(`.memory-card[data-index="${index2}"]`);

        card1Element.classList.add('matched');
        card2Element.classList.add('matched');

        this.matchedPairs++;
        this.updateStats();
    }

    updateStats() {
        const infoDisplay = document.getElementById('game-info-display');
        if (infoDisplay) {
            infoDisplay.innerHTML = `
                <div class="stat">
                    <span class="stat-label">Matches</span>
                    <span class="stat-value">${this.matchedPairs}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Moves</span>
                    <span class="stat-value">${this.moves}</span>
                </div>
            `;
        }
    }

    endGame() {
        this.endTime = Date.now();
        const timeElapsed = Math.floor((this.endTime - this.startTime) / 1000);

        // Save progress
        this.saveProgress(timeElapsed);

        // Show victory screen
        setTimeout(() => {
            this.showVictoryScreen(timeElapsed);
        }, 800);
    }

    showVictoryScreen(timeElapsed) {
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        document.getElementById('victory-moves').textContent = this.moves;
        document.getElementById('victory-time').textContent = timeString;

        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('victory-screen').classList.add('active');
    }

    saveProgress(timeElapsed) {
        const progressData = StorageManager.loadProgress('memory-garden') || {
            totalGames: 0,
            gamesWon: 0,
            bestMoves: {},
            bestTimes: {},
            history: []
        };

        progressData.totalGames++;
        progressData.gamesWon++;

        // Update best scores
        if (!progressData.bestMoves[this.difficulty] || this.moves < progressData.bestMoves[this.difficulty]) {
            progressData.bestMoves[this.difficulty] = this.moves;
        }

        if (!progressData.bestTimes[this.difficulty] || timeElapsed < progressData.bestTimes[this.difficulty]) {
            progressData.bestTimes[this.difficulty] = timeElapsed;
        }

        // Add to history
        progressData.history.push({
            date: new Date().toISOString(),
            difficulty: this.difficulty,
            moves: this.moves,
            time: timeElapsed
        });

        // Keep only last 50 games in history
        if (progressData.history.length > 50) {
            progressData.history = progressData.history.slice(-50);
        }

        StorageManager.saveProgress('memory-garden', progressData);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MemoryMatchGame;
}
