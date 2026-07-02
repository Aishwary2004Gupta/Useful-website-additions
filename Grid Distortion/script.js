import * as THREE from 'https://unpkg.com/three@0.155.0/build/three.module.js';

const textContainer = document.getElementById("textContainer");
const fontLabel = document.getElementById("fontName");

/* =======================
   STATE
======================= */
let scene, camera, renderer, planeMesh;
let easeFactor = 0.02;

let mousePosition = { x: 0.5, y: 0.5 };
let targetMousePosition = { x: 0.5, y: 0.5 };
let prevPosition = { x: 0.5, y: 0.5 };

/* =======================
   SHADERS
======================= */
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/* Modified fragment shader: use adaptive cell count (u_cellCount) and center calculation */
const fragmentShader = `
varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec2 u_mouse;
uniform vec2 u_prevMouse;
uniform float u_cellCount;

void main() {
  vec2 gridUV = floor(vUv * u_cellCount) / u_cellCount;
  vec2 center = gridUV + vec2(0.5) / u_cellCount;

  vec2 mouseDir = u_mouse - u_prevMouse;
  float dist = length(center - u_mouse);
  float strength = smoothstep(0.3, 0.0, dist);

  vec2 uvOffset = strength * -mouseDir * 0.4;
  gl_FragColor = texture2D(u_texture, vUv - uvOffset);
}
`;

/* =======================
   ⚡ FAST FONT LOADER
======================= */
const loadedFonts = new Set();

/**
 * Load a Google Font by injecting its stylesheet and waiting for the font to be available.
 * Adds a timeout so a missing font won't block the app indefinitely.
 */
async function loadAnyGoogleFont(fontName, timeout = 5000) {
  if (loadedFonts.has(fontName)) return;

  const id = "gf-" + fontName.replace(/\s+/g, "-");
  if (!document.getElementById(id)) {
    const url =
      "https://fonts.googleapis.com/css2?family=" +
      fontName.replace(/\s+/g, "+") +
      "&display=swap";

    // Request the font ASAP using preload and swap to stylesheet on load.
    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "style";
    preload.href = url;
    preload.crossOrigin = "anonymous";
    document.head.appendChild(preload);

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = url;
    link.crossOrigin = "anonymous";
    // Prevent render-blocking until it's loaded
    link.media = "print";
    link.onload = () => {
      link.media = "all";
    };
    document.head.appendChild(link);

    // Fallback for no-JS
    const noscript = document.createElement("noscript");
    noscript.innerHTML = `<link rel="stylesheet" href="${url}">`;
    document.head.appendChild(noscript);
  }

  try {
    // Wait for this specific font to be available, but don't wait forever.
    await Promise.race([
      (async () => {
        await document.fonts.load(`16px "${fontName}"`);
        await document.fonts.ready;
      })(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("font load timeout")), timeout)
      ),
    ]);
  } catch (err) {
    console.warn(`Font "${fontName}" failed to load within ${timeout}ms:`, err);
  }

  // Mark as attempted so we don't keep retrying forever.
  loadedFonts.add(fontName);
}

/* 🔥 Warm preload (returns a promise that resolves when all requested fonts finish attempting to load) */
function preloadFontsInBackground(fonts, delay = 0) {
  if (delay > 0) {
    // Staggered load with delays
    return Promise.all(
      fonts.map(
        (font, i) =>
          new Promise((resolve) =>
            setTimeout(() => loadAnyGoogleFont(font).finally(resolve), i * delay)
          )
      )
    );
  } else {
    // Load in parallel and wait for completion
    return Promise.all(fonts.map((font) => loadAnyGoogleFont(font)));
  }
}

/* =======================
   CANVAS TEXTURE
======================= */
function createTextTexture(text, font) {
  // Clamp DPR so mobile devices don't create enormous textures
  const dpr = Math.min(Math.max(1, window.devicePixelRatio), 2);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // font sizing responsive to both width and height so it looks good on tall phones
  let fontSize = Math.min(canvas.width * 0.12, canvas.height * 0.18);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = `100 ${fontSize}px "${font}"`;
  while (ctx.measureText(text).width > canvas.width * 0.8) {
    fontSize *= 0.95;
    ctx.font = `100 ${fontSize}px "${font}"`;
  }

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#111";
  ctx.lineWidth = fontSize * 0.02;

  // Keep text crisp
  if (ctx.imageSmoothingEnabled !== undefined) ctx.imageSmoothingEnabled = false;

  ctx.strokeText(text, 0, 0);
  ctx.fillText(text, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/* =======================
   FONT LIST
======================= */
const fonts = [
  "Asset",
  "Sekuya",
  "Bungee Shade",
  "Nosifer",
  "Monoton",
  "Eater",
  "Rubik Glitch",
  "Rubik Glitch Pop",
  "Bungee",
  "Black Ops One",
  "Mountains of Christmas",
  "Faster One",
  "Orbitron",
  "Luckiest Guy",
  "Rubik Gemstones",
  "BBH Bartle",
];

let currentFontIndex = 0;

/* =======================
   SCENE
======================= */

/* helper: pick sensible cell count based on width */
function computeCellCount() {
  // Fewer cells on small screens for more visible distortion; more on large screens.
  return Math.max(12, Math.round(window.innerWidth / 20));
}

function initScene(texture) {
  scene = new THREE.Scene();

  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera(
    -1, 1,
    1 / aspect,
    -1 / aspect,
    0.1,
    10
  );
  camera.position.z = 1;

  planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: {
        u_mouse: { value: new THREE.Vector2() },
        u_prevMouse: { value: new THREE.Vector2() },
        u_texture: { value: texture },
        u_cellCount: { value: computeCellCount() }
      },
      vertexShader,
      fragmentShader
    })
  );

  scene.add(planeMesh);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Ensure clear color is white so the whole page stays white even if something doesn't cover it.
  renderer.setClearColor(0xffffff, 1);
  renderer.domElement.style.backgroundColor = "#ffffff";

  textContainer.appendChild(renderer.domElement);
}

/* =======================
   CHANGE FONT (USER ONLY)
======================= */
async function changeFont(step = 1) {
  currentFontIndex =
    (currentFontIndex + step + fonts.length) % fonts.length;

  const fontName = fonts[currentFontIndex];
  fontLabel.textContent = fontName;

  await loadAnyGoogleFont(fontName);

  const oldTex = planeMesh.material.uniforms.u_texture.value;
  oldTex.dispose();

  planeMesh.material.uniforms.u_texture.value =
    createTextTexture("Distort", fontName);
}

/* =======================
   RENDER LOOP
======================= */
function animate() {
  requestAnimationFrame(animate);

  mousePosition.x += (targetMousePosition.x - mousePosition.x) * easeFactor;
  mousePosition.y += (targetMousePosition.y - mousePosition.y) * easeFactor;

  planeMesh.material.uniforms.u_mouse.value.set(
    mousePosition.x,
    1 - mousePosition.y
  );
  planeMesh.material.uniforms.u_prevMouse.value.set(
    prevPosition.x,
    1 - prevPosition.y
  );

  renderer.render(scene, camera);
}

/* =======================
   EVENTS (DESKTOP + MOBILE)
======================= */

/* Replace mousemove with pointermove which works for mouse/touch/pen */
textContainer.addEventListener("pointermove", e => {
  easeFactor = 0.035;
  const r = textContainer.getBoundingClientRect();
  prevPosition = { ...targetMousePosition };
  targetMousePosition.x = (e.clientX - r.left) / r.width;
  targetMousePosition.y = (e.clientY - r.top) / r.height;
});

/* Touch handlers: update positions and prevent default scrolling (body overflow is hidden but safer) */
/* Add double-tap detection and prevent single-tap from changing font */
let _touchStartPos = null;
let _touchMoved = false;
let _lastTapTime = 0;
let _lastTapPos = { x: 0, y: 0 };
const DOUBLE_TAP_DELAY = 350; // ms
const DOUBLE_TAP_MAX_DIST = 30; // px

textContainer.addEventListener("touchstart", e => {
  const t = e.touches[0];
  if (!t) return;
  // mark potential tap start
  _touchStartPos = { x: t.clientX, y: t.clientY };
  _touchMoved = false;

  e.preventDefault();
  easeFactor = 0.045;
  const r = textContainer.getBoundingClientRect();
  prevPosition = { ...targetMousePosition };
  targetMousePosition.x = (t.clientX - r.left) / r.width;
  targetMousePosition.y = (t.clientY - r.top) / r.height;
});

textContainer.addEventListener("touchmove", e => {
  const t = e.touches[0];
  if (!t) return;
  const dx = t.clientX - (_touchStartPos ? _touchStartPos.x : t.clientX);
  const dy = t.clientY - (_touchStartPos ? _touchStartPos.y : t.clientY);
  if (Math.hypot(dx, dy) > 8) _touchMoved = true; // small threshold to cancel tap
  e.preventDefault();
  easeFactor = 0.03;
  const r = textContainer.getBoundingClientRect();
  prevPosition = { ...targetMousePosition };
  targetMousePosition.x = (t.clientX - r.left) / r.width;
  targetMousePosition.y = (t.clientY - r.top) / r.height;
});

textContainer.addEventListener("touchend", e => {
  // Only consider quick taps (no move). Use changedTouches to get the ended touch.
  const t = e.changedTouches && e.changedTouches[0];
  if (!t) return;
  if (_touchMoved) {
    _touchMoved = false;
    _touchStartPos = null;
    return;
  }

  const now = Date.now();
  const tapPos = { x: t.clientX, y: t.clientY };
  const dt = now - _lastTapTime;
  const dist = Math.hypot(tapPos.x - _lastTapPos.x, tapPos.y - _lastTapPos.y);

  if (dt <= DOUBLE_TAP_DELAY && dist <= DOUBLE_TAP_MAX_DIST) {
    // Double-tap detected -> change font
    changeFont(1);
    _lastTapTime = 0;
    _lastTapPos = { x: 0, y: 0 };
  } else {
    // Store this tap as a candidate for a second tap
    _lastTapTime = now;
    _lastTapPos = tapPos;
  }

  _touchStartPos = null;
});

window.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    changeFont(1);
  }
});

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  if (planeMesh && planeMesh.material && planeMesh.material.uniforms.u_cellCount) {
    planeMesh.material.uniforms.u_cellCount.value = computeCellCount();
  }
  changeFont(0); // regenerate texture to match new size
});

/* =======================
   START
======================= */
(async () => {
  fontLabel.textContent = fonts[0];

  // Load first font immediately and ensure it's ready (so the initial canvas uses the correct font)
  await loadAnyGoogleFont(fonts[0]);

  // No-delay warm-preload of remaining fonts (start immediately and wait for them)
  await preloadFontsInBackground(fonts.slice(1), 0);

  // Initialize the scene now that font preloads have been attempted
  initScene(createTextTexture("Distort", fonts[0]));
  animate();

  // Warm-preload finished
})();
