const emotionGame = new EmotionGame();
const breathingGame = new BreathingGame();
const bubbleGame = new BubbleGame();

document.addEventListener('DOMContentLoaded', () => {
    const screens = {
        welcome: document.getElementById('welcome-screen'),
        game: document.getElementById('game-screen'),
        breath: document.getElementById('breath-screen'),
        bubble: document.getElementById('bubble-screen')
    };

    function showScreen(screenId) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[screenId].classList.add('active');
    }

    const backToMenuBtn = document.getElementById('back-to-menu-btn');

    document.getElementById('start-faces').addEventListener('click', () => {
        showScreen('game');
        backToMenuBtn.classList.remove('hidden');
        emotionGame.start();
    });

    document.getElementById('start-breath').addEventListener('click', () => {
        showScreen('breath');
        backToMenuBtn.classList.remove('hidden');
        breathingGame.start();
    });

    document.getElementById('start-bubbles').addEventListener('click', () => {
        showScreen('bubble');
        backToMenuBtn.classList.remove('hidden');
        bubbleGame.start();
    });

    backToMenuBtn.addEventListener('click', () => {
        breathingGame.stop();
        bubbleGame.stop();
        showScreen('welcome');
        backToMenuBtn.classList.add('hidden');
    });
});
