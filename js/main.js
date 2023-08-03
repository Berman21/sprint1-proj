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
    gLevel.lives = 3
    var elLives = document.querySelector('.lives')
    elLives.innerText = gLevel.lives
    var elSmiley = document.querySelector('.restart')
    elSmiley.innerText = '😀'
    var elMsg = document.querySelector('.msg')
    elMsg.innerText = 'GOOD LUCK'
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
    // setMinesNegsCount(board)
    // console.table(board);
    return board
}

function setMinesNegsCount(board, mines) { // search mines around each cell and assign it to the cell
    for (var x = 0; x < mines; x++) {
        var posI = getRandomInt(0, board.length)
        var posJ = getRandomInt(0, board.length)
        board[posI][posJ].isMine = true
    }
    for (var i = 0; i < board.length; i++) {        // run through the mat
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j]              // each cell in mat
            var count = 0
            for (var y = i - 1; y <= i + 1; y++) {     // run around each cell
                if (y < 0 || y >= board[i].length) continue
                for (var x = j - 1; x <= j + 1; x++) {
                    if (x < 0 || x >= board[j].length) continue
                    var currIsMineCell = board[y][x]   // each suspected cell around the cuu cell
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
            var className = ''
            if (cell.isMarked) {
                className += ' marked'
            }
            strHTML += `\t<td class="cell ${className}"onclick="onCellClicked(this, ${i}, ${j})"oncontextmenu="onCellMarked(this)"></td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elCell = document.querySelector('.board-cells')
    elCell.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    if (gGame.shownCount === 0) {
        setMinesNegsCount(gBoard, gLevel.mines)
        startTimer()
        var elLives = document.querySelector('.lives')
        elLives.innerText = gLevel.lives
    }
    const cell = gBoard[i][j]
    if (elCell.isShown || elCell.isMarked) return
    // console.log('Cell clicked: ', elCell, i, j)
    if (cell.minesAroundCount === 0 && !cell.isMine) {
        cell.isShown = true
        cell.innerText = cell.minesAroundCount
        for (var y = i - 1; y <= i + 1; y++) {     // run around each cell
            if (y < 0 || y >= gBoard[i].length) continue
            for (var x = j - 1; x <= j + 1; x++) {
                if (x < 0 || x >= gBoard[j].length) continue
                var currCell = gBoard[y][x]
                if (currCell.isMine)continue
                currCell.isShown = true
                currCell.innerText = cell.minesAroundCount
                
            }
        }

    }
    if (!cell.isMine) {
        elCell.isShown = true
        elCell.innerText = cell.minesAroundCount
    }
    if (cell.isMine) {
        elCell.isShown = true
        elCell.innerText = '💥'
        gLevel.lives--
        gLevel.openedMines++
        var elLives = document.querySelector('.lives')
        elLives.innerText = gLevel.lives
    }
    checkGameOver(elCell)
}

function onCellMarked(elCell) {
    if (!gGame.isOn) return
    if (elCell.isShown) return
    if (!elCell.isMarked) {
        elCell.isMarked = true
        console.log(elCell.isMarked);
        elCell.innerText = '🚩'
    } else if (elCell.isMarked) {
        elCell.isMarked = false
        elCell.innerText = ''
        gGame.markedCount--
    }
    checkGameOver(elCell)
}

function checkGameOver(elCell) {
    var elSmiley = document.querySelector('.restart')
    var elMsg = document.querySelector('.msg')
    if (elCell.isMarked) gGame.markedCount++
    if (elCell.isShown && !elCell.isMine) gGame.shownCount++
    if (gLevel.lives === 0 || gLevel.openedMines === gLevel.mines) {
        elSmiley.innerText = '🤯'
        gGame.isOn = false
        elMsg.innerText = 'LOSER'
    } else if (gGame.markedCount === gLevel.mines - gLevel.openedMines && gGame.shownCount - gLevel.openedMines === Math.pow(gLevel.size, 2) - gLevel.mines) {
        elSmiley.innerText = '😎'
        gGame.isOn = false
        elMsg.innerText = 'WINNER'
    }
}

function startTimer(){
    gGame.secsPassed = Date.now()

    gGame.timerIntervalId = setInterval(function(){
        var delta = Date.now() - gGame.secsPassed
        var elTimer = document.querySelector('.timer span')
        elTimer.innerText = `${(delta/1000).toFixed(3)}`
    },37)
}
