const cloudTrack = document.getElementById('cloud-track');
const gameArea = document.getElementById('game-container');

let cloudX = 0;
const cloudSpeed = 0.5;

function animate() {

    const areaWidth = gameArea.clientWidth;

    cloudX -= cloudSpeed;

    // this does something
    if (cloudX <= -areaWidth) {
        cloudX = 0;
    }

    cloudTrack.style.transform = `translateX(${cloudX}px)`;

    requestAnimationFrame(animate);
}

animate();