// --- TEST-SCHALTER ---
const showAnswersForTesting = false;

const words = [
    { id: 1,  answer: "TENACIOUSD",       x: 8,  y: 1,  dir: "h", question: "SONG" },
    { id: 2,  answer: "SCHOTTLAND",       x: 16, y: 1,  dir: "v", question: "Zu welchem Land gehört diese Hymne?\n\nThe hills are bare now,\nAnd autumn leaves lie thick and still,\nO'er land that is lost now,\nWhich those so dearly held.\nThat stood against him,\nProud Edward's Army,\nAnd sent him homeward,\nTo think again." },
    { id: 3,  answer: "JAMES",            x: 10, y: 3,  dir: "v", question: "Harry Potters Vater" },
    { id: 4,  answer: "WEIHNACHTEN",      x: 5,  y: 5,  dir: "v", question: "Die schönste Zeit im Jahr" },
    { id: 5,  answer: "SEYCHELLEN",       x: 10, y: 7,  dir: "h", question: "Inselstaat" },
    { id: 6,  answer: "FAMILIE",          x: 22, y: 7,  dir: "v", question: "Der engste Kreis" },
    { id: 7,  answer: "NAEHMASCHINE",     x: 5,  y: 9,  dir: "h", question: "Arbeitsmittel des Schneiders" },
    { id: 8,  answer: "MEERJUNGFRAU",     x: 9,  y: 9,  dir: "v", question: "Fischweib" },
    { id: 9,  answer: "SEGELBOOT",        x: 18, y: 10, dir: "v", question: "Ich habe keine Flügel, aber der Wind treibt mich an. Ich habe keinen Motor, aber ich reise übers weite Meer. Mein Kleid ist aus Tuch, mein Weg ist das Wasser. Was bin ich?" },
    { id: 10, answer: "FREUNDE",          x: 6,  y: 11, dir: "h", question: "Man kann sie nicht im Laden kaufen, aber sie sind unbezahlbar. Sie teilen deinen Kummer, damit er kleiner wird, und sie verdoppeln deine Freude, wenn du lachst. Wer sind sie?" },
    { id: 11, answer: "EISEN",            x: 15, y: 11, dir: "h", question: "Davon hast du zu wenig im Blut" },
    { id: 12, answer: "JASONSDANCECREW",  x: 9,  y: 13, dir: "h", question: "Dort hast du tanzen gelernt" },
    { id: 13, answer: "ANTONIA",          x: 14, y: 13, dir: "v", question: "Wessen Name bedeutet \u201eDie Unbezahlbare\u201c?" },
    { id: 14, answer: "WOMBAT",           x: 23, y: 13, dir: "v", question: "Würfelkacker" },
    { id: 15, answer: "STEIERMARK",       x: 11, y: 15, dir: "v", question: "Österreichisches Kronland" },
    { id: 16, answer: "VOLLEYBALL",       x: 13, y: 15, dir: "v", question: "Mintonette" },
    { id: 17, answer: "PUZZLE",           x: 2,  y: 17, dir: "h", question: "Erfunden durch John Spilsbury" },
    { id: 18, answer: "HIERARCHIE",       x: 5,  y: 19, dir: "h", question: "Dagegen kannst du nix machen, ist..." },
    { id: 19, answer: "CONTAINEX",        x: 11, y: 22, dir: "h", question: "Welches Unternehmen hat 17.950 kg Rückstände aus der Kanalreinigung im Jahr 2024 erzeugt?" },
    { id: 20, answer: "BOULDERN",         x: 11, y: 24, dir: "h", question: "Ohne Seil klettern" },
    { id: 21, answer: "PEOPLEPLEASER",    x: 4,  y: 6,  dir: "v", question: "Dieses Nomen verwendest du, um dein Verhalten anderen gegenüber zu beschreiben." },
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
    // First pass: create all cells
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

    // Second pass: number labels on first cell of each word
    words.forEach(wordObj => {
        let firstCell = document.getElementById(`cell-${wordObj.x}-${wordObj.y}`);
        if (firstCell) {
            let existing = firstCell.querySelector('.cell-num');
            if (!existing) {
                let label = document.createElement('span');
                label.className = 'cell-num';
                label.innerText = wordObj.id;
                firstCell.appendChild(label);
            } else {
                existing.innerText += '\u00B7' + wordObj.id;
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

    const questionEl = document.getElementById('modal-question');

    if (wordObj.question === 'SONG') {
        if (isPlaying) toggleMusic();
        questionEl.innerHTML = `
            <span style="display:block;margin-bottom:10px;">🎵 Hör dir diesen Song an – welches Wort steckt darin?</span>
            <audio id="question-song" src="dd.mp3" preload="auto"></audio>
            <button id="song-play-btn" onclick="toggleSongBtn()" style="
                background:linear-gradient(135deg,#ff6b9d,#a78bfa);
                color:white;border:none;border-radius:30px;
                padding:10px 24px;font-size:1rem;font-family:'Boogaloo',cursive;
                cursor:pointer;box-shadow:0 4px 14px rgba(255,107,157,0.4);
                margin-top:4px;
            ">▶ Abspielen</button>
        `;
    } else {
        questionEl.innerHTML = wordObj.question.replace(/\n/g, '<br>');
    }

    answerInput.value = '';
    errorMsg.innerText = '';
    modal.style.display = 'flex';
    answerInput.focus();
}

function toggleSongBtn() {
    const audio = document.getElementById('question-song');
    const btn   = document.getElementById('song-play-btn');
    if (!audio) return;
    if (audio.paused) {
        audio.play();
        btn.textContent = '⏸ Pause';
    } else {
        audio.pause();
        btn.textContent = '▶ Abspielen';
    }
}

closeModal.onclick = () => {
    const song = document.getElementById('question-song');
    if (song) { song.pause(); song.currentTime = 0; }
    modal.style.display = 'none';
};
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
        if (cell) {
            // Preserve the number label, only update the text node
            const numLabel = cell.querySelector('.cell-num');
            cell.textContent = wordObj.answer[i];
            cell.style.color = "#000";
            if (numLabel) cell.appendChild(numLabel);
        }
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
