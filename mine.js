const boardElement =
    document.getElementById("board");

const newGameButton =
    document.getElementById("newGame");

const messageElement =
    document.getElementById("message");

const boardSizeElement =
    document.getElementById("boardSize");

const mineCountElement =
    document.getElementById("mineCount");

const flagCountElement =
    document.getElementById("flagCount");

const timeElement =
    document.getElementById("time");

const difficultyButtons =
    document.querySelectorAll(".difficulty-btn");



const levels = {

    easy: {
        rows: 9,
        cols: 9,
        mines: 10
    },

    medium: {
        rows: 16,
        cols: 16,
        mines: 40
    },

    hard: {
        rows: 16,
        cols: 30,
        mines: 99
    }

};



let currentLevel = "easy";

let rows = 9;
let cols = 9;
let mineCount = 10;

let cells = [];

let mines = new Set();

let flags = 0;

let seconds = 0;

let started = false;

let gameOver = false;

let timer = null;



function getIndex(row, col) {

    return row * cols + col;

}



function getNeighbors(index) {

    const row =
        Math.floor(index / cols);

    const col =
        index % cols;

    const neighbors = [];

    for (
        let rowOffset = -1;
        rowOffset <= 1;
        rowOffset++
    ) {

        for (
            let colOffset = -1;
            colOffset <= 1;
            colOffset++
        ) {

            if (
                rowOffset === 0 &&
                colOffset === 0
            ) {
                continue;
            }

            const newRow =
                row + rowOffset;

            const newCol =
                col + colOffset;

            if (
                newRow >= 0 &&
                newRow < rows &&
                newCol >= 0 &&
                newCol < cols
            ) {

                neighbors.push(
                    getIndex(
                        newRow,
                        newCol
                    )
                );

            }

        }

    }

    return neighbors;

}



function placeMines(safeIndex) {

    mines.clear();

    const available = [];

    for (
        let i = 0;
        i < rows * cols;
        i++
    ) {

        if (i !== safeIndex) {
            available.push(i);
        }

    }



    for (
        let i = available.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            available[i],
            available[randomIndex]
        ] = [
            available[randomIndex],
            available[i]
        ];

    }



    for (
        let i = 0;
        i < mineCount;
        i++
    ) {

        mines.add(
            available[i]
        );

    }

}



function countMines(index) {

    return getNeighbors(index)
        .filter(
            neighbor =>
                mines.has(neighbor)
        )
        .length;

}



function startTimer() {

    if (timer !== null) {
        return;
    }

    timer = setInterval(() => {

        if (!gameOver) {

            seconds++;

            timeElement.textContent =
                seconds;

        }

    }, 1000);

}



function updateStats() {

    boardSizeElement.textContent =
        `${cols}×${rows}`;

    mineCountElement.textContent =
        mineCount;

    flagCountElement.textContent =
        flags;

    timeElement.textContent =
        seconds;

}



function reveal(index) {

    if (gameOver) {
        return;
    }

    if (cells[index].open) {
        return;
    }

    if (cells[index].flag) {
        return;
    }



    if (!started) {

        started = true;

        placeMines(index);

        startTimer();

    }



    if (mines.has(index)) {

        finishGame(false);

        return;

    }


    const stack = [index];

    const visited = new Set();


    while (stack.length > 0) {

        const current =
            stack.pop();


        if (
            visited.has(current) ||
            cells[current].open ||
            cells[current].flag
        ) {

            continue;

        }


        visited.add(current);

        cells[current].open = true;

        cells[current].count =
            countMines(current);



        if (
            cells[current].count === 0
        ) {

            for (
                const neighbor
                of getNeighbors(current)
            ) {

                if (
                    !mines.has(neighbor)
                ) {

                    stack.push(
                        neighbor
                    );

                }

            }

        }

    }


    renderBoard();

    checkWin();

}



function toggleFlag(index) {

    if (gameOver) {
        return;
    }

    if (cells[index].open) {
        return;
    }


    if (!started) {

        started = true;

        placeMines(-1);

        startTimer();

    }



    if (cells[index].flag) {

        cells[index].flag = false;

        flags--;

    }


    else {

        if (flags >= mineCount) {
            return;
        }

        cells[index].flag = true;

        flags++;

    }


    renderBoard();

    checkWin();

}


function finishGame(won) {

    gameOver = true;


    clearInterval(timer);

    timer = null;



    for (
        let i = 0;
        i < cells.length;
        i++
    ) {

        if (mines.has(i)) {

            cells[i].open = true;

        }

    }


    if (won) {

        messageElement.textContent =
            "🎉 Chúc mừng mẹ mày! 🎉";

    }

    else {

        messageElement.textContent =
            "Bùm Bùm Chéo Chéo, Con Mẹ Mày Béo";

    }


    renderBoard();

}



function checkWin() {

    if (!started || gameOver) {
        return;
    }

    let openedSafeCells = 0;


    for (
        let i = 0;
        i < cells.length;
        i++
    ) {

        if (
            cells[i].open &&
            !mines.has(i)
        ) {

            openedSafeCells++;

        }

    }


    if (
        openedSafeCells ===
        rows * cols - mineCount
    ) {

        finishGame(true);

    }

}



function renderBoard() {

    boardElement.innerHTML = "";

    boardElement.style.gridTemplateColumns =
        `repeat(${cols}, 36px)`;


    for (
        let i = 0;
        i < cells.length;
        i++
    ) {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className = "cell";


        const cell = cells[i];



        if (cell.open) {

            button.classList.add("open");



            if (mines.has(i)) {

                button.classList.add("mine");

                button.textContent = "🖕";

            }



            else if (cell.count > 0) {

                button.textContent =
                    cell.count;

                button.classList.add(
                    `n${cell.count}`
                );

            }

        }



        else if (cell.flag) {

            button.classList.add("flag");

            button.textContent = "🫃🏿";



            if (
                gameOver &&
                !mines.has(i)
            ) {

                button.classList.add(
                    "wrong-flag"
                );

            }

        }



        button.addEventListener(
            "click",
            () => reveal(i)
        );



        button.addEventListener(
            "contextmenu",
            event => {

                event.preventDefault();

                toggleFlag(i);

            }
        );


        boardElement.appendChild(
            button
        );

    }


    updateStats();

}



function resetGame() {

    clearInterval(timer);

    timer = null;


    const level =
        levels[currentLevel];


    rows = level.rows;

    cols = level.cols;

    mineCount = level.mines;


    cells = Array.from(
        {
            length:
                rows * cols
        },
        () => ({

            open: false,

            flag: false,

            count: 0

        })
    );


    mines.clear();

    flags = 0;

    seconds = 0;

    started = false;

    gameOver = false;


    messageElement.textContent = "";


    renderBoard();

}



difficultyButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                currentLevel =
                    button.dataset.level;


                difficultyButtons.forEach(
                    item => {

                        item.classList.toggle(
                            "active",
                            item === button
                        );

                    }
                );


                resetGame();

            }
        );

    }
);



newGameButton.addEventListener(
    "click",
    resetGame
);



resetGame();