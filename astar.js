var grid;

class slot {
    constructor(x, y, type = 1) {
        this.x = x;
        this.y = y;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.neighbors = [];
        this.type = type; // 0 = start, 1 = node, 2 = finish
    }

    drawSearch() {
        drawSquare(this.x, this.y, `rgb(200, 150, 255)`);
    }

    drawFinal() {
        switch (this.type) {
            case 0:
                drawSquare(this.x, this.y, `blue`);
                break;
            case 1:
                drawSquare(this.x, this.y, `red`);
                break;
            case 2:
                drawSquare(this.x, this.y, `green`);
                break;
            default:
                break;
        }
    }
}

async function main() {
    grid = new Array(size);

    let start;
    let end;

    for (let y = 0; y < size; y++) {
        grid[y] = new Array(size);
        for (let x = 0; x < size; x++) {
            if (maze[y][x] === ' ') {
                grid[y][x] = new slot(x, y);
            }
            else if (maze[y][x] === 'A') {
                grid[y][x] = new slot(x, y, 0);
                start = grid[y][x];
            }
            else if (maze[y][x] === 'B') {
                grid[y][x] = new slot(x, y, 2);
                end = new slot(x, y);
            }
        }
    }

    // Add neighbors
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            if (grid[y][x] !== undefined) {
                grid[y][x].neighbors = neighbors(grid[y][x]);
            }
        }
    }

    let openSet = [start];
    let closedSet = [];

    while (openSet.length > 0) {
        let bestPathScoreNode = openSet[0];

        for (const openNode of openSet) {
            if (openNode.f < bestPathScoreNode.f) {
                bestPathScoreNode = openNode;
            }
        }

        if (bestPathScoreNode.x === end.x && bestPathScoreNode.y === end.y) {
            return bestPathScoreNode; // with previous
        }

        openSet.splice(openSet.indexOf(bestPathScoreNode), 1);
        closedSet.push(bestPathScoreNode);

        let neighbors = bestPathScoreNode.neighbors;

        for (const neighbor of neighbors) {
            if (!closedSet.includes(neighbor)) {
                if (!instant) {
                    neighbor.drawSearch();
                }
                
                let tempG = bestPathScoreNode.g + heuristic(neighbor, bestPathScoreNode); // f(n) = g(n) + h(n)

                let newPath = false;
                if (openSet.includes(neighbor)) {
                    if (tempG < neighbor.g) {
                        neighbor.g = tempG;
                        newPath = true;
                    }
                    // middle case where newPath is false
                }
                else {
                    neighbor.g = tempG;
                    newPath = true;
                    openSet.push(neighbor);
                }

                if (newPath) {
                    neighbor.h = heuristic(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.previous = bestPathScoreNode;
                }

                visited++;
                if (!instant) {
                    await wait(500 / size);
                }
            }
        }
    }

    // if goes through without returning bestPathScoreNode / openSet collapses then there is no solution

    throw new Error("no solution");
}

const sides = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }];

function neighbors(node) {
    let nodes = [];
    for (const side of sides) {
        let nx = node.x + side.x;
        let ny = node.y + side.y;

        if (between(nx, 0, size) && between(ny, 0, size) && grid[ny][nx] !== undefined) {
            nodes.push(grid[ny][nx]);
        }
    }
    return nodes;
}

// Estimate of distance
function heuristic(a, b) {
    // Manhattan distance (https://en.wikipedia.org/wiki/Taxicab_geometry)
    // Best fit for our use case as we are in grid
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    // Euclidean distance
    // return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

    // No heuristic / default to Dijkstra
    // return 0;
}

function between(value, min, max) {
    return value >= min && value < max;
}