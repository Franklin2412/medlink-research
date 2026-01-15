const phonicsGame = new PhonicsGame();
const wordEchoGame = new WordEchoGame();

window.phonicsGame = phonicsGame;
window.wordEchoGame = wordEchoGame;

document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const welcomeScreen = document.getElementById('welcome-screen');
    const gameScreen = document.getElementById('game-screen');
    const echoScreen = document.getElementById('echo-screen');

    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const infoDisplay = document.getElementById('game-info-display');

    document.getElementById('start-phonics').addEventListener('click', () => {
        welcomeScreen.classList.remove('active');
        gameScreen.classList.add('active');
        backToMenuBtn.classList.remove('hidden');
        phonicsGame.start();
    });

    document.getElementById('start-word-echo').addEventListener('click', () => {
        welcomeScreen.classList.remove('active');
        echoScreen.classList.add('active');
        backToMenuBtn.classList.remove('hidden');
        wordEchoGame.start();
    });

    backToMenuBtn.addEventListener('click', () => {
        if (welcomeScreen.classList.contains('active')) return;

        // Record activity if we were playing
        if (gameScreen.classList.contains('active')) {
            StorageManager.recordSessionActivity('SpeakEasy Studio', 'Phonics Fun', `Score: ${phonicsGame.score}`, 'N/A');
        } else if (echoScreen.classList.contains('active')) {
            StorageManager.recordSessionActivity('SpeakEasy Studio', 'Word Echo', `Score: ${wordEchoGame.score}`, 'N/A');
        }

        gameScreen.classList.remove('active');
        echoScreen.classList.remove('active');
        welcomeScreen.classList.add('active');
        backToMenuBtn.classList.add('hidden');
        infoDisplay.innerHTML = '';

        // Reset buttons
        document.getElementById('echo-listen-btn').classList.remove('hidden');
    });

    document.getElementById('play-sound-btn').addEventListener('click', () => {
        phonicsGame.speakSound();
    });

    document.getElementById('echo-listen-btn').addEventListener('click', () => {
        wordEchoGame.speakSlowly();
    });

    document.getElementById('progress-btn').addEventListener('click', () => {
        StorageManager.showSessionStats();
    });
});
