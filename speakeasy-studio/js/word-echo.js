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

                if (event.error === 'network') {
                    if (window.location.protocol === 'file:') {
                        this.updateStatus('⚠️ Browser Restriction: Speech Recognition requires a local server (http://localhost) or a secure HTTPS connection. It often fails when opening HTML files directly.');
                    } else {
                        this.updateStatus('Network error! Please check your internet connection.');
                    }
                } else if (event.error === 'not-allowed') {
                    this.updateStatus('Microphone access denied. Please allow permissions.');
                } else if (event.error === 'no-speech') {
                    this.updateStatus('I didn\'t hear anything. Try again!');
                } else {
                    this.updateStatus(`Error: ${event.error}. Please try skipping.`);
                }
            };
        } else {
            console.warn('Speech Recognition not supported in this browser.');
            this.updateStatus('Browser not supported. Please use Google Chrome.');
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
            // Ensure slider matches initial default
            slider.value = this.duration;
            valDisplay.textContent = this.duration;
        }

        const skipBtn = document.getElementById('echo-skip-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                if (this.recognition) this.recognition.abort();
                this.stopListening();
                this.updateStatus('Skipping word...');
                this.currentWordIndex++;
                setTimeout(() => this.nextWord(), 1000);
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
            // Automatically speak the word when it appears
            setTimeout(() => this.speakSlowly(), 500);
        } else {
            this.endGame();
        }
    }

    // Hybrid Stretch: Duplicates characters to extend duration beyond CSS rate limits
    stretchWord(word, factor) {
        if (factor <= 1) return word;
        return word.split('').map(char => char.repeat(factor)).join('');
    }

    speakSlowly() {
        const word = this.words[this.currentWordIndex];
        this.synth.cancel();

        // Calculate Hybrid Params
        // Factor: 1 (for 1-4s), 2 (for 5-7s), 3 (for 8-10s)
        const stretchFactor = this.duration < 5 ? 1 : (this.duration < 8 ? 2 : 3);

        // Rate: 1.2 descending to 0.2
        const rate = Math.max(0.1, 1.3 - (this.duration * 0.11));

        const textToSpeak = this.stretchWord(word, stretchFactor);
        const utterance = new SpeechSynthesisUtterance(textToSpeak);

        utterance.rate = rate;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            this.startVisualizer();
            this.startMouthAnimation();
            this.updateStatus(`Speaking (${this.duration}s)...`);
            this.displayWord(word);
        };

        utterance.onend = () => {
            this.stopVisualizer();
            this.stopMouthAnimation();
            setTimeout(() => {
                this.startListening();
            }, 500);
        };

        this.synth.speak(utterance);
    }

    startMouthAnimation() {
        const mouth = document.querySelector('.mouth');
        if (mouth) {
            // Adjust animation duration for the hybrid length
            // Base duration * stretch factor * inverse rate
            const baseAnim = 0.2 + (this.duration * 0.1);
            mouth.style.setProperty('--mouth-anim-duration', `${baseAnim}s`);
            mouth.classList.add('speaking');
        }
    }

    stopMouthAnimation() {
        const mouth = document.querySelector('.mouth');
        if (mouth) mouth.classList.remove('speaking');
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
            this.stopListening();
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
