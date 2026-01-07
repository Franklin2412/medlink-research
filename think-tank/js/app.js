// Game Instances
let currentGame = null;
const patternGame = new PatternGame();
const oddOneOutGame = new OddOneOutGame();
const classificationGame = new ClassificationGame();
const shadowMatchGame = new ShadowMatchGame();
const sizeSortGame = new SizeSortGame();
const colorMatchGame = new ColorMatchGame();
const quantityGame = new QuantityMatchGame();
const storyGame = new SequenceStoryGame();
const attributeGame = new AttributeHunterGame();
const sudokuGame = new EmojiSudokuGame();

document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const gameScreen = document.getElementById('game-screen');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const infoDisplay = document.getElementById('game-info-display');

    // Activity Starters
    const startGame = (gameInstance) => {
        if (currentGame) currentGame.stop();
        currentGame = gameInstance;

        welcomeScreen.classList.remove('active');
        gameScreen.classList.add('active');
        backToMenuBtn.classList.remove('hidden');
        currentGame.start();
    };

    document.getElementById('start-patterns').addEventListener('click', () => startGame(patternGame));
    document.getElementById('start-odd-one').addEventListener('click', () => startGame(oddOneOutGame));
    document.getElementById('start-classification').addEventListener('click', () => startGame(classificationGame));
    document.getElementById('start-shadow').addEventListener('click', () => startGame(shadowMatchGame));
    document.getElementById('start-size').addEventListener('click', () => startGame(sizeSortGame));
    document.getElementById('start-color').addEventListener('click', () => startGame(colorMatchGame));
    document.getElementById('start-quantity').addEventListener('click', () => startGame(quantityGame));
    document.getElementById('start-story').addEventListener('click', () => startGame(storyGame));
    document.getElementById('start-attribute').addEventListener('click', () => startGame(attributeGame));
    document.getElementById('start-sudoku').addEventListener('click', () => startGame(sudokuGame));

    backToMenuBtn.addEventListener('click', () => {
        if (currentGame) currentGame.stop();
        gameScreen.classList.remove('active');
        welcomeScreen.classList.add('active');
        backToMenuBtn.classList.add('hidden');
        infoDisplay.innerHTML = '';

        // Reset instructions
        document.getElementById('instruction').textContent = 'What comes next in the pattern?';
    });
});
