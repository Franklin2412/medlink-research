const phonicsGame = new PhonicsGame();

document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const welcomeScreen = document.getElementById('welcome-screen');
    const gameScreen = document.getElementById('game-screen');

    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const infoDisplay = document.getElementById('game-info-display');

    document.getElementById('start-phonics').addEventListener('click', () => {
        welcomeScreen.classList.remove('active');
        gameScreen.classList.add('active');
        backToMenuBtn.classList.remove('hidden');
        phonicsGame.start();
    });

    backToMenuBtn.addEventListener('click', () => {
        if (welcomeScreen.classList.contains('active')) return; // already there

        // Record activity if we were playing
        if (gameScreen.classList.contains('active')) {
            StorageManager.recordSessionActivity('SpeakEasy Studio', 'Phonics Fun', `Score: ${phonicsGame.score}`, 'N/A');
        }

        gameScreen.classList.remove('active');
        welcomeScreen.classList.add('active');
        backToMenuBtn.classList.add('hidden');
        infoDisplay.innerHTML = '';
    });

    document.getElementById('play-sound-btn').addEventListener('click', () => {
        phonicsGame.speakSound();
    });

    document.getElementById('progress-btn').addEventListener('click', () => {
        StorageManager.showSessionStats();
    });
});
