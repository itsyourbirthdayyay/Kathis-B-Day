// --- TEST-SCHALTER ---
const showAnswersForTesting = true;

const words = [
    { id: 1,  answer: "TENACIOUSD",       x: 7,  y: 1,  dir: "h", question: "XXX" },
    { id: 2,  answer: "SCHOTTLAND",       x: 15, y: 1,  dir: "v", question: "XXX" },
    { id: 3,  answer: "JAMES",            x: 8,  y: 3,  dir: "v", question: "XXX" },
    { id: 4,  answer: "WEIHNACHTEN",      x: 5,  y: 5,  dir: "v", question: "XXX" },
    { id: 5,  answer: "SEYCHELLEN",       x: 8,  y: 7,  dir: "h", question: "XXX" },
    { id: 6,  answer: "FAMILIE",          x: 22, y: 7,  dir: "v", question: "XXX" },
    { id: 7,  answer: "NAEHMASCHINE",     x: 5,  y: 9,  dir: "h", question: "XXX" },
    { id: 8,  answer: "MEERJUNGFRAU",     x: 9,  y: 9,  dir: "v", question: "XXX" },
    { id: 9,  answer: "SEGELBOOT",        x: 19, y: 10, dir: "v", question: "XXX" },
    { id: 10, answer: "FREUNDE",          x: 7,  y: 11, dir: "h", question: "XXX" },
    { id: 11, answer: "EISEN",            x: 16, y: 11, dir: "h", question: "XXX" },
    { id: 12, answer: "JASONSDANCECREW",  x: 9,  y: 13, dir: "h", question: "XXX" },
    { id: 13, answer: "ANTONIA",          x: 16, y: 13, dir: "v", question: "XXX" },
    { id: 14, answer: "WOMBAT",           x: 23, y: 13, dir: "v", question: "XXX" },
    { id: 15, answer: "STEIERMARK",       x: 7,  y: 15, dir: "v", question: "XXX" },
    { id: 16, answer: "VOLLEYBALL",       x: 14, y: 15, dir: "v", question: "XXX" },
    { id: 17, answer: "PUZZLE",           x: 2,  y: 17, dir: "h", question: "XXX" },
    { id: 18, answer: "HIERARCHIE",       x: 5,  y: 19, dir: "h", question: "XXX" },
    { id: 19, answer: "CONTAINEX",        x: 10, y: 22, dir: "h", question: "XXX" },
    { id: 20, answer: "BOULDERN",         x: 11, y: 24, dir: "h", question: "XXX" },
    { id: 21, answer: "PEOPLEPLEASER",    x: 2,  y: 11, dir: "v", question: "XXX" },
];

const solutionCells = [
    {x: 7, y: 3}, {x: 10, y: 5}, {x: 3, y: 9}
];

let progress = JSON.parse(localStorage.getItem("kathiProgress")) || {};
let currentWordId = null;

const crosswordDiv = document.getElementById('crossword');
const polaroidsH = document.getElementById('polaroids-h');
const polaroidsV = document.getElementById('polaroids-v');
const modal = document.getElementById('question-modal');
const closeModal = document.getElementById('close-modal');
const submitBtn = document.getElementById('submit-answer');
const answerInput = document.getElementById('answer-input');
const errorMsg = document.getElementById('error-message');
const finaleModal = document.getElementById('finale-modal');
const closeFinale = document.getElementById('close-finale');

function buildGrid() {
    words.forEach(wordObj => {
        for (let i = 0; i < wordObj.answer.length; i++) {
            let cellX = wordObj.x + (wordObj.dir === "h" ? i : 0);
            let cellY = wordObj.y + (wordObj.dir === "v" ? i : 0);
            let cellId = `cell-${cellX}-${cellY}`;
            if (!document.getElementById(cellId)) {
                let cell = document.createElement('div');
                cell.id = cellId;
                cell.className = 'cell';
                cell.style.gridColumn = cellX;
                cell.style.gridRow = cellY;
                if (showAnswersForTesting) {
                    cell.innerText = wordObj.answer[i];
                    cell.style.color = "#ccc";
                }
                crosswordDiv.appendChild(cell);
            } else if (showAnswersForTesting) {
                document.getElementById(cellId).innerText = wordObj.answer[i];
            }
        }
    });
}

function buildPolaroids() {
    polaroidsH.innerHTML = '';
    polaroidsV.innerHTML = '';
    const sorted = [...words].sort((a, b) => a.id - b.id);
    sorted.forEach((wordObj) => {
        let polaroid = document.createElement('div');
        polaroid.className = 'polaroid';
        polaroid.id = `polaroid-${wordObj.id}`;
        polaroid.innerHTML = `<span class="polaroid-icon">${getPartyIcon(wordObj.id)}</span><span class="polaroid-num">${wordObj.id}</span>`;
        polaroid.addEventListener('click', () => openModal(wordObj));
        if (wordObj.dir === "h") {
            polaroidsH.appendChild(polaroid);
        } else {
            polaroidsV.appendChild(polaroid);
        }
        if (progress[wordObj.id]) markAsSolved(wordObj);
    });
    checkWinCondition();
}

function getPartyIcon(id) {
    const icons = ['🎈','🎉','🎂','🥂','🎁','✨','🪩','🎊','🍾','🎶','🌟','🎀','🥳','🎤','🪅','🎸','💃','🎯','🎠','🌈','🫧'];
    return icons[(id - 1) % icons.length];
}

function openModal(wordObj) {
    currentWordId = wordObj.id;
    let directionText = wordObj.dir === "h" ? "Waagerecht →" : "Senkrecht ↓";
    document.getElementById('modal-title').innerText = `Frage ${wordObj.id} (${directionText})`;
    document.getElementById('modal-question').innerText = wordObj.question;
    answerInput.value = '';
    errorMsg.innerText = '';
    modal.style.display = 'flex';
    answerInput.focus();
}

closeModal.onclick = () => modal.style.display = 'none';
closeFinale.onclick = () => finaleModal.style.display = 'none';
window.onclick = (e) => {
    if (e.target == modal) modal.style.display = 'none';
    if (e.target == finaleModal) finaleModal.style.display = 'none';
}

submitBtn.onclick = () => {
    let userInput = answerInput.value.toUpperCase().trim();
    let currentWordObj = words.find(w => w.id === currentWordId);
    if (userInput === currentWordObj.answer) {
        progress[currentWordId] = true;
        localStorage.setItem("kathiProgress", JSON.stringify(progress));
        markAsSolved(currentWordObj);
        modal.style.display = 'none';
        checkWinCondition();
    } else {
        errorMsg.innerText = "Das war leider nicht richtig. Versuch es nochmal! 🎈";
    }
}

answerInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") { event.preventDefault(); submitBtn.click(); }
});

function markAsSolved(wordObj) {
    document.getElementById(`polaroid-${wordObj.id}`).classList.add('solved');
    for (let i = 0; i < wordObj.answer.length; i++) {
        let cellX = wordObj.x + (wordObj.dir === "h" ? i : 0);
        let cellY = wordObj.y + (wordObj.dir === "v" ? i : 0);
        let cell = document.getElementById(`cell-${cellX}-${cellY}`);
        if (cell) { cell.innerText = wordObj.answer[i]; cell.style.color = "#000"; }
    }
}

function checkWinCondition() {
    let allSolved = words.length > 0 && words.every(w => progress[w.id]);
    if (allSolved) {
        solutionCells.forEach(pos => {
            let cell = document.getElementById(`cell-${pos.x}-${pos.y}`);
            if (cell) cell.classList.add('solution-glow');
        });
        setTimeout(() => { finaleModal.style.display = 'flex'; }, 1500);
    }
}

// Konfetti-Effekt beim Lösen
function launchConfetti() {
    const colors = ['#ff6b9d','#ffd700','#a78bfa','#34d399','#60a5fa','#f97316'];
    for (let i = 0; i < 60; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.cssText = `
            left: ${Math.random() * 100}vw;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation-delay: ${Math.random() * 2}s;
            animation-duration: ${2 + Math.random() * 2}s;
            width: ${6 + Math.random() * 8}px;
            height: ${6 + Math.random() * 8}px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    }
}

// Ballon-Animation für den Hintergrund
function createBalloons() {
    const balloonEmojis = ['🎈','🎈','🎉','✨'];
    for (let i = 0; i < 8; i++) {
        const b = document.createElement('div');
        b.className = 'bg-balloon';
        b.innerText = balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)];
        b.style.cssText = `
            left: ${5 + Math.random() * 90}%;
            animation-delay: ${Math.random() * 8}s;
            animation-duration: ${10 + Math.random() * 8}s;
            font-size: ${1.5 + Math.random() * 2}rem;
            opacity: ${0.15 + Math.random() * 0.2};
        `;
        document.querySelector('.bg-deco').appendChild(b);
    }
}

buildGrid();
buildPolaroids();
createBalloons();

// ── 🦆 Duck Music Player ──────────────────────────────────────
// Lege deine Entenbild-Dateien in denselben Ordner:
//   duck_idle.gif  →  stehende Ente (oder .png)
//   duck_dance.gif →  tanzende Ente (animiertes GIF)
const duckEl  = document.getElementById('duck');
const duckImg = document.getElementById('duck-img');
const bubble  = document.getElementById('duck-bubble');
const music   = document.getElementById('music');

let isPlaying = false;

function toggleMusic() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        music.play();
        duckEl.classList.add('dancing');
        duckImg.src = 'duck_dance.gif';
        bubble.textContent = '🎵 yeah!';
    } else {
        music.pause();
        duckEl.classList.remove('dancing');
        duckImg.src = 'duck_idle.gif';
        bubble.textContent = 'drück mich';
    }
}
