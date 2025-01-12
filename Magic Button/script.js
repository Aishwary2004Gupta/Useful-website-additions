const canvas = document.getElementById("cursorCanvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById("change-animation");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Global variables
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let particles = [];
let currentAnimation = 0;
let swirlAngle = 0;
let maxParticles = 150; // Limit the number of particles for performance

// Update canvas size dynamically on resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Track mouse movements
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Particle class
class Particle {
  constructor(x, y, size = 5, hue = 180, alpha = 1, decay = 0.02) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.hue = hue;
    this.alpha = alpha;
    this.decay = decay;
  }

  update() {
    this.alpha -= this.decay; // Fade effect
  }

  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Common particle handler
function addParticle(hueVariation = 50, size = 4, decay = 0.02) {
  if (particles.length > maxParticles) particles.shift(); // Remove oldest particle
  const hue = Math.random() * hueVariation + currentAnimation * 40; // Vary based on animation
  particles.push(new Particle(mouse.x, mouse.y, size, hue, 1, decay));
}

// Individual effects
const effects = [
  // Swirl effect
  () => {
    swirlAngle += 0.1;
    for (let i = 0; i < 10; i++) {
      const angle = swirlAngle + (i * Math.PI * 2) / 10;
      const x = mouse.x + Math.cos(angle) * 20;
      const y = mouse.y + Math.sin(angle) * 20;
      particles.push(new Particle(x, y, 4, Math.random() * 360, 0.8, 0.03));
    }
  },
  // Flashlight effect
  () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  },
  // Distort effect
  () => addParticle(Math.random() * 360, 10, 0.03),
  // Dot cursor effect
  () => {
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(220, 100%, 60%)";
    ctx.fill();
  },
  // Following cursor particles
  () => addParticle(50, 6),
  // Text cursor
  () => {
    ctx.font = "20px Arial";
    ctx.fillStyle = "hsl(60, 100%, 50%)";
    ctx.fillText("Hello!", mouse.x + 10, mouse.y - 10);
  },
  // Arrow cursor
  () => {
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
    ctx.lineTo(mouse.x - 10, mouse.y + 20);
    ctx.lineTo(mouse.x + 10, mouse.y + 20);
    ctx.closePath();
    ctx.fillStyle = "hsl(300, 100%, 60%)";
    ctx.fill();
  },
  // Blur effect
  () => {
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 40, 0, Math.PI * 2);
    ctx.fill();
  },
];

// Draw and update particles
function drawParticles() {
  particles.forEach((particle, index) => {
    particle.update();
    if (particle.alpha <= 0) particles.splice(index, 1); // Remove faded particles
    else particle.draw();
  });
}

// Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effects[currentAnimation]();
  drawParticles();
  requestAnimationFrame(animate);
}

// Change animation on button click
button.addEventListener("click", () => {
  currentAnimation = (currentAnimation + 1) % effects.length;
  particles = []; // Clear particles for a fresh start
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Start animation
animate();
