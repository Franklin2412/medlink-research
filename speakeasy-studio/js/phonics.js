class PhonicsGame {
    constructor() {
        this.score = 0;
        this.currentSound = null;
        this.options = [];
        this.sounds = [
            { letter: 'A', sound: 'Apple', icon: '🍎' },
            { letter: 'B', sound: 'Ball', icon: '⚽' },
            { letter: 'C', sound: 'Cat', icon: '🐱' },
            { letter: 'D', sound: 'Dog', icon: '🐶' },
            { letter: 'E', sound: 'Elephant', icon: '🐘' },
            { letter: 'F', sound: 'Fish', icon: '🐟' },
            { letter: 'G', sound: 'Goat', icon: '🐐' },
            { letter: 'H', sound: 'Hat', icon: '🎩' }
        ];
    }

    start() {
        this.score = 0;
        this.updateScore();
        this.nextTurn();
    }

    nextTurn() {
        // Pick random sound element
        const targetIndex = Math.floor(Math.random() * this.sounds.length);
        this.currentSound = this.sounds[targetIndex];

        // Generate options (target + 2 randoms)
        const otherOptions = this.sounds
            .filter(s => s.letter !== this.currentSound.letter)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);

        this.options = [this.currentSound, ...otherOptions].sort(() => 0.5 - Math.random());

        this.render();
        this.speakSound();
    }

    render() {
        const grid = document.getElementById('options-grid');
        grid.innerHTML = '';

        this.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option.icon;
            btn.onclick = () => this.handleGuess(option, btn);
            grid.appendChild(btn);
        });
    }

    speakSound() {
        const msg = new SpeechSynthesisUtterance(`Pick the ${this.currentSound.sound}`);
        msg.rate = 0.8;
        window.speechSynthesis.speak(msg);
    }

    handleGuess(option, btn) {
        if (option.letter === this.currentSound.letter) {
            btn.classList.add('correct');
            this.score += 10;
            this.updateScore();

            const msg = new SpeechSynthesisUtterance('Correct! Excellent job!');
            window.speechSynthesis.speak(msg);

            setTimeout(() => this.nextTurn(), 1500);
        } else {
            btn.classList.add('wrong');
            const msg = new SpeechSynthesisUtterance('Try again!');
            window.speechSynthesis.speak(msg);
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
}
