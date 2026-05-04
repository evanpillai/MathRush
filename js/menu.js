export let gameStarted = false;

export function setGameStarted(active) {
    gameStarted = active;
}

const cutsceneContainer = document.getElementById('cutscene-container');
        const video = document.getElementById('cutscene-player');
        const startBtn = document.getElementById('start-btn');
        const menuContent = document.querySelector('.menu-content');
        const menuChar = document.querySelector('.menu-character');
        const menuBoss = document.querySelector('.menu-boss');
        const menuBg = document.querySelector('.menu-background');
        
    

        startBtn.addEventListener('click', () => {
            menuContent.style.display = 'none';
            menuChar.style.display = 'none';
            menuBoss.style.display = 'none';
            menuBg.style.display = 'none';
            video.style.display = 'block';
            video.play().catch(() => startGame());
        });

        video.onended = () => startGame();

        function startGame() {
            cutsceneContainer.style.display = 'none';
            gameStarted = true;
        }