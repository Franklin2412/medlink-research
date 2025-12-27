const phonicsGame = new PhonicsGame();

document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const welcomeScreen = document.getElementById('welcome-screen');
    const gameScreen = document.getElementById('game-screen');

    document.getElementById('start-phonics').addEventListener('click', () => {
        welcomeScreen.classList.remove('active');
        gameScreen.classList.add('active');
        phonicsGame.start();
    });

    document.getElementById('back-to-menu').addEventListener('click', () => {
        gameScreen.classList.remove('active');
        welcomeScreen.classList.add('active');
    });

    document.getElementById('play-sound-btn').addEventListener('click', () => {
        phonicsGame.speakSound();
    });
});
