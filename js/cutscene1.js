const cutsceneContainer = document.getElementById('cutscene-container');
    const video = document.getElementById('cutscene-player');
    const startBtn = document.getElementById('start-btn');

    startBtn.addEventListener('click', () => {
        // 1. Hide the button and show the video
        startBtn.style.display = 'none';
        video.style.display = 'block';

        // 2. Play the video
        video.play().catch(error => {
            console.error("Video failed to play:", error);
            startGame();
        });
    });

    // 3. When the video ends, start the game
    video.onended = function() {
        startGame();
    };

    function gameLoop() {
        checkCircleCollision();
        debugCircles();

    }


    function startGame() {
        cutsceneContainer.style.display = 'none';
        console.log("Gameplay started!");
        gameLoop();
    }