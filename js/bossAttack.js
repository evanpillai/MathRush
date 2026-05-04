import mathQuestions from './questions.js';
import { setGameStarted, gameStarted } from './menu.js';

const questionText = document.getElementById('question-text');
const timerDisplay = document.getElementById('timer-val');
const timerLabel = document.getElementById('timer-label');
const tiles = document.querySelectorAll('.stone-tile');
const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const stormCloud = document.getElementById('storm-cloud');
const boss = document.getElementById('boss');

const deathScreen = document.getElementById('death-screen');
const finalTimeTxt = document.getElementById('final-time');
const bestTimeTxt = document.getElementById('best-time');
const retryBtn = document.getElementById('retry-btn');


let currentQuestion = null;
let attackInterval;
let lasersActive = false;
let startDelay = 5;
let gameStartTime = null;
let touchStartTime = null; 
const GRACE_PERIOD = 1000; 

const startTimerInterval = setInterval(() => {
    if (gameStarted) {
        if (!gameStartTime) {
            gameStartTime = Date.now();
        }
        startDelay--;
        timerDisplay.innerText = startDelay;
        if (startDelay <= 0) {
            clearInterval(startTimerInterval);
            timerLabel.innerText = "TIME REMAINING: ";
            initAttack();
        }
    }
}, 1000);

export function setLasers(active) {
    lasersActive = active
}

function initAttack() {
    lasersActive = false;
    touchStartTime = null;
    stormCloud.style.top = "-25%"; 
    document.querySelectorAll('.laser-beam').forEach(l => l.remove());
    player.style.filter = "none";

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
    if (!lasersActive) return;

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
        if (touchStartTime === null) {
            touchStartTime = Date.now();
            player.style.filter = "brightness(3) saturate(2) hue-rotate(90deg)"; 
        } else if (Date.now() - touchStartTime > GRACE_PERIOD) {
            triggerGameOver();
            return;
        }
    } else {
        touchStartTime = null;
        player.style.filter = "none";
    }
    requestAnimationFrame(checkCollision);
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


