const cloudTrack = document.getElementById('clouds');
const gameArea = document.getElementById('game-container');

let cloudX = 0;
const cloudSpeed = 0.5;

function animate() {
    const areaWidth = gameArea.clientWidth;

    // ONLY update the position if hitlag is NOT active
    if (!window.isHitlag) {
        cloudX -= cloudSpeed;

        if (cloudX <= -areaWidth) {
            cloudX = 0;
        }
        
        // Only update the style when moving to save performance
        cloudTrack.style.transform = `translateX(${cloudX}px)`;
    }

    // Always keep the loop alive no matter what
    requestAnimationFrame(animate);
}

animate();