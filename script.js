// --- TEST-SCHALTER (true = Buchstaben sichtbar zum Testen) ---
const showAnswersForTesting = false;

const words = [
    { id: 1,  answer: "TENACIOUSD",      x: 8,  y: 1,  dir: "h", question: "SONG" },
    { id: 2,  answer: "SCHOTTLAND",      x: 16, y: 1,  dir: "v", question: "Zu welchem Land geh\u00f6rt diese Hymne?\n\nThe hills are bare now,\nAnd autumn leaves lie thick and still,\nO\u2019er land that is lost now,\nWhich those so dearly held.\nThat stood against him,\nProud Edward\u2019s Army,\nAnd sent him homeward,\nTo think again." },
    { id: 3,  answer: "JAMES",           x: 10, y: 3,  dir: "v", question: "Harry Potters Vater" },
    { id: 4,  answer: "WEIHNACHTEN",     x: 5,  y: 5,  dir: "v", question: "Die sch\u00f6nste Zeit im Jahr" },
    { id: 5,  answer: "SEYCHELLEN",      x: 10, y: 7,  dir: "h", question: "Inselstaat" },
    { id: 6,  answer: "FAMILIE",         x: 22, y: 7,  dir: "v", question: "Der engste Kreis" },
    { id: 7,  answer: "NAEHMASCHINE",    x: 5,  y: 9,  dir: "h", question: "Arbeitsmittel des Schneiders" },
    { id: 8,  answer: "MEERJUNGFRAU",    x: 9,  y: 9,  dir: "v", question: "Fischweib" },
    { id: 9,  answer: "SEGELBOOT",       x: 18, y: 10, dir: "v", question: "Ich habe keine Fl\u00fcgel, aber der Wind treibt mich an. Ich habe keinen Motor, aber ich reise \u00fcbers weite Meer. Mein Kleid ist aus Tuch, mein Weg ist das Wasser. Was bin ich?" },
    { id: 10, answer: "FREUNDE",         x: 6,  y: 11, dir: "h", question: "Man kann sie nicht im Laden kaufen, aber sie sind unbezahlbar. Sie teilen deinen Kummer, damit er kleiner wird, und sie verdoppeln deine Freude, wenn du lachst. Wer sind sie?" },
    { id: 11, answer: "EISEN",           x: 15, y: 11, dir: "h", question: "Davon hast du zu wenig im Blut" },
    { id: 12, answer: "JASONSDANCECREW", x: 9,  y: 13, dir: "h", question: "Dort hast du tanzen gelernt" },
    { id: 13, answer: "ANTONIA",         x: 14, y: 13, dir: "v", question: "Wessen Name bedeutet \u201eDie Unbezahlbare\u201c?" },
    { id: 14, answer: "WOMBAT",          x: 23, y: 13, dir: "v", question: "W\u00fcrfelkacker" },
    { id: 15, answer: "STEIERMARK",      x: 11, y: 15, dir: "v", question: "\u00d6sterreichisches Kronland" },
    { id: 16, answer: "VOLLEYBALL",      x: 13, y: 15, dir: "v", question: "Mintonette" },
    { id: 17, answer: "PUZZLE",          x: 2,  y: 17, dir: "h", question: "Erfunden durch John Spilsbury" },
    { id: 18, answer: "HIERARCHIE",      x: 5,  y: 19, dir: "h", question: "Dagegen kannst du nix machen, ist..." },
    { id: 19, answer: "CONTAINEX",       x: 11, y: 22, dir: "h", question: "Welches Unternehmen hat 17.950 kg R\u00fcckst\u00e4nde aus der Kanalreinigung im Jahr 2024 erzeugt?" },
    { id: 20, answer: "BOULDERN",        x: 11, y: 24, dir: "h", question: "Ohne Seil klettern" },
    { id: 21, answer: "PEOPLEPLEASER",   x: 4,  y: 6,  dir: "v", question: "Dieses Nomen verwendest du, um dein Verhalten anderen gegen\u00fcber zu beschreiben." },
];

const solutionCells = [
    {x: 7, y: 3}, {x: 10, y: 5}, {x: 3, y: 9}
];

// ── State ────────────────────────────────────────────────────────────────────
let progress      = JSON.parse(localStorage.getItem("kathiProgress")) || {};
let currentWordId = null;
let isPlaying     = false;  // declared early so openModal can reference it safely

// ── DOM refs ─────────────────────────────────────────────────────────────────
const crosswordDiv = document.getElementById('crossword');
const polaroidsH   = document.getElementById('polaroids-h');
const polaroidsV   = document.getElementById('polaroids-v');
const modal        = document.getElementById('question-modal');
const modalClose   = document.getElementById('close-modal');
const submitBtn    = document.getElementById('submit-answer');
const answerInput  = document.getElementById('answer-input');
const errorMsg     = document.getElementById('error-message');
const finaleModal  = document.getElementById('finale-modal');
const finaleClose  = document.getElementById('close-finale');
const duckEl       = document.getElementById('duck');
const duckImg      = document.getElementById('duck-img');
const bubble       = document.getElementById('duck-bubble');
const music        = document.getElementById('music');

// ── Grid ─────────────────────────────────────────────────────────────────────
function buildGrid() {
    // Pass 1: create cells
    words.forEach(function(wordObj) {
        for (var i = 0; i < wordObj.answer.length; i++) {
            var cellX  = wordObj.x + (wordObj.dir === "h" ? i : 0);
            var cellY  = wordObj.y + (wordObj.dir === "v" ? i : 0);
            var cellId = 'cell-' + cellX + '-' + cellY;
            if (!document.getElementById(cellId)) {
                var cell = document.createElement('div');
                cell.id = cellId;
                cell.className = 'cell';
                cell.style.gridColumn = cellX;
                cell.style.gridRow    = cellY;
                if (showAnswersForTesting) {
                    cell.textContent  = wordObj.answer[i];
                    cell.style.color  = '#ccc';
                }
                crosswordDiv.appendChild(cell);
            } else if (showAnswersForTesting) {
                document.getElementById(cellId).textContent = wordObj.answer[i];
            }
        }
    });

    // Pass 2: question-number labels on first cell of each word
    words.forEach(function(wordObj) {
        var firstCell = document.getElementById('cell-' + wordObj.x + '-' + wordObj.y);
        if (!firstCell) return;
        var label = firstCell.querySelector('.cell-num');
        if (!label) {
            label = document.createElement('span');
            label.className   = 'cell-num';
            label.textContent = wordObj.id;
            firstCell.appendChild(label);
        } else {
            label.textContent += '\u00B7' + wordObj.id;
        }
    });
}

// ── Polaroids ─────────────────────────────────────────────────────────────────
function buildPolaroids() {
    polaroidsH.innerHTML = '';
    polaroidsV.innerHTML = '';
    var sorted = words.slice().sort(function(a, b) { return a.id - b.id; });
    sorted.forEach(function(wordObj) {
        var polaroid = document.createElement('div');
        polaroid.className = 'polaroid';
        polaroid.id = 'polaroid-' + wordObj.id;
        polaroid.innerHTML =
            '<span class="polaroid-icon">' + getPartyIcon(wordObj.id) + '</span>' +
            '<span class="polaroid-num">'  + wordObj.id + '</span>';
        polaroid.addEventListener('click', function() { openModal(wordObj); });
        (wordObj.dir === "h" ? polaroidsH : polaroidsV).appendChild(polaroid);
        if (progress[wordObj.id]) markAsSolved(wordObj);
    });
    checkWinCondition();
}

function getPartyIcon(id) {
    var icons = ['🎈','🎉','🎂','🥂','🎁','✨','🪩','🎊','🍾','🎶','🌟','🎀','🥳','🎤','🪅','🎸','💃','🎯','🎠','🌈','🫧'];
    return icons[(id - 1) % icons.length];
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(wordObj) {
    currentWordId = wordObj.id;
    var dirText = wordObj.dir === "h" ? "Waagerecht \u2192" : "Senkrecht \u2193";
    document.getElementById('modal-title').textContent = 'Frage ' + wordObj.id + ' (' + dirText + ')';

    var questionEl = document.getElementById('modal-question');

    if (wordObj.question === 'SONG') {
        if (isPlaying) toggleMusic();
        questionEl.innerHTML =
            '<span style="display:block;margin-bottom:12px;">Welche Band spielt diesen Song?</span>' +
            '<audio id="question-song" src="dd.mp3" preload="auto"></audio>' +
            '<button id="song-play-btn" onclick="toggleSongBtn()" style="' +
                'background:linear-gradient(135deg,#ff6b9d,#a78bfa);' +
                'color:white;border:none;border-radius:30px;' +
                'padding:10px 24px;font-size:1rem;font-family:Boogaloo,cursive;' +
                'cursor:pointer;box-shadow:0 4px 14px rgba(255,107,157,0.4);' +
            '">\u25b6 Abspielen</button>';
    } else {
        questionEl.innerHTML = wordObj.question.replace(/\n/g, '<br>');
    }

    answerInput.value    = '';
    errorMsg.textContent = '';
    modal.style.display  = 'flex';
    setTimeout(function() { answerInput.focus(); }, 50);
}

function closeModalFn() {
    var song = document.getElementById('question-song');
    if (song) { song.pause(); song.currentTime = 0; }
    modal.style.display = 'none';
}

function toggleSongBtn() {
    var audio = document.getElementById('question-song');
    var btn   = document.getElementById('song-play-btn');
    if (!audio || !btn) return;
    if (audio.paused) {
        audio.play();
        btn.textContent = '\u23f8 Pause';
    } else {
        audio.pause();
        btn.textContent = '\u25b6 Abspielen';
    }
}

modalClose.onclick  = closeModalFn;
finaleClose.onclick = function() { finaleModal.style.display = 'none'; };

window.onclick = function(e) {
    if (e.target === modal)       closeModalFn();
    if (e.target === finaleModal) finaleModal.style.display = 'none';
};

// ── Answer submission ─────────────────────────────────────────────────────────
submitBtn.onclick = function() {
    var userInput      = answerInput.value.toUpperCase().trim();
    var currentWordObj = words.find(function(w) { return w.id === currentWordId; });
    if (!currentWordObj) return;
    if (userInput === currentWordObj.answer) {
        progress[currentWordId] = true;
        localStorage.setItem("kathiProgress", JSON.stringify(progress));
        markAsSolved(currentWordObj);
        closeModalFn();
        launchConfetti();
        checkWinCondition();
    } else {
        errorMsg.textContent = "Das war leider nicht richtig. Versuch es nochmal! \uD83C\uDF88";
    }
};

answerInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") { e.preventDefault(); submitBtn.click(); }
});

// ── Mark solved ───────────────────────────────────────────────────────────────
function markAsSolved(wordObj) {
    var polaroid = document.getElementById('polaroid-' + wordObj.id);
    if (polaroid) polaroid.classList.add('solved');

    for (var i = 0; i < wordObj.answer.length; i++) {
        var cellX = wordObj.x + (wordObj.dir === "h" ? i : 0);
        var cellY = wordObj.y + (wordObj.dir === "v" ? i : 0);
        var cell  = document.getElementById('cell-' + cellX + '-' + cellY);
        if (cell) {
            var numLabel      = cell.querySelector('.cell-num');
            cell.textContent  = wordObj.answer[i];
            cell.style.color  = '#000';
            if (numLabel) cell.appendChild(numLabel);
        }
    }
}

// ── Win condition ─────────────────────────────────────────────────────────────
function checkWinCondition() {
    var allSolved = words.every(function(w) { return progress[w.id]; });
    if (allSolved) {
        solutionCells.forEach(function(pos) {
            var cell = document.getElementById('cell-' + pos.x + '-' + pos.y);
            if (cell) cell.classList.add('solution-glow');
        });
        setTimeout(function() { finaleModal.style.display = 'flex'; }, 1500);
    }
}

// ── Confetti ──────────────────────────────────────────────────────────────────
function launchConfetti() {
    var colors = ['#ff6b9d','#ffd700','#a78bfa','#34d399','#60a5fa','#f97316'];
    for (var i = 0; i < 60; i++) {
        var el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.cssText =
            'left:'               + (Math.random() * 100) + 'vw;' +
            'background:'         + colors[Math.floor(Math.random() * colors.length)] + ';' +
            'animation-delay:'    + (Math.random() * 2) + 's;' +
            'animation-duration:' + (2 + Math.random() * 2) + 's;' +
            'width:'              + (6 + Math.random() * 8) + 'px;' +
            'height:'             + (6 + Math.random() * 8) + 'px;' +
            'border-radius:'      + (Math.random() > 0.5 ? '50%' : '2px') + ';';
        document.body.appendChild(el);
        setTimeout(function(e) { return function() { e.remove(); }; }(el), 4000);
    }
}

// ── Background balloons ───────────────────────────────────────────────────────
function createBalloons() {
    var emojis = ['\uD83C\uDF88','\uD83C\uDF88','\uD83C\uDF89','\u2728'];
    for (var i = 0; i < 8; i++) {
        var b = document.createElement('div');
        b.className   = 'bg-balloon';
        b.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        b.style.cssText =
            'left:'               + (5 + Math.random() * 90) + '%;' +
            'animation-delay:'    + (Math.random() * 8) + 's;' +
            'animation-duration:' + (10 + Math.random() * 8) + 's;' +
            'font-size:'          + (1.5 + Math.random() * 2) + 'rem;' +
            'opacity:'            + (0.15 + Math.random() * 0.2) + ';';
        document.querySelector('.bg-deco').appendChild(b);
    }
}

// ── Init ──────────────────────────────────────────────────────────────────────
buildGrid();
buildPolaroids();
createBalloons();

// ── Duck Music Player ─────────────────────────────────────────────────────────
function toggleMusic() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        music.play();
        duckEl.classList.add('dancing');
        duckImg.src       = 'duck_dance.gif';
        bubble.textContent = '\uD83C\uDFB5 yeah!';
    } else {
        music.pause();
        duckEl.classList.remove('dancing');
        duckImg.src       = 'duck_idle.gif';
        bubble.textContent = 'dr\u00fcck mich';
    }
}
