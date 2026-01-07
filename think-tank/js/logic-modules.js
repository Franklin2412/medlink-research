/**
 * GAME 5: Odd One Out
 * Categorical logic.
 */
class OddOneOutGame extends BaseLogicGame {
    constructor() {
        super();
        this.categories = [
            { name: 'Animals', items: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🦁'], odd: '🍎' },
            { name: 'Fruits', items: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇'], odd: '🚗' },
            { name: 'Weather', items: ['☀️', '☁️', '🌧️', '❄️', '⚡', '🌙', '🌈'], odd: '🍔' },
            { name: 'Vehicles', items: ['🚗', '🚕', '🚙', '🚌', '🏎️', '🚓', '🚑'], odd: '🌸' },
            { name: 'Flowers', items: ['🌸', '🌺', '🌹', '🌷', '🌻', '🌼', '🍀'], odd: '✈️' },
            { name: 'Food', items: ['🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯'], odd: '🧸' }
        ];
        // Distractor bank for random odds
        this.allOdds = ['🍎', '🚗', '🍔', '🌸', '✈️', '🧸', '⚽', '🎷', '📺', '⏰'];
    }

    generateChallenge() {
        const cat = this.categories[Math.floor(Math.random() * this.categories.length)];
        const pool = [...cat.items].sort(() => 0.5 - Math.random());

        // Pick 3 from category
        const challengeItems = pool.slice(0, 3);

        // Pick 1 odd item (either predefined or random different)
        this.correctAnswer = cat.odd;
        challengeItems.push(this.correctAnswer);

        this.currentSet = challengeItems.sort(() => 0.5 - Math.random());
    }

    render() {
        const instruction = document.getElementById('instruction');
        const seqContainer = document.getElementById('sequence');
        const placeholder = document.getElementById('placeholder');
        const optionsContainer = document.getElementById('pattern-options');

        instruction.textContent = "Which one doesn't belong?";
        seqContainer.innerHTML = '';
        placeholder.classList.add('hidden'); // No placeholder needed for this type
        optionsContainer.innerHTML = '';
        optionsContainer.classList.add('grid-4');

        this.currentSet.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'option-btn logic-card fade-in';
            btn.textContent = item;
            btn.style.fontSize = '4rem';
            btn.onclick = () => this.checkAnswer(item, btn);
            optionsContainer.appendChild(btn);
        });
    }

    stop() {
        super.stop();
        document.getElementById('placeholder').classList.remove('hidden');
        document.getElementById('pattern-options').classList.remove('grid-4');
    }
}

/**
 * GAME 6: Classification
 * Binary sorting logic.
 */
class ClassificationGame extends BaseLogicGame {
    constructor() {
        super();
        this.categories = [
            { id: 'living', name: 'Living Things', items: ['🐶', '🐱', '🌳', '🌸', '🧚', '🐘'] },
            { id: 'not-living', name: 'Not Living', items: ['🚗', '🏠', '🎻', '⚽', '🎒', '📱'] },
            { id: 'food', name: 'Yummy Food', items: ['🍕', '🍎', '🍰', '🥕', '🍦', '🍔'] },
            { id: 'not-food', name: 'Don\'t Eat!', items: ['👞', '🧱', '🔨', '🔑', '🧼', '🔭'] }
        ];
        this.currentBins = [];
        this.currentItem = null;
    }

    generateChallenge() {
        // Pick two opposite categories
        const setIndex = Math.random() > 0.5 ? 0 : 2; // 0 & 1 or 2 & 3
        const cat1 = this.categories[setIndex];
        const cat2 = this.categories[setIndex + 1];

        this.currentBins = [cat1, cat2];

        // Pick a random item from either
        const sourceCat = Math.random() > 0.5 ? cat1 : cat2;
        this.currentItem = sourceCat.items[Math.floor(Math.random() * sourceCat.items.length)];
        this.correctAnswer = sourceCat.name;
    }

    render() {
        const instruction = document.getElementById('instruction');
        const seqContainer = document.getElementById('sequence');
        const placeholder = document.getElementById('placeholder');
        const optionsContainer = document.getElementById('pattern-options');

        instruction.textContent = `Where does the ${this.currentItem} belong?`;

        // Target item display
        seqContainer.innerHTML = `<div class="pattern-item bounce" style="font-size: 6rem;">${this.currentItem}</div>`;
        placeholder.classList.add('hidden');

        // Sorting Bins (Options)
        optionsContainer.innerHTML = '';
        this.currentBins.forEach(bin => {
            const btn = document.createElement('button');
            btn.className = 'option-btn bin-card';
            btn.innerHTML = `
                <div class="bin-name">${bin.name}</div>
            `;
            btn.onclick = () => this.checkAnswer(bin.name, btn);
            optionsContainer.appendChild(btn);
        });
    }

    stop() {
        super.stop();
        document.getElementById('placeholder').classList.remove('hidden');
    }
}

/**
 * GAME 4: Shadow Match
 * Shape recognition logic.
 */
class ShadowMatchGame extends BaseLogicGame {
    constructor() {
        super();
        this.items = ['🍎', '🍔', '🚀', '🐱', '🦋', '🎈', '✈️', '⛵', '🏠', '🎁'];
    }

    generateChallenge() {
        const pool = [...this.items].sort(() => 0.5 - Math.random());
        this.correctAnswer = pool[0];
        this.options = pool.slice(0, 3).sort(() => 0.5 - Math.random());
    }

    render() {
        const instruction = document.getElementById('instruction');
        const seqContainer = document.getElementById('sequence');
        const placeholder = document.getElementById('placeholder');
        const optionsContainer = document.getElementById('pattern-options');

        instruction.textContent = "Which object matches the shadow?";

        // Shadow display
        seqContainer.innerHTML = `
            <div class="pattern-item shadow-item bounce" style="font-size: 6rem; filter: brightness(0); opacity: 0.8;">
                ${this.correctAnswer}
            </div>
        `;
        placeholder.classList.add('hidden');

        // Options
        optionsContainer.innerHTML = '';
        this.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn fade-in';
            btn.textContent = opt;
            btn.onclick = () => this.checkAnswer(opt, btn);
            optionsContainer.appendChild(btn);
        });
    }

    stop() {
        super.stop();
        document.getElementById('placeholder').classList.remove('hidden');
    }
}

window.OddOneOutGame = OddOneOutGame;
window.ClassificationGame = ClassificationGame;
window.ShadowMatchGame = ShadowMatchGame;
