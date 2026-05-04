const winScreen = document.getElementById('win-screen');
const winRetryBtn = document.getElementById('win-retry-btn');
const timerBar = document.getElementById('timer-bar');
const timerText = document.getElementById('timer-text');

let bossHealth = 100;
export let battleActive = false;
let battleTimer = 20;
const MAXBATTLETIME = 20;
let currentCorrectAnswer = null;
let battleInterval = null;

export function setBattleActive(active) {
    battleActive = active
}
// Call this when the player touches the boss or triggers an attack
export function startMathBattle() {
    battleActive = true;
    battleTimer = 20;

    timerBar.style.transition = 'none'; // Disable transition for instant reset
    timerBar.style.width = '100%';
    timerBar.style.backgroundColor = '#00ff00';
    timerText.innerText = `${MAXBATTLETIME}s`;

    setTimeout(() => {
        timerBar.style.transition = 'width 1s linear, background-color 0.5s';
    }, 50);

    document.getElementById('battle-overlay').style.display = 'flex';
    
    generateNewQuestion();
    startBattleTimer();
}

function generateNewQuestion() {
    const num1 = Math.floor(Math.random() * 12) + 1;
    const num2 = Math.floor(Math.random() * 12) + 1;
    currentCorrectAnswer = num1 + num2;

    document.getElementById('battle-question').innerText = `${num1} + ${num2} = ?`;
    
    // Create random decoys
    const buttons = document.querySelectorAll('.answer-btn');
    const correctIndex = Math.floor(Math.random() * 3);
    
    buttons.forEach((btn, index) => {
        if (index === correctIndex) {
            btn.innerText = currentCorrectAnswer;
            btn.onclick = () => handleAnswer(true);
        } else {
            let decoy = currentCorrectAnswer + (Math.floor(Math.random() * 5) + 1);
            btn.innerText = decoy;
            btn.onclick = () => handleAnswer(false);
        }
    });
}

const hpBar = document.getElementById('boss-hp-bar');

function updateBossUI() {
    // Ensure the bar doesn't go below 0%
    const displayHP = Math.max(0, bossHealth);
    hpBar.style.width = `${displayHP}%`;

    // Color feedback: Turns redder as HP drops
    if (displayHP < 40) {
        hpBar.style.background = "linear-gradient(to right, #880000, #ff0000)";
    }
}

function handleAnswer(isCorrect) {
    if (!battleActive) return;

    if (isCorrect) {
        bossHealth -= 5;
        console.log("Boss Health:", bossHealth);
        if (bossHealth<=0) {
            playerWin();
        }
        
        // Update the visual bar
        updateBossUI();

        // Visual feedback on the boss sprite
        const bossImg = document.getElementById('boss');
        if (bossImg) {
            bossImg.style.filter = "brightness(1) contrast(2)";
            setTimeout(() => bossImg.style.filter = "none", 100);
        }

        generateNewQuestion();
    } else {
        endBattle();
    }
    
    
}

function startBattleTimer() {
    if (battleInterval) clearInterval(battleInterval);

    battleInterval = setInterval(() => {
        battleTimer--;

        // Update Text
        timerText.innerText = `${battleTimer}s`;

        // Update Bar Width Percentage
        const timePercentage = (battleTimer / MAXBATTLETIME) * 100;
        timerBar.style.width = `${Math.max(0, timePercentage)}%`;

        // Color Feedback for Timer
        if (timePercentage < 50) timerBar.style.backgroundColor = "#ffcc00"; // Yellow
        if (timePercentage < 25) timerBar.style.backgroundColor = "#ff4444"; // Red

        if (battleTimer < 0 || bossHealth <= 0) {
            endBattle();
            
        }
    }, 1000);
}

function endBattle() {
    battleActive = false;
    document.getElementById('battle-overlay').style.display = 'none';
    // Resume normal gameplay or trigger boss death
}


function playerWin() {
    winScreen.style.display = 'flex';
}

winRetryBtn.addEventListener('click', () => location.reload());

