import { startMathBattle,battleActive, setBattleActive } from './spriteAttack.js';
import { SWORDSLICE } from './const.js';
import { gameStarted } from './menu.js';
import { bossInvulnerable } from './bossAttack.js';

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

    if (window.isHitlag) {
        requestAnimationFrame(movePlayer);
        return; 
    }

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
    if (e.code === 'Space' && gameStarted && !battleActive) {
        createHitbox();
    }
});

function triggerHitlag(duration = 100) { // duration in milliseconds
    window.isHitlag = true;

    // Optional: Add a slight CSS zoom or grayscale to emphasize the "freeze"
    document.getElementById('game-container').style.filter = "brightness(1.2)";

    setTimeout(() => {
        window.isHitlag = false;
        document.getElementById('game-container').style.filter = "none";
    }, duration);
}

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

function triggerSlash(hitboxY) {
    const slash = document.getElementById('slash-effect');
    
    // Set the vertical position of the slash to match the attack hitbox
    slash.style.top = `${hitboxY}px`;

    slash.classList.add('active-slash');

    // Slice Sound
    SWORDSLICE.play();

    setTimeout(() => {
        slash.classList.remove('active-slash');
    }, 350);
}

function isPixelCollision(hitbox, bossImg) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Get exact screen positions
    const hRect = hitbox.getBoundingClientRect();
    const bRect = bossImg.getBoundingClientRect();

    canvas.width = hRect.width;
    canvas.height = hRect.height;

    // The "Magic Math": 
    // We need to draw the boss relative to the hitbox's top-left corner (0,0 of the canvas)
    const drawX = bRect.left - hRect.left;
    const drawY = bRect.top - hRect.top;

    ctx.drawImage(bossImg, drawX, drawY, bRect.width, bRect.height);

    try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        // Check every 4th byte (Alpha)
        for (let i = 3; i < imgData.length; i += 4) {
            if (imgData[i] > 10) return true; 
        }
    } catch (e) {
        console.error("CORS Error: Image must be hosted locally to check pixels!", e);
        return false;
    }
    return false;
}

function checkBossHit(hitbox) {
    const bossImg = document.getElementById('boss');
    if (!bossImg || bossInvulnerable) return;

    const bRect = bossImg.getBoundingClientRect();
    const hRect = hitbox.getBoundingClientRect();

    // 1. Check if boxes touch at all
    const boxOverlap = !(
        hRect.right < bRect.left || 
        hRect.left > bRect.right || 
        hRect.bottom < bRect.top || 
        hRect.top > bRect.bottom
    );

    if (boxOverlap) {
        console.log("Box overlap detected! Running pixel check...");
        
        if (isPixelCollision(hitbox, bossImg)) {
            if (!battleActive && !window.isHitlag) {
                // 1. Trigger the Visual Slash
                const hRect = hitbox.getBoundingClientRect();
                triggerSlash(hRect.top + (hRect.height / 2)); 
                
                // 2. Trigger the Hitlag (Freeze for 150ms)
                triggerHitlag(150);

                // 3. Delay the Math Battle slightly so the player sees the hit
                setTimeout(() => {
                    // battleActive = true;
                    setBattleActive(true)
                    startMathBattle();
                }, 150); 
            }
        }
    }
}


