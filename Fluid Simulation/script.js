// script.js

import {
  simulationVertexShader,
  simulationFragmentShader,
  renderVertexShader,
  renderFragmentShader,
} from "./shaders.js";

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
  const mouse = new THREE.Vector2(-1, -1);
  const mousePrev = new THREE.Vector2(-1, -1);

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
    ctx.fillText("softhorizon", bgCanvas.width / 2, bgCanvas.height / 2);
  }
  drawBackground();

  const bgTexture = new THREE.CanvasTexture(bgCanvas);
  bgTexture.minFilter = THREE.LinearFilter;
  bgTexture.magFilter = THREE.LinearFilter;
  bgTexture.format = THREE.RGBAFormat;
  bgTexture.needsUpdate = true;
  // ensure edge sampling doesn't wrap (safe sampling when we offset UVs)
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
    resetProgress: { value: 0.0 }, // NEW: drives smooth reset in the shader
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
  // avoid any depth interactions and ensure they always render full screen
  simQuad.frustumCulled = false;
  renderQuad.frustumCulled = false;
  simMaterial.depthTest = false;
  renderMaterial.depthTest = false;
  simScene.add(simQuad);
  scene.add(renderQuad);

  // initialize render target with zero texture to avoid NaNs
  function clearRenderTarget(rt) {
    const old = renderer.getRenderTarget();
    renderer.setRenderTarget(rt);
    // set a clean clear color and clear
    renderer.setClearColor(new THREE.Color(0, 0, 0), 1.0);
    renderer.clear(true, true, true);
    renderer.setRenderTarget(old);
  }
  clearRenderTarget(rtA);
  clearRenderTarget(rtB);

  // mouse events (normalized to pixels)
  window.addEventListener("mousemove", (e) => {
    const dpr = window.devicePixelRatio || 1;
    mousePrev.x = mouse.x; mousePrev.y = mouse.y;
    mouse.x = e.clientX * dpr;
    // flip Y so shader coords match canvas texel orientation
    mouse.y = (window.innerHeight - e.clientY) * dpr;
  });

  // add touch support
  function handleTouch(e) {
    if (e.touches && e.touches.length > 0) {
      const t = e.touches[0];
      const dpr = window.devicePixelRatio || 1;
      mousePrev.x = mouse.x; mousePrev.y = mouse.y;
      mouse.x = t.clientX * dpr;
      mouse.y = (window.innerHeight - t.clientY) * dpr;
    }
  }
  window.addEventListener("touchstart", handleTouch, { passive: true });
  window.addEventListener("touchmove", handleTouch, { passive: true });
  window.addEventListener("mouseleave", () => {
    mouse.set(-1, -1);
    mousePrev.set(-1, -1);
  });
  window.addEventListener("touchend", () => {
    mouse.set(-1, -1);
    mousePrev.set(-1, -1);
  });

  // hook up reset button (rename made in HTML)
  const resetBtn = document.querySelector('button');
  let resetting = false;
  let resetStart = 0;
  const resetTotal = 1200; // ms total for 0 -> 1 -> 0 triangular animation

  resetBtn.addEventListener('click', () => {
    if (resetting) return;
    // start resetting
    resetting = true;
    resetStart = performance.now();
    resetBtn.disabled = true;
    // ignore further mouse input during reset
    mouse.set(-1, -1);
    mousePrev.set(-1, -1);
  });

  // handle resize
  function onResize() {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.floor(window.innerWidth * dpr));
    const h = Math.max(1, Math.floor(window.innerHeight * dpr));
    res.set(w, h);

    renderer.setSize(window.innerWidth, window.innerHeight);
    // recreate RTs to match new size (dispose old)
    rtA.dispose(); rtB.dispose();
    rtA = new THREE.WebGLRenderTarget(res.x, res.y, options);
    rtB = new THREE.WebGLRenderTarget(res.x, res.y, options);

    // keep uniforms pointing to the new textures & resolution
    simUniforms.resolution.value = res;
    simUniforms.textureA.value = rtA.texture;
    simUniforms.resetProgress.value = simUniforms.resetProgress.value || 0.0;
    renderUniforms.resolution.value = res;
    renderUniforms.textureA.value = rtA.texture;

    // redraw background canvas texture for new size
    bgCanvas.width = w; bgCanvas.height = h;
    drawBackground();
    bgTexture.needsUpdate = true;

    // clear new RTs
    clearRenderTarget(rtA);
    clearRenderTarget(rtB);
  }
  window.addEventListener("resize", onResize);

  // animation
  let frame = 0;
  function step() {
    const now = performance.now();
    simUniforms.time.value = now / 1000;
    simUniforms.frame.value = frame++;

    // If resetting, compute triangular smooth progress (0 -> 1 -> 0) using sin(pi * t)
    if (resetting) {
      const t = (now - resetStart) / resetTotal;
      if (t >= 1.0) {
        // finished
        simUniforms.resetProgress.value = 0.0;
        resetting = false;
        resetBtn.disabled = false;
      } else {
        // sin(pi * t) goes 0 -> 1 -> 0 as t goes 0..1 (peak at t=0.5)
        simUniforms.resetProgress.value = Math.sin(Math.PI * Math.min(1.0, Math.max(0.0, t)));
      }
    }

    // feed previous state
    simUniforms.textureA.value = rtA.texture;
    simUniforms.mouse.value = mouse;
    simUniforms.mousePrev.value = mousePrev;

    // simulation pass: render simScene into rtB
    renderer.setRenderTarget(rtB);
    renderer.clear();
    renderer.render(simScene, camera);

    // render pass: use rtB as the sim texture to shade the visible scene
    renderUniforms.textureA.value = rtB.texture;
    renderUniforms.textureB.value = bgTexture;
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(scene, camera);

    // swap RTs
    const tmp = rtA; rtA = rtB; rtB = tmp;

    requestAnimationFrame(step);
  }

  // start
  requestAnimationFrame(step);
});
