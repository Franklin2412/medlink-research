const routineGame = new RoutineGame();

document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const gameScreen = document.getElementById('game-screen');

    const backToMenuBtn = document.getElementById('back-to-menu-btn');

    document.getElementById('start-routine').addEventListener('click', () => {
        welcomeScreen.classList.remove('active');
        gameScreen.classList.add('active');
        backToMenuBtn.classList.remove('hidden');
        routineGame.start();
    });

    document.getElementById('check-routine').addEventListener('click', () => {
        routineGame.check();
    });

    backToMenuBtn.addEventListener('click', () => {
        gameScreen.classList.remove('active');
        welcomeScreen.classList.add('active');
        backToMenuBtn.classList.add('hidden');
    });

    document.getElementById('play-again').addEventListener('click', () => {
        routineGame.hideVictoryOverlay();
        routineGame.start();
    });
});
