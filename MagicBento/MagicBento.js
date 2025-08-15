
import { gsap } from "https://cdn.skypack.dev/gsap@3.12.2";
import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js";

// Config state
const state = {
  stars: true,
  spotlight: true,
  tilt: true,
  magnetism: true,
  particleCount: 12,
  particleLife: 0.9,
  spotlightRadius: 200,
};

// Pane UI
const paneContainer = document.getElementById("paneContainer");
const pane = new Pane({ container: paneContainer });
pane
  .addBinding(state, "stars", { label: "Stars (hover)" })
  .on("change", () => { });
pane.addBinding(state, "spotlight", { label: "Spotlight" });
pane.addBinding(state, "tilt", { label: "Tilt" });
pane.addBinding(state, "magnetism", { label: "Magnetism" });
pane.addBinding(state, "spotlightRadius", {
  min: 100,
  max: 1200,
  step: 10,
});
pane.addButton({ title: "Disable All Animations" }).on("click", () => {
  state.stars = state.spotlight = state.tilt = state.magnetism = false;
  pane.refresh();
});

// Toggle panel fold/unfold
const toggle = document.getElementById("panelToggle");
toggle.addEventListener("click", () => {
  paneContainer.style.display =
    paneContainer.style.display === "none" ? "block" : "none";
});

// Global spotlight canvas (subtle background)
const globalCanvas = document.getElementById("globalCanvas");
const gctx = globalCanvas.getContext("2d");
function resizeCanvas() {
  globalCanvas.width = innerWidth;
  globalCanvas.height = innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// draw subtle vignette (static)
function drawVignette() {
  gctx.clearRect(0, 0, globalCanvas.width, globalCanvas.height);
  const grad = gctx.createLinearGradient(0, 0, 0, globalCanvas.height);
  grad.addColorStop(0, "rgba(4,2,7,1)");
  grad.addColorStop(1, "rgba(10,3,18,1)");
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, globalCanvas.width, globalCanvas.height);
}
drawVignette();

// Global spotlight element handled via CSS vars on body or just inner overlay
const grid = document.getElementById("grid");
let lastMouse = { x: 0, y: 0 };

// Particle system per-card
const cards = Array.from(document.querySelectorAll(".card"));

cards.forEach((card) => {
  const layer = card.querySelector(".particles-layer");
  // ensure css var for glow radius/color
  card.style.setProperty("--glow-radius", "220px");
  const glow =
    card.getAttribute("data-glow") ||
    getComputedStyle(document.documentElement).getPropertyValue(
      "--glow-color"
    ) ||
    "132,0,255";
  card.style.setProperty("--glow-color", glow);

  // state for transform composition
  let current = { tx: 0, ty: 0, rx: 0, ry: 0 };
  function applyTransform() {
    card.style.transform = `translate3d(${current.tx}px, ${current.ty}px, 0) rotateX(${current.rx}deg) rotateY(${current.ry}deg)`;
  }

  let spawnInterval = null;

  function spawnBurst(x, y) {
    if (!state.stars) return;
    // create N particles
    for (let i = 0; i < state.particleCount; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const size = 3 + Math.random() * 5;
      p.style.width = p.style.height = `${size}px`;
      p.style.left = `${x - size / 2}px`;
      p.style.top = `${y - size / 2}px`;
      const alpha = 0.9 + Math.random() * 0.2;
      p.style.background = `rgba(${glow}, ${alpha})`;
      p.style.boxShadow = `0 0 ${6 + Math.random() * 8
        }px rgba(${glow}, ${alpha})`;
      layer.appendChild(p);

      // compute random velocity
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 70;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      gsap.fromTo(
        p,
        { opacity: 1, scale: 0.2, x: 0, y: 0 },
        {
          opacity: 0,
          scale: 0.8,
          x: tx,
          y: ty,
          duration: state.particleLife + Math.random() * 0.6,
          ease: "power2.out",
          onComplete: () => p.remove(),
        }
      );
    }
  }

  // on hover start continuous bursts at mouse point
  function onMouseEnter(e) {
    const rect = card.getBoundingClientRect();
    let lastPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    // spawn on mousemove and also interval to create continuous burst
    function onMove(ev) {
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      lastPos = { x, y };

      // glow intensity and position - only when spotlight is enabled
      if (state.spotlight) {
        const relX = ((ev.clientX - rect.left) / rect.width) * 100;
        const relY = ((ev.clientY - rect.top) / rect.height) * 100;
        const dx = ev.clientX - (rect.left + rect.width / 2);
        const dy = ev.clientY - (rect.top + rect.height / 2);
        const dist = Math.hypot(dx, dy);
        const max = Math.hypot(rect.width / 2, rect.height / 2);
        const intensity = Math.max(0, 1 - dist / max);
        card.style.setProperty("--glow-x", `${relX}%`);
        card.style.setProperty("--glow-y", `${relY}%`);
        card.style.setProperty("--glow-intensity", intensity.toFixed(2));
        card.style.setProperty("--glow-radius", `${state.spotlightRadius}px`);
      } else {
        card.style.setProperty("--glow-intensity", "0");
      }

      // tilt - independent check
      if (state.tilt) {
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
        current.rx = rotateX;
        current.ry = rotateY;
      }

      // magnetism - independent check
      if (state.magnetism) {
        const moveX = (x - rect.width / 2) * 0.04;
        const moveY = (y - rect.height / 2) * 0.04;
        current.tx = moveX;
        current.ty = moveY;
      }

      applyTransform();

      // stars effect - separate check
      if (state.stars) {
        spawnBurst(x, y);
      }
    }

    card.addEventListener("mousemove", onMove);

    // spawn particles only if stars are enabled
    if (state.stars) {
      spawnInterval = setInterval(() => {
        spawnBurst(lastPos.x, lastPos.y);
      }, 160);
    }

    card._onMove = onMove;
  }

  function onMouseLeave() {
    current = { tx: 0, ty: 0, rx: 0, ry: 0 };
    applyTransform();
    card.style.setProperty("--glow-intensity", "0");
    if (card._onMove) card.removeEventListener("mousemove", card._onMove);
    clearInterval(spawnInterval);
    spawnInterval = null;
  }

  card.addEventListener("mouseenter", onMouseEnter);
  card.addEventListener("mouseleave", onMouseLeave);
});

function tick() {
  requestAnimationFrame(tick);
}
tick();