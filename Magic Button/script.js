const canvas = document.getElementById('cursorCanvas');
const ctx = canvas.getContext('2d');
const button = document.getElementById('change-animation');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Mouse position and animations
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let currentAnimation = 0; // 0 to 4
let particles = [];
let pulseCircles = [];
let ripples = [];
let typingTrail = [];

// Background styles
const backgrounds = [
  "radial-gradient(circle at center, #2c3e50, #34495e)", // Modern dark
  "linear-gradient(90deg, #9b59b6, #8e44ad)", // Purple gradient
  "linear-gradient(45deg, #e67e22, #d35400)", // Warm orange
  "linear-gradient(135deg, #16a085, #1abc9c)", // Aqua green
  "linear-gradient(225deg, #3498db, #2980b9)", // Neon blue
];

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Update mouse position
window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

// Particle Class for dynamic effects
class Particle {
  constructor(x, y, hue, size = Math.random() * 5 + 3) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.hue = hue;
    this.alpha = 1; // Opacity
    this.decay = 0.02; // Decay rate
  }

  update() {
    this.alpha -= this.decay;
  }

  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

// Animation 1: Neon Follow Trail
function neonTrail() {
  particles.push(new Particle(mouse.x, mouse.y, Math.random() * 360, 6));

  particles.forEach((particle, index) => {
    particle.update();
    if (particle.alpha <= 0) particles.splice(index, 1);
    particle.draw();
  });
}

// Animation 2: Click Pulse
function clickPulse() {
  canvas.addEventListener('click', (e) => {
    pulseCircles.push({
      x: e.clientX,
      y: e.clientY,
      size: 1,
      maxSize: 100,
      opacity: 0.8,
      hue: Math.random() * 360,
    });
  });

  pulseCircles.forEach((circle, index) => {
    circle.size += 2;
    circle.opacity -= 0.02;

    if (circle.opacity <= 0) pulseCircles.splice(index, 1);

    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.size, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${circle.hue}, 100%, 50%, ${circle.opacity})`;
    ctx.lineWidth = 4;
    ctx.stroke();
  });
}

// Animation 3: Background Ripple
function backgroundRipple() {
  ripples.push({ x: mouse.x, y: mouse.y, radius: 1, alpha: 1, hue: 180 });

  ripples.forEach((ripple, index) => {
    ripple.radius += 2;
    ripple.alpha -= 0.02;

    if (ripple.alpha <= 0) ripples.splice(index, 1);

    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${ripple.hue}, 100%, 70%, ${ripple.alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

// Animation 4: Static Dotted Cursor
function staticDots() {
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
    const radius = 30;
    const x = mouse.x + Math.cos(angle) * radius;
    const y = mouse.y + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(200, 100%, 70%)`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "hsl(200, 100%, 70%)";
    ctx.fill();
  }
}

// Animation 5: Typing Effect
function typingEffect() {
  typingTrail.push(new Particle(mouse.x, mouse.y, 220, 10));
  particles.forEach((particle) => {
    ctx.font = "24px Arial";
    ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
    ctx.fillText("Type!", particle.x, particle.y);
  });

  typingTrail.forEach((particle, index) => {
    particle.update();
    if (particle.alpha <= 0) typingTrail.splice(index, 1);
    particle.draw();
  });
}

// Trigger animation
function triggerAnimation() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (currentAnimation === 0) neonTrail();
  else if (currentAnimation === 1) clickPulse();
  else if (currentAnimation === 2) backgroundRipple();
  else if (currentAnimation === 3) staticDots();
  else if (currentAnimation === 4) typingEffect();

  requestAnimationFrame(triggerAnimation);
}

// Change animation and background
button.addEventListener("click", () => {
  currentAnimation = (currentAnimation + 1) % 5;
  document.body.style.background = backgrounds[currentAnimation];
});

// Start the animations
triggerAnimation();
