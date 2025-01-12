const canvas = document.getElementById("cursorCanvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById("change-animation");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Global Variables
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let particles = [];
let currentAnimation = 0;
let swirlAngle = 0;
const textCursorContent = "Hello!";
let spotlightRadius = 150;

// Update canvas size on window resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Update mouse position
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Particle Class
class Particle {
  constructor(x, y, hue, size = 5, alpha = 1, decay = 0.02) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.hue = hue;
    this.alpha = alpha;
    this.decay = decay;
  }

  update() {
    this.alpha -= this.decay;
  }

  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Swirl Cursor Effect
function swirlEffect() {
  swirlAngle += 0.1;
  for (let i = 0; i < 10; i++) {
    const angle = swirlAngle + (i * Math.PI * 2) / 10;
    const x = mouse.x + Math.cos(angle) * 50;
    const y = mouse.y + Math.sin(angle) * 50;
    particles.push(new Particle(x, y, Math.random() * 360, 4));
  }
  drawParticles();
}

// Flashlight Cursor Effect
function flashlightEffect() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, spotlightRadius, 0, Math.PI * 2);
  ctx.fill();
}

// Distort Cursor Effect
function distortEffect() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.push(new Particle(mouse.x, mouse.y, Math.random() * 360, 10, 0.5, 0.03));
  drawParticles();
}

// Dot Cursor Effect
function dotEffect() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = "hsl(220, 100%, 60%)";
  ctx.fill();
}

// Following Cursor Effect
function followingCursorEffect() {
  particles.push(new Particle(mouse.x, mouse.y, 180, 5, 1, 0.02));
  drawParticles();
}

// Text Cursor Effect
function textCursorEffect() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "20px Arial";
  ctx.fillStyle = "hsl(60, 100%, 50%)";
  ctx.fillText(textCursorContent, mouse.x + 10, mouse.y - 10);
}

// Arrow Cursor Effect
function arrowEffect() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(mouse.x, mouse.y);
  ctx.lineTo(mouse.x - 10, mouse.y + 25);
  ctx.lineTo(mouse.x + 10, mouse.y + 25);
  ctx.closePath();
  ctx.fillStyle = "hsl(300, 100%, 60%)";
  ctx.fill();
}

// Blur Cursor Effect
function blurEffect() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 40, 0, Math.PI * 2);
  ctx.fill();
}

// Draw Particles
function drawParticles() {
  particles.forEach((particle, index) => {
    particle.update();
    if (particle.alpha <= 0) particles.splice(index, 1);
    particle.draw();
  });
}

// Trigger Animations
function animate() {
  if (currentAnimation === 0) swirlEffect();
  else if (currentAnimation === 1) flashlightEffect();
  else if (currentAnimation === 2) distortEffect();
  else if (currentAnimation === 3) dotEffect();
  else if (currentAnimation === 4) followingCursorEffect();
  else if (currentAnimation === 5) textCursorEffect();
  else if (currentAnimation === 6) arrowEffect();
  else if (currentAnimation === 7) blurEffect();
  requestAnimationFrame(animate);
}

// Switch Animation
button.addEventListener("click", () => {
  currentAnimation = (currentAnimation + 1) % 8;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = [];
});


animate();