/* ---------- 配置 ---------- */
const GRID_SIZE   = 8;
const RADIUS      = 4;
const MAX_ANGLE   = 60;
const RIPPLE_SPEED = 1.5;
const IDLE_SPEED   = 0.02;

const scene = document.getElementById('scene');
const cubes = [];
let userActive = false;
let idleTimer, simRAF;

/* 创建网格 */
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

/* 工具函数 */
const lerp = (a,b,t)=>a+(b-a)*t;

/* 倾斜逻辑（仅对命中立方体生效） */
function tiltAt(rowCenter,colCenter){
  cubes.forEach(cube=>{
    const r = +cube.dataset.row;
    const c = +cube.dataset.col;
    const dist = Math.hypot(r-rowCenter,c-colCenter);
    if (dist <= RADIUS){
      const pct = 1 - dist/RADIUS;
      const angle = pct * MAX_ANGLE;
      cube.style.transform = `rotateX(${-angle}deg) rotateY(${angle}deg)`;
    }else{
      cube.style.transform = '';
    }
  });
}

/* 点击涟漪 */
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

/* 扁平化所有立方体 */
function flattenAll(){
  cubes.forEach(c=>{
    c.classList.remove('is-3d');
    c.style.transform = '';
  });
}

/* 鼠标移动：仅把“当前立方体”变 3D */
scene.addEventListener('pointermove', e=>{
  userActive = true;
  clearTimeout(idleTimer);

  const rect = scene.getBoundingClientRect();
  const cellW = rect.width / GRID_SIZE;
  const cellH = rect.height / GRID_SIZE;
  const col = Math.floor((e.clientX - rect.left) / cellW);
  const row = Math.floor((e.clientY - rect.top) / cellH);
  const idx = row * GRID_SIZE + col;
  const targetCube = cubes[idx];
  if(!targetCube) return;

  flattenAll();
  targetCube.classList.add('is-3d');
  tiltAt(row + 0.5, col + 0.5);
  idleTimer = setTimeout(()=> userActive = false, 3000);
});

scene.addEventListener('pointerleave', flattenAll);
scene.addEventListener('click', e=>{
  const rect = scene.getBoundingClientRect();
  const col = Math.floor((e.clientX - rect.left) / (rect.width / GRID_SIZE));
  const row = Math.floor((e.clientY - rect.top) / (rect.height / GRID_SIZE));
  ripple(col, row);
});

/* 空闲自动动画 */
let simPos = {x:Math.random()*GRID_SIZE, y:Math.random()*GRID_SIZE};
let simTarget = {x:Math.random()*GRID_SIZE, y:Math.random()*GRID_SIZE};

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