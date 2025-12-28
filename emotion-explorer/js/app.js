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

    document.getElementById('start-faces').addEventListener('click', () => {
        showScreen('game');
        emotionGame.start();
    });

    document.getElementById('start-breath').addEventListener('click', () => {
        showScreen('breath');
        breathingGame.start();
    });

    document.getElementById('start-bubbles').addEventListener('click', () => {
        showScreen('bubble');
        bubbleGame.start();
    });

    document.querySelectorAll('.back-to-menu-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            breathingGame.stop();
            bubbleGame.stop();
            showScreen('welcome');
        });
    });
});
