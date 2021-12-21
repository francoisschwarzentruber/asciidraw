const CELLSIZEX = 7.5;
const CELLSIZEY = 14;

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

function text2Matrix(text) {
    const lines = text.split("\n");
    const maxX = Math.max(...lines.map((l) => l.length));
    const M = new Array(maxX);
    for (let x = -1; x < maxX; x++)
        M[x] = new Array(lines.length);

    for (let y = 0; y < lines.length; y++)
        for (let x = 0; x < maxX; x++)
            M[x][y] = { char: lines[y][x] ? lines[y][x] : " ", pos: { x: x * CELLSIZEX + 16, y: y * CELLSIZEY + CELLSIZEY }, edges: [] };
    return M;
}

let matrix = undefined;
function load(txt) {
    matrix = text2Matrix(txt);
}



function loop() {
    setTimeout(loop, 40);
    if (matrix == undefined) return;
    live();
    draw();

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


function addEdge(x, y, x2, y2) {
    M(x, y).edges.push(M(x2, y2));
    M(x2, y2).edges.push(M(x, y));
}

function live() {
    for (let x = 0; x < matrix.length; x++)
        for (let y = 0; y < matrix[x].length; y++) {
            const cell = M(x, y);
            if (M(x, y) && isCharacterDrawing(cell.char)) {
                cell.edges = [];

                /**is (x, y) connected to (x+i, x+j)? */
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
                const f = (d) => {
                    if (Math.abs(d) < 2 * CELLSIZEY / 4)
                        return 0
                    else
                        return (d) / 50;
                }


                for (let i = -1; i <= 1; i++)
                    for (let j = -1; j <= 1; j++)
                        if (i != 0 || j != 0)
                            if (isConnected(x, y, i, j)) {
                                addEdge(x, y, x+i, y+j);
                                
                                if (!isFixed(x, y)) {
                                    M(x, y).pos.x += f(M(x + i, y + j).pos.x - M(x, y).pos.x);
                                    M(x, y).pos.y += f(M(x + i, y + j).pos.y - M(x, y).pos.y);
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
    for (let x = 0; x < matrix.length; x++)
        for (let y = 0; y < matrix[x].length; y++) {
            if (matrix[x][y]) {
                const char = matrix[x][y].char;

                for (const e of matrix[x][y].edges) {
                    ctx.beginPath();
                    ctx.moveTo(matrix[x][y].pos.x, matrix[x][y].pos.y);
                    ctx.lineTo(e.pos.x, e.pos.y);
                    ctx.stroke();
                }

                if (!isCharacterDrawing(char) || char == "•" || matrix[x][y].edges.length == 0)
                    ctx.fillText(char, matrix[x][y].pos.x, matrix[x][y].pos.y + CELLSIZEY / 4);


            }

        }

}