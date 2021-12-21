const CELLSIZEX = 7.5;
const CELLSIZEY = 14;

window.onload = () => {
    textarea.oninput = () => {
        textarea.classList.add("edit");
        setTimeout(() => textarea.classList.remove("edit"), 2000);
        load(textarea.value);
        
    }

    textarea.onclick = () => {
        textarea.classList.add("edit");
        setTimeout(() => textarea.classList.remove("edit"), 2000);
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
            M[x][y] = { char: lines[y][x] ? lines[y][x] : " ", pos: { x: x * CELLSIZEX, y: y * CELLSIZEY + CELLSIZEY }, edges: [] };
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
    return undefined;
}


function live() {
    for (let x = 0; x < matrix.length; x++)
        for (let y = 0; y < matrix[x].length; y++) {
            const cell = M(x, y);
            if (M(x, y) && isCharacterDrawing(cell.char)) {
                cell.edges = [];
                const isConnected = function (x, y, i, j) {
                    if (M(x + i, y + j)) {
                        const char = M(x + i, y + j).char;
                        if (i == 0)
                            return ["|", "|", "\\", "/"].indexOf(char) >= 0;
                        if (j == 0)
                            return ["-", "_", "\\", "/"].indexOf(M(x + i, y + j).char) >= 0;
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
                const f = (x) => {
                    if (Math.abs(x) < 3 * CELLSIZEY / 4)
                        return 0
                    else
                        return (x) / 50;
                }

                for (let i = -1; i <= 1; i++)
                    for (let j = -1; j <= 1; j++)
                        if (isConnected(x, y, i, j)) {
                            cell.edges.push(M(x + i, y + j));
                            M(x, y).pos.x += f(M(x + i, y + j).pos.x - M(x, y).pos.x);
                            M(x, y).pos.y += f(M(x + i, y + j).pos.y - M(x, y).pos.y);
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

                if (!isCharacterDrawing(char) || char == "•")
                    ctx.fillText(char, matrix[x][y].pos.x, matrix[x][y].pos.y + CELLSIZEY / 4);


            }

        }

}