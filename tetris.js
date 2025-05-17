const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');

// Game constants
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const COLORS = [
    null, 'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'
];

// Tetromino shapes
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[2, 2], [2, 2]], // O
    [[0, 3, 0], [3, 3, 3]], // T
    [[4, 4, 0], [0, 4, 4]], // S
    [[0, 5, 5], [5, 5, 0]], // Z
    [[6, 6, 6], [0, 0, 6]], // J
    [[7, 7, 7], [7, 0, 0]]  // L
];

let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let currentPiece = createNewPiece();
let nextPiece = createNewPiece();
let gameInterval;
let score = 0;
let isGameOver = false;

// Game state
let gamePaused = false;

// Initialize game
initializeGame();

// Event listeners
document.addEventListener('keydown', handleKeyPress);

function initializeGame() {
    drawBoard();
    drawPiece();
    gameInterval = setInterval(gameLoop, 1000);
}

function gameLoop() {
    if (!gamePaused && !isGameOver) {
        movePieceDown();
        draw();
    }
}

function createNewPiece() {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
        shape: shape,
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0,
        color: shape[0][0]
    };
}

function handleKeyPress(e) {
    if (gamePaused || isGameOver) return;

    switch(e.key) {
        case 'ArrowLeft':
            movePieceLeft();
            break;
        case 'ArrowRight':
            movePieceRight();
            break;
        case 'ArrowDown':
            movePieceDown();
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ':
            dropPiece();
            break;
        case 'p':
        case 'P':
            togglePause();
            break;
    }
}

function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                drawBlock(x, y, COLORS[cell]);
            }
        });
    });
}

function drawPiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                drawBlock(currentPiece.x + x, currentPiece.y + y, COLORS[currentPiece.color]);
            }
        });
    });
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
}

function draw() {
    drawBoard();
    drawPiece();
}

function movePieceLeft() {
    if (canMove(currentPiece.x - 1, currentPiece.y)) {
        currentPiece.x--;
        draw();
    }
}

function movePieceRight() {
    if (canMove(currentPiece.x + 1, currentPiece.y)) {
        currentPiece.x++;
        draw();
    }
}

function movePieceDown() {
    if (canMove(currentPiece.x, currentPiece.y + 1)) {
        currentPiece.y++;
    } else {
        mergePiece();
        checkLines();
        if (isGameOver) {
            clearInterval(gameInterval);
            alert('Game Over! Final Score: ' + score);
        } else {
            currentPiece = nextPiece;
            nextPiece = createNewPiece();
        }
    }
    draw();
}

function dropPiece() {
    while (canMove(currentPiece.x, currentPiece.y + 1)) {
        currentPiece.y++;
    }
    mergePiece();
    checkLines();
    currentPiece = nextPiece;
    nextPiece = createNewPiece();
    draw();
}

function rotatePiece() {
    const rotated = rotate(currentPiece.shape);
    if (canMove(currentPiece.x, currentPiece.y, rotated)) {
        currentPiece.shape = rotated;
        draw();
    }
}

function togglePause() {
    gamePaused = !gamePaused;
    if (gamePaused) {
        clearInterval(gameInterval);
    } else {
        gameInterval = setInterval(gameLoop, 1000);
    }
}

function canMove(x, y, shape = currentPiece.shape) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                if (x + col < 0 || x + col >= COLS || 
                    y + row >= ROWS || 
                    board[y + row][x + col]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            }
        });
    });
    
    // Check if game over
    if (board[0].some(cell => cell !== 0)) {
        isGameOver = true;
    }
}

function checkLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    // Update score
    score += linesCleared * 100;
    scoreDisplay.textContent = score;
}

function rotate(matrix) {
    return matrix[0].map((_, i) => 
        matrix.map(row => row[i]).reverse()
    );
}
