let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let mouseMoved = false;

const params = {
    pointsNumber: 30,
    spring: 0.25,
    friction: 0.5,
    widthFactor: 0.6,
};

// Initialize trail points
const trail = new Array(params.pointsNumber).fill().map(() => ({
    x: pointer.x,
    y: pointer.y,
    dx: 0,
    dy: 0,
}));

// Handle actual user movement
function updateMousePosition(eX, eY) {
    pointer.x = eX;
    pointer.y = eY;
}

// When user moves the mouse for the first time
window.addEventListener("mousemove", (e) => {
    mouseMoved = true;
    updateMousePosition(e.pageX, e.pageY);
});
window.addEventListener("touchmove", (e) => {
    mouseMoved = true;
    updateMousePosition(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
});
window.addEventListener("click", (e) => {
    updateMousePosition(e.pageX, e.pageY);
});

// Resize canvas
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", setupCanvas);
setupCanvas();

// ---- RANDOM TRAIL MOTION ----
function randomMotion(t) {
    // Only applies if user hasn’t moved mouse yet
    if (!mouseMoved) {
        pointer.x =
            window.innerWidth / 2 +
            Math.sin(t * 0.001) * 200 +
            Math.cos(t * 0.003) * 100;
        pointer.y =
            window.innerHeight / 2 +
            Math.cos(t * 0.0015) * 150 +
            Math.sin(t * 0.0025) * 80;
    }
}

// ---- ANIMATION LOOP ----
function update(t) {
    randomMotion(t); // add automatic trail movement

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Smooth follow for trail points
    trail.forEach((p, i) => {
        const prev = i === 0 ? pointer : trail[i - 1];
        const spring = i === 0 ? 0.4 * params.spring : params.spring;
        p.dx += (prev.x - p.x) * spring;
        p.dy += (prev.y - p.y) * spring;
        p.dx *= params.friction;
        p.dy *= params.friction;
        p.x += p.dx;
        p.y += p.dy;
    });

    // Draw line
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);

    for (let i = 1; i < trail.length - 1; i++) {
        const xc = 0.5 * (trail[i].x + trail[i + 1].x);
        const yc = 0.5 * (trail[i].y + trail[i + 1].y);
        ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
        ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
        ctx.strokeStyle = `hsla(${(t / 10 + i * 10) % 360}, 80%, 60%, 0.8)`;
        ctx.stroke();
    }

    ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
    ctx.stroke();

    requestAnimationFrame(update);
}

update(0);
