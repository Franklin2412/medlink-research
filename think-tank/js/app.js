const patternGame = new PatternGame();

document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const gameScreen = document.getElementById('game-screen');

    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const infoDisplay = document.getElementById('game-info-display');

    document.getElementById('start-patterns').addEventListener('click', () => {
        welcomeScreen.classList.remove('active');
        gameScreen.classList.add('active');
        backToMenuBtn.classList.remove('hidden');
        patternGame.start();
    });

    backToMenuBtn.addEventListener('click', () => {
        gameScreen.classList.remove('active');
        welcomeScreen.classList.add('active');
        backToMenuBtn.classList.add('hidden');
        infoDisplay.innerHTML = '';
    });
});
