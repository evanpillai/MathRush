const cutsceneContainer = document.getElementById('cutscene-container');
const video = document.getElementById('cutscene-player');
const startBtn = document.getElementById('start-btn');
const menuContent = document.querySelector('.menu-content');

window.gameStarted = false;

startBtn.addEventListener('click', () => {
    // Hide the text/buttons immediately
    menuContent.style.opacity = '0';
    menuContent.style.pointerEvents = 'none';
    
    // Show and play video
    video.style.display = 'block';
    video.play().catch(() => startGame());
});

// If the user clicks the video, they can skip it (optional)
video.addEventListener('click', () => startGame());

video.onended = () => startGame();

function startGame() {
    cutsceneContainer.style.display = 'none';
    window.gameStarted = true;
}