// Hier ist unser "Lexikon". 
// x und y sind die exakten Start-Koordinaten aus deiner Zeichnung.
// dir: 'h' = horizontal (waagerecht), 'v' = vertikal (senkrecht)
const words = [
    { id: 1, answer: "EISEN", x: 7, y: 3, dir: "h", question: "XXX" },
    { id: 2, answer: "MEERJUNGFRAU", x: 10, y: 5, dir: "h", question: "XXX" },
    { id: 3, answer: "HIERARCHIE", x: 3, y: 9, dir: "h", question: "XXX" },
    { id: 4, answer: "STEIERMARK", x: 14, y: 10, dir: "h", question: "XXX" },
    { id: 5, answer: "WOMBAT", x: 4, y: 14, dir: "h", question: "XXX" },
    { id: 6, answer: "NAEHMASCHINE", x: 10, y: 1, dir: "v", question: "XXX" },
    { id: 7, answer: "WEIHNACHTEN", x: 16, y: 1, dir: "v", question: "XXX" },
    { id: 8, answer: "PICKNICKKORB", x: 23, y: 7, dir: "v", question: "XXX" },
    { id: 9, answer: "SEGELBOOT", x: 5, y: 8, dir: "v", question: "XXX" },
    { id: 10, answer: "ANTONIA", x: 8, y: 14, dir: "v", question: "XXX" }
];

// Später: Trag hier die x und y Koordinaten der Kästchen ein, die zum Lösungswort gehören!
// Beispiel: {x: 7, y: 3} ist das allererste E von EISEN.
const solutionCells = [
    {x: 7, y: 3}, {x: 10, y: 5}, {x: 3, y: 9} // Das sind im Moment nur Platzhalter!
];

let progress = JSON.parse(localStorage.getItem("monikaProgress")) || {};
let currentWordId = null;

const crosswordDiv = document.getElementById('crossword');
const polaroidsDiv = document.getElementById('polaroids');
const modal = document.getElementById('question-modal');
const closeModal = document.getElementById('close-modal');
const submitBtn = document.getElementById('submit-answer');
const answerInput = document.getElementById('answer-input');
const errorMsg = document.getElementById('error-message');

// 1. Das Gitter aufbauen
function buildGrid() {
    // Wir erzeugen nur Kästchen, wo auch Buchstaben sind
    words.forEach(wordObj => {
        for (let i = 0; i < wordObj.answer.length; i++) {
            let cellX = wordObj.x + (wordObj.dir === "h" ? i : 0);
            let cellY = wordObj.y + (wordObj.dir === "v" ? i : 0);
            let cellId = `cell-${cellX}-${cellY}`;

            // Prüfen ob das Kästchen durch eine Kreuzung schon existiert
            if (!document.getElementById(cellId)) {
                let cell = document.createElement('div');
                cell.id = cellId;
                cell.className = 'cell';
                cell.style.gridColumn = cellX;
                cell.style.gridRow = cellY;
                crosswordDiv.appendChild(cell);
            }
        }
    });
}

// 2. Polaroids aufbauen
function buildPolaroids() {
    words.forEach((wordObj, index) => {
        let polaroid = document.createElement('div');
        polaroid.className = 'polaroid';
        polaroid.id = `polaroid-${wordObj.id}`;
        // Polaroid Text: Zeige einfach "1", "2", "3" etc. oder ein Schloss an 
        polaroid.innerHTML = '?';

        polaroid.addEventListener('click', () => openModal(wordObj));
        polaroidsDiv.appendChild(polaroid);

        // Falls schon gelöst (aus dem Local Storage)
        if (progress[wordObj.id]) {
            markAsSolved(wordObj);
        }
    });
    checkWinCondition();
}

// 3. Modal Steuerung
function openModal(wordObj) {
    currentWordId = wordObj.id;
    document.getElementById('modal-title').innerText = `Frage ${words.indexOf(wordObj) + 1}`;
    document.getElementById('modal-question').innerText = wordObj.question;
    answerInput.value = '';
    errorMsg.innerText = '';
    modal.style.display = 'flex';
    answerInput.focus();
}

closeModal.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; }

// 4. Antwort prüfen
submitBtn.onclick = () => {
    let userInput = answerInput.value.toUpperCase().trim();
    let currentWordObj = words.find(w => w.id === currentWordId);

    if (userInput === currentWordObj.answer) {
        // Richtig!
        progress[currentWordId] = true;
        localStorage.setItem("monikaProgress", JSON.stringify(progress));
        markAsSolved(currentWordObj);
        modal.style.display = 'none';
        checkWinCondition();
    } else {
        // Falsch!
        errorMsg.innerText = "Das war leider nicht richtig. Versuch es nochmal!";
    }
}

// Eingabe auch mit der Enter-Taste ermöglichen
answerInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        submitBtn.click();
    }
});

// 5. Visuelles Update wenn gelöst
function markAsSolved(wordObj) {
    // Polaroid ausgrauen
    document.getElementById(`polaroid-${wordObj.id}`).classList.add('solved');
    
    // Buchstaben in das Gitter eintragen
    for (let i = 0; i < wordObj.answer.length; i++) {
        let cellX = wordObj.x + (wordObj.dir === "h" ? i : 0);
        let cellY = wordObj.y + (wordObj.dir === "v" ? i : 0);
        let cell = document.getElementById(`cell-${cellX}-${cellY}`);
        if (cell) {
            cell.innerText = wordObj.answer[i];
        }
    }
}

// 6. Das große Finale prüfen
function checkWinCondition() {
    let allSolved = words.every(w => progress[w.id]);
    
    if (allSolved) {
        document.getElementById('finale-message').classList.remove('hidden');
        
        // Die speziellen Lösungs-Kästchen zum Leuchten bringen
        solutionCells.forEach(pos => {
            let cell = document.getElementById(`cell-${pos.x}-${pos.y}`);
            if (cell) {
                cell.classList.add('solution-glow');
            }
        });
    }
}

// --- Startschuss ---
buildGrid();
buildPolaroids();