const CELLSIZEX = 7.5;
const CELLSIZEY = 14;
const LAZYNESS = 3 / 4;
const PRECISION = 1 / 50;
const FPS = 20;

window.onload = () => {
    const wakeup = () => {
        /*    textarea.classList.add("edit");
            setTimeout(() => textarea.classList.remove("edit"), 2000);*/
    }

    textarea.onclick = wakeup;
    textarea.onkeydown = wakeup;

    textarea.oninput = () => {
        wakeup();
        load(textarea.value);

    }

    load(textarea.value);
    loop();
}

let matrix = undefined;
let nodes = new Array();

function load(txt) {
    nodes = [];
    matrix = text2Matrix(txt);
    constructGraph();
}

function loop() {
    setTimeout(loop, 1000 / FPS);
    if (matrix == undefined) return;
    live();
    draw();
}



function text2Matrix(text) {
    const lines = text.split("\n");
    const maxX = Math.max(...lines.map((l) => l.length));
    const M = new Array(maxX);
    for (let x = -1; x < maxX; x++)
        M[x] = new Array(lines.length);

    for (let y = 0; y < lines.length; y++)
        for (let x = 0; x < maxX; x++)
            if (lines[y][x] != " " && lines[y][x] != undefined) {
                const node = { char: lines[y][x], x: x, y: y, pos: { x: x * CELLSIZEX + 16, y: y * CELLSIZEY + CELLSIZEY }, edges: [] };
                M[x][y] = node;
                nodes.push(node);
            }



    return M;
}



function M(x, y) {
    if (matrix[x])
        if (matrix[x][y])
            return matrix[x][y];
    return { char: " ", pos: { x: x * CELLSIZEX, y: y * CELLSIZEY + CELLSIZEY }, edges: [] };
}


function isMChar(x, y, char) {
    return M(x, y).char == char;
}


function isMCharacterDrawing(x, y) {
    return isCharacterDrawing(M(x, y).char);
}

function isMCharInCross(x, y, char) {
    if (isMChar(x - 1, y, char))
        return true;
    if (isMChar(x + 1, y, char))
        return true;
    if (isMChar(x, y - 1, char))
        return true;
    if (isMChar(x, y + 1, char))
        return true;
    return false;
}

function isFixed(x, y) {
    if (!isMCharacterDrawing(x, y))
        return true;

    if (M(x, y).edges.length == 1)
        return true;

    if (isMChar(x, y, '-')) {
        if (isMChar(x - 1, y - 1, '\\'))
            return false;
        if (isMChar(x + 1, y - 1, '/'))
            return false;
        if (isMChar(x - 1, y + 1, '/'))
            return false;
        if (isMChar(x + 1, y + 1, '\\'))
            return false;
        if (isMCharInCross(x, y, "|"))
            return true;
        return !(isMCharacterDrawing(x + 1, y) && isMCharacterDrawing(x - 1, y));
    }

    if (isMChar(x, y, '|')) {
        if (isMChar(x - 1, y - 1, '\\'))
            return false;
        if (isMChar(x + 1, y - 1, '/'))
            return false;
        if (isMChar(x - 1, y + 1, '/'))
            return false;
        if (isMChar(x + 1, y + 1, '\\'))
            return false;
        if (isMCharInCross(x, y, "-"))
            return true;
        return !(isMCharacterDrawing(x, y - 1) && isMCharacterDrawing(x, y + 1));
    }

    return false;
}

function constructGraph() {
    function addEdge(x, y, x2, y2) {
        M(x, y).edges.push(M(x2, y2));
        M(x2, y2).edges.push(M(x, y));
    }

    for (const cell of nodes) {
        const x = cell.x;
        const y = cell.y;
        if (M(x, y) && isCharacterDrawing(cell.char)) {
            cell.edges = [];

            const isConnected = function (x, y, i, j) {
                if (M(x + i, y + j)) {
                    const char = M(x + i, y + j).char;
                    if (i == 0)
                        return ["|", "|"].indexOf(char) >= 0;
                    if (j == 0)
                        return ["-", "_"].indexOf(M(x + i, y + j).char) >= 0;
                    if (i * j < 0)
                        return char == "/";
                    if (i * j > 0)
                        return char == "\\";
                    return false;
                    //return M(x + i, y + j).char of ["-"];
                }
                else
                    return false;
            }


            for (let i = -1; i <= 1; i++)
                for (let j = -1; j <= 1; j++)
                    if (isConnected(x, y, i, j)) {
                        if (i != 0 || j != 0)
                            addEdge(x, y, x + i, y + j);
                    }

        }
    }
}






function dist(p, q) {
    return Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
}




function live() {
    for (const cell of nodes) {
        const x = cell.x;
        const y = cell.y;
        if (isCharacterDrawing(cell.char)) {

            /**is (x, y) connected to (x+i, x+j)? */

            const f = (d) => {
                if (Math.abs(d) < LAZYNESS * CELLSIZEY)
                    return 0
                else
                    return (d) * PRECISION;
            }


            for (const e of cell.edges)
                if (!isFixed(x, y)) {
                    cell.pos.x += f(e.pos.x - cell.pos.x);
                    cell.pos.y += f(e.pos.y - cell.pos.y);
                }


            for (const node2 of nodes) {
                if (cell.edges.indexOf(node2) < 0) {
                    const d = dist(cell.pos, node2.pos);
                    if (d < 2 * CELLSIZEY && d > 0) {
                        const dx = node2.pos.x - cell.pos.x;
                        const dy = node2.pos.y - cell.pos.y;
                        const c = 2;//0.2 / (Math.abs(d) + 1);
                        const i = node2.x - cell.x;
                        const j = node2.y - cell.y;

                        if (dx * i < 0)
                            cell.pos.x -= i * c;
                        if (dy * j < 0)
                            cell.pos.y -= j * c;
                    }
                }
            }

        }
    }
}


function isCharacterDrawing(char) {
    return ["-", "|", "\\", "/", "_", "•"].indexOf(char) >= 0;
}

function draw() {

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.textAlign = "center";
    ctx.font = "14px monospace";
    for (const node of nodes) {
        const char = node.char;

        for (const e of node.edges) {
            ctx.beginPath();
            ctx.moveTo(node.pos.x, node.pos.y);
            ctx.lineTo(e.pos.x, e.pos.y);
            ctx.stroke();
        }

        if (!isCharacterDrawing(char) || char == "•" || node.edges.length == 0)
            ctx.fillText(char, node.pos.x, node.pos.y + 1 * CELLSIZEY / 4);

    }

}

