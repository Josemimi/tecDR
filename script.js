@import url('https://fonts.googleapis.com/css2?family=Consolas:wght@400;700&display=swap');

body {
    margin: 0;
    font-family: Consolas, monospace;
    display: flex;
    height: 100vh;
    background: #0A1A2F;
    color: white;
}

#sidebar {
    width: 260px;
    padding: 20px;
    background: #0A1A2F;
    border-right: 3px solid #14A5FF;
    overflow-y: auto;
}

#sidebar h1 {
    font-size: 22px;
    margin-top: 0;
    margin-bottom: 20px;
    text-align: center;
}

#sidebar .ultra {
    color: #14A5FF;
}

.block {
    margin-bottom: 25px;
    background: #112233;
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #143A66;
}

.block h3 {
    margin-top: 0;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #F2EFE9;
}

button {
    width: 100%;
    background: #14A5FF;
    border: none;
    padding: 8px;
    border-radius: 6px;
    color: #0A1A2F;
    font-weight: bold;
    margin-top: 5px;
    cursor: pointer;
    transition: 0.2s;
}

button:hover {
    background: #5bc6ff;
}

.undo {
    background: #F2EFE9 !important;
    color: #0A1A2F !important;
}

input, select {
    width: 100%;
    padding: 6px;
    margin-top: 5px;
    border: none;
    border-radius: 5px;
}

#canvas {
    flex: 1;
    background: white;
    display: block;
    cursor: crosshair;
}

