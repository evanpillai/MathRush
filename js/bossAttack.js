import mathQuestions from './questions.js';

const questionText = document.getElementById('question-text');
const timerDisplay = document.getElementById('timer-val');
const timerLabel = document.getElementById('timer-label');
const tiles = document.querySelectorAll('.stone-tile');
const player = document.getElementById('player');
const bubble = document.getElementById('immunity-bubble');
const gameContainer = document.getElementById('game-container');
const stormCloud = document.getElementById('storm-cloud');
const hearts = document.querySelectorAll('.heart');

const deathScreen = document.getElementById('death-screen');
const finalTimeTxt = document.getElementById('final-time');
const bestTimeTxt = document.getElementById('best-time');
const retryBtn = document.getElementById('retry-btn');

let currentQuestion = null;
let attackInterval;
let lasersActive = false;
let startDelay = 5;
let gameStartTime = null;

// Health & Immunity
let playerHealth = 3;
let isInvulnerable = false;
const IMMUNITY_DURATION = 1000; // 1 second

const bossFlameContainer = document.createElement('div');
bossFlameContainer.id = 'boss-flame-container';
bossFlameContainer.style.position = 'absolute';
bossFlameContainer.style.top = '0'; bossFlameContainer.style.left = '0';
bossFlameContainer.style.width = '100%'; bossFlameContainer.style.height = '100%';
bossFlameContainer.style.pointerEvents = 'none'; bossFlameContainer.style.zIndex = '60';
gameContainer.appendChild(bossFlameContainer);

const startTimerInterval = setInterval(() => {
    if (window.gameStarted) {
        if (!gameStartTime) gameStartTime = Date.now();
        startDelay--;
        timerDisplay.innerText = startDelay;
        if (startDelay <= 0) {
            clearInterval(startTimerInterval);
            bossFlameContainer.innerHTML = '';
            timerLabel.innerText = "TIME REMAINING: ";
            initAttack();
        }
    }
}, 1000);

function initAttack() {
    lasersActive = false;
    isInvulnerable = false;
    bubble.classList.remove('bubble-active');
    player.style.filter = "none";
    stormCloud.style.top = "-25%"; 
    document.querySelectorAll('.laser-beam').forEach(l => l.remove());

    currentQuestion = mathQuestions[Math.floor(Math.random() * mathQuestions.length)];
    questionText.innerText = `BOSS: What is ${currentQuestion.question}?`;
    
    let answers = [currentQuestion.answer];
    while (answers.length < 3) {
        let fake = Math.floor(Math.random() * 50).toString();
        if (!answers.includes(fake)) answers.push(fake);
    }
    answers.sort(() => Math.random() - 0.5);

    tiles.forEach((tile, index) => {
        tile.innerHTML = `<span class="answer-label">${answers[index]}</span>`;
        tile.dataset.value = answers[index];
        tile.style.backgroundColor = "transparent";
    });

    startAttackTimer();
}

function startAttackTimer() {
    let timeLeft = 7; 
    timerDisplay.innerText = timeLeft;
    attackInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft === 2) stormCloud.style.top = "0";
        if (timeLeft <= 0) {
            clearInterval(attackInterval);
            fireLasers();
        }
    }, 1000);
}

function fireLasers() {
    const safeTile = Array.from(tiles).find(t => t.dataset.value === currentQuestion.answer);
    const safeRect = safeTile.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();

    for (let x = 0; x < containerRect.width; x += 25) {
        const relLeft = safeRect.left - containerRect.left;
        const relRight = safeRect.right - containerRect.left;
        if (x > (relLeft - 10) && x < (relRight + 10)) continue; 
        createLaserVisual(x);
    }

    lasersActive = true;
    checkCollision();

    setTimeout(() => {
        if (lasersActive) {
            lasersActive = false;
            initAttack();
        }
    }, 4000);
}

function createLaserVisual(xPosition) {
    const laser = document.createElement('div');
    laser.className = 'laser-beam';
    laser.style.left = `${xPosition}px`;
    gameContainer.appendChild(laser);
}

function checkCollision() {
    if (!lasersActive || isInvulnerable) return;

    const playerRect = player.getBoundingClientRect();
    const activeLasers = document.querySelectorAll('.laser-beam');
    let isTouching = false;

    for (let laser of activeLasers) {
        const lRect = laser.getBoundingClientRect();
        if (playerRect.right > lRect.left && playerRect.left < lRect.right && playerRect.bottom > lRect.top) {
            isTouching = true;
            break;
        }
    }

    if (isTouching) {
        takeDamage();
    } else {
        requestAnimationFrame(checkCollision);
    }
}

function takeDamage() {
    playerHealth--;
    
    if (hearts[playerHealth]) {
        hearts[playerHealth].style.opacity = "0.1";
        hearts[playerHealth].style.transform = "scale(0.8)";
    }

    if (playerHealth <= 0) {
        triggerGameOver();
    } else {
        isInvulnerable = true;
        bubble.classList.add('bubble-active');
        player.style.filter = "brightness(1.5)";

        setTimeout(() => {
            isInvulnerable = false;
            bubble.classList.remove('bubble-active');
            player.style.filter = "none";
            if (lasersActive) checkCollision();
        }, IMMUNITY_DURATION);
    }
}

function triggerGameOver() {
    lasersActive = false;
    const survived = Math.floor((Date.now() - gameStartTime) / 1000);
    let best = localStorage.getItem('mathRushBest') || 0;
    if (survived > best) {
        best = survived;
        localStorage.setItem('mathRushBest', best);
    }
    finalTimeTxt.innerText = survived;
    bestTimeTxt.innerText = best;
    deathScreen.style.display = 'flex';
}

retryBtn.addEventListener('click', () => location.reload());