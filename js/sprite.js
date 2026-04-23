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