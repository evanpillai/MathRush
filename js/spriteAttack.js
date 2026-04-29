let bossHealth = 100;
let battleActive = false;
let battleTimer = 20;
let currentCorrectAnswer = null;

// Call this when the player touches the boss or triggers an attack
export function startMathBattle() {
    battleActive = true;
    battleTimer = 20;
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
        
        // Update the visual bar
        updateBossUI();

        // Visual feedback on the boss sprite
        const bossImg = document.getElementById('boss');
        if (bossImg) {
            bossImg.style.filter = "brightness(3) contrast(2)";
            setTimeout(() => bossImg.style.filter = "none", 100);
        }
    }
    
    generateNewQuestion();
}
    
    


function startBattleTimer() {
    const countdown = setInterval(() => {
        battleTimer--;
        // Update a UI element to show time remaining
        
        if (battleTimer <= 0 || bossHealth <= 0) {
            clearInterval(countdown);
            endBattle();
        }
    }, 1000);
}

function endBattle() {
    battleActive = false;
    document.getElementById('battle-overlay').style.display = 'none';
    // Resume normal gameplay or trigger boss death
}