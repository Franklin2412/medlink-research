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

/**
 * GAME 2: Size Sort
 * Spatial reasoning logic.
 */
class SizeSortGame extends BaseLogicGame {
    constructor() {
        super();
        this.items = [
            { name: 'Ant', emoji: '🐜', size: 1 },
            { name: 'Mouse', emoji: '🐭', size: 2 },
            { name: 'Dog', emoji: '🐶', size: 3 },
            { name: 'Horse', emoji: '🐎', size: 4 },
            { name: 'Elephant', emoji: '🐘', size: 5 },
            { name: 'Whale', emoji: '🐋', size: 6 }
        ];
    }

    generateChallenge() {
        // Pick 3 random items from different size tiers
        const pool = [...this.items].sort(() => 0.5 - Math.random()).slice(0, 3);
        // Correct answer is the sequence sorted by size
        this.correctOrder = [...pool].sort((a, b) => a.size - b.size);
        this.currentSet = [...pool].sort(() => 0.5 - Math.random());

        // In this game, we check the FULL order. 
        // For simplicity in the first version, let's ask "Which one is LARGEST?"
        this.askType = Math.random() > 0.5 ? 'LARGEST' : 'SMALLEST';
        this.correctAnswer = this.askType === 'LARGEST'
            ? this.correctOrder[2].emoji
            : this.correctOrder[0].emoji;
    }

    render() {
        const instruction = document.getElementById('instruction');
        const seqContainer = document.getElementById('sequence');
        const placeholder = document.getElementById('placeholder');
        const optionsContainer = document.getElementById('pattern-options');

        instruction.textContent = `Which one is the ${this.askType}?`;
        seqContainer.innerHTML = '';
        placeholder.classList.add('hidden');

        optionsContainer.innerHTML = '';
        this.currentSet.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'option-btn logic-card fade-in';
            // Visual hint: slightly vary size of emoji in button
            const visualSize = 2 + (item.size * 0.5);
            btn.innerHTML = `<span style="font-size: ${visualSize}rem">${item.emoji}</span>`;
            btn.onclick = () => this.checkAnswer(item.emoji, btn);
            optionsContainer.appendChild(btn);
        });
    }

    stop() {
        super.stop();
        document.getElementById('placeholder').classList.remove('hidden');
    }
}

/**
 * GAME 3: Color Match
 * Visual categorization logic.
 */
class ColorMatchGame extends BaseLogicGame {
    constructor() {
        super();
        this.colorGroups = [
            { name: 'Red', emoji: '🔴', items: ['🍎', '🍓', '🚗', '🦞', '🎈'] },
            { name: 'Green', emoji: '🟢', items: ['🍏', '🌳', '🐢', '🥦', '🍀'] },
            { name: 'Blue', emoji: '🔵', items: ['🐳', '🦋', '🛳️', '👖', '🌌'] },
            { name: 'Yellow', emoji: '🟡', items: ['🍋', '🍌', '☀️', '🐤', '⭐'] }
        ];
    }

    generateChallenge() {
        const targetColor = this.colorGroups[Math.floor(Math.random() * this.colorGroups.length)];
        const otherColors = this.colorGroups.filter(c => c !== targetColor);

        const correctItem = targetColor.items[Math.floor(Math.random() * targetColor.items.length)];
        const distractor1 = otherColors[0].items[Math.floor(Math.random() * otherColors[0].items.length)];
        const distractor2 = otherColors[1].items[Math.floor(Math.random() * otherColors[1].items.length)];

        this.correctAnswer = correctItem;
        this.targetColorName = targetColor.name;
        this.targetColorEmoji = targetColor.emoji;

        this.options = [correctItem, distractor1, distractor2].sort(() => 0.5 - Math.random());
    }

    render() {
        const instruction = document.getElementById('instruction');
        const seqContainer = document.getElementById('sequence');
        const placeholder = document.getElementById('placeholder');
        const optionsContainer = document.getElementById('pattern-options');

        instruction.textContent = `Find something that is ${this.targetColorName}!`;
        seqContainer.innerHTML = `<div class="pattern-item bounce" style="font-size: 5rem;">${this.targetColorEmoji}</div>`;
        placeholder.classList.add('hidden');

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

window.SizeSortGame = SizeSortGame;
window.ColorMatchGame = ColorMatchGame;

/**
 * GAME 7: Quantity Match
 * Numeracy logic.
 */
class QuantityMatchGame extends BaseLogicGame {
    constructor() {
        super();
        this.items = ['🍎', '⭐', '🐶', '🎈', '🚗', '🍄'];
    }

    generateChallenge() {
        this.correctAnswer = Math.floor(Math.random() * 5) + 1; // 1 to 5
        this.itemEmoji = this.items[Math.floor(Math.random() * this.items.length)];

        // Generate options (correct numeral + 2 distractors)
        const distractors = [1, 2, 3, 4, 5, 6]
            .filter(n => n !== this.correctAnswer)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);

        this.options = [this.correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
    }

    render() {
        const instruction = document.getElementById('instruction');
        const seqContainer = document.getElementById('sequence');
        const placeholder = document.getElementById('placeholder');
        const optionsContainer = document.getElementById('pattern-options');

        instruction.textContent = "How many items do you see?";

        // Display set of items
        let itemsHtml = '';
        for (let i = 0; i < this.correctAnswer; i++) {
            itemsHtml += `<div class="pattern-item fade-in">${this.itemEmoji}</div>`;
        }
        seqContainer.innerHTML = itemsHtml;
        placeholder.classList.add('hidden');

        optionsContainer.innerHTML = '';
        this.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn font-bold';
            btn.textContent = opt;
            btn.style.fontSize = '4rem';
            btn.onclick = () => this.checkAnswer(opt, btn);
            optionsContainer.appendChild(btn);
        });
    }

    stop() {
        super.stop();
        document.getElementById('placeholder').classList.remove('hidden');
    }
}

/**
 * GAME 10: Sequence Story
 * Temporal logic.
 */
class SequenceStoryGame extends BaseLogicGame {
    constructor() {
        super();
        this.sequences = [
            { name: 'Chicken', steps: ['🥚', '🐥', '🐔'] },
            { name: 'Plant', steps: ['🌱', '🌿', '🌳'] },
            { name: 'Butterfly', steps: ['🐛', '🕸️', '🦋'] },
            { name: 'Construction', steps: ['🧱', '🏠', '🏰'] },
            { name: 'Time', steps: ['🌅', '☀️', '🌇'] }
        ];
    }

    generateChallenge() {
        const seq = this.sequences[Math.floor(Math.random() * this.sequences.length)];
        this.fullSequence = seq.steps;

        // Hide the LAST step
        this.displaySteps = [seq.steps[0], seq.steps[1]];
        this.correctAnswer = seq.steps[2];

        // Distractors
        const allSteps = this.sequences.flatMap(s => s.steps);
        const distractors = allSteps
            .filter(s => !this.fullSequence.includes(s))
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);

        this.options = [this.correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
    }

    render() {
        const instruction = document.getElementById('instruction');
        const seqContainer = document.getElementById('sequence');
        const placeholder = document.getElementById('placeholder');
        const optionsContainer = document.getElementById('pattern-options');

        instruction.textContent = "What happens next in the story?";

        seqContainer.innerHTML = '';
        this.displaySteps.forEach(step => {
            const div = document.createElement('div');
            div.className = 'pattern-item fade-in';
            div.textContent = step;
            seqContainer.appendChild(div);
        });

        placeholder.classList.remove('hidden');
        placeholder.textContent = '?';

        optionsContainer.innerHTML = '';
        this.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn fade-in';
            btn.textContent = opt;
            btn.onclick = () => this.checkAnswer(opt, btn);
            optionsContainer.appendChild(btn);
        });
    }

    onSuccess(choice) {
        document.getElementById('placeholder').textContent = choice;
        document.getElementById('placeholder').classList.add('correct-highlight');
    }
}

window.QuantityMatchGame = QuantityMatchGame;
window.SequenceStoryGame = SequenceStoryGame;

/**
 * GAME 8: Attribute Hunter
 * Multi-criteria identification.
 */
class AttributeHunterGame extends BaseLogicGame {
    constructor() {
        super();
        this.items = [
            { emoji: '🍎', color: 'red', shape: 'round', type: 'food' },
            { emoji: '🍌', color: 'yellow', shape: 'long', type: 'food' },
            { emoji: '⭐', color: 'yellow', shape: 'star', type: 'object' },
            { emoji: '🚗', color: 'red', shape: 'car', type: 'object' },
            { emoji: '🥦', color: 'green', shape: 'tree', type: 'food' },
            { emoji: '🐢', color: 'green', shape: 'round', type: 'animal' },
            { emoji: '⚽', color: 'white', shape: 'round', type: 'object' },
            { emoji: '🦁', color: 'yellow', shape: 'cat', type: 'animal' }
        ];
    }

    generateChallenge() {
        const target = this.items[Math.floor(Math.random() * this.items.length)];
        this.correctAnswer = target.emoji;

        // Randomly pick 2 attributes to ask about
        const attrs = ['color', 'shape', 'type'];
        const chosen = attrs.sort(() => 0.5 - Math.random()).slice(0, 2);

        this.query = `Find the one that is ${target[chosen[0]]} and ${target[chosen[1]]}!`;

        // Pick 2 distractors
        this.options = [this.correctAnswer];
        const distractors = this.items
            .filter(i => i.emoji !== this.correctAnswer)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);
        this.options.push(...distractors.map(d => d.emoji));
        this.options = this.options.sort(() => 0.5 - Math.random());
    }

    render() {
        const instruction = document.getElementById('instruction');
        const seqContainer = document.getElementById('sequence');
        const placeholder = document.getElementById('placeholder');
        const optionsContainer = document.getElementById('pattern-options');

        instruction.textContent = this.query;
        seqContainer.innerHTML = '<div class="pattern-item bounce">🔍</div>';
        placeholder.classList.add('hidden');

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

/**
 * GAME 9: Emoji Sudoku (2x2)
 * Deductive logic.
 */
class EmojiSudokuGame extends BaseLogicGame {
    constructor() {
        super();
        this.emojiSets = [['🍎', '🍌'], ['🐶', '🐱'], ['☀️', '🌙'], ['🚗', '✈️']];
    }

    generateChallenge() {
        const set = this.emojiSets[Math.floor(Math.random() * this.emojiSets.length)];
        const A = set[0];
        const B = set[1];

        // Latin Square 2x2: 
        // A B
        // B A
        this.grid = [
            [A, B],
            [B, A]
        ];

        // Randomly hide one cell
        this.targetRow = Math.floor(Math.random() * 2);
        this.targetCol = Math.floor(Math.random() * 2);
        this.correctAnswer = this.grid[this.targetRow][this.targetCol];

        this.displayGrid = JSON.parse(JSON.stringify(this.grid));
        this.displayGrid[this.targetRow][this.targetCol] = '?';

        this.options = [A, B].sort(() => 0.5 - Math.random());
    }

    render() {
        const instruction = document.getElementById('instruction');
        const seqContainer = document.getElementById('sequence');
        const placeholder = document.getElementById('placeholder');
        const optionsContainer = document.getElementById('pattern-options');

        instruction.textContent = "Fill the empty spot! (Each row and column must be different)";

        // Render 2x2 grid
        let gridHtml = '<div class="sudoku-grid">';
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 2; c++) {
                const val = this.displayGrid[r][c];
                const isTarget = (r === this.targetRow && c === this.targetCol);
                gridHtml += `<div class="sudoku-cell ${isTarget ? 'sudoku-target' : ''}">${val}</div>`;
            }
        }
        gridHtml += '</div>';

        seqContainer.innerHTML = gridHtml;
        placeholder.classList.add('hidden');

        optionsContainer.innerHTML = '';
        this.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn fade-in';
            btn.textContent = opt;
            btn.onclick = () => this.checkAnswer(opt, btn);
            optionsContainer.appendChild(btn);
        });
    }

    onSuccess(choice) {
        const targetCell = document.querySelector('.sudoku-target');
        if (targetCell) {
            targetCell.textContent = choice;
            targetCell.classList.add('correct-highlight');
        }
    }

    stop() {
        super.stop();
        document.getElementById('placeholder').classList.remove('hidden');
    }
}

window.AttributeHunterGame = AttributeHunterGame;
window.EmojiSudokuGame = EmojiSudokuGame;
