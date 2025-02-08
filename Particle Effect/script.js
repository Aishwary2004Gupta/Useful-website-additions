// Set up canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializeParticles(); // Reinitialize particles on resize
});

// Create mouse object
const mouse = {
    x: undefined,
    y: undefined,
};

canvas.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Particle class
class Particle {
    constructor(x, y) {
        this.baseX = x;
        this.baseY = y;
        this.currX = x;
        this.currY = y;
        this.size = 5;
        this.color = 'white';
        this.dx = 0;
        this.dy = 0;
    }

    update() {
        // Get vectors and distances
        const vectorToMouse = [mouse.x - this.currX, mouse.y - this.currY];
        const vectorToBase = [this.baseX - this.currX, this.baseY - this.currY];
        const distanceToMouse = Math.sqrt(vectorToMouse[0] ** 2 + vectorToMouse[1] ** 2);
        const distanceToBase = Math.sqrt(vectorToBase[0] ** 2 + vectorToBase[1] ** 2);

        // Update velocity
        if (distanceToMouse < 50 && distanceToBase < 100) {
            this.dx = -vectorToMouse[0] / distanceToMouse;
            this.dy = -vectorToMouse[1] / distanceToMouse;
        } else if (distanceToBase > 1) {
            this.dx = vectorToBase[0] / distanceToBase * 0.05;
            this.dy = vectorToBase[1] / distanceToBase * 0.05;
        } else {
            this.dx = 0;
            this.dy = 0;
        }

        // Move particle
        this.currX += this.dx;
        this.currY += this.dy;

        // Update color based on distance to base
        const intensity = Math.max(0, 255 - Math.floor(distanceToBase) * 3);
        this.color = `rgb(${intensity}, ${intensity}, ${intensity})`;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.currX, this.currY, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

// Create particles
let particles = [];
function initializeParticles() {
    particles = [];
    const gridSize = 25;
    const particleSpacing = 15;
    const startX = canvas.width / 2 - (gridSize * particleSpacing) / 2;
    const startY = canvas.height / 2 - (gridSize * particleSpacing) / 2;

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            particles.push(new Particle(startX + i * particleSpacing, startY + j * particleSpacing));
        }
    }
}

// Main animation loop
function mainLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(mainLoop);
}

initializeParticles();
mainLoop();
