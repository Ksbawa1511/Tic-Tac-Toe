console.log("Welcome to Tic Tac Toe");

const music = new Audio("music.mp3");
const audioTurn = new Audio("ting.mp3");
const gameover = new Audio("gameover.mp3");
const winImage = document.querySelector('.imgbox').getElementsByTagName('img')[0];
const container = document.querySelector(".container");
const winLine = document.getElementById("win-line");

const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

const boxes = Array.from(document.getElementsByClassName("box"));
const boxtexts = Array.from(document.getElementsByClassName("boxtext"));
const info = document.querySelector(".info");
const modeInputs = document.querySelectorAll('input[name="mode"]');
const resetBtn = document.getElementById("reset");

const human = "X";
const computer = "0";
const AUTO_RESET_MS = 2000;

let turn = human;
let isgameover = false;
let mode = document.querySelector('input[name="mode"]:checked')?.value || "pvp";
let resetTimer;

const changeTurn = () => turn === human ? computer : human;

const updateInfo = () => {
    if (isgameover) return;
    if (mode === "cpu") {
        info.innerText = turn === human ? "Your turn (X)" : "Computer thinking...";
    } else {
        info.innerText = "Turn for " + turn;
    }
};

const drawWinLine = (indexes) => {
    if (!container || !winLine || indexes.length < 2) return;
    const containerRect = container.getBoundingClientRect();
    const [start, , end] = indexes.map(idx => {
        const rect = boxes[idx].getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top,
        };
    });
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    winLine.style.width = `${length}px`;
    winLine.style.transform = `translate(${start.x}px, ${start.y}px) rotate(${angle}deg)`;
    winLine.style.opacity = "1";
};

const scheduleAutoReset = () => {
    clearTimeout(resetTimer);
    resetTimer = setTimeout(resetGame, AUTO_RESET_MS);
};

const showWinner = (symbol, indexes) => {
    info.innerText = symbol + " Won, Congrats";
    isgameover = true;
    winImage.style.width = "200px";
    winImage.style.opacity = "1";
    // gameover.play();
    drawWinLine(indexes);
    scheduleAutoReset();
};

const checkWin = () => {
    for (const win of wins) {
        const [a, b, c] = win;
        if (
            boxtexts[a].innerText !== "" &&
            boxtexts[a].innerText === boxtexts[b].innerText &&
            boxtexts[a].innerText === boxtexts[c].innerText
        ) {
            showWinner(boxtexts[a].innerText, win);
            return true;
        }
    }
    return false;
};

const checkDraw = () => {
    if (isgameover) return;
    const filled = boxtexts.every(el => el.innerText !== "");
    if (filled) {
        info.innerText = "It's a draw";
        isgameover = true;
        scheduleAutoReset();
    }
};

const resetGame = () => {
    clearTimeout(resetTimer);
    boxtexts.forEach(el => {
        el.innerText = "";
    });
    turn = human;
    isgameover = false;
    winImage.style.width = "0px";
    winImage.style.opacity = "0";
    if (winLine) {
        winLine.style.width = "0px";
        winLine.style.opacity = "0";
        winLine.style.transform = "translate(0, 0) rotate(0deg)";
    }
    updateInfo();
};

const placeSymbol = (index) => {
    if (isgameover) return false;
    const target = boxtexts[index];
    if (!target || target.innerText !== "") return false;
    target.innerText = turn;
    audioTurn.play();
    const hasWon = checkWin();
    checkDraw();
    if (!isgameover && !hasWon) {
        turn = changeTurn();
        updateInfo();
    }
    return true;
};

const findWinningMove = (symbol) => {
    for (const [a, b, c] of wins) {
        const values = [boxtexts[a].innerText, boxtexts[b].innerText, boxtexts[c].innerText];
        const emptySlots = [a, b, c].filter((idx, pos) => values[pos] === "");
        const symbolCount = values.filter(val => val === symbol).length;
        if (symbolCount === 2 && emptySlots.length === 1) {
            return emptySlots[0];
        }
    }
    return undefined;
};

const computerMove = () => {
    if (isgameover || turn !== computer) return;

    let moveIndex = findWinningMove(computer);
    if (moveIndex === undefined) {
        moveIndex = findWinningMove(human);
    }

    if (moveIndex === undefined && boxtexts[4].innerText === "") {
        moveIndex = 4;
    }

    if (moveIndex === undefined) {
        const empties = boxtexts
            .map((el, idx) => (el.innerText === "" ? idx : null))
            .filter(idx => idx !== null);
        if (empties.length === 0) return;
        moveIndex = empties[Math.floor(Math.random() * empties.length)];
    }

    placeSymbol(moveIndex);
};

boxes.forEach((element, index) => {
    element.addEventListener("click", () => {
        if (isgameover) return;
        if (mode === "cpu" && turn !== human) return;

        const moved = placeSymbol(index);

        if (moved && mode === "cpu" && !isgameover && turn === computer) {
            updateInfo();
            setTimeout(computerMove, 450);
        }
    });
});

resetBtn.addEventListener("click", resetGame);

modeInputs.forEach(input => {
    input.addEventListener("change", (event) => {
        mode = event.target.value;
        resetGame();
    });
});

updateInfo();
