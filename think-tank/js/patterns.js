/**
 * GAME 1: Pattern Power++
 * Logical sequencing with emojis.
 */
class PatternGame extends BaseLogicGame {
    constructor() {
        super();
        this.items = ['🔴', '🔵', '⭐', '🍏', '🍄', '🎈', '🐶', '🐱', '🦋', '🌈'];
        this.currentSequence = [];
    }

    generateChallenge() {
        // Diversified pattern types
        const types = ['ABAB', 'AABA', 'ABC', 'AABB', 'ABBA'];
        // Pick type based on level (introduce harder ones gradually)
        let availableTypes = ['ABAB'];
        if (this.level > 3) availableTypes.push('AABA', 'ABC');
        if (this.level > 8) availableTypes.push('AABB', 'ABBA');

        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        const pool = [...this.items].sort(() => 0.5 - Math.random());

        const A = pool[0];
        const B = pool[1];
        const C = pool[2];

        let base = [];
        switch (type) {
            case 'ABAB': base = [A, B]; break;
            case 'AABA': base = [A, A, B]; break;
            case 'ABC': base = [A, B, C]; break;
            case 'AABB': base = [A, A, B, B]; break;
            case 'ABBA': base = [A, B, B, A]; break;
        }

        // Create a sequence of 2-3 repeats
        this.currentSequence = [...base, ...base];
        if (this.level > 5 && base.length < 4) {
            this.currentSequence.push(...base);
        }

        // The correct answer is the NEXT item in the base sequence cycle
        this.correctAnswer = base[0];
    }

    render() {
        const seqContainer = document.getElementById('sequence');
        const placeholder = document.getElementById('placeholder');
        const optionsContainer = document.getElementById('pattern-options');

        // Reset
        seqContainer.innerHTML = '';
        placeholder.textContent = '?';
        placeholder.className = 'pattern-placeholder';
        optionsContainer.innerHTML = '';

        // Render Sequence
        this.currentSequence.forEach(item => {
            const div = document.createElement('div');
            div.className = 'pattern-item fade-in';
            div.textContent = item;
            seqContainer.appendChild(div);
        });

        // Generate Options
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

    onSuccess(choice) {
        const placeholder = document.getElementById('placeholder');
        placeholder.textContent = choice;
        placeholder.classList.add('correct-highlight');
    }
}

window.PatternGame = PatternGame;
