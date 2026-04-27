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

function handleAnswer(isCorrect) {
    if (!battleActive) return;

    if (isCorrect) {
        bossHealth -= 5;
        console.log("Boss Health:", bossHealth);
        // Add a visual flash or shake to the boss here
    }
    
    // Immediately show the next question
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