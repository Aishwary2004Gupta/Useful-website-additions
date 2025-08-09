import { gsap } from 'gsap';
import './MagicBento.css';

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = "132, 0, 255";

const cardData = [
  { color: "#060010", title: "Analytics", description: "Track user behavior", label: "Insights" },
  { color: "#060010", title: "Dashboard", description: "Centralized data view", label: "Overview" },
  { color: "#060010", title: "Collaboration", description: "Work together seamlessly", label: "Teamwork" },
  { color: "#060010", title: "Automation", description: "Streamline workflows", label: "Efficiency" },
  { color: "#060010", title: "Integration", description: "Connect favorite tools", label: "Connectivity" },
  { color: "#060010", title: "Security", description: "Enterprise‑grade protection", label: "Protection" },
];

const createParticle = (x, y, glowColor) => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position: absolute; width:4px; height:4px; border-radius:50%;
    background:rgba(${glowColor},1);
    box-shadow:0 0 6px rgba(${glowColor},0.6);
    pointer-events:none; z-index:100;
    left:${x}px; top:${y}px;
  `;
  return el;
};

const calculateSpotlight = (radius) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75
});

function updateGlow(card, mouseX, mouseY, glow, radius) {
  const rect = card.getBoundingClientRect();
  const relX = ((mouseX - rect.left) / rect.width) * 100;
  const relY = ((mouseY - rect.top) / rect.height) * 100;
  card.style.setProperty("--glow-x", relX + "%");
  card.style.setProperty("--glow-y", relY + "%");
  card.style.setProperty("--glow-intensity", glow);
  card.style.setProperty("--glow-radius", radius + "px");
}

class ParticleCard {
  constructor(el, options) {
    this.el = el;
    Object.assign(this, options);
    this.init();
  }
  init() {
    this.particles = [];
    this.memo = [];
    this.hovered = false;
    this.setupEvents();
  }
  setupEvents() {
    this.el.addEventListener("mouseenter", () => {
      this.hovered = true;
      if (config.starsEffect && !config.disableAnimations) {
        this.spawnParticles();
      }
      if (config.tiltEffect && !config.disableAnimations) {
        gsap.to(this.el, { rotateX: 5, rotateY: 5, duration: 0.3, ease: "power2.out", transformPerspective: 1000 });
      }
    });

    this.el.addEventListener("mouseleave", () => {
      this.hovered = false;
      this.clearAll();
      if (config.tiltEffect && !config.disableAnimations) {
        gsap.to(this.el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: "power2.out" });
      }
      if (config.magnetism && !config.disableAnimations) {
        gsap.to(this.el, { x: 0, y: 0, duration: 0.3, ease: "power2.out" });
      }
    });

    this.el.addEventListener("mousemove", (e) => {
      if (config.disableAnimations) return;
      
      const rect = this.el.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const cx = rect.width / 2, cy = rect.height / 2;

      if (config.tiltEffect) {
        gsap.to(this.el, { 
          rotateX: ((y - cy) / cy) * -10,
          rotateY: ((x - cx) / cx) * 10,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000
        });
      }
      
      if (config.magnetism) {
        gsap.to(this.el, {
          x: (x - cx) * 0.05,
          y: (y - cy) * 0.05,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });

    this.el.addEventListener("click", (e) => {
      if (!config.clickEffect || config.disableAnimations) return;
      const rect = this.el.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const maxDist = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );
      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position:absolute; width:${maxDist * 2}px; height:${maxDist * 2}px;
        border-radius:50%;
        background:radial-gradient(circle, rgba(${this.glowColor},0.4) 0%, rgba(${this.glowColor},0.2) 30%, transparent 70%);
        left:${x - maxDist}px; top:${y - maxDist}px;
        pointer-events:none; z-index:1000;
      `;
      this.el.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: "power2.out", onComplete: () => ripple.remove() });
    });
  }

  spawnParticles() {
    if (this.memo.length === 0) {
      const rect = this.el.getBoundingClientRect();
      for (let i = 0; i < this.particleCount; i++) {
        this.memo.push(createParticle(Math.random() * rect.width, Math.random() * rect.height, this.glowColor));
      }
    }
    this.memo.forEach((p, i) => {
      setTimeout(() => {
        if (!this.hovered) return;
        const clone = p.cloneNode(true);
        this.el.appendChild(clone);
        this.particles.push(clone);
        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" });
        gsap.to(clone, { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, rotation: Math.random() * 360, duration: 2 + Math.random() * 2, ease: "none", repeat: -1, yoyo: true });
        gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: "power2.inOut", repeat: -1, yoyo: true });
      }, i * 100);
    });
  }

  clearAll() {
    this.particles.forEach(p => gsap.to(p, { scale: 0, opacity: 0, duration: 0.3, ease: "back.in(1.7)", onComplete: () => p.remove() }));
    this.particles = [];
  }
}

// Replace React component with vanilla JS initialization
document.addEventListener('DOMContentLoaded', () => {
    const gridRef = document.getElementById('cardGrid');
    
    // Create spotlight
    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    document.body.appendChild(spotlight);

    const config = {
        spotlightRadius: DEFAULT_SPOTLIGHT_RADIUS,
        starsEffect: true,
        spotlightEffect: true,
        tiltEffect: true,
        clickEffect: true,
        magnetism: true,
        disableAnimations: false
    };

    // Initialize cards
    cardData.forEach(cfg => {
        const card = document.createElement('div');
        card.className = 'card card--text-autohide card--border-glow';
        card.style.backgroundColor = cfg.color;
        card.innerHTML = `
            <div class="card__header"><div class="card__label">${cfg.label}</div></div>
            <div class="card__content">
                <h2 class="card__title">${cfg.title}</h2>
                <p class="card__description">${cfg.description}</p>
            </div>
        `;
        gridRef.appendChild(card);

        new ParticleCard(card, {
            particleCount: DEFAULT_PARTICLE_COUNT,
            glowColor: DEFAULT_GLOW_COLOR,
            enableTilt: config.tiltEffect,
            clickEffect: config.clickEffect,
            enableMagnetism: config.magnetism
        });
    });

    // Initialize spotlight effect
    new GlobalSpotlight(gridRef, {
        spotlightRadius: config.spotlightRadius,
        glowColor: DEFAULT_GLOW_COLOR
    });
});
        const cr = card.getBoundingClientRect();
        const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(cr.width, cr.height) / 2;
        const eff = Math.max(0, dist);
        minDist = Math.min(minDist, eff);
        let glowIntensity = 0;
        if (eff <= proximity) glowIntensity = 1;
        else if (eff <= fadeDistance) glowIntensity = (fadeDistance - eff) / (fadeDistance - proximity);
        updateGlow(card, e.clientX, e.clientY, glowIntensity, config.spotlightRadius);
      });

      gsap.to(spotlight, { left: e.clientX, top: e.clientY, duration: 0.1, ease: "power2.out" });
      const targetOpacity = minDist <= proximity
        ? 0.8
        : (minDist <= fadeDistance ? ((fadeDistance - minDist) / (fadeDistance - proximity)) * 0.8 : 0);
      gsap.to(spotlight, { opacity: targetOpacity, duration: targetOpacity > 0 ? 0.2 : 0.5, ease: "power2.out" });
    };

    const mouseLeaveHandler = () => {
      grid.querySelectorAll(".card").forEach(c => c.style.setProperty("--glow-intensity", 0));
      gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: "power2.out" });
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    grid.addEventListener("mouseleave", mouseLeaveHandler);

    cardData.forEach(cfg => {
      const card = document.createElement("div");
      card.className = "card card--text-autohide card--border-glow";
      card.style.backgroundColor = cfg.color;
      card.style.setProperty("--glow-color", DEFAULT_GLOW_COLOR);

      card.innerHTML = `
        <div class="card__header"><div class="card__label">${cfg.label}</div></div>
        <div class="card__content">
          <h2 class="card__title">${cfg.title}</h2>
          <p class="card__description">${cfg.description}</p>
        </div>
      `;
      grid.append(card);

      new ParticleCard(card, {
        particleCount: DEFAULT_PARTICLE_COUNT,
        glowColor: DEFAULT_GLOW_COLOR,
        enableTilt: config.tiltEffect,
        clickEffect: config.clickEffect,
        enableMagnetism: config.magnetism
      });
    });

    return () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      grid.removeEventListener("mouseleave", mouseLeaveHandler);
      spotlight.remove();
    };
  }, [enableSpotlight, spotlightRadius, glowColor]);

  return (
    <section className="bento-section">
      <div className="card-grid" ref={gridRef}>
        {cardData.map((card, index) => (
          <div
            key={index}
            className={`card ${textAutoHide ? 'card--text-autohide' : ''} ${enableBorderGlow ? 'card--border-glow' : ''}`}
            style={{ backgroundColor: card.color }}
          >
            <div className="card__header">
              <div className="card__label">{card.label}</div>
            </div>
            <div className="card__content">
              <h2 className="card__title">{card.title}</h2>
              <p className="card__description">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MagicBento;
