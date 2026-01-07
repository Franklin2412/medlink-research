class PatternGame {
    constructor() {
        this.level = 1;
        this.items = ['🔴', '🔵', '⭐', '🍏', '🍄', '🎈'];
        this.currentSequence = [];
        this.correctAnswer = null;
    }

    start() {
        this.level = 1;
        this.nextLevel();
    }

    nextLevel() {
        const infoDisplay = document.getElementById('game-info-display');
        if (infoDisplay) {
            infoDisplay.innerHTML = `
                <div class="stat">
                    <span class="stat-label">Level</span>
                    <span class="stat-value">${this.level}</span>
                </div>
            `;
        }
        this.generatePattern();
        this.render();
    }

    generatePattern() {
        // ABAB, ABCABC, AABAAB types
        const patternTypes = ['ABAB', 'AABA', 'ABC'];
        const type = patternTypes[Math.floor(Math.random() * patternTypes.length)];

        const availableItems = [...this.items].sort(() => 0.5 - Math.random());
        const item1 = availableItems[0];
        const item2 = availableItems[1];
        const item3 = availableItems[2];

        let base = [];
        if (type === 'ABAB') base = [item1, item2];
        else if (type === 'AABA') base = [item1, item1, item2];
        else if (type === 'ABC') base = [item1, item2, item3];

        this.currentSequence = [...base, ...base];
        this.correctAnswer = base[0]; // The next one in a repeating cycle
    }

    render() {
        const seqContainer = document.getElementById('sequence');
        seqContainer.innerHTML = '';

        this.currentSequence.forEach(item => {
            const div = document.createElement('div');
            div.className = 'pattern-item';
            div.textContent = item;
            seqContainer.appendChild(div);
        });

        const optionsContainer = document.getElementById('pattern-options');
        optionsContainer.innerHTML = '';

        // Generate options (correct + 2 distractors)
        const distractors = this.items
            .filter(i => i !== this.correctAnswer)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);

        const options = [this.correctAnswer, ...distractors].sort(() => 0.5 - Math.random());

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => this.checkAnswer(opt, btn);
            optionsContainer.appendChild(btn);
        });
    }

    checkAnswer(choice, btn) {
        if (choice === this.correctAnswer) {
            btn.classList.add('correct');
            this.level++;
            // Show feedback
            const placeholder = document.getElementById('placeholder');
            placeholder.textContent = choice;
            placeholder.style.borderStyle = 'solid';
            placeholder.style.borderColor = 'var(--success-color)';

            setTimeout(() => {
                placeholder.textContent = '?';
                placeholder.style.borderStyle = 'dashed';
                placeholder.style.borderColor = 'var(--primary-color)';
                this.nextLevel();
            }, 1000);
        } else {
            btn.classList.add('wrong');
            const msg = new SpeechSynthesisUtterance('Try to see the pattern again.');
            window.speechSynthesis.speak(msg);
            setTimeout(() => btn.classList.remove('wrong'), 800);
        }
    }
}
