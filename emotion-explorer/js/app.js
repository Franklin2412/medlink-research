const emotionGame = new EmotionGame();

document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const gameScreen = document.getElementById('game-screen');

    document.getElementById('start-faces').addEventListener('click', () => {
        welcomeScreen.classList.remove('active');
        gameScreen.classList.add('active');
        emotionGame.start();
    });

    document.getElementById('back-to-menu').addEventListener('click', () => {
        gameScreen.classList.remove('active');
        welcomeScreen.classList.add('active');
    });
});
