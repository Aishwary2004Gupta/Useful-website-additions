// Canvas
const canvas = document.getElementById('webgl');

// Scene
const scene = new THREE.Scene();

// Camera (Orthographic like original)
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  -aspect, aspect,
  1, -1,
  0.01, 500
);

camera.position.set(0, 0, 10);
camera.zoom = 100;
camera.updateProjectionMatrix();
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1.5);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Fullscreen Image
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(
  "https://cdn.maximeheckel.com/images/backgrounds/gril-with-pearl-earing.jpg"
);

const imageGeometry = new THREE.PlaneGeometry(2 * aspect, 2);
const imageMaterial = new THREE.MeshBasicMaterial({ map: texture });

const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
scene.add(imageMesh);

// Shader (converted from fragmentShader.glsl)
const DepixelationShader = {
  uniforms: {
    "progress": { value: 0.0 },
    "resolution": { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    "time": { value: 0 },
    "tDiffuse": { value: null }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    uniform float progress;
    uniform vec2 resolution;
    uniform float time;
    uniform sampler2D tDiffuse;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    const float LEVELS = 5.0;

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;
      vec4 inputColor = texture2D(tDiffuse, uv);

      float basePixelSize = pow(2.0, LEVELS);
      float currentLevel = floor(progress * LEVELS);
      float currentPixelSize = max(basePixelSize / pow(2.0, currentLevel), 1.0);

      float currentPixelsPerRow = ceil(resolution.x / currentPixelSize);
      float currentPixelsPerCol = ceil(resolution.y / currentPixelSize);
      float currentTotalPixels = currentPixelsPerRow * currentPixelsPerCol;

      float levelProgress = fract(progress * LEVELS) * currentTotalPixels;
      float currentRowInLevel = floor(levelProgress / currentPixelsPerRow);
      float currentPixelInRow = mod(levelProgress, currentPixelsPerRow);

      vec2 gridPos = floor(uv * resolution / currentPixelSize);
      float row = floor(currentPixelsPerCol - gridPos.y - 1.0);
      float posInRow = floor(gridPos.x);

      vec4 additionalColor = vec4(0.0);
      vec2 finalUv;

      if (currentPixelSize <= 1.0) {
        finalUv = uv;
      } else if (row < currentRowInLevel || (row == currentRowInLevel && posInRow <= currentPixelInRow)) {
        vec2 finalNormalized = currentPixelSize / resolution;
        vec2 uvPixel = finalNormalized * floor(uv / finalNormalized);
        finalUv = uvPixel;

        if (row == currentRowInLevel) {
          float r = random(vec2(posInRow, row));
          float twinkle = sin(time * 10.0 + r * 10.0) + 1.0;
          additionalColor = vec4(0.005) * (twinkle * 20.0);
        }

      } else {
        float fp = currentPixelSize * 2.0;
        vec2 fn = fp / resolution;
        finalUv = fn * floor(uv / fn);
      }

      vec4 color = texture2D(tDiffuse, finalUv);
      gl_FragColor = color + additionalColor;
    }
  `
};

// Postprocessing
const composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));

const shaderPass = new THREE.ShaderPass(DepixelationShader);
composer.addPass(shaderPass);

// UI Controls
const slider = document.getElementById("progressSlider");
const label = document.getElementById("progressValue");

slider.addEventListener("input", () => {
  shaderPass.uniforms.progress.value = parseFloat(slider.value);
  label.textContent = slider.value;
});

// Resize
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  renderer.setSize(w, h);
  composer.setSize(w, h);

  camera.left = -w / h;
  camera.right = w / h;
  camera.updateProjectionMatrix();

  shaderPass.uniforms.resolution.value.set(w, h);
});

// Animation Loop
let time = 0;

function animate() {
  requestAnimationFrame(animate);
  time += 0.01;

  shaderPass.uniforms.time.value = time;

  controls.update();
  composer.render();
}

animate();
