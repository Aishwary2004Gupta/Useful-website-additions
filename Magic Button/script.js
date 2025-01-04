const canvas = document.getElementById('cursorCanvas');
const ctx = canvas.getContext('2d');
const button = document.getElementById('change-animation');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Mouse position and animation states
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let currentAnimation = 0; // Tracks the current animation (0 to 2)
let particles = [];
let neonTrail = []; // Array to store trail points for the neon effect

// Backgrounds for each animation
const backgrounds = [
  "linear-gradient(45deg, #16213e, #0f3460)", // Dark pink gradient
  "linear-gradient(45deg, #1a2a6c, #fdbb2d)", // Blue-yellow gradient
  "linear-gradient(45deg, rgb(55, 188, 224), rgb(39, 19, 14))", // Gray-brown gradient
];

// Resize event listener
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Update mouse position
window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

// Neon trail effect
function neonCursorTrail() {
  neonTrail.push({ x: mouse.x, y: mouse.y, alpha: 1 });

  // Remove excess points to keep the trail size consistent
  if (neonTrail.length > 20) neonTrail.shift();

  neonTrail.forEach((point, index) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2); // Draw the glowing point
    ctx.closePath();

    ctx.globalAlpha = point.alpha; // Adjust transparency for fading effect
    ctx.fillStyle = `hsl(300, 100%, 70%)`; // Purple neon color
    ctx.shadowBlur = 15;
    ctx.shadowColor = `hsl(300, 100%, 70%)`;
    ctx.fill();

    // Gradually reduce the alpha for the fading effect
    neonTrail[index].alpha -= 0.03;
  });
}

// Trigger animations based on the current animation
function triggerAnimation() {
  if (currentAnimation === 0) {
    createParticles(10, 'alphabet'); // Alphabet animation
  } else if (currentAnimation === 1) {
    createParticles(20, 'shape'); // Random shape animation
  } else {
    neonCursorTrail(); // Neon cursor trail animation
  }
}

// Particle Class
class Particle {
  constructor(x, y, hue, shape, letter = '') {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 4 + 2;
    this.speedX = (Math.random() - 0.5) * 3;
    this.speedY = (Math.random() - 0.5) * 3;
    this.lifetime = 1; // Lifetime for fading
    this.hue = hue; // Color hue
    this.shape = shape; // Shape type
    this.letter = letter; // Only used for the alphabet particle
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.lifetime -= 0.02;
  }

  draw() {
    ctx.globalAlpha = this.lifetime;
    ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;

    ctx.beginPath();
    if (this.shape === 'circle') {
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'square') {
      ctx.fillRect(this.x, this.y, this.size * 2, this.size * 2);
    } else if (this.shape === 'triangle') {
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.size, this.y + this.size * 2);
      ctx.lineTo(this.x - this.size, this.y + this.size * 2);
      ctx.closePath();
      ctx.fill();
    } else if (this.shape === 'letter') {
      ctx.font = `${this.size * 5}px Arial`;
      ctx.fillText(this.letter, this.x, this.y);
    }
  }
}

// Particle creation
function createParticles(amount, type) {
  for (let i = 0; i < amount; i++) {
    const hue = Math.random() * 360;
    const letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    particles.push(
      new Particle(
        mouse.x,
        mouse.y,
        hue,
        type === 'alphabet' ? 'letter' : ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)],
        letter
      )
    );
  }
}

// Main animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle, index) => {
    particle.update();
    particle.draw();

    if (particle.lifetime <= 0) {
      particles.splice(index, 1);
    }
  });

  triggerAnimation();
  requestAnimationFrame(animate);
}

// Switch animation and background
button.addEventListener('click', () => {
  currentAnimation = (currentAnimation + 1) % 3; // Cycle through animations (0, 1, 2)
  document.body.style.background = backgrounds[currentAnimation];
});

// Start animation
animate();
