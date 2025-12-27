class EmotionGame {
    constructor() {
        this.emotions = [
            { name: 'Happy', emoji: '😊' },
            { name: 'Sad', emoji: '😢' },
            { name: 'Angry', emoji: '😠' },
            { name: 'Surprised', emoji: '😲' },
            { name: 'Scared', emoji: '😨' },
            { name: 'Sleepy', emoji: '😴' }
        ];
        this.currentTarget = null;
    }

    start() {
        this.nextTurn();
    }

    nextTurn() {
        this.currentTarget = this.emotions[Math.floor(Math.random() * this.emotions.length)];
        document.getElementById('target-emotion').textContent = this.currentTarget.name;

        const distractors = this.emotions
            .filter(e => e.name !== this.currentTarget.name)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        const choices = [this.currentTarget, ...distractors].sort(() => 0.5 - Math.random());

        this.render(choices);
    }

    render(choices) {
        const container = document.getElementById('emotion-options');
        container.innerHTML = '';

        choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'emotion-btn';
            btn.innerHTML = `${choice.emoji}<span>${choice.name}</span>`;
            btn.onclick = () => this.checkAnswer(choice, btn);
            container.appendChild(btn);
        });
    }

    checkAnswer(choice, btn) {
        if (choice.name === this.currentTarget.name) {
            btn.classList.add('correct');
            // Play sound/feedback
            const msg = new SpeechSynthesisUtterance(`Yes! That is ${choice.name}!`);
            window.speechSynthesis.speak(msg);

            setTimeout(() => this.nextTurn(), 1500);
        } else {
            btn.classList.add('wrong');
            const msg = new SpeechSynthesisUtterance(`That is ${choice.name}. Can you find ${this.currentTarget.name}?`);
            window.speechSynthesis.speak(msg);
        }
    }
}
