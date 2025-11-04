document.addEventListener("DOMContentLoaded", function () {
  const mouse = { x: 0, y: 0, smoothX: 0, smoothY: 0, diff: 0 };
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const cursor = document.querySelector(".js-cursor");
  const svg = document.querySelector(".js-svg");
  const particlesWrapper = document.querySelector(".js-particles-wrapper");
  const particles = [];

  mouse.x = viewport.width / 2;
  mouse.y = viewport.height / 2;
  mouse.smoothX = mouse.x;
  mouse.smoothY = mouse.y;

  function updateCursor() {
    cursor.style.left = mouse.smoothX + "px";
    cursor.style.top = mouse.smoothY + "px";
  }

  class Particle {
    constructor(x, y, size) {
      this.size = size;
      this.x = x;
      this.y = y;
      this.startTime = Date.now();
      this.lifeDuration = 6000;

      this.el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      this.el.setAttribute("cx", this.x.toString());
      this.el.setAttribute("cy", this.y.toString());
      this.el.setAttribute("r", this.size.toString());
      this.el.setAttribute("fill", "white");
      particlesWrapper.appendChild(this.el);
      this.animate();
    }

    animate() {
      const elapsed = Date.now() - this.startTime;
      if (elapsed > this.lifeDuration) return this.kill();

      let currentSize;
      if (elapsed < 2000) {
        const progress = elapsed / 2000;
        currentSize = this.size + this.size * progress;
      } else {
        const progress = (elapsed - 2000) / 4000;
        currentSize = this.size * 2 * (1 - progress);
      }
      this.el.setAttribute("r", currentSize.toString());
      requestAnimationFrame(() => this.animate());
    }

    kill() {
      if (this.el.parentNode) this.el.remove();
    }
  }

  function onMouseMove(e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
  }

  function onResize() {
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;
    svg.style.width = viewport.width + "px";
    svg.style.height = viewport.height + "px";
  }

  function emitParticle() {
    const size = Math.random() * 10 + 5;
    const p = new Particle(mouse.smoothX, mouse.smoothY, size);
    particles.push(p);
  }

  function render() {
    mouse.smoothX += (mouse.x - mouse.smoothX) * 0.1;
    mouse.smoothY += (mouse.y - mouse.smoothY) * 0.1;
    mouse.diff = Math.hypot(mouse.x - mouse.smoothX, mouse.y - mouse.smoothY);

    emitParticle();
    updateCursor();
    requestAnimationFrame(render);
  }

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("resize", onResize);
  onResize();
  updateCursor();
  render();
});
