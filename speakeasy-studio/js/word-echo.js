class WordEchoGame {
    constructor() {
        this.lang = 'en-US';
        this.wordsEn = ['Apple', 'Banana', 'Cat', 'Dog', 'Elephant', 'Flower', 'Garden', 'Happy', 'Ice', 'Jump', 'Sun', 'Moon', 'Water', 'Book', 'Tree'];
        this.wordsTa = ['அம்மா', 'அப்பா', 'நாய்', 'பூனை', 'மரம்', 'பழம்', 'பால்', 'வானம்', 'வீடு', 'பள்ளி', 'கண்', 'காது', 'வாய்', 'மூக்கு', 'கைகள்'];
        this.words = [...this.wordsEn];

        this.currentWordIndex = 0;
        this.score = 0;
        this.isListening = false;
        this.synth = window.speechSynthesis;
        this.recognition = null;
        this.voices = [];

        // Load voices explicitly
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.voices = this.synth.getVoices();
            };
        }

        this.duration = 4; // Default 4 seconds
        this.initSpeechRecognition();
        this.initControls();
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.lang = this.lang;
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;

            this.recognition.onresult = (event) => {
                const speechToText = event.results[0][0].transcript.toLowerCase();
                this.checkResult(speechToText);
            };
            // ... (rest of method maintained implicitly, but replacing up to initControls start in next chunk if needed, but here we focus on constructor/init mostly)

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
        const langSelect = document.getElementById('language-select');
        if (langSelect) {
            langSelect.addEventListener('change', (e) => {
                this.lang = e.target.value;
                this.words = this.lang === 'ta-IN' ? [...this.wordsTa] : [...this.wordsEn];

                if (this.recognition) {
                    this.recognition.abort();
                    this.recognition.lang = this.lang;
                }
                this.stopListening();

                // Small delay to allow abort to finalize
                setTimeout(() => this.start(), 100);
            });
        }

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

    speakSlowly() {
        const word = this.words[this.currentWordIndex];
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = this.lang;

        // Explicitly selecting voice improves reliability for non-English languages
        if (this.voices.length === 0) {
            this.voices = this.synth.getVoices();
        }

        // Normalize search: match ta-IN, ta_IN, or just ta
        const targetLang = this.lang.toLowerCase().replace('_', '-');
        const voice = this.voices.find(v => v.lang.toLowerCase().replace('_', '-') === targetLang) ||
            this.voices.find(v => v.lang.toLowerCase().startsWith(targetLang.split('-')[0]));

        if (voice) {
            utterance.voice = voice;
        } else {
            console.warn(`No voice found for ${this.lang}`);
            if (this.lang !== 'en-US') {
                this.updateStatus('⚠️ Tamil voice not found. Please install Tamil language pack in OS settings.');
            }
        }

        // High-Fidelity Slow Motion
        // We prioritize smooth audio over artificial stretching.
        // Map 1s-10s slider to rate 1.2 -> 0.1
        // This provides the slowest possible NATURAL speech the browser allows.
        const rate = Math.max(0.1, 1.3 - (this.duration * 0.12));

        utterance.rate = rate;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            this.setVisualizerState('speaking');
            this.updateStatus(`Speaking slowly...`);
            this.displayWord(word);
        };

        utterance.onend = () => {
            this.setVisualizerState('idle'); // Brief idle before listening
            setTimeout(() => {
                this.startListening();
            }, 500);
        };

        this.synth.speak(utterance);
    }

    // Unified Visualizer Control
    setVisualizerState(state) {
        const wave = document.getElementById('echo-visualizer');
        const mic = document.getElementById('mic-indicator');
        const idle = document.getElementById('echo-idle-icon');

        // Hide all first
        if (wave) wave.classList.add('hidden');
        if (mic) mic.classList.add('hidden');
        if (idle) idle.classList.add('hidden');

        // Show active state
        if (state === 'speaking' && wave) {
            wave.classList.remove('hidden');
            const bars = document.querySelectorAll('.wave-bar');
            bars.forEach(bar => bar.classList.add('speaking'));
        } else if (state === 'listening' && mic) {
            mic.classList.remove('hidden');
        } else if (state === 'idle' && idle) {
            idle.classList.remove('hidden');
        }
    }

    startListening() {
        if (!this.recognition) return;

        this.isListening = true;
        this.updateStatus('Now your turn! Say it!');
        this.setVisualizerState('listening');
        document.getElementById('echo-listen-btn').disabled = true;

        try {
            this.recognition.start();
        } catch (e) {
            if (e.name !== 'InvalidStateError') {
                console.error('Recognition start error:', e);
                this.stopListening();
            } else {
                console.warn('Recognition already started. Continuing...');
            }
        }
    }

    stopListening() {
        this.isListening = false;
        this.setVisualizerState('idle');
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

    // startVisualizer and stopVisualizer removed in favor of setVisualizerState

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
