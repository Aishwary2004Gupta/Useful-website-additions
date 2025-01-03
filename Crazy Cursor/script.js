const canvas = document.getElementById('cursorCanvas');
const ctx = canvas.getContext('2d');
const button = document.getElementById('btn');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let currentAnimation = 'default'; // Tracks the current animation
let animationTimeout = null;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Update mouse position
window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

let particles = [];

// Particle Class
class Particle {
  constructor(x, y, hue, shape) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 4 + 2;
    this.speedX = (Math.random() - 0.5) * 3;
    this.speedY = (Math.random() - 0.5) * 3;
    this.lifetime = 1;
    this.hue = hue;
    this.shape = shape;
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
    } else if (this.shape === 'square') {
      ctx.rect(this.x, this.y, this.size * 2, this.size * 2);
    } else if (this.shape === 'triangle') {
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.size, this.y + this.size * 2);
      ctx.lineTo(this.x - this.size, this.y + this.size * 2);
      ctx.closePath();
    }
    ctx.fill();
  }
}

function createParticles(amount, shape = 'circle') {
  for (let i = 0; i < amount; i++) {
    const hue = Math.random() * 360;
    const chosenShape =
      shape === 'random' ? ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] : shape;
    particles.push(new Particle(mouse.x, mouse.y, hue, chosenShape));
  }
}

// Animations
function defaultTrail() {
  createParticles(5);
}

function explosionEffect() {
  createParticles(50, 'random'); // Explosion burst of random shapes
}

function circleWaveEffect() {
  createParticles(30, 'circle'); // Circular wave effect
}

function zigzagTrail() {
  createParticles(10, 'triangle'); // Zig-zag effect using triangles
}

// Animation Switcher
function switchAnimation() {
  if (animationTimeout) clearTimeout(animationTimeout);

  if (currentAnimation === 'default') {
    currentAnimation = 'explosion';
    explosionEffect();
  } else if (currentAnimation === 'explosion') {
    currentAnimation = 'circleWave';
    circleWaveEffect();
  } else if (currentAnimation === 'circleWave') {
    currentAnimation = 'zigzagTrail';
  } else {
    currentAnimation = 'default';
  }

  animationTimeout = setTimeout(() => {
    currentAnimation = 'default';
  }, 2000);
}

// Main Animation Loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update particles
  particles.forEach((particle, index) => {
    particle.update();
    particle.draw();

    if (particle.lifetime <= 0) {
      particles.splice(index, 1);
    }
  });

  // Perform the current animation
  if (currentAnimation === 'default') {
    defaultTrail();
  } else if (currentAnimation === 'explosion') {
    explosionEffect();
  } else if (currentAnimation === 'circleWave') {
    circleWaveEffect();
  } else if (currentAnimation === 'zigzagTrail') {
    zigzagTrail();
  }

  requestAnimationFrame(animate);
}

// Button Click Listener
button.addEventListener('click', () => {
  switchAnimation();
});

// Start the animation loop
animate();
