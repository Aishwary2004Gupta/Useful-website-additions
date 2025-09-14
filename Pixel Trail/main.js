import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.156/build/three.module.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.156/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.156/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://cdn.jsdelivr.net/npm/three@0.156/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "https://cdn.jsdelivr.net/npm/three@0.156/examples/jsm/shaders/FXAAShader.js";

// Gooey shader (like reactbits.dev)
const GooeyShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 15.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    varying vec2 vUv;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float alpha = smoothstep(0.5, 0.8, color.a * amount);
      gl_FragColor = vec4(color.rgb, alpha);
    }
  `
};

const container = document.getElementById("scene-container");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Particles
let particles = [];
const trail = [];
let gridSize = 50, trailSize = 10, maxAge = 250, color = "#ffffff";

// Postprocessing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const gooeyPass = new ShaderPass(GooeyShader);
composer.addPass(gooeyPass);
const fxaaPass = new ShaderPass(FXAAShader);
composer.addPass(fxaaPass);

// Mouse tracking
let mouse = new THREE.Vector2(-100, -100);
container.addEventListener("mousemove", (e) => {
  const rect = container.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  trail.push({ x: mouse.x * rect.width / 2, y: mouse.y * rect.height / 2, time: Date.now() });
});
container.addEventListener("mouseleave", () => { mouse.set(-100, -100); });

// Particles (grid points)
function createParticles() {
  particles.forEach(p => scene.remove(p));
  particles = [];

  const cols = Math.floor(container.clientWidth / gridSize);
  const rows = Math.floor(container.clientHeight / gridSize);

  const geo = new THREE.CircleGeometry(2, 16);
  const mat = new THREE.MeshBasicMaterial({ color });

  for (let y = -rows / 2; y < rows / 2; y++) {
    for (let x = -cols / 2; x < cols / 2; x++) {
      const mesh = new THREE.Mesh(geo, mat.clone());
      mesh.position.set(x * gridSize, y * gridSize, 0);
      mesh.scale.set(0, 0, 0);
      scene.add(mesh);
      particles.push(mesh);
    }
  }
}
createParticles();

// Animation loop
function animate() {
  const now = Date.now();

  particles.forEach(p => {
    let opacity = 0;
    for (const t of trail) {
      const dx = p.position.x - t.x;
      const dy = p.position.y - t.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const distFactor = 1 - dist / 150;
        const ageFactor = 1 - Math.min((now - t.time) / maxAge, 1);
        opacity = Math.max(opacity, distFactor * ageFactor * (trailSize / 10));
      }
    }
    p.scale.set(opacity * 2, opacity * 2, 1);
    p.material.color.set(color);
    p.material.opacity = opacity;
    p.material.transparent = true;
  });

  // cleanup old trail
  for (let i = trail.length - 1; i >= 0; i--) {
    if (now - trail[i].time > maxAge) trail.splice(i, 1);
  }

  composer.render();
  requestAnimationFrame(animate);
}
animate();

// Handle resize
window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  composer.setSize(container.clientWidth, container.clientHeight);
  createParticles();
});

// Controls
document.getElementById("gridSize").addEventListener("input", (e) => {
  gridSize = parseInt(e.target.value);
  document.getElementById("gridSizeValue").textContent = gridSize;
  createParticles();
});
document.getElementById("trailSize").addEventListener("input", (e) => {
  trailSize = parseInt(e.target.value);
  document.getElementById("trailSizeValue").textContent = trailSize;
});
document.getElementById("maxAge").addEventListener("input", (e) => {
  maxAge = parseInt(e.target.value);
  document.getElementById("maxAgeValue").textContent = maxAge;
});
document.getElementById("colorPicker").addEventListener("input", (e) => {
  color = e.target.value;
  document.getElementById("colorValue").textContent = color.toUpperCase();
});
