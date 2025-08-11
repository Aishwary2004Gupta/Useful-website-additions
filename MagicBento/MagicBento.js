// ----- Card Data -----
const cardData = [
  { color: "#060010", title: "Analytics", description: "Track user behavior", label: "Insights" },
  { color: "#060010", title: "Dashboard", description: "Centralized data view", label: "Overview" },
  { color: "#060010", title: "Collaboration", description: "Work together seamlessly", label: "Teamwork" },
  { color: "#060010", title: "Automation", description: "Streamline workflows", label: "Efficiency" },
  { color: "#060010", title: "Integration", description: "Connect favorite tools", label: "Connectivity" },
  { color: "#060010", title: "Security", description: "Enterprise-grade protection", label: "Protection" }
];

const config = {
  textAutoHide: true,
  enableStars: true,
  enableSpotlight: true,
  enableBorderGlow: true,
  enableTilt: true,
  enableMagnetism: true,
  clickEffect: true,
  spotlightRadius: 300,
  particleCount: 12,
  glowColor: '132, 0, 255' // as string
};

const grid = document.getElementById("cardGrid");

// ----- Render Cards -----
function renderCards() {
  grid.innerHTML = '';
  cardData.forEach((card, i) => {
    const el = document.createElement("div");
    el.className = "card" +
      (config.textAutoHide ? " card--text-autohide" : "") +
      (config.enableBorderGlow ? " card--border-glow" : "");
    el.style.backgroundColor = card.color;
    el.style.setProperty("--glow-color", config.glowColor);
    el.innerHTML = `
      <div class="card__header">${card.label}</div>
      <div class="card__content">
        <div class="card__title">${card.title}</div>
        <div class="card__desc">${card.description}</div>
      </div>
    `;
    attachCardEffects(el);
    grid.appendChild(el);
  });
}
renderCards();

// ----- Particle, Tilt, Magnetism, Ripple -----
function attachCardEffects(cardEl) {
  let particles = [];

  // Mouse events for glow
  cardEl.addEventListener('mousemove', e => {
    // Border glow (follows mouse)
    if (config.enableBorderGlow) {
      const rect = cardEl.getBoundingClientRect();
      const relX = ((e.clientX - rect.left) / rect.width) * 100;
      const relY = ((e.clientY - rect.top) / rect.height) * 100;
      cardEl.style.setProperty('--glow-x', relX + "%");
      cardEl.style.setProperty('--glow-y', relY + "%");
      cardEl.style.setProperty('--glow-intensity', 1);
    }
    // Particle stars orbit
    if (config.enableStars) {
      if (!particles.length) {
        for (let i = 0; i < config.particleCount; i++) {
          let p = document.createElement('div');
          p.className = 'particle';
          p.style.setProperty('--glow-color', config.glowColor);
          cardEl.appendChild(p);
          particles.push(p);
        }
      }
      // Animate particles in a circle
      const rect = cardEl.getBoundingClientRect();
      const centerX = rect.width / 2, centerY = rect.height / 2;
      particles.forEach((p, i) => {
        let angle = (Date.now()/100 + i*360/config.particleCount) * Math.PI/180;
        let r = 30 + 12*Math.sin(Date.now()/(400+i*60));
        p.style.left = (centerX + r*Math.cos(angle)) + 'px';
        p.style.top = (centerY + r*Math.sin(angle)) + 'px';
      });
    }
    // Tilt
    if (config.enableTilt || config.enableMagnetism) {
      const rect = cardEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width/2, centerY = rect.height/2;
      if (config.enableTilt) {
        cardEl.style.transform = `perspective(900px) rotateX(${((y-centerY)/centerY)*-10}deg) rotateY(${((x-centerX)/centerX)*10}deg)`;
      }
      if (config.enableMagnetism) {
        cardEl.style.left = ((x-centerX)*0.05) + "px";
        cardEl.style.top = ((y-centerY)*0.05) + "px";
        cardEl.style.position = "relative";
      }
    }
  });
  cardEl.addEventListener('mouseleave', ()=>{
    cardEl.style.setProperty('--glow-intensity', 0);
    if (config.enableTilt) cardEl.style.transform = "";
    if (config.enableMagnetism) {
      cardEl.style.left="";cardEl.style.top="";cardEl.style.position="";
    }
    particles.forEach(p=>p.remove());
    particles=[];
  });
  // Click ripple effect
  cardEl.addEventListener('click', e=>{
    if (!config.clickEffect) return;
    const rect = cardEl.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const maxD = Math.max(rect.width, rect.height);
    const ripple = document.createElement('div');
    ripple.style.cssText = `position:absolute;pointer-events:none;z-index:30;width:${2*maxD}px;height:${2*maxD}px;border-radius:50%;background:radial-gradient(circle,rgba(${config.glowColor},.4) 0%, rgba(${config.glowColor},.2) 30%,transparent 70%);left:${x-maxD}px;top:${y-maxD}px;opacity:1;transform:scale(0);transition:transform 0.8s cubic-bezier(.2,.68,.6,.99),opacity 0.8s;`;
    cardEl.appendChild(ripple);
    setTimeout(()=>{ripple.style.transform="scale(1)";ripple.style.opacity=0;},0);
    setTimeout(()=>{ripple.remove();},900);
  });
}

// ----- Global Spotlight effect -----
const spotlight = document.getElementById("globalSpotlight");
document.addEventListener('mousemove', e=>{
  if (!config.enableSpotlight) {
    spotlight.style.opacity = 0; return;
  }
  const gridRect = grid.getBoundingClientRect();
  if (
    e.clientX >= gridRect.left && e.clientX <= gridRect.right &&
    e.clientY >= gridRect.top && e.clientY <= gridRect.bottom
  ) {
    spotlight.style.opacity = 0.8;
    spotlight.style.left = e.clientX+'px';
    spotlight.style.top = e.clientY+'px';
    spotlight.style.background = `radial-gradient(circle,rgba(${config.glowColor},.15) 0%,rgba(${config.glowColor},.08) 30%,transparent 80%)`;
  } else {
    spotlight.style.opacity = 0;
    grid.querySelectorAll('.card').forEach(card=>card.style.setProperty('--glow-intensity', 0));
  }
});
spotlight.style.width = spotlight.style.height = config.spotlightRadius*2+"px";

// ----- Responsive update -----
window.addEventListener('resize', ()=> spotlight.style.display = config.enableSpotlight ? 'block':'none');

// ----- TweakPane Controls -----
const pane = new Pane({ container: document.getElementById('pane-container'), title: "MagicBento Config" });
pane.addInput(config, "textAutoHide", { label: "Text Auto Hide" }).on('change', renderCards);
pane.addInput(config, "enableStars", { label: "Particles/Stars" }).on('change', renderCards);
pane.addInput(config, "enableSpotlight", { label: "Spotlight" });
pane.addInput(config, "enableBorderGlow", { label: "Border Glow" }).on('change', renderCards);
pane.addInput(config, "enableTilt", { label: "Tilt 3D" });
pane.addInput(config, "enableMagnetism", { label: "Magnetism" });
pane.addInput(config, "clickEffect", { label: "Ripple on Click" });
pane.addInput(config, "spotlightRadius", { min: 100, max: 500, step: 10 }).on('change', v=>{
  spotlight.style.width = spotlight.style.height = v.value*2+"px";
});
pane.addInput(config, "particleCount", { min: 0, max: 32, step:1 }).on('change', renderCards);
pane.addInput(config, "glowColor", { label: "Glow Color (r,g,b)" }).on('change', v => {
  document.documentElement.style.setProperty('--glow-color', config.glowColor);
  renderCards();
});

// Update cards live on most changes
pane.on('change', ()=> renderCards());
