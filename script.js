const canvas = document.getElementById('tetris-board');
const context = canvas.getContext('2d');

// Set the scale and size of blocks
const scale = 30;
context.scale(scale, scale);

const COLS = 10;
const ROWS = 20;

// Define colors for each tetromino
const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF'
];

// Tetromino shapes
const tetrominoes = [
    [],
    [[0, 1, 0], [1, 1, 1]],       // T-shape
    [[0, 1, 1], [1, 1, 0]],       // Z-shape
    [[1, 1, 0], [0, 1, 1]],       // S-shape
    [[1, 1, 1, 1]],               // I-shape
    [[1, 1], [1, 1]],             // O-shape
    [[0, 0, 1], [1, 1, 1]],       // L-shape
    [[1, 0, 0], [1, 1, 1]]        // J-shape
];

// Create matrix of the game
function createMatrix(width, height) {
    const matrix = [];
    while (height--) {
        matrix.push(new Array(width).fill(0));
    }
    return matrix;
}

const arena = createMatrix(COLS, ROWS);

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate() {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    matrix.reverse();
}

function playerReset() {
    const pieces = 'IJLOSTZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (COLS / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function createPiece(type) {
    switch (type) {
        case 'T':
            return tetrominoes[1];
        case 'O':
            return tetrominoes[5];
        case 'L':
            return tetrominoes[6];
        case 'J':
            return tetrominoes[7];
        case 'I':
            return tetrominoes[4];
        case 'S':
            return tetrominoes[3];
        case 'Z':
            return tetrominoes[2];
    }
}

function arenaSweep() {
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
    }
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0
};

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

function startGame() {
    playerReset();
    updateScore();
    update();
}

function resetGame() {
    arena.forEach(row => row.fill(0));
    startGame();
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 38) {
        playerRotate();
    }
});

playerReset();
