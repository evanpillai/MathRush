import mathQuestions from './questions.js';

const winScreen = document.getElementById('win-screen');
const winRetryBtn = document.getElementById('win-retry-btn');
const timerBar = document.getElementById('timer-bar');
const timerText = document.getElementById('timer-text');
const hpBar = document.getElementById('boss-hp-bar');

let bossHealth = 100;
export let battleActive = false;
let battleTimer = 20;
const MAXBATTLETIME = 20;
let currentCorrectAnswer = null;
let currentQuestionType = null;
let battleInterval = null;

// Track mistakes by type
export const mistakeTracker = {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0
};

export function setBattleActive(active) {
    battleActive = active;
}

export function startMathBattle() {
    battleActive = true;
    battleTimer = 20;

    timerBar.style.transition = 'none';
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
    const q = mathQuestions[Math.floor(Math.random() * mathQuestions.length)];
    currentCorrectAnswer = q.answer;
    currentQuestionType = q.type;

    document.getElementById('battle-question').innerText = `${q.question} = ?`;
    
    const buttons = document.querySelectorAll('.answer-btn');
    const correctIndex = Math.floor(Math.random() * 3);
    
    let answers = [currentCorrectAnswer];
    while (answers.length < 3) {
        let fake = Math.floor(Math.random() * 50).toString();
        if (!answers.includes(fake)) answers.push(fake);
    }
    answers.sort(() => Math.random() - 0.5);

    buttons.forEach((btn, index) => {
        btn.innerText = answers[index];
        btn.style.backgroundColor = "#ff0055"; // Reset to default
        btn.onclick = () => handleAnswer(btn.innerText === currentCorrectAnswer, btn);
    });
}

function updateBossUI() {
    const displayHP = Math.max(0, bossHealth);
    hpBar.style.width = `${displayHP}%`;
    if (displayHP < 40) {
        hpBar.style.background = "linear-gradient(to right, #880000, #ff0000)";
    }
}

function handleAnswer(isCorrect, clickedBtn) {
    if (!battleActive) return;

    const buttons = document.querySelectorAll('.answer-btn');

    if (isCorrect) {
        clickedBtn.style.backgroundColor = "#2ecc71"; // Green
        bossHealth -= 10;
        updateBossUI();

        const bossImg = document.getElementById('boss');
        if (bossImg) {
            bossImg.style.filter = "brightness(1) contrast(2)";
            setTimeout(() => bossImg.style.filter = "none", 100);
        }

        if (bossHealth <= 0) {
            setTimeout(playerWin, 500);
        } else {
            setTimeout(generateNewQuestion, 500);
        }
    } else {
        // Wrong answer
        mistakeTracker[currentQuestionType]++;
        clickedBtn.style.backgroundColor = "#e74c3c"; // Red
        
        // Find and highlight the correct one
        buttons.forEach(btn => {
            if (btn.innerText === currentCorrectAnswer) {
                btn.style.backgroundColor = "#2ecc71"; // Green
            }
        });

        setTimeout(endBattle, 500);
    }
}

function startBattleTimer() {
    if (battleInterval) clearInterval(battleInterval);
    battleInterval = setInterval(() => {
        battleTimer--;
        timerText.innerText = `${battleTimer}s`;
        const timePercentage = (battleTimer / MAXBATTLETIME) * 100;
        timerBar.style.width = `${Math.max(0, timePercentage)}%`;

        if (timePercentage < 50) timerBar.style.backgroundColor = "#ffcc00";
        if (timePercentage < 25) timerBar.style.backgroundColor = "#ff4444";

        if (battleTimer < 0) {
            clearInterval(battleInterval);
            endBattle();
        }
    }, 1000);
}

function endBattle() {
    battleActive = false;
    clearInterval(battleInterval);
    document.getElementById('battle-overlay').style.display = 'none';
}

export function renderMistakes(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "<h3>Mistakes Summary:</h3>";
    let hasMistakes = false;
    for (const [type, count] of Object.entries(mistakeTracker)) {
        if (count > 0) {
            container.innerHTML += `<p>${type.toUpperCase()}: ${count}</p>`;
            hasMistakes = true;
        }
    }
    if (!hasMistakes) container.innerHTML += "<p>Perfect math skills!</p>";
}

function playerWin() {
    battleActive = false;
    clearInterval(battleInterval);
    document.getElementById('battle-overlay').style.display = 'none';
    renderMistakes('win-mistakes');
    winScreen.style.display = 'flex';
}

winRetryBtn.addEventListener('click', () => location.reload());