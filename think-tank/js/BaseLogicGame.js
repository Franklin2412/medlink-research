/**
 * Base class for all logic-based games in Think Tank.
 * Handles levels, scoring, and shared UI components.
 */
class BaseLogicGame {
    constructor() {
        this.level = 1;
        this.score = 0;
        this.correctAnswer = null;
        this.isActive = false;
    }

    /**
     * Start or reset the game
     */
    start() {
        this.level = 1;
        this.score = 0;
        this.isActive = true;
        this.nextLevel();
    }

    /**
     * Stop the game
     */
    stop() {
        this.isActive = false;
    }

    /**
     * Move to the next challenge
     */
    nextLevel() {
        if (!this.isActive) return;
        this.updateStatsUI();
        this.generateChallenge();
        this.render();
    }

    /**
     * Generate the logic challenge (To be overridden)
     */
    generateChallenge() {
        // Implementation in subclasses
    }

    /**
     * Render the game state to the DOM (To be overridden)
     */
    render() {
        // Implementation in subclasses
    }

    /**
     * Standardized answer checking with feedback
     */
    checkAnswer(choice, element) {
        if (!this.isActive) return;

        if (this.isCorrect(choice)) {
            this.handleSuccess(choice, element);
        } else {
            this.handleFailure(choice, element);
        }
    }

    /**
     * Logic for correctness (To be overridden if simple equality isn't enough)
     */
    isCorrect(choice) {
        return choice === this.correctAnswer;
    }

    /**
     * Success feedback and level progression
     */
    handleSuccess(choice, element) {
        if (element) element.classList.add('correct');
        this.level++;
        this.score += 10;

        this.playFeedback(true);
        this.onSuccess(choice); // Custom success hook

        setTimeout(() => {
            this.nextLevel();
        }, 1200);
    }

    /**
     * Failure feedback
     */
    handleFailure(choice, element) {
        if (element) {
            element.classList.add('wrong');
            setTimeout(() => element.classList.remove('wrong'), 800);
        }
        this.playFeedback(false);
        this.onFailure(choice); // Custom failure hook
    }

    /**
     * Shared UI Stat update
     */
    updateStatsUI() {
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

    /**
     * Simple speech feedback
     */
    playFeedback(isSuccess) {
        const phrases = isSuccess
            ? ['Great job!', 'You got it!', 'Excellent!', 'Well done!']
            : ['Try again!', 'Look closely...', 'Not quite.', 'Give it another go!'];

        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        const msg = new SpeechSynthesisUtterance(phrase);
        msg.rate = 1.2;
        window.speechSynthesis.speak(msg);
    }

    // Default hooks
    onSuccess(choice) { }
    onFailure(choice) { }
}

window.BaseLogicGame = BaseLogicGame;
