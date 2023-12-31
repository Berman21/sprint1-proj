'use strict'

const noContext = document.getElementById("noContextMenu");

noContext.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

var gBoard

var gLevel = {
    size: 0,
    mines: 0
}
var gGame = {
    isOn: false,
    useHint: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    mines: 0
}



function createLevel(size, mines) {
    gLevel.size = size
    gLevel.mines = mines
    gLevel.openedMines = 0
    onInit()
}

function onInit() {
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gLevel.openedMines = 0
    gLevel.safe = 3
    var elSafe = document.querySelector('.safe span')
    elSafe.innerText = gLevel.safe
    gLevel.hints = 3
    var elHints = document.querySelector('.hints span')
    elHints.innerText = gLevel.hints
    if (gLevel.size === 4) {
        gLevel.lives = 2
    } else {
        gLevel.lives = 3
    }
    var elLives = document.querySelector('.lives span')
    elLives.innerText = gLevel.lives
    var elSmiley = document.querySelector('.restart')
    elSmiley.innerText = '😀'
    var elMsg = document.querySelector('.msg')
    elMsg.innerText = 'GOOD LUCK'
    var elTimer = document.querySelector('.timer span')
    clearInterval(gGame.timerIntervalId)
    elTimer.innerText = '0.000'
    gGame.isOn = true
    gBoard = buildBoard(gLevel.size, gLevel.mines)
    renderBoard(gBoard)
}


function buildBoard(size) {
    const board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            var cell = {
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }
    }
    return board
}

function setMinesNegsCount(board, mines, iIdx, jIdx) { // plaze mines and search mines around each cell and assign it to the cell
    var cells = []
    for (var i = 0; i < board.length; i++) {          // collect all cells other than clicked cell
        for (var j = 0; j < board.length; j++) {
            if (board[i][j] !== board[iIdx][jIdx]) {
                cells.push({ i, j })
            }
        }
    }
    for (var x = 0; x < mines; x++) {                 // place mines in random cells that arent clicked cell
        var randIdx = getRandomInt(0, cells.length - 1)
        cells.splice(randIdx, 1)
        var randCellPos = cells[randIdx]
        board[randCellPos.i][randCellPos.j].isMine = true
    }
    for (var i = 0; i < board.length; i++) {          // count mines around each cell and saves the count in the cell
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j]
            var count = 0
            for (var y = i - 1; y <= i + 1; y++) {
                if (y < 0 || y >= board[i].length) continue
                for (var x = j - 1; x <= j + 1; x++) {
                    if (x < 0 || x >= board[j].length) continue
                    var currIsMineCell = board[y][x]
                    if (currIsMineCell.isMine) count++
                }
            }
            currCell.minesAroundCount = count
        }
    }

}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr class="board-row" >\n`
        for (var j = 0; j < board.length; j++) {
            const cell = board[i][j]
            // var className = ''
            // if (cell.isMarked) {
            //     className += ' marked'
            // }
            strHTML += `\t<td class="cell cell-${i}-${j}"onclick="onCellClicked(this, ${i}, ${j})"oncontextmenu="onCellMarked(this)"></td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elCell = document.querySelector('.board-cells')
    elCell.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    if (elCell.isShown || elCell.isMarked) return

    const cell = gBoard[i][j]
    // console.log('cell clicked', cell)
    if (gGame.shownCount === 0) {
        setMinesNegsCount(gBoard, gLevel.mines, i, j)
        startTimer()
    }
    // if (gGame.useHint) {        // not working yet!
    //     gLevel.hints--
    //     var elHint = document.querySelector('.hints span')
    //     elHint.innerText = gLevel.hints
    //     gGame.useHint = false
    //     expandShown(gBoard, elCell, i, j)
    //     gGame.useHint = true
    //     setTimeout(expandShown, 1000, gBoard, elCell, i, j)
    //     gGame.useHint = false
    // } else if
    if (cell.minesAroundCount === 0 && !cell.isMinen && !gGame.useHint) {
        expandShown(gBoard, elCell, i, j)
    } else if (!cell.isMine) {
        elCell.isShown = true
        elCell.innerText = cell.minesAroundCount
        gGame.shownCount++
        // console.log('shown cells:', gGame.shownCount);
        if (gGame.markedCount === gLevel.mines - gLevel.openedMines &&
            gGame.shownCount - gLevel.openedMines === Math.pow(gLevel.size, 2) - gLevel.mines) {
            checkGameOver('😎', 'YOU WIN')
        }
    } else if (cell.isMine) {
        elCell.isShown = true
        elCell.innerText = '💥'
        gGame.shownCount++
        gLevel.lives--
        gLevel.openedMines++
        // console.log('opened mines:', gLevel.openedMines);
        var elLives = document.querySelector('.lives span')
        elLives.innerText = gLevel.lives
        if (gLevel.lives === 0 || gLevel.openedMines === gLevel.mines) {
            checkGameOver('🤯', 'YOU LOSE')
        } else if (gGame.markedCount === gLevel.mines - gLevel.openedMines &&
            gGame.shownCount - gLevel.openedMines === Math.pow(gLevel.size, 2) - gLevel.mines) {
            checkGameOver('😎', 'YOU WIN')
        }
    }
}

function expandShown(board, elCell, i, j) {
    for (var iIdx = i - 1; iIdx <= i + 1; iIdx++) {
        if (iIdx < 0 || iIdx >= board[i].length) continue
        for (var jIdx = j - 1; jIdx <= j + 1; jIdx++) {
            if (jIdx < 0 || jIdx >= board[j].length) continue
            elCell = document.querySelector(`.cell-${iIdx}-${jIdx}`)
            if (elCell.isShown && !gGame.useHint) continue
            elCell.innerText = board[iIdx][jIdx].minesAroundCount
            elCell.isShown = true
            gGame.shownCount++
            // if (gGame.useHint && elCell.isShown) {  // not working yet!
            //     elCell.innerText = ''
            //     elCell.isShown = false
            //     gGame.shownCount--
            // }
            console.log(gGame.shownCount);
        }
    }
}

function onCellMarked(elCell) {
    if (!gGame.isOn) return
    if (elCell.isShown) return
    if (!elCell.isMarked) {
        elCell.isMarked = true
        elCell.innerText = '🚩'
        gGame.markedCount++
        // console.log('marked count:', gGame.markedCount);
        if (gGame.markedCount === gLevel.mines - gLevel.openedMines &&
            gGame.shownCount - gLevel.openedMines === Math.pow(gLevel.size, 2) - gLevel.mines) {
            checkGameOver('😎', 'YOU WIN')
        }
    } else if (elCell.isMarked) {
        elCell.isMarked = false
        elCell.innerText = ''
        gGame.markedCount--
    }
}

function checkGameOver(smiley, msg) {
    var elSmiley = document.querySelector('.restart')
    var elMsg = document.querySelector('.msg')
    elSmiley.innerText = smiley
    gGame.isOn = false
    clearInterval(gGame.timerIntervalId)
    elMsg.innerText = msg

}

function startTimer() {
    gGame.secsPassed = Date.now()

    gGame.timerIntervalId = setInterval(function () {
        var delta = Date.now() - gGame.secsPassed
        var elTimer = document.querySelector('.timer span')
        elTimer.innerText = `${(delta / 1000).toFixed(3)}`
    }, 37)
}

function onHint() {
    var elHint = document.querySelector('.hints')
    if (!gGame.useHint) {
        elHint.style.backgroundColor = 'rgba(255, 255, 0, 0.466)'
        gGame.useHint = true
        // console.log('hint on');
    } else {
        elHint.style.backgroundColor = 'rgb(56, 56, 56)'
        gGame.useHint = false
        // console.log('hint off');
    }
}

function onSafe() {
    gLevel.safe--
    var elSafe = document.querySelector('.safe span')
    elSafe.innerText = gLevel.safe

    var cells = []
    for (var i = 0; i < gBoard.length; i++) {          // collect all cells other than mines
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                cells.push({ i, j })
            }
        }
    }        
    var randIdx = getRandomInt(0, cells.length - 1)
    var randCellPos = cells[randIdx]
    var elCell = document.querySelector(`.cell-${randCellPos.i}-${randCellPos.j}`)
    var intervalId = setInterval(function () {
        elCell.style.backgroundColor = 'rgb(76, 96, 41)'
    }, 2000)
    setTimeout(clearInterval,intervalId)
    elCell.style.backgroundColor = 'lightblue'
}
