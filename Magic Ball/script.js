const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
const mouse = { x: undefined, y: undefined };

// Particle class
class Particle {
    constructor(x, y, radius, color, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.baseRadius = radius;
        this.color = color;
        this.speed = speed;
        this.velocityX = (Math.random() - 0.5) * speed;
        this.velocityY = (Math.random() - 0.5) * speed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Bounce off walls
        if (this.x < this.radius || this.x > canvas.width - this.radius) {
            this.velocityX = -this.velocityX;
        }
        if (this.y < this.radius || this.y > canvas.height - this.radius) {
            this.velocityY = -this.velocityY;
        }

        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
            this.radius = this.baseRadius + 3; // Grow near mouse
            this.velocityX += dx / distance * 0.05;
            this.velocityY += dy / distance * 0.05;
        } else {
            this.radius = this.baseRadius;
        }

        this.draw();
    }
}

// Generate particles
function init() {
    particles = [];
    for (let i = 0; i < 200; i++) {
        const radius = Math.random() * 3 + 1;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;
        const speed = Math.random() * 2 + 0.5;
        const color = `hsl(${Math.random() * 360}, 80%, 60%)`;

        particles.push(new Particle(x, y, radius, color, speed));
    }
}

// Connect particles
function connectParticles() {
    const maxDistance = 120;

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
                const opacity = 1 - distance / maxDistance;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}

// Animate particles
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => particle.update());
    connectParticles();

    requestAnimationFrame(animate);
}

// Update mouse position
canvas.addEventListener("mousemove", event => {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Handle screen resize
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

// Start
init();
animate();
