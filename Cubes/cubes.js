/* CONFIG ---------------------------------------------------- */
const GRID_SIZE   = 8;
const RADIUS      = 4;
const MAX_ANGLE   = 60;
const RIPPLE_SPEED = 1.5;
const IDLE_SPEED   = 0.02;
/* ---------------------------------------------------------- */

const scene      = document.getElementById('scene');
const cubes      = [];
let userActive   = false;
let idleTimer;
let simRAF;

/* build the grid ------------------------------------------------*/
for (let r = 0; r < GRID_SIZE; r++) {
  for (let c = 0; c < GRID_SIZE; c++) {
    const cube = document.createElement('div');
    cube.className = 'cube';
    cube.dataset.row = r;
    cube.dataset.col = c;

    ['front','back','left','right','top','bottom']
      .forEach(f => {
        const face = document.createElement('div');
        face.className = `cube-face cube-face--${f}`;
        cube.appendChild(face);
      });

    scene.appendChild(cube);
    cubes.push(cube);
  }
}

/* math helpers ------------------------------------------------*/
const clamp = (v,min,max) => Math.min(max, Math.max(min, v));
const lerp  = (a,b,t)   => a + (b - a) * t;

/* tilt --------------------------------------------------------*/
function tiltAt(rowCenter, colCenter){
  cubes.forEach(cube=>{
    const r = +cube.dataset.row;
    const c = +cube.dataset.col;
    const dist = Math.hypot(r - rowCenter, c - colCenter);
    if (dist <= RADIUS){
      const pct  = 1 - dist / RADIUS;
      const angle = pct * MAX_ANGLE;
      cube.style.transform =
        `rotateX(${-angle}deg) rotateY(${angle}deg)`;
    }else{
      cube.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
  });
}

/* ripple ------------------------------------------------------*/
function ripple(rx, ry){
  const rowHit = Math.floor(ry);
  const colHit = Math.floor(rx);

  const spreadDelay = 0.15 / RIPPLE_SPEED;
  const animDur     = 0.3 / RIPPLE_SPEED;
  const hold        = 0.6 / RIPPLE_SPEED;

  const rings = {}; // ring index -> [faces...]

  cubes.forEach(cube=>{
    const r = +cube.dataset.row;
    const c = +cube.dataset.col;
    const dist = Math.hypot(r - rowHit, c - colHit);
    const ring = Math.round(dist);
    if (!rings[ring]) rings[ring] = [];
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

/* pointer events ---------------------------------------------*/
function onPointerMove(ev){
  userActive = true;
  clearTimeout(idleTimer);

  const rect = scene.getBoundingClientRect();
  const cellW = rect.width / GRID_SIZE;
  const cellH = rect.height / GRID_SIZE;
  const colCenter = (ev.clientX - rect.left) / cellW;
  const rowCenter = (ev.clientY - rect.top) / cellH;
  tiltAt(rowCenter, colCenter);

  idleTimer = setTimeout(()=> userActive = false , 3000);
}
function onPointerLeave(){ resetAll(); }
function onClick(ev){
  const rect = scene.getBoundingClientRect();
  const cellW = rect.width / GRID_SIZE;
  const cellH = rect.height / GRID_SIZE;
  const col = (ev.clientX - rect.left) / cellW;
  const row = (ev.clientY - rect.top) / cellH;
  ripple(col, row);
}
function resetAll(){
  cubes.forEach(cube=> cube.style.transform = '' );
}

scene.addEventListener('pointermove', onPointerMove);
scene.addEventListener('pointerleave', onPointerLeave);
scene.addEventListener('click', onClick);

/* idle auto-animation ----------------------------------------*/
let simPos   = {x:Math.random()*GRID_SIZE, y:Math.random()*GRID_SIZE};
let simTarget= {x:Math.random()*GRID_SIZE, y:Math.random()*GRID_SIZE};

function idleLoop(){
  if (!userActive){
    simPos.x = lerp(simPos.x, simTarget.x, IDLE_SPEED);
    simPos.y = lerp(simPos.y, simTarget.y, IDLE_SPEED);
    tiltAt(simPos.y, simPos.x);

    if (Math.hypot(simPos.x - simTarget.x, simPos.y - simTarget.y) < 0.1){
      simTarget = {x:Math.random()*GRID_SIZE, y:Math.random()*GRID_SIZE};
    }
  }
  simRAF = requestAnimationFrame(idleLoop);
}
idleLoop();