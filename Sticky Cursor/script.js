const canvas = document.getElementById('trailingCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

const particles = [];

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 1;
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3;
        this.lifetime = 1;
        this.hue = Math.random() * 360; // For rainbow effect
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.lifetime -= 0.02;
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = `hsl(${this.hue}, 100%, 50%, ${this.lifetime})`; // Add transparency
        ctx.lineWidth = this.size;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
    }
}

function createParticles() {
    particles.push(new Particle(mouse.x, mouse.y));
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Remove particles once lifetime ends
        if (particles[i].lifetime <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }

    createParticles();
    requestAnimationFrame(animate);
}

// Start animation loop
animate();
