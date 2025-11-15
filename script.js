let mode = null;
let gridEnabled = true;
let gridSize = 25;

let startX = 0, startY = 0;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let objects = [];

function setMode(m){ mode = m; }

function setGridSize() {
    gridSize = parseInt(document.getElementById("gridSize").value);
    drawAll();
}

function toggleGrid() {
    gridEnabled = document.getElementById("toggleGrid").checked;
    drawAll();
}

canvas.addEventListener("mousedown", e => {
    startX = e.offsetX;
    startY = e.offsetY;
});

canvas.addEventListener("mouseup", e => {
    let endX = e.offsetX;
    let endY = e.offsetY;

    if(mode === "line"){
        objects.push({type:"line", x1:startX, y1:startY, x2:endX, y2:endY});
    }
    if(mode === "rect"){
        objects.push({type:"rect", x:startX, y:startY, w:endX-startX, h:endY-startY});
    }
    if(mode === "circle"){
        let r = Math.sqrt((endX-startX)**2 + (endY-startY)**2);
        objects.push({type:"circle", x:startX, y:startY, r});
    }
    drawAll();
});

function drawGrid() {
    ctx.strokeStyle = "#d5d5d5";
    ctx.lineWidth = 0.5;

    for(let x = 0; x < canvas.width; x += gridSize){
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for(let y = 0; y < canvas.height; y += gridSize){
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawAll(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(gridEnabled) drawGrid();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";

    for(let obj of objects){
        ctx.beginPath();
        if(obj.type === "line"){
            ctx.moveTo(obj.x1, obj.y1);
            ctx.lineTo(obj.x2, obj.y2);
        }
        if(obj.type === "rect"){
            ctx.rect(obj.x, obj.y, obj.w, obj.h);
        }
        if(obj.type === "circle"){
            ctx.arc(obj.x, obj.y, obj.r, 0, Math.PI * 2);
        }
        ctx.stroke();
    }
}

function undo(){
    objects.pop();
    drawAll();
}

drawAll();
