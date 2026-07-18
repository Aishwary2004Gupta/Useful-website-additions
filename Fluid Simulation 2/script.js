const simulationVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const simulationFragmentShader = `
uniform sampler2D textureA;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float time;
uniform int frame;
uniform float uMouseActive;
uniform float resetProgress; // Smooth reset multiplier (0.0 to 1.0)
varying vec2 vUv;

const float delta = 1.4;  

void main() {
    vec2 uv = vUv;
    if (frame == 0) {
        gl_FragColor = vec4(0.0);
        return;
    }
    
    vec4 data = texture2D(textureA, uv);
    float pressure = data.x;
    float pVel = data.y;
    
    vec2 texelSize = 1.0 / resolution;
    float p_right = texture2D(textureA, uv + vec2(texelSize.x, 0.0)).x;
    float p_left = texture2D(textureA, uv + vec2(-texelSize.x, 0.0)).x;
    float p_up = texture2D(textureA, uv + vec2(0.0, texelSize.y)).x;
    float p_down = texture2D(textureA, uv + vec2(0.0, -texelSize.y)).x;
    
    if (uv.x <= texelSize.x) p_left = p_right;
    if (uv.x >= 1.0 - texelSize.x) p_right = p_left;
    if (uv.y <= texelSize.y) p_down = p_up;
    if (uv.y >= 1.0 - texelSize.y) p_up = p_down;
    
    // Enhanced wave equation matching ShaderToy
    pVel += delta * (-2.0 * pressure + p_right + p_left) / 4.0;
    pVel += delta * (-2.0 * pressure + p_up + p_down) / 4.0;
    
    pressure += delta * pVel;
    
    pVel -= 0.005 * delta * pressure;
    pVel *= 1.0 - 0.002 * delta;
    pressure *= 0.999;
    
    // Apply dynamic reset dampening (damps liquid energy smoothly to clear waves)
    pVel *= (1.0 - resetProgress * 0.15);
    pressure *= (1.0 - resetProgress * 0.15);
    
    vec2 mouseUV = mouse / resolution;
    if(mouse.x > 0.0 && uMouseActive > 0.0) {
        float dist = distance(uv, mouseUV);
        if(dist <= 0.02) {  // Size of the ripple
            // Suppress input dynamically as reset progress peaks
            pressure += uMouseActive * 2.5 * (1.0 - dist / 0.02) * (1.0 - resetProgress);
        }
    }
    
    gl_FragColor = vec4(pressure, pVel, 
        (p_right - p_left) / 2.0, 
        (p_up - p_down) / 2.0);
}
`

const renderVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const renderFragmentShader = `
uniform sampler2D textureA;
uniform sampler2D textureB;
varying vec2 vUv;

void main() {
    vec4 data = texture2D(textureA, vUv);
    
    vec2 distortion = 0.3 * data.zw;
    vec4 color = texture2D(textureB, vUv + distortion);
    
    vec3 normal = normalize(vec3(-data.z * 2.0, 0.5, -data.w * 2.0));
    vec3 lightDir = normalize(vec3(-3.0, 10.0, 3.0));
    float specular = pow(max(0.0, dot(normal, lightDir)), 60.0) * 1.5;
    
    gl_FragColor = color + vec4(specular);
}
`

document.addEventListener("DOMContentLoaded", () => {
  // Basic three.js setup
  const scene = new THREE.Scene();
  const simScene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // resolution in pixels (for shaders)
  let res = new THREE.Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);

  // create two render targets (ping-pong)
  const options = {
    format: THREE.RGBAFormat,
    type: (renderer.capabilities.isWebGL2 ? THREE.FloatType : THREE.UnsignedByteType),
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  };

  let rtA = new THREE.WebGLRenderTarget(res.x, res.y, options);
  let rtB = new THREE.WebGLRenderTarget(res.x, res.y, options);

  // mouse state
  const mouse = new THREE.Vector2(-1000, -1000);
  const mousePrev = new THREE.Vector2(-1000, -1000);
  let mouseActive = 0.0; // dynamic multiplier based on movement/clicks

  // Create a canvas texture as the background (text)
  const bgCanvas = document.createElement("canvas");
  bgCanvas.width = res.x;
  bgCanvas.height = res.y;
  const ctx = bgCanvas.getContext("2d");
  function drawBackground() {
    ctx.fillStyle = "#fb7427";
    ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    const fontSize = Math.round(250 * (window.devicePixelRatio || 1));
    ctx.fillStyle = "#fef4b8";
    ctx.font = `bold ${fontSize}px Test Söhne, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Aishwary", bgCanvas.width / 2, bgCanvas.height / 2);
  }
  drawBackground();

  const bgTexture = new THREE.CanvasTexture(bgCanvas);
  bgTexture.minFilter = THREE.LinearFilter;
  bgTexture.magFilter = THREE.LinearFilter;
  bgTexture.format = THREE.RGBAFormat;
  bgTexture.needsUpdate = true;
  bgTexture.wrapS = THREE.ClampToEdgeWrapping;
  bgTexture.wrapT = THREE.ClampToEdgeWrapping;

  // simulation material
  const simUniforms = {
    textureA: { value: rtA.texture },
    resolution: { value: res },
    mouse: { value: mouse },
    mousePrev: { value: mousePrev },
    time: { value: 0.0 },
    frame: { value: 0 },
    uMouseActive: { value: 0.0 },
    resetProgress: { value: 0.0 }, // Dynamic uniform to handle the smooth reset curve
  };

  const simMaterial = new THREE.ShaderMaterial({
    uniforms: simUniforms,
    vertexShader: simulationVertexShader,
    fragmentShader: simulationFragmentShader,
  });

  // render material
  const renderUniforms = {
    textureA: { value: rtA.texture },
    textureB: { value: bgTexture },
    resolution: { value: res },
    lightDir: { value: new THREE.Vector3(-0.3, 0.6, 0.8).normalize() },
  };

  const renderMaterial = new THREE.ShaderMaterial({
    uniforms: renderUniforms,
    vertexShader: renderVertexShader,
    fragmentShader: renderFragmentShader,
  });

  // full-screen quads
  const plane = new THREE.PlaneGeometry(2, 2);
  const simQuad = new THREE.Mesh(plane, simMaterial);
  const renderQuad = new THREE.Mesh(plane, renderMaterial);
  simQuad.frustumCulled = false;
  renderQuad.frustumCulled = false;
  simMaterial.depthTest = false;
  renderMaterial.depthTest = false;
  simScene.add(simQuad);
  scene.add(renderQuad);

  // Clear render target to empty state
  function clearRenderTarget(rt) {
    const old = renderer.getRenderTarget();
    renderer.setRenderTarget(rt);
    renderer.setClearColor(new THREE.Color(0, 0, 0), 0.0);
    renderer.clear(true, true, true);
    renderer.setRenderTarget(old);
  }
  clearRenderTarget(rtA);
  clearRenderTarget(rtB);

  // Helper function to update coordinates
  function updateMouseCoords(clientX, clientY) {
    const dpr = window.devicePixelRatio || 1;
    mousePrev.copy(mouse);
    mouse.x = clientX * dpr;
    mouse.y = (window.innerHeight - clientY) * dpr;
  }

  // Pointer Move (Works on movement without needing left-click down)
  window.addEventListener("pointermove", (e) => {
    if (resetting) return;
    const dpr = window.devicePixelRatio || 1;
    const currentX = e.clientX * dpr;
    const currentY = (window.innerHeight - e.clientY) * dpr;
    
    let speed = 0;
    if (mouse.x > 0.0) {
      speed = Math.hypot(currentX - mouse.x, currentY - mouse.y);
    }
    
    updateMouseCoords(e.clientX, e.clientY);
    
    // Scale up intensity smoothly based on movement speed
    mouseActive = Math.min(1.5, mouseActive + speed * 0.01 + 0.08);
  });

  // Pointer Down (Creates an instant ripple on Click or Tap)
  window.addEventListener("pointerdown", (e) => {
    if (resetting) return;
    // Ignore clicks on header & footer elements
    if (e.target.closest('button') || e.target.closest('a')) return;
    
    updateMouseCoords(e.clientX, e.clientY);
    mouseActive = 2.0; // Strong burst on click!
  });

  // Reset pointer when leaving window
  window.addEventListener("pointerleave", () => {
    mouse.set(-1000, -1000);
    mousePrev.set(-1000, -1000);
    mouseActive = 0.0;
  });

  // Smooth Reset States
  const resetBtn = document.getElementById('reset-btn');
  let resetting = false;
  let resetStart = 0;
  const resetTotal = 1200; // ms total for smooth 0 -> 1 -> 0 wave decay curve

  // Smooth Reset Button Logic
  resetBtn.addEventListener('click', () => {
    if (resetting) return;
    resetting = true;
    resetStart = performance.now();
    resetBtn.disabled = true;

    // Reset interaction tracking immediately
    mouse.set(-1000, -1000);
    mousePrev.set(-1000, -1000);
    mouseActive = 0.0;
  });

  // Handle resizing
  function onResize() {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.floor(window.innerWidth * dpr));
    const h = Math.max(1, Math.floor(window.innerHeight * dpr));
    res.set(w, h);

    renderer.setSize(window.innerWidth, window.innerHeight);
    rtA.dispose(); rtB.dispose();
    rtA = new THREE.WebGLRenderTarget(res.x, res.y, options);
    rtB = new THREE.WebGLRenderTarget(res.x, res.y, options);

    simUniforms.resolution.value = res;
    simUniforms.textureA.value = rtA.texture;
    simUniforms.resetProgress.value = simUniforms.resetProgress.value || 0.0;
    renderUniforms.resolution.value = res;
    renderUniforms.textureA.value = rtA.texture;

    bgCanvas.width = w; bgCanvas.height = h;
    drawBackground();
    bgTexture.needsUpdate = true;

    clearRenderTarget(rtA);
    clearRenderTarget(rtB);
  }
  window.addEventListener("resize", onResize);

  // Animation Loop
  let frame = 0;
  function step() {
    const now = performance.now();
    simUniforms.time.value = now / 1000;
    simUniforms.frame.value = frame++;

    // Compute smooth dampening progress (0 -> 1 -> 0)
    if (resetting) {
      const t = (now - resetStart) / resetTotal;
      if (t >= 1.0) {
        simUniforms.resetProgress.value = 0.0;
        resetting = false;
        resetBtn.disabled = false;
        // Clean sweep targets to fully lock initial zero state
        clearRenderTarget(rtA);
        clearRenderTarget(rtB);
      } else {
        // sin(pi * t) goes 0 -> 1 -> 0 as t goes 0..1 (peak absorption at center)
        simUniforms.resetProgress.value = Math.sin(Math.PI * Math.min(1.0, Math.max(0.0, t)));
      }
    }

    if (!resetting) {
      // Decay the mouse activity smoothly over frames so ripple trail fades naturally
      mouseActive *= 0.93;
      if (mouseActive < 0.01) mouseActive = 0.0;
    }
    simUniforms.uMouseActive.value = mouseActive;

    simUniforms.textureA.value = rtA.texture;
    simUniforms.mouse.value = mouse;
    simUniforms.mousePrev.value = mousePrev;

    // Simulation pass (into rtB)
    renderer.setRenderTarget(rtB);
    renderer.clear();
    renderer.render(simScene, camera);

    // Final render pass (to screen)
    renderUniforms.textureA.value = rtB.texture;
    renderUniforms.textureB.value = bgTexture;
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(scene, camera);

    // Swap targets
    const tmp = rtA; rtA = rtB; rtB = tmp;

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
});