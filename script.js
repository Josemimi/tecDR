// Variables principales
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 260; // ancho menos sidebar
canvas.height = window.innerHeight;

let mode = null;
let color = "#14A5FF";
let alpha = 1;
let lineWidth = 2;
let units = "px";
let unitScale = 1;
let gridSize = 25;
let gridEnabled = true;

// Capas
let layers = { "Capa 1": [] };
let layerVisibility = { "Capa 1": true };
let currentLayer = "Capa 1";
let polyPoints = [];
let undoStack = [];

// Zoom y Pan
let offsetX = 0;
let offsetY = 0;
let scale = 1;
let isPanning = false;
let startPan = {x:0, y:0};

// Eventos ventana
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth - 260;
    canvas.height = window.innerHeight;
    drawAll();
});

// ---------------- FUNCIONES DE HERRAMIENTAS ----------------
function setMode(m) {
    mode = m;
    if (m !== "polyline") polyPoints = [];
}

function setColor() {
    color = document.getElementById("colorPicker").value;
}

function setLineWidth() {
    lineWidth = parseInt(document.getElementById("lineWidth").value);
}

function setAlpha() {
    alpha = parseFloat(document.getElementById("alpha").value);
}

function setUnit() {
    units = document.getElementById("units").value;
    if(units==="px") unitScale=1;
    if(units==="cm") unitScale=37.795;
    if(units==="m") unitScale=3779.5;
    drawAll();
}

// ---------------- CAPAS ----------------
function addLayer() {
    let name = document.getElementById("layerName").value.trim();
    if(!name) return;
    layers[name] = [];
    layerVisibility[name] = true;
    let select = document.getElementById("layerSelect");
    select.innerHTML += `<option>${name}</option>`;
    select.value = name;
    currentLayer = name;
}

function changeLayer() {
    currentLayer = document.getElementById("layerSelect").value;
    document.getElementById("layerVisible").checked = layerVisibility[currentLayer];
}

function toggleLayerVisibility() {
    layerVisibility[currentLayer] = document.getElementById("layerVisible").checked;
    drawAll();
}

// ---------------- CUADRÍCULA ----------------
function setGridSize() {
    gridSize = parseInt(document.getElementById("gridSize").value);
    drawAll();
}

function toggleGrid() {
    gridEnabled = document.getElementById("gridToggle").checked;
    drawAll();
}

// ---------------- EVENTOS MOUSE ----------------
canvas.addEventListener("mousedown", e=>{
    const pos = toWorld(e.offsetX, e.offsetY);

    if(e.button===1 || e.button===2) { // Pan con botón derecho o central
        isPanning = true;
        startPan = {x: e.clientX, y: e.clientY};
        canvas.style.cursor="move";
        return;
    }

    if(mode==="text"){
        let txt = prompt("Introduce texto:");
        if(!txt) return;
        addObject({type:"text", x:pos.x, y:pos.y, text:txt, color, alpha, lineWidth});
        drawAll();
        return;
    }

    startX = pos.x; startY = pos.y;

    if(mode==="polyline") polyPoints.push({x:pos.x, y:pos.y});
});

canvas.addEventListener("mousemove", e=>{
    if(!isPanning) return;
    let dx = e.clientX - startPan.x;
    let dy = e.clientY - startPan.y;
    offsetX += dx/scale;
    offsetY += dy/scale;
    startPan = {x:e.clientX, y:e.clientY};
    drawAll();
});

canvas.addEventListener("mouseup", e=>{
    if(isPanning){ isPanning=false; canvas.style.cursor="crosshair"; return; }
    const pos = toWorld(e.offsetX, e.offsetY);

    if(mode==="line") addObject({type:"line", x1:startX, y1:startY, x2:pos.x, y2:pos.y, color, alpha, lineWidth});
    if(mode==="rect") addObject({type:"rect", x:startX, y:startY, w:pos.x-startX, h:pos.y-startY, color, alpha, lineWidth});
    if(mode==="circle"){
        let r = Math.sqrt((pos.x-startX)**2 + (pos.y-startY)**2);
        addObject({type:"circle", x:startX, y:startY, r, color, alpha, lineWidth});
    }
    if(mode==="ellipse"){
        addObject({type:"ellipse", x:startX, y:startY, rx:Math.abs(pos.x-startX), ry:Math.abs(pos.y-startY), color, alpha, lineWidth});
    }
    if(mode==="triangle"){
        addObject({type:"triangle", x1:startX, y1:startY, x2:pos.x, y2:pos.y, x3:startX, y3:pos.y, color, alpha, lineWidth});
    }
    if(mode==="arc"){
        let r = Math.sqrt((pos.x-startX)**2 + (pos.y-startY)**2);
        addObject({type:"arc", x:startX, y:startY, r, startAngle:0, endAngle:Math.PI, color, alpha, lineWidth});
    }

    drawAll();
});

canvas.addEventListener("wheel", e=>{
    e.preventDefault();
    let scaleFactor = e.deltaY<0?1.1:0.9;
    let wx = (e.offsetX - offsetX) / scale;
    let wy = (e.offsetY - offsetY) / scale;
    scale *= scaleFactor;
    offsetX -= wx*(scaleFactor-1);
    offsetY -= wy*(scaleFactor-1);
    drawAll();
});

// ---------------- UTILIDADES ----------------
function toWorld(x,y){ return {x:(x-offsetX)/scale, y:(y-offsetY)/scale}; }
function addObject(obj){
    layers[currentLayer].push(obj);
    undoStack.push({layer:currentLayer, obj:obj});
}
function undo(){
    if(undoStack.length===0) return;
    let last = undoStack.pop();
    layers[last.layer].pop();
    drawAll();
}

// ---------------- DIBUJO ----------------
function drawGrid(){
    ctx.save();
    ctx.strokeStyle="#D0D7DF";
    ctx.lineWidth=0.5;
    for(let x=-offsetX%gridSize; x<canvas.width/scale; x+=gridSize){
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height/scale); ctx.stroke();
    }
    for(let y=-offsetY%gridSize; y<canvas.height/scale; y+=gridSize){
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width/scale,y); ctx.stroke();
    }
    ctx.restore();
}

function drawAll(){
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.scale(scale,scale);
    ctx.translate(offsetX, offsetY);

    if(gridEnabled) drawGrid();

    for(let l in layers){
        if(!layerVisibility[l]) continue;
        for(let obj of layers[l]){
            ctx.strokeStyle=obj.color;
            ctx.fillStyle=obj.color;
            ctx.globalAlpha=obj.alpha;
            ctx.lineWidth=obj.lineWidth;

            ctx.beginPath();
            switch(obj.type){
                case "line": ctx.moveTo(obj.x1,obj.y1); ctx.lineTo(obj.x2,obj.y2); break;
                case "rect": ctx.rect(obj.x,obj.y,obj.w,obj.h); break;
                case "circle": ctx.arc(obj.x,obj.y,obj.r,0,Math.PI*2); break;
                case "ellipse": ctx.ellipse(obj.x,obj.y,obj.rx,obj.ry,0,0,2*Math.PI); break;
                case "triangle": ctx.moveTo(obj.x1,obj.y1); ctx.lineTo(obj.x2,obj.y2); ctx.lineTo(obj.x3,obj.y3); ctx.closePath(); break;
                case "arc": ctx.arc(obj.x,obj.y,obj.r,obj.startAngle,obj.endAngle); break;
                case "text": ctx.font="16px Consolas"; ctx.fillText(obj.text,obj.x,obj.y); break;
            }
            ctx.stroke();
        }
    }

    // polilínea temporal
    if(polyPoints.length>0){
        ctx.beginPath();
        ctx.moveTo(polyPoints[0].x, polyPoints[0].y);
        for(let p of polyPoints) ctx.lineTo(p.x,p.y);
        ctx.strokeStyle=color;
        ctx.lineWidth=lineWidth;
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
}

// ---------------- EXPORT ----------------
function exportPNG(){
    let dataURL = canvas.toDataURL("image/png");
    let a = document.createElement("a");
    a.href = dataURL;
    a.download = "osemiSCAD.png";
    a.click();
}

function exportSVG(){
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">`;
    for(let l in layers){
        if(!layerVisibility[l]) continue;
        for(let obj of layers[l]){
            switch(obj.type){
                case "line": svg += `<line x1="${obj.x1}" y1="${obj.y1}" x2="${obj.x2}" y2="${obj.y2}" stroke="${obj.color}" stroke-width="${obj.lineWidth}" />`; break;
                case "rect": svg += `<rect x="${obj.x}" y="${obj.y}" width="${obj.w}" height="${obj.h}" stroke="${obj.color}" stroke-width="${obj.lineWidth}" fill="none"/>`; break;
                case "circle": svg += `<circle cx="${obj.x}" cy="${obj.y}" r="${obj.r}" stroke="${obj.color}" stroke-width="${obj.lineWidth}" fill="none"/>`; break;
                case "ellipse": svg += `<ellipse cx="${obj.x}" cy="${obj.y}" rx="${obj.rx}" ry="${obj.ry}" stroke="${obj.color}" stroke-width="${obj.lineWidth}" fill="none"/>`; break;
                case "triangle": svg += `<polygon points="${obj.x1},${obj.y1} ${obj.x2},${obj.y2} ${obj.x3},${obj.y3}" stroke="${obj.color}" stroke-width="${obj.lineWidth}" fill="none"/>`; break;
                case "arc": svg += `<path d="M ${obj.x+obj.r},${obj.y} A ${obj.r},${obj.r} 0 0,1 ${obj.x-obj.r},${obj.y}" stroke="${obj.color}" stroke-width="${obj.lineWidth}" fill="none"/>`; break;
                case "text": svg += `<text x="${obj.x}" y="${obj.y}" fill="${obj.color}" font-family="Consolas">${obj.text}</text>`; break;
            }
        }
    }
    svg += "</svg>";
    let a = document.createElement("a");
    a.href = 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
    a.download = "osemiSCAD.svg";
    a.click();
}

// Inicializar
drawAll();
