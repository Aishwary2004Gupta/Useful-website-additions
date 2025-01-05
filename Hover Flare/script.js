const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");
const modeSwitch = document.getElementById("modeSwitch");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
const mouse = { x: undefined, y: undefined };
let theme = "light"; // Set the default theme to "light"

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
            this.radius = this.baseRadius + 15; // Larger growth
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
        const color =
            theme === "dark"
                ? `hsl(${Math.random() * 360}, 80%, 60%)`
                : `rgba(0, 0, 0, ${Math.random() * 0.7 + 0.3})`;

        particles.push(new Particle(x, y, radius, color, speed));
    }
}

// Connect particles (optional visual effect)
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
                ctx.strokeStyle =
                    theme === "dark"
                        ? `rgba(255, 255, 255, ${opacity})`
                        : `rgba(0, 0, 0, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => particle.update());
    connectParticles();
    requestAnimationFrame(animate);
}

// Update mouse position
canvas.addEventListener("mousemove", (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Handle screen resize
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

// Toggle theme
modeSwitch.addEventListener("change", () => {
    theme = modeSwitch.checked ? "light" : "dark";
    canvas.style.background = theme === "dark" ? "#141e30" : "#e4e5e6";
    init(); // Reinitialize with updated colors
});

// Ensure default light mode is applied on load
function applyDefaultLightMode() {
    canvas.style.background = "#e4e5e6"; // Light mode background
    modeSwitch.checked = true; // Set toggle to light mode
}

// Initialize animation
applyDefaultLightMode();
init();
animate();
