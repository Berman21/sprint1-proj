'use strict'

var gBoard

var gLevel = {
    size: 4,
    mines: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

onInit()
function onInit() {
    gBoard = buildBoard(gLevel.size, gLevel.mines)
    renderBoard(gBoard)
}

function buildBoard(size, mines) {
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
    for (var x = 0; x < mines; x++) {
        var posI = getRandomInt(0, size)
        var posJ = getRandomInt(0, size)
        board[posI][posJ].isMine = true
    }
    // board[0][1].isMine = true
    // board[2][2].isMine = true
    setMinesNegsCount(board)
    console.table(board);
    return board
}

function setMinesNegsCount(board) { // search mines around each cell and assign it to the cell
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
            strHTML += `\t<td class="cell ${className}" 
            onclick="onCellClicked(this, ${i}, ${j})" ></td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elCell = document.querySelector('.board-cells')
    elCell.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    const cell = gBoard[i][j]
    if (cell.isShown || cell.isMarked) return
    console.log('Cell clicked: ', elCell, i, j)
    if (!cell.isMine) {
        elCell.innerText = cell.minesAroundCount
    }
    if (cell.isMine) {
        elCell.innerHTML = '💥'
    }
}