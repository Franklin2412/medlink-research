// Game Instances
let currentGame = null;
const patternGame = new PatternGame();
const oddOneOutGame = new OddOneOutGame();
const classificationGame = new ClassificationGame();
const shadowMatchGame = new ShadowMatchGame();

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
