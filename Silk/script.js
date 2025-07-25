const canvas = document.getElementById('silk-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let width = canvas.width;
let height = canvas.height;

function draw() {
    ctx.fillStyle = document.getElementById('color').value;
    ctx.fillRect(0, 0, width, height);

    ctx.filter = `url(#filter)`;
    ctx.drawImage(canvas, 0, 0, width, height);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    width = canvas.width;
    height = canvas.height;
    draw();
}

window.addEventListener('resize', resizeCanvas);

document.getElementById('demoBtn').addEventListener('click', () => {
    const demo = document.getElementById('demo');
    demo.classList.toggle('visible');
});

document.querySelectorAll('#config-panel input, #config-panel button').forEach(element => {
    element.addEventListener('input', draw);
});

draw();