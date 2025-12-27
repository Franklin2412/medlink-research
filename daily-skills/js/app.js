const routineGame = new RoutineGame();

document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const gameScreen = document.getElementById('game-screen');

    document.getElementById('start-routine').addEventListener('click', () => {
        welcomeScreen.classList.remove('active');
        gameScreen.classList.add('active');
        routineGame.start();
    });

    document.getElementById('check-routine').addEventListener('click', () => {
        routineGame.check();
    });

    document.getElementById('back-to-menu').addEventListener('click', () => {
        gameScreen.classList.remove('active');
        welcomeScreen.classList.add('active');
    });
});
