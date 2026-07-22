// script.js

import {
  simulationVertexShader,
  simulationFragmentShader,
  renderVertexShader,
  renderFragmentShader,
} from "./shaders.js";

document.addEventListener("DOMContentLoaded", () => {
  const clamp01 = (value) => Math.max(0, Math.min(1, value));

  const getDpr = () =>
    Math.min(window.devicePixelRatio || 1, 2);

  // Basic three.js setup
  const scene = new THREE.Scene();
  const simScene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    0,
    1
  );

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(getDpr());
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Resolution in pixels for the shaders
  let res = new THREE.Vector2(
    Math.max(1, Math.floor(window.innerWidth * getDpr())),
    Math.max(1, Math.floor(window.innerHeight * getDpr()))
  );

  // Ping-pong render targets
  const options = {
    format: THREE.RGBAFormat,
    type: renderer.capabilities.isWebGL2
      ? THREE.FloatType
      : THREE.UnsignedByteType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  };

  let rtA = new THREE.WebGLRenderTarget(
    res.x,
    res.y,
    options
  );

  let rtB = new THREE.WebGLRenderTarget(
    res.x,
    res.y,
    options
  );

  // Pointer state
  const mouse = new THREE.Vector2(-1, -1);
  const mousePrev = new THREE.Vector2(-1, -1);

  let mouseActive = 0.0;
  let lastPointerMove = performance.now();

  // Idle-state animation
  let idleProgress = 0.0;

  const idleDelay = 300;
  const idleFadeDuration = 1;
  const idleResponse = 5.0;

  // Reset-button state
  let resetting = false;
  let resetStart = 0;
  const resetTotal = 1200;

  let previousFrameTime = performance.now();

  // Background canvas
  const bgCanvas = document.createElement("canvas");
  bgCanvas.width = res.x;
  bgCanvas.height = res.y;

  const ctx = bgCanvas.getContext("2d");

  function drawBackground() {
    ctx.fillStyle = "#fb7427";
    ctx.fillRect(
      0,
      0,
      bgCanvas.width,
      bgCanvas.height
    );

    const fontSize = Math.round(250 * getDpr());

    ctx.fillStyle = "#fef4b8";
    ctx.font = `bold ${fontSize}px Test Söhne, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      "Aishwary",
      bgCanvas.width / 2,
      bgCanvas.height / 2
    );
  }

  drawBackground();

  const bgTexture = new THREE.CanvasTexture(bgCanvas);
  bgTexture.minFilter = THREE.LinearFilter;
  bgTexture.magFilter = THREE.LinearFilter;
  bgTexture.format = THREE.RGBAFormat;
  bgTexture.wrapS = THREE.ClampToEdgeWrapping;
  bgTexture.wrapT = THREE.ClampToEdgeWrapping;
  bgTexture.needsUpdate = true;

  // Simulation uniforms
  const simUniforms = {
    textureA: { value: rtA.texture },
    resolution: { value: res },
    mouse: { value: mouse },
    mousePrev: { value: mousePrev },
    time: { value: 0.0 },
    frame: { value: 0 },
    uMouseActive: { value: 0.0 },
    resetProgress: { value: 0.0 },
    idleProgress: { value: 0.0 },
  };

  const simMaterial = new THREE.ShaderMaterial({
    uniforms: simUniforms,
    vertexShader: simulationVertexShader,
    fragmentShader: simulationFragmentShader,
  });

  // Render uniforms
  const renderUniforms = {
    textureA: { value: rtA.texture },
    textureB: { value: bgTexture },
    resolution: { value: res },
    lightDir: {
      value: new THREE.Vector3(
        -0.3,
        0.6,
        0.8
      ).normalize(),
    },
  };

  const renderMaterial = new THREE.ShaderMaterial({
    uniforms: renderUniforms,
    vertexShader: renderVertexShader,
    fragmentShader: renderFragmentShader,
  });

  // Full-screen quads
  const plane = new THREE.PlaneGeometry(2, 2);

  const simQuad = new THREE.Mesh(
    plane,
    simMaterial
  );

  const renderQuad = new THREE.Mesh(
    plane,
    renderMaterial
  );

  simQuad.frustumCulled = false;
  renderQuad.frustumCulled = false;

  simMaterial.depthTest = false;
  simMaterial.depthWrite = false;

  renderMaterial.depthTest = false;
  renderMaterial.depthWrite = false;

  simScene.add(simQuad);
  scene.add(renderQuad);

  // Clear a render target
  function clearRenderTarget(renderTarget) {
    const previousTarget = renderer.getRenderTarget();

    renderer.setRenderTarget(renderTarget);
    renderer.setClearColor(0x000000, 1);
    renderer.clear(true, true, true);

    renderer.setRenderTarget(previousTarget);
  }

  clearRenderTarget(rtA);
  clearRenderTarget(rtB);

  // Update pointer coordinates
  function updatePointer(clientX, clientY) {
    if (resetting) return;

    const dpr = getDpr();

    const nextX = clientX * dpr;
    const nextY =
      (window.innerHeight - clientY) * dpr;

    const hasPreviousPosition =
      mouse.x >= 0 && mouse.y >= 0;

    // First pointer position
    if (!hasPreviousPosition) {
      mouse.set(nextX, nextY);
      mousePrev.copy(mouse);

      mouseActive = 0.65;
      lastPointerMove = performance.now();

      return;
    }

    const distance = Math.hypot(
      nextX - mouse.x,
      nextY - mouse.y
    );

    // Ignore negligible movement
    if (distance <= 0.01) return;

    mousePrev.copy(mouse);
    mouse.set(nextX, nextY);

    lastPointerMove = performance.now();

    // Increase ripple activity based on movement speed
    mouseActive = Math.min(
      1.5,
      mouseActive +
      0.08 +
      Math.min(distance * 0.01, 0.5)
    );
  }

  // Mouse movement creates ripples without clicking
  window.addEventListener("mousemove", (event) => {
    updatePointer(
      event.clientX,
      event.clientY
    );
  });

  // Touch support
  function handleTouch(event) {
    if (
      event.touches &&
      event.touches.length > 0
    ) {
      const touch = event.touches[0];

      updatePointer(
        touch.clientX,
        touch.clientY
      );
    }
  }

  window.addEventListener(
    "touchstart",
    handleTouch,
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    handleTouch,
    { passive: true }
  );

  function clearPointer() {
    mouse.set(-1, -1);
    mousePrev.set(-1, -1);
    mouseActive = 0.0;
    lastPointerMove = performance.now();
  }

  window.addEventListener(
    "mouseleave",
    clearPointer
  );

  window.addEventListener(
    "touchend",
    clearPointer
  );

  window.addEventListener(
    "blur",
    clearPointer
  );

  // Reset button
  const resetBtn =
    document.getElementById("reset-btn") ||
    document.querySelector("nav button");

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (resetting) return;

      resetting = true;
      resetStart = performance.now();

      resetBtn.disabled = true;

      mouse.set(-1, -1);
      mousePrev.set(-1, -1);
      mouseActive = 0.0;
      lastPointerMove = performance.now();
    });
  }

  // Handle resize
  function onResize() {
    const dpr = getDpr();

    const width = Math.max(
      1,
      Math.floor(window.innerWidth * dpr)
    );

    const height = Math.max(
      1,
      Math.floor(window.innerHeight * dpr)
    );

    res.set(width, height);

    renderer.setPixelRatio(dpr);
    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    rtA.dispose();
    rtB.dispose();

    rtA = new THREE.WebGLRenderTarget(
      width,
      height,
      options
    );

    rtB = new THREE.WebGLRenderTarget(
      width,
      height,
      options
    );

    simUniforms.resolution.value = res;
    simUniforms.textureA.value = rtA.texture;

    renderUniforms.resolution.value = res;
    renderUniforms.textureA.value = rtA.texture;

    bgCanvas.width = width;
    bgCanvas.height = height;

    drawBackground();
    bgTexture.needsUpdate = true;

    clearRenderTarget(rtA);
    clearRenderTarget(rtB);
  }

  window.addEventListener("resize", onResize);

  // Animation loop
  let frame = 0;

  function step() {
    const now = performance.now();

    const deltaTime = Math.min(
      0.1,
      Math.max(
        0,
        (now - previousFrameTime) / 1000
      )
    );

    previousFrameTime = now;

    simUniforms.time.value = now / 1000;
    simUniforms.frame.value = frame++;

    /*
     * Idle behavior:
     *
     * The cursor can stop moving for idleDelay milliseconds.
     * After that, idleProgress smoothly increases to 1.
     * The shader uses this value to gradually remove the waves.
     */
    const timeSincePointerMove =
      now - lastPointerMove;

    const idleTarget = resetting
      ? 1.0
      : clamp01(
        (timeSincePointerMove - idleDelay) /
        idleFadeDuration
      );

    const idleBlend =
      1.0 -
      Math.exp(-idleResponse * deltaTime);

    idleProgress +=
      (idleTarget - idleProgress) * idleBlend;

    simUniforms.idleProgress.value =
      idleProgress;

    /*
     * Smoothly reduce the amount of new ripple
     * energy after the cursor stops moving.
     */
    if (resetting) {
      mouseActive = 0.0;
    } else {
      mouseActive *= Math.exp(-9.0 * deltaTime);

      if (mouseActive < 0.001) {
        mouseActive = 0.0;
      }
    }

    /*
     * Reset button animation:
     * resetProgress moves from 0 -> 1 -> 0.
     */
    if (resetting) {
      const resetTime =
        (now - resetStart) / resetTotal;

      const resetT = clamp01(resetTime);

      simUniforms.resetProgress.value =
        Math.sin(Math.PI * resetT);

      if (resetTime >= 1.0) {
        simUniforms.resetProgress.value = 0.0;
        resetting = false;

        if (resetBtn) {
          resetBtn.disabled = false;
        }

        // Ensure the simulation ends completely calm.
        clearRenderTarget(rtA);
        clearRenderTarget(rtB);
      }
    } else {
      simUniforms.resetProgress.value = 0.0;
    }

    // Feed simulation uniforms
    simUniforms.textureA.value = rtA.texture;
    simUniforms.mouse.value = mouse;
    simUniforms.mousePrev.value = mousePrev;

    simUniforms.uMouseActive.value =
      resetting ? 0.0 : mouseActive;

    // Simulation pass
    renderer.setRenderTarget(rtB);
    renderer.clear();
    renderer.render(simScene, camera);

    // Screen render pass
    renderUniforms.textureA.value = rtB.texture;
    renderUniforms.textureB.value = bgTexture;

    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(scene, camera);

    // Swap render targets
    const temp = rtA;
    rtA = rtB;
    rtB = temp;

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
});