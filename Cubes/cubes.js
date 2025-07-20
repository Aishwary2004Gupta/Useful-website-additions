
/* ---------- CONFIG ---------- */
const GRID_SIZE = 8;
const IDLE_SPEED = 0.02;

const scene = document.getElementById("scene");
const cubes = [];
let userActive = false;
let idleTimer, simRAF;

/* ---------- Controls ---------- */
const panel = document.getElementById("panel");
const ui = {
  gridSize: panel.querySelector("#gridSize"),
  maxAngle: panel.querySelector("#maxAngle"),
  radius: panel.querySelector("#radius"),
  tiltDur: panel.querySelector("#tiltDur"),
  cubeDepth: panel.querySelector("#cubeDepth"),
  border: panel.querySelector("#borderStyle"),
};

/* 实时更新根变量 */
Object.keys(ui).forEach((k) => {
  ui[k].addEventListener("input", updateVars);
});
function updateVars() {
  document.documentElement.style.setProperty(
    "--grid-size",
    ui.gridSize.value
  );
  document.documentElement.style.setProperty(
    "--max-angle",
    ui.maxAngle.value
  );
  document.documentElement.style.setProperty("--radius", ui.radius.value);
  document.documentElement.style.setProperty(
    "--tilt-dur",
    ui.tiltDur.value + "ms"
  );
  document.documentElement.style.setProperty(
    "--cube-depth",
    ui.cubeDepth.value + "vmin"
  );
  document.documentElement.style.setProperty(
    "--border-style",
    ui.border.value
  );
  rebuildGrid(); // 重新绘制网格
}

/* ---------- dynamic grid ---------- */
function rebuildGrid() {
  scene.innerHTML = "";
  cubes.length = 0;
  const size = +getComputedStyle(
    document.documentElement
  ).getPropertyValue("--grid-size");
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cube = document.createElement("div");
      cube.className = "cube";
      cube.dataset.row = r;
      cube.dataset.col = c;

      ["front", "back", "left", "right", "top", "bottom"].forEach((f) => {
        const face = document.createElement("div");
        face.className = `cube-face cube-face--${f}`;
        cube.appendChild(face);
      });
      scene.appendChild(cube);
      cubes.push(cube);
    }
  }
}

/* ---------- helpers ---------- */
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- tilt + radius ---------- */
function tiltAt(rowCenter, colCenter) {
  const maxAngle = +getComputedStyle(
    document.documentElement
  ).getPropertyValue("--max-angle");
  const radius = +getComputedStyle(
    document.documentElement
  ).getPropertyValue("--radius");
  cubes.forEach((cube) => {
    const r = +cube.dataset.row;
    const c = +cube.dataset.col;
    const dist = Math.hypot(r - rowCenter, c - colCenter);
    const inside = dist <= radius;

    cube.classList.toggle("is-3d", inside);

    if (inside) {
      const pct = 1 - dist / radius;
      const angle = pct * maxAngle;
      cube.style.transform = `rotateX(${-angle}deg) rotateY(${angle}deg)`;
    } else {
      cube.style.transform = "";
    }
  });
}

/* ---------- RGB ripple ---------- */
function ripple(rx, ry) {
  const size = +getComputedStyle(
    document.documentElement
  ).getPropertyValue("--grid-size");
  const rowHit = Math.floor(ry);
  const colHit = Math.floor(rx);
  const speed = 1.2;

  const spreadDelay = 0.15 / speed;
  const animDur = 0.35 / speed;
  const hold = 0.6 / speed;

  const rings = {};
  cubes.forEach((cube) => {
    const r = +cube.dataset.row;
    const c = +cube.dataset.col;
    const dist = Math.hypot(r - rowHit, c - colHit);
    const ring = Math.round(dist);
    if (!rings[ring]) rings[ring] = [];
    rings[ring].push(...cube.querySelectorAll(".cube-face"));
  });

  Object.keys(rings)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((ring) => {
      const delay = ring * spreadDelay;
      const faces = rings[ring];
      const hue = (Date.now() / 5 + ring * 40) % 360;

      faces.forEach((f) => {
        f.style.transition = `background ${animDur}s ease-out ${delay}s`;
        f.style.background = `hsl(${hue},100%,60%)`;
      });
      setTimeout(() => {
        faces.forEach((f) => {
          f.style.transition = `background ${animDur}s ease-out`;
          f.style.background = "var(--cube-face-bg)";
        });
      }, (delay + animDur + hold) * 1000);
    });
}

/* ---------- events ---------- */
function onPointerMove(ev) {
  userActive = true;
  clearTimeout(idleTimer);
  const rect = scene.getBoundingClientRect();
  const size = +getComputedStyle(
    document.documentElement
  ).getPropertyValue("--grid-size");
  const cellW = rect.width / size;
  const cellH = rect.height / size;
  const colCenter = (ev.clientX - rect.left) / cellW;
  const rowCenter = (ev.clientY - rect.top) / cellH;
  tiltAt(rowCenter, colCenter);
  idleTimer = setTimeout(() => (userActive = false), 3000);
}

scene.addEventListener("pointermove", onPointerMove);
scene.addEventListener("pointerleave", () => tiltAt(-100, -100));
scene.addEventListener("click", (ev) => {
  const rect = scene.getBoundingClientRect();
  const size = +getComputedStyle(
    document.documentElement
  ).getPropertyValue("--grid-size");
  const col = (ev.clientX - rect.left) / (rect.width / size);
  const row = (ev.clientY - rect.top) / (rect.height / size);
  ripple(col, row);
});

/* ---------- idle auto-animation ---------- */
let simPos = {
  x: Math.random() * GRID_SIZE,
  y: Math.random() * GRID_SIZE,
};
let simTarget = {
  x: Math.random() * GRID_SIZE,
  y: Math.random() * GRID_SIZE,
};

function idleLoop() {
  if (!userActive) {
    const size = +getComputedStyle(
      document.documentElement
    ).getPropertyValue("--grid-size");
    simPos.x = lerp(simPos.x, simTarget.x, IDLE_SPEED);
    simPos.y = lerp(simPos.y, simTarget.y, IDLE_SPEED);
    tiltAt(simPos.y, simPos.x);
    if (
      Math.hypot(simPos.x - simTarget.x, simPos.y - simTarget.y) < 0.1
    ) {
      simTarget = { x: Math.random() * size, y: Math.random() * size };
    }
  }
  simRAF = requestAnimationFrame(idleLoop);
}

/* ---------- init ---------- */
rebuildGrid();
idleLoop();
