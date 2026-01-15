class WordEchoGame {
    constructor() {
        this.words = ['Apple', 'Banana', 'Cat', 'Dog', 'Elephant', 'Flower', 'Garden', 'Happy', 'Ice', 'Jump', 'Sun', 'Moon', 'Water', 'Book', 'Tree'];
        this.currentWordIndex = 0;
        this.score = 0;
        this.isListening = false;
        this.synth = window.speechSynthesis;
        this.recognition = null;

        this.duration = 4; // Default 4 seconds
        this.initSpeechRecognition();
        this.initControls();
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.lang = 'en-US';
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;

            this.recognition.onresult = (event) => {
                const speechToText = event.results[0][0].transcript.toLowerCase();
                this.checkResult(speechToText);
            };

            this.recognition.onspeechend = () => {
                this.stopListening();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopListening();
                this.updateStatus('Try again! I didn\'t hear that.');
            };
        } else {
            console.warn('Speech Recognition not supported in this browser.');
        }
    }

    initControls() {
        const slider = document.getElementById('duration-slider');
        const valDisplay = document.getElementById('duration-val');
        if (slider && valDisplay) {
            slider.addEventListener('input', (e) => {
                this.duration = parseInt(e.target.value);
                valDisplay.textContent = this.duration;
            });
        }
    }

    start() {
        this.currentWordIndex = 0;
        this.score = 0;
        this.nextWord();
    }

    nextWord() {
        if (this.currentWordIndex < this.words.length) {
            const word = this.words[this.currentWordIndex];
            this.displayWord('???');
            this.updateStatus('Listen to the word...');
            this.clearFeedback();
        } else {
            this.endGame();
        }
    }

    stretchWord(word) {
        // Higher duration means more character repetition
        // Map 2s-10s to repeat factor 2-15
        const repeatFactor = Math.floor((this.duration - 2) * 1.5) + 2;

        return word.split('').map(char => {
            // Stretch vowels and liquid consonants more
            if ('aeioulnmrsh'.includes(char.toLowerCase())) {
                return char.repeat(repeatFactor);
            }
            // Stops and others stretch less
            return char.repeat(Math.ceil(repeatFactor / 2));
        }).join('');
    }

    speakSlowly() {
        const word = this.words[this.currentWordIndex];
        const stretchedWord = this.stretchWord(word);
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(stretchedWord);
        // Map duration (2-10) to rate (1.0 down to 0.1)
        // 2s -> ~1.0, 10s -> ~0.1
        utterance.rate = Math.max(0.1, 1 - (this.duration - 2) * 0.1);
        utterance.pitch = 1.1; // Friendly pitch

        utterance.onstart = () => {
            this.startVisualizer();
            this.updateStatus('Speaking slowly...');
            // Reveal actual word partially or fully? Let's reveal fully now.
            this.displayWord(word);
        };

        utterance.onend = () => {
            this.stopVisualizer();
            this.displayWord(word); // reveal word
            setTimeout(() => {
                this.startListening();
            }, 500);
        };

        this.synth.speak(utterance);
    }

    startListening() {
        if (!this.recognition) return;

        this.isListening = true;
        this.updateStatus('Now your turn! Say it!');
        document.getElementById('mic-indicator').classList.remove('hidden');
        document.getElementById('echo-listen-btn').disabled = true;

        try {
            this.recognition.start();
        } catch (e) {
            console.error('Recognition start error:', e);
        }
    }

    stopListening() {
        this.isListening = false;
        document.getElementById('mic-indicator').classList.add('hidden');
        document.getElementById('echo-listen-btn').disabled = false;
    }

    checkResult(spoken) {
        const target = this.words[this.currentWordIndex].toLowerCase();
        const feedbackEl = document.getElementById('echo-feedback');

        if (spoken.includes(target)) {
            this.score++;
            this.currentWordIndex++;
            feedbackEl.textContent = '🌟 Correct! Great job!';
            feedbackEl.className = 'mt-xl text-xl font-bold correct';
            this.updateStatus('Excellent! Moving to next word...');

            setTimeout(() => {
                this.nextWord();
            }, 2000);
        } else {
            feedbackEl.textContent = `❌ I heard "${spoken}". Try again!`;
            feedbackEl.className = 'mt-xl text-xl font-bold wrong';
            this.updateStatus('Give it another try!');
        }
    }

    startVisualizer() {
        const bars = document.querySelectorAll('.wave-bar');
        bars.forEach(bar => bar.classList.add('speaking'));
    }

    stopVisualizer() {
        const bars = document.querySelectorAll('.wave-bar');
        bars.forEach(bar => bar.classList.remove('speaking'));
    }

    displayWord(text) {
        document.getElementById('echo-word-display').textContent = text;
    }

    updateStatus(text) {
        document.getElementById('echo-status').textContent = text;
    }

    clearFeedback() {
        document.getElementById('echo-feedback').textContent = '';
        document.getElementById('echo-feedback').className = 'mt-xl text-xl font-bold';
    }

    endGame() {
        this.updateStatus('🎉 Activity Complete!');
        this.displayWord('Well Done!');
        document.getElementById('echo-feedback').textContent = `Final Score: ${this.score}`;
        document.getElementById('echo-listen-btn').classList.add('hidden');

        // Show back to menu button or handle as needed
    }
}
