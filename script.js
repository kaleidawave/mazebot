const urlParams = new URLSearchParams(window.location.search);

const allowedSizes = [10, 20, 30, 40, 60, 100, 120, 150, 200];

let size = parseInt(urlParams.get('size')) || 10;
if (!allowedSizes.includes(size)) {
    alert(`Maze size not valid. Maze size must be either ${allowedSizes}`);
    size = 10;
}

let instant = urlParams.get('instant') === 'true'; 

document.getElementsByName('size')[0].value = size;
document.getElementsByName('instant')[0].checked = instant;

let maze;
let start;
let end;

let visited = 0;

let ctx;

//#region Event Listeners

document.getElementById('solve').addEventListener('click', function () {
    this.disabled = true;
    solveMaze(maze, start, end);
});

document.getElementById('reset').addEventListener('click', function () {
    this.disabled = true;
    drawGrid();
});

//#endregion

//#region Load & Draw Grid 

async function drawGrid() {

    const grid = await fetch(`https://api.noopschallenge.com/mazebot/random?minSize=${size}&maxSize=${size}`).then(r => r.json());
    ctx = document.getElementById('app').getContext('2d');
    ctx.canvas.width = size;
    ctx.canvas.height = size;

    maze = grid.map;

    // Heuristics Debug:
    // size = 40;
    // maze = fillGrid(size, ' ');
    // maze[2][10] = 'A';
    // maze[20][34] = 'B';

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            let cell = maze[y][x];
            if (cell === 'X') {
                drawSquare(x, y, 'black');
            }
            else if (cell === 'B') {
                drawSquare(x, y, 'green');
            }
            else if (cell === 'A') {
                drawSquare(x, y, 'blue');
            }
            else {
                drawSquare(x, y, 'white');
            }
        }
    }

    document.getElementById('solve').disabled = false;
    document.getElementById('info').innerHTML = `Loaded: ${grid.name}`;

    start = grid.startingPosition;
    end = grid.endingPosition;
}

drawGrid();
//#endregion

//#region Solve Maze
async function solveMaze() {
    try {
        let end = await main();
        let path = [];
        path.push(end);
        while (end.previous) {
            path.push(end.previous);
            end = end.previous;
        }
        for (const node of path) {
            node.drawFinal();
        }
    }
    catch (error) {
        alert('No Solution');
    }
    finally {
        document.getElementById('reset').disabled = false;
    }
}

//#endregion

//#region Helper Functions

function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

function wait(ms) {
    return new Promise((r, _) => setTimeout(r, ms));
}
function fillGrid(size, value) {
    let grid = [];
    for (let x = 0; x < size; x++) {
        let row = [];
        for (let y = 0; y < size; y++) {
            row.push(value);
        }
        grid.push(row);
    }
    return grid;
}
//#endregion