const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

// ===== Pointer motion logic (from first code) =====
let mouseMoved = false;
const pointer = {
  x: 0.5 * window.innerWidth,
  y: 0.5 * window.innerHeight,
};

const params = {
  pointsNumber: 40,
  widthFactor: 0.3,
  mouseThreshold: 0.6,
  spring: 0.4,
  friction: 0.5,
};

const trail = new Array(params.pointsNumber).fill().map(() => ({
  x: pointer.x,
  y: pointer.y,
  dx: 0,
  dy: 0,
}));

window.addEventListener("mousemove", (e) => {
  mouseMoved = true;
  updateMousePosition(e.pageX, e.pageY);
});
window.addEventListener("touchmove", (e) => {
  mouseMoved = true;
  updateMousePosition(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
});

function updateMousePosition(eX, eY) {
  pointer.x = eX;
  pointer.y = eY;
}

function updateTrail(t) {
  if (!mouseMoved) {
    pointer.x =
      (0.5 + 0.2 * Math.cos(0.002 * t) * Math.sin(0.005 * t)) *
      window.innerWidth;
    pointer.y =
      (0.5 +
        0.3 * Math.cos(0.005 * t) +
        0.1 * Math.cos(0.01 * t)) *
      window.innerHeight;
  }

  trail.forEach((p, i) => {
    const prev = i === 0 ? pointer : trail[i - 1];
    const spring = i === 0 ? 0.4 * params.spring : params.spring;
    p.dx += (prev.x - p.x) * spring;
    p.dy += (prev.y - p.y) * spring;
    p.dx *= params.friction;
    p.dy *= params.friction;
    p.x += p.dx;
    p.y += p.dy;
  });
}

// ===== Wave line logic (second code adapted) =====
let lines = [];
let pos = { x: pointer.x, y: pointer.y };
let E = {
  friction: 0.5,
  trails: 15,
  size: 40,
  dampening: 0.25,
  tension: 0.98,
};

function Node() {
  this.x = 0;
  this.y = 0;
  this.vx = 0;
  this.vy = 0;
}

function Line(spring) {
  this.spring = spring;
  this.friction = E.friction;
  this.nodes = Array.from({ length: E.size }, () => new Node());
  this.nodes.forEach((n) => {
    n.x = pos.x;
    n.y = pos.y;
  });
}

Line.prototype.update = function () {
  let e = this.spring;
  let t = this.nodes[0];
  t.vx += (pos.x - t.x) * e;
  t.vy += (pos.y - t.y) * e;

  for (let i = 0; i < this.nodes.length; i++) {
    let p = this.nodes[i];
    if (i > 0) {
      const prev = this.nodes[i - 1];
      p.vx += (prev.x - p.x) * e;
      p.vy += (prev.y - p.y) * e;
      p.vx += prev.vx * E.dampening;
      p.vy += prev.vy * E.dampening;
    }
    p.vx *= this.friction;
    p.vy *= this.friction;
    p.x += p.vx;
    p.y += p.vy;
    e *= E.tension;
  }
};

Line.prototype.draw = function () {
  ctx.beginPath();
  ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
  for (let i = 1; i < this.nodes.length - 1; i++) {
    const xc = 0.5 * (this.nodes[i].x + this.nodes[i + 1].x);
    const yc = 0.5 * (this.nodes[i].y + this.nodes[i + 1].y);
    ctx.quadraticCurveTo(this.nodes[i].x, this.nodes[i].y, xc, yc);
  }
  ctx.stroke();
  ctx.closePath();
};

// ===== Render loop =====
function render(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateTrail(t);
  pos.x = trail[trail.length - 1].x;
  pos.y = trail[trail.length - 1].y;

  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 2;
  for (let line of lines) {
    line.update();
    line.draw();
  }

  requestAnimationFrame(render);
}

function setup() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  lines = [];
  for (let i = 0; i < E.trails; i++) {
    lines.push(new Line(0.4 + (i / E.trails) * 0.025));
  }
  render(0);
}

window.addEventListener("resize", setup);
setup();
