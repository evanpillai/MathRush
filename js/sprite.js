import { startMathBattle } from './spriteAttack.js';

const player = document.getElementById('player');
const gameBox = document.getElementById('game-container');

//start in center
let posX = gameBox.clientWidth / 2 - 40;
let posY = gameBox.clientHeight * 0.7;

const walkSpeed = 3;
const runSpeed = 5;
const keys = {};

let frame = 0; 
let row = 0;   
let tick = 0;  

const PLAYER_WIDTH = 64;
const PLAYER_HEIGHT = 80;

window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function movePlayer() {
    let moveX = 0;
    let moveY = 0;
    let isMoving = false;

    if (keys['w'] || keys['arrowup'])    moveY -= 1;
    if (keys['s'] || keys['arrowdown'])  moveY += 1;
    if (keys['a'] || keys['arrowleft'])  moveX -= 1;
    if (keys['d'] || keys['arrowright']) moveX += 1;

    if (moveX !== 0 || moveY !== 0) isMoving = true;

    if (moveY < 0 && moveX > 0) row = 4;
    else if (moveY < 0 && moveX < 0) row = 5;
    else if (moveY > 0 && moveX > 0) row = 6;
    else if (moveY > 0 && moveX < 0) row = 7;
    else if (moveY < 0) row = 3;
    else if (moveY > 0) row = 0;
    else if (moveX < 0) row = 2;
    else if (moveX > 0) row = 1;

    let currentSpeed = keys['shift'] ? runSpeed : walkSpeed;
    if (moveX !== 0 && moveY !== 0) currentSpeed *= 0.707;

    let nextX = posX + (moveX * currentSpeed);
    let nextY = posY + (moveY * currentSpeed);



    if (nextX < 0) nextX = 0;
    if (nextX > gameBox.clientWidth - PLAYER_WIDTH) {
        nextX = gameBox.clientWidth - PLAYER_WIDTH;
    }

    //vertical limit
    const skyLimit = gameBox.clientHeight * 0.37; 
    
    if (nextY < skyLimit) nextY = skyLimit; // Stops the player from going up into the sky
    if (nextY > gameBox.clientHeight - PLAYER_HEIGHT) {
        nextY = gameBox.clientHeight - PLAYER_HEIGHT; // Stops them from falling off the bottom
    }

    posX = nextX;
    posY = nextY;

    if (isMoving) {
        tick++;
        if (tick > 8) {
            frame = (frame + 1) % 6;
            tick = 0;
        }
    } else {
        frame = 0; 
    }
    
    player.style.left = `${posX}px`;
    player.style.top = `${posY}px`;
    player.style.backgroundPosition = `-${frame * 64}px -${row * 80}px`;

    requestAnimationFrame(movePlayer);
}

movePlayer();

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && window.gameStarted && !window.battleActive) {
        createHitbox();
    }
});

function createHitbox() {
    const hitbox = document.createElement('div');
    hitbox.className = 'attack-hitbox';
    
    // Size of the attack box
    const boxWidth = 40;
    const boxHeight = 40;
    
    // Default position (centered on player)
    let hLeft = posX + (PLAYER_WIDTH / 2) - (boxWidth / 2);
    let hTop = posY + (PLAYER_HEIGHT / 2) - (boxHeight / 2);

    // Offset the box based on the direction (row) the player is facing
    // Using your existing row logic: 0: Down, 1: Right, 2: Left, 3: Up
    const offset = 40; 

    if (row === 0 || row === 6 || row === 7) hTop += offset; // Facing Down
    if (row === 3 || row === 4 || row === 5) hTop -= offset; // Facing Up
    if (row === 1 || row === 4 || row === 6) hLeft += offset; // Facing Right
    if (row === 2 || row === 5 || row === 7) hLeft -= offset; // Facing Left

    hitbox.style.width = `${boxWidth}px`;
    hitbox.style.height = `${boxHeight}px`;
    hitbox.style.left = `${hLeft}px`;
    hitbox.style.top = `${hTop}px`;

    gameBox.appendChild(hitbox);

    // Check for collision with boss immediately
    checkBossHit(hitbox);

    // Remove the box after 150ms
    setTimeout(() => {
        hitbox.remove();
    }, 150);
}

function checkBossHit(hitbox) {
    const bossZone = document.getElementById('boss-hitbox');
    
    // Safety check in case the boss hitbox hasn't loaded yet
    if (!bossZone) return;

    // Get the pixel positions and dimensions of the Boss Hitbox
    const b = {
        left: bossZone.offsetLeft,
        right: bossZone.offsetLeft + bossZone.offsetWidth,
        top: bossZone.offsetTop,
        bottom: bossZone.offsetTop + bossZone.offsetHeight
    };

    // Get the pixel positions and dimensions of the Attack Hitbox
    const h = {
        left: hitbox.offsetLeft,
        right: hitbox.offsetLeft + hitbox.offsetWidth,
        top: hitbox.offsetTop,
        bottom: hitbox.offsetTop + hitbox.offsetHeight
    };

    // The Collision Logic: 
    // Is the Attack Box NOT to the left, NOT to the right, NOT above, and NOT below?
    const isHitting = !(
        h.right < b.left || 
        h.left > b.right || 
        h.bottom < b.top || 
        h.top > b.bottom
    );

    if (isHitting) {
        console.log("💥 DIRECT HIT ON BOSS!");
        
        // Optional: Add a visual effect to the boss image to show it was hit
        const bossImg = document.getElementById('boss');
        bossImg.style.filter = "brightness(2) contrast(2)";
        setTimeout(() => bossImg.style.filter = "none", 100);
        startMathBattle();
    }
}
