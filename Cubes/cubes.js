/* ---------- CONFIG ---------- */
const GRID_SIZE   = 8;
const RADIUS      = 4;
const MAX_ANGLE   = 60;
const RIPPLE_SPEED = 1.5;
const IDLE_SPEED   = 0.02;

const scene = document.getElementById('scene');
const cubes = [];
let userActive = false;
let idleTimer, simRAF;

/* ---------- build grid ---------- */
for (let r = 0; r < GRID_SIZE; r++) {
  for (let c = 0; c < GRID_SIZE; c++) {
    const cube = document.createElement('div');
    cube.className = 'cube';
    cube.dataset.row = r;
    cube.dataset.col = c;

    ['front','back','left','right','top','bottom'].forEach(f=>{
      const face = document.createElement('div');
      face.className = `cube-face cube-face--${f}`;
      cube.appendChild(face);
    });
    scene.appendChild(cube);
    cubes.push(cube);
  }
}

/* ---------- helpers ---------- */
const lerp = (a,b,t)=>a+(b-a)*t;

/* ---------- tilt + 3-D radius ---------- */
function tiltAt(rowCenter,colCenter){
  cubes.forEach(cube=>{
    const r = +cube.dataset.row;
    const c = +cube.dataset.col;
    const dist = Math.hypot(r-rowCenter,c-colCenter);
    const inside = dist <= RADIUS;

    // smooth 2D⇄3D
    cube.classList.toggle('is-3d', inside);

    // tilt only if inside radius
    if (inside){
      const pct = 1 - dist/RADIUS;
      const angle = pct * MAX_ANGLE;
      cube.style.transform = `rotateX(${-angle}deg) rotateY(${angle}deg)`;
    }else{
      cube.style.transform = '';
    }
  });
}

/* ---------- ripple ---------- */
function ripple(rx,ry){
  const rowHit = Math.floor(ry);
  const colHit = Math.floor(rx);
  const spreadDelay = 0.15 / RIPPLE_SPEED;
  const animDur     = 0.3 / RIPPLE_SPEED;
  const hold        = 0.6 / RIPPLE_SPEED;

  const rings = {};
  cubes.forEach(cube=>{
    const r = +cube.dataset.row;
    const c = +cube.dataset.col;
    const dist = Math.hypot(r-rowHit,c-colHit);
    const ring = Math.round(dist);
    if(!rings[ring]) rings[ring]=[];
    rings[ring].push(...cube.querySelectorAll('.cube-face'));
  });

  Object.keys(rings).map(Number).sort((a,b)=>a-b).forEach(ring=>{
    const delay = ring * spreadDelay;
    const faces = rings[ring];
    faces.forEach(f=>{
      f.style.transition = `background ${animDur}s ease-out ${delay}s`;
      f.style.background = 'var(--ripple-color)';
    });
    setTimeout(()=>{
      faces.forEach(f=>{
        f.style.transition = `background ${animDur}s ease-out`;
        f.style.background = 'var(--cube-face-bg)';
      });
    }, (delay + animDur + hold) * 1000);
  });
}

/* ---------- pointer events ---------- */
function onPointerMove(ev){
  userActive = true;
  clearTimeout(idleTimer);

  const rect = scene.getBoundingClientRect();
  const cellW = rect.width / GRID_SIZE;
  const cellH = rect.height / GRID_SIZE;
  const colCenter = (ev.clientX - rect.left) / cellW;
  const rowCenter = (ev.clientY - rect.top) / cellH;
  tiltAt(rowCenter, colCenter);
  idleTimer = setTimeout(()=> userActive = false, 3000);
}

scene.addEventListener('pointermove', onPointerMove);
scene.addEventListener('pointerleave', ()=> tiltAt(-100,-100)); // all outside radius → 2-D
scene.addEventListener('click', ev=>{
  const rect = scene.getBoundingClientRect();
  const col = (ev.clientX - rect.left) / (rect.width / GRID_SIZE);
  const row = (ev.clientY - rect.top) / (rect.height / GRID_SIZE);
  ripple(col, row);
});

/* ---------- idle auto-animation ---------- */
let simPos   = {x:Math.random()*GRID_SIZE, y:Math.random()*GRID_SIZE};
let simTarget= {x:Math.random()*GRID_SIZE, y:Math.random()*GRID_SIZE};

function idleLoop(){
  if(!userActive){
    simPos.x = lerp(simPos.x, simTarget.x, IDLE_SPEED);
    simPos.y = lerp(simPos.y, simTarget.y, IDLE_SPEED);
    tiltAt(simPos.y, simPos.x);
    if(Math.hypot(simPos.x - simTarget.x, simPos.y - simTarget.y) < 0.1){
      simTarget = {x:Math.random()*GRID_SIZE, y:Math.random()*GRID_SIZE};
    }
  }
  simRAF = requestAnimationFrame(idleLoop);
}
idleLoop();