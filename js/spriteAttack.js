import { initAttack } from "./bossAttack.js";

import mathQuestions from './questions.js';

const winScreen = document.getElementById('win-screen');
const winRetryBtn = document.getElementById('win-retry-btn');
const timerBar = document.getElementById('timer-bar');
const timerText = document.getElementById('timer-text');
const hpBar = document.getElementById('boss-hp-bar');

let bossHealth = 100;
export let battleActive = false;
let battleTimer = 10;
const MAXBATTLETIME = 10;
let currentQuestionObj = null;
let battleInterval = null;

// Track detailed mistakes for the review screen
export const mistakeDetails = {
    addition: [],
    subtraction: [],
    multiplication: [],
    division: []
};

export function setBattleActive(active) {
    battleActive = active;
}

export function startMathBattle() {
    battleActive = true;
    battleTimer = 10;
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
    currentQuestionObj = mathQuestions[Math.floor(Math.random() * mathQuestions.length)];
    document.getElementById('battle-question').innerText = `${currentQuestionObj.question} = ?`;
    
    const buttons = document.querySelectorAll('.answer-btn');
    let answers = [currentQuestionObj.answer];
    while (answers.length < 3) {
        let fake = Math.floor(Math.random() * 50).toString();
        if (!answers.includes(fake)) answers.push(fake);
    }
    answers.sort(() => Math.random() - 0.5);

    buttons.forEach((btn, index) => {
        btn.innerText = answers[index];
        btn.style.backgroundColor = "#1f59cf"; // Reset color
        btn.onclick = () => handleAnswer(btn.innerText === currentQuestionObj.answer, btn);
    });
}

function updateBossUI() {
    const displayHP = Math.max(0, bossHealth);
    hpBar.style.width = `${displayHP}%`;
    if (displayHP < 40) hpBar.style.background = "linear-gradient(to right, #880000, #ff0000)";
}

function handleAnswer(isCorrect, clickedBtn) {
    if (!battleActive) return;

    if (isCorrect) {
        clickedBtn.style.backgroundColor = "#2ecc71"; // Green
        bossHealth -= 5;
        updateBossUI();

        const bossImg = document.getElementById('boss');
        if (bossImg) {
            bossImg.style.filter = "brightness(1) contrast(2)";
            setTimeout(() => bossImg.style.filter = "none", 100);
        }

        if (bossHealth <= 0) setTimeout(playerWin, 500);
        else setTimeout(generateNewQuestion, 500);
    } else {
        // Log mistake details
        mistakeDetails[currentQuestionObj.type].push({
            q: currentQuestionObj.question,
            a: currentQuestionObj.answer
        });

        clickedBtn.style.backgroundColor = "#e74c3c"; // Red
        
        // Show correct answer in green
        document.querySelectorAll('.answer-btn').forEach(btn => {
            if (btn.innerText === currentQuestionObj.answer) {
                btn.style.backgroundColor = "#2ecc71";
            }
        });

        setTimeout(endBattle, 700);
        initAttack();
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

        if (battleTimer < 0 || bossHealth <= 0) {
            clearInterval(battleInterval);
        if (battleTimer <= 0) {
            clearInterval(battleInterval);
            endBattle();
            initAttack();
        }
    }
        
    }, 1000);
}

function endBattle() {
    battleActive = false;
    clearInterval(battleInterval);
    document.getElementById('battle-overlay').style.display = 'none';

    // Resume normal gameplay or trigger boss death
}

function playerWin() {
    battleActive = false;
    clearInterval(battleInterval);
    document.getElementById('battle-overlay').style.display = 'none';
    renderMistakes('win-mistakes');
    winScreen.style.display = 'flex';
}

// Mistake Review Logic
export function renderMistakes(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "<p style='margin-bottom:10px;'>Click a category to review mistakes:</p>";
    let hasMistakes = false;

    for (const [type, questions] of Object.entries(mistakeDetails)) {
        if (questions.length > 0) {
            const btn = document.createElement('div');
            btn.innerHTML = `${type.toUpperCase()} (${questions.length})`;
            btn.style.cssText = "background:#444; color:#00ffcc; padding:8px; margin:5px; cursor:pointer; border:1px solid #00ffcc; border-radius:4px; font-size:14px;";
            btn.onclick = () => showReviewModal(type);
            container.appendChild(btn);
            hasMistakes = true;
        }
    }
    if (!hasMistakes) container.innerHTML = "<p style='color:#2ecc71;'>Perfect Score! No mistakes.</p>";
}

function showReviewModal(type) {
    const modal = document.getElementById('review-modal');
    const list = document.getElementById('review-list');
    const title = document.getElementById('review-title');
    
    title.innerText = `REVIEW: ${type.toUpperCase()}`;
    list.innerHTML = "";

    mistakeDetails[type].forEach(item => {
        const div = document.createElement('div');
        div.style.cssText = "border-bottom:1px solid #444; padding:10px; margin-bottom:10px;";
        
        let hint = "Double check your mental math!";
        if (type === "multiplication") hint = "Think of this as repeated addition.";
        if (type === "division") hint = "Think: how many times does the second number fit into the first?";

        div.innerHTML = `
            <p style="font-size:18px; color:#ff0055; margin:0;">Question: ${item.q}</p>
            <p style="font-size:18px; color:#2ecc71; margin:5px 0;">Correct Answer: ${item.a}</p>
            <p style="font-size:12px; color:#aaa; font-style:italic;">Note: ${hint}</p>
        `;
        list.appendChild(div);
    });

    modal.style.display = "flex";
}

document.getElementById('close-review').onclick = () => {
    document.getElementById('review-modal').style.display = "none";
};

winRetryBtn.addEventListener('click', () => location.reload());