const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const maxParticles = 100;
const connectionDistance = 150;

// Particle constructor
class Particle {
  constructor(x, y, dx, dy, radius) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  }

  update() {
    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.dx = -this.dx;
    }
    if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
      this.dy = -this.dy;
    }

    this.x += this.dx;
    this.y += this.dy;
    this.draw();
  }
}

// Mouse tracking
const mouse = {
  x: null,
  y: null,
};

canvas.addEventListener('mousemove', (event) => {
  mouse.x = event.x;
  mouse.y = event.y;
});

// Initialize particles
function initParticles() {
  for (let i = 0; i < maxParticles; i++) {
    const radius = 5;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    const dx = (Math.random() - 0.5) * 2;
    const dy = (Math.random() - 0.5) * 2;

    particles.push(new Particle(x, y, dx, dy, radius));
  }
}

// Connect particles
function connectParticles() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < connectionDistance) {
        const opacity = 1 - distance / connectionDistance;
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
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

// Handle window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Start
initParticles();
animate();
