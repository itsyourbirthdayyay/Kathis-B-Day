// --- HIER IST DEIN TEST-SCHALTER ---
// Ändere 'true' zu 'false', wenn Monika das Rätsel bekommen soll!
const showAnswersForTesting = true; 

// Lexikon (Millimetergenau auf dein letztes digitales Bild abgestimmt)
const words = [
    { id: 1, answer: "ANTONIA", x: 5, y: 1, dir: "v", question: "XXX" },
    { id: 2, answer: "FAMILIE", x: 6, y: 4, dir: "v", question: "XXX" },
    { id: 3, answer: "FREUNDE", x: 6, y: 4, dir: "h", question: "XXX" },
    { id: 4, answer: "PUZZLE", x: 14, y: 1, dir: "v", question: "XXX" },
    { id: 5, answer: "SCHOTTLAND", x: 2, y: 4, dir: "v", question: "XXX" },
    { id: 6, answer: "TENACIOUSD", x: 4, y: 7, dir: "v", question: "XXX" },
    { id: 7, answer: "SEYCHELLEN", x: 13, y: 6, dir: "h", question: "XXX" },
    { id: 8, answer: "HIERARCHIE", x: 17, y: 6, dir: "v", question: "XXX" },
    { id: 9, answer: "EISEN", x: 21, y: 6, dir: "v", question: "XXX" },
    { id: 10, answer: "CONTAINEX", x: 1, y: 7, dir: "h", question: "XXX" },
    { id: 11, answer: "NAEHMASCHINE", x: 8, y: 5, dir: "v", question: "XXX" },
    { id: 12, answer: "MEERJUNGFRAU", x: 8, y: 9, dir: "h", question: "XXX" },
    { id: 13, answer: "WOMBAT", x: 9, y: 11, dir: "v", question: "XXX" },
    { id: 14, answer: "JASONSDANCECREW", x: 6, y: 12, dir: "h", question: "XXX" },
    { id: 15, answer: "STEIERMARK", x: 14, y: 14, dir: "h", question: "XXX" },
    { id: 16, answer: "VOLLEYBALL", x: 18, y: 10, dir: "v", question: "XXX" },
    { id: 17, answer: "SEGELBOOT", x: 13, y: 16, dir: "h", question: "XXX" },
    { id: 18, answer: "BOULDERN", x: 19, y: 15, dir: "v", question: "XXX" },
    { id: 19, answer: "WEIHNACHTEN", x: 4, y: 15, dir: "h", question: "XXX" }
];

// Platzhalter für das finale Lösungswort (x, y Koordinaten eintragen)
const solutionCells = [
    {x: 7, y: 3}, {x: 10, y: 5}, {x: 3, y: 9} 
];

let progress = JSON.parse(localStorage.getItem("monikaProgress")) || {};
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
                
                // Wenn Test-Modus aktiv ist, schreibe die Buchstaben direkt rein
                if (showAnswersForTesting) {
                    cell.innerText = wordObj.answer[i];
                    cell.style.color = "#ccc"; // Leicht ausgegraut zur Unterscheidung
                }
                
                crosswordDiv.appendChild(cell);
            }
        }
    });
}

function buildPolaroids() {
    // Vorher leeren, falls die Funktion mehrfach aufgerufen wird
    polaroidsH.innerHTML = '';
    polaroidsV.innerHTML = '';

    words.forEach((wordObj) => {
        let polaroid = document.createElement('div');
        polaroid.className = 'polaroid';
        polaroid.id = `polaroid-${wordObj.id}`;
        polaroid.innerHTML = '?'; 
        polaroid.addEventListener('click', () => openModal(wordObj));
        
        if (wordObj.dir === "h") {
            polaroidsH.appendChild(polaroid);
        } else {
            polaroidsV.appendChild(polaroid);
        }

        if (progress[wordObj.id]) {
            markAsSolved(wordObj);
        }
    });
    checkWinCondition();
}

function openModal(wordObj) {
    currentWordId = wordObj.id;
    let directionText = wordObj.dir === "h" ? "Waagerecht" : "Senkrecht";
    document.getElementById('modal-title').innerText = `Rätsel (${directionText})`;
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
        localStorage.setItem("monikaProgress", JSON.stringify(progress));
        markAsSolved(currentWordObj);
        modal.style.display = 'none';
        checkWinCondition();
    } else {
        errorMsg.innerText = "Das war leider nicht richtig. Versuch es nochmal!";
    }
}

answerInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        submitBtn.click();
    }
});

function markAsSolved(wordObj) {
    document.getElementById(`polaroid-${wordObj.id}`).classList.add('solved');
    for (let i = 0; i < wordObj.answer.length; i++) {
        let cellX = wordObj.x + (wordObj.dir === "h" ? i : 0);
        let cellY = wordObj.y + (wordObj.dir === "v" ? i : 0);
        let cell = document.getElementById(`cell-${cellX}-${cellY}`);
        if (cell) {
            cell.innerText = wordObj.answer[i];
            cell.style.color = "#000"; // Farbe bei Lösung wieder auf Schwarz setzen
        }
    }
}

function checkWinCondition() {
    let allSolved = words.length > 0 && words.every(w => progress[w.id]);
    
    if (allSolved) {
        solutionCells.forEach(pos => {
            let cell = document.getElementById(`cell-${pos.x}-${pos.y}`);
            if (cell) {
                cell.classList.add('solution-glow');
            }
        });

        setTimeout(() => {
            finaleModal.style.display = 'flex';
        }, 1500); 
    }
}

// Startschuss
buildGrid();
buildPolaroids();