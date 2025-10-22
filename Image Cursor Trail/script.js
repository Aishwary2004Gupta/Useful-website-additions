class AutoImageCursorTrail {
  constructor() {
    this.container = document.getElementById("cursorTrailContainer");
    this.dotCursor = document.getElementById("dotCursor");
    this.statusMode = document.getElementById("status-mode");
    this.resetButton = document.getElementById("resetButton");

    // Flame cursor configuration
    this.flameConfig = {
      imageLifespan: 600,
      removalDelay: 16,
      mouseThreshold: 20, // Lower threshold for smoother auto movement
      inDuration: 400,
      outDuration: 600,
      inEasing: "cubic-bezier(.07,.5,.5,1)",
      outEasing: "cubic-bezier(.87, 0, .13, 1)",
      minMovementForImage: 2, // Lower for continuous auto movement
      baseImageSize: 120,
      minImageSize: 80,
      maxImageSize: 200,
      baseRotation: 45,
      maxRotationFactor: 3,
      imageInterval: 60, // Faster image creation for auto movement
      trailLength: 30
    };

    // Flame images - using the blurry orange images
    this.flameImages = [
      "https://assets.codepen.io/7558/cr-blurry-orange-small-001.jpg",
      "https://assets.codepen.io/7558/cr-blurry-orange-small-002.jpg",
      "https://assets.codepen.io/7558/cr-blurry-orange-small-003.jpg",
      "https://assets.codepen.io/7558/cr-blurry-orange-small-004.jpg",
      "https://assets.codepen.io/7558/cr-blurry-orange-small-005.jpg",
      "https://assets.codepen.io/7558/cr-blurry-orange-small-006.jpg",
      "https://assets.codepen.io/7558/cr-blurry-orange-small-007.jpg",
      "https://assets.codepen.io/7558/cr-blurry-orange-small-008.jpg",
      "https://assets.codepen.io/7558/cr-blurry-orange-small-009.jpg",
      "https://assets.codepen.io/7558/cr-blurry-orange-small-010.jpg",
      "https://assets.codepen.io/7558/cr-blurry-orange-small-011.jpg",
      "https://assets.codepen.io/7558/cr-blurry-orange-small-012.jpg",
      "https://assets.codepen.io/7558/cr-blurry-orange-small-013.jpg",
      "https://assets.codepen.io/7558/cr-blurry-orange-small-014.jpg"
    ];

    // Flame trail variables
    this.flameTrail = [];
    this.flameImageIndex = 0;
    this.lastFlameTime = 0;
    this.lastRemovalTime = 0;
    this.isMoving = false;
    this.isCursorInContainer = false;

    // Auto movement variables - Infinity symbol parameters
    this.mouseMoved = false;
    this.autoMovementTime = 0;
    this.autoMovementSpeed = 0.002; // Speed of infinity symbol animation
    
    // Infinity symbol parameters
    this.infinityParams = {
      centerX: 0.5 * window.innerWidth,
      centerY: 0.5 * window.innerHeight,
      width: 300,  // Width of the infinity symbol
      height: 150, // Height of the infinity symbol
      rotation: 0  // Current rotation angle
    };

    this.pointer = {
      x: this.infinityParams.centerX,
      y: this.infinityParams.centerY
    };

    // Smooth trail physics
    this.params = {
      pointsNumber: 20, // Reduced for smoother auto movement
      widthFactor: 0.3,
      mouseThreshold: 0.6,
      spring: 0.6, // Increased spring for tighter following
      friction: 0.7 // Increased friction for less overshoot
    };
    
    this.trail = new Array(this.params.pointsNumber);
    for (let i = 0; i < this.params.pointsNumber; i++) {
      this.trail[i] = {
        x: this.pointer.x,
        y: this.pointer.y,
        dx: 0,
        dy: 0
      };
    }

    // Cursor trail dots
    this.cursorTrailDots = [];
    this.maxTrailDots = 8;

    this.lastImageTime = 0;
    this.userInteracted = false;
    this.animationId = null;

    this.lastPosition = { x: this.pointer.x, y: this.pointer.y };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startAutoAnimation();
    this.updateDotCursor();
  }

  setupEventListeners() {
    // Mouse movement - ONLY inside container triggers user control
    this.container.addEventListener("mousemove", (e) => {
      this.handleUserInteraction();
      this.updateMousePosition(e.clientX, e.clientY);
      this.updateDotCursorPosition(e.clientX, e.clientY);
      this.createCursorTrailDot(e.clientX, e.clientY);
      this.handleFlameMovement(e.clientX, e.clientY);
    });

    // Touch movement - ONLY inside container
    this.container.addEventListener("touchmove", (e) => {
      e.preventDefault();
      this.handleUserInteraction();
      if (e.touches[0]) {
        this.updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
        this.updateDotCursorPosition(
          e.touches[0].clientX,
          e.touches[0].clientY
        );
        this.handleFlameMovement(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    // Global mouse move for cursor visibility only (doesn't trigger user control)
    document.addEventListener("mousemove", (e) => {
      this.updateDotCursorPosition(e.clientX, e.clientY);
      this.createCursorTrailDot(e.clientX, e.clientY);
    });

    // Click also counts as interaction - ONLY inside container
    this.container.addEventListener("click", (e) => {
      this.handleUserInteraction();
      this.updateMousePosition(e.clientX, e.clientY);
    });

    // Reset button
    this.resetButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.resetAutoMovement();
    });

    // Hide default cursor only in container
    this.container.style.cursor = "none";
  }

  // Calculate infinity symbol position
  calculateInfinityPosition(time) {
    const t = time * this.autoMovementSpeed;
    
    // Parametric equations for infinity symbol (lemniscate)
    const scale = 1 + 0.1 * Math.sin(t * 0.5); // Pulsing effect
    const a = this.infinityParams.width * scale;
    const b = this.infinityParams.height * scale;
    
    const x = a * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
    const y = b * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
    
    // Add some variation to make it more organic
    const variation = 0.05;
    const varX = variation * a * Math.sin(t * 2);
    const varY = variation * b * Math.cos(t * 3);
    
    return {
      x: this.infinityParams.centerX + x + varX,
      y: this.infinityParams.centerY + y + varY
    };
  }

  // Flame cursor methods
  handleFlameMovement(x, y) {
    this.isCursorInContainer = this.isInContainer(x, y);
    
    if (this.isCursorInContainer && this.hasMovedEnough() && this.hasMovedAtAll()) {
      this.isMoving = true;
      clearTimeout(this.moveTimeout);
      this.moveTimeout = setTimeout(() => (this.isMoving = false), 100);
      
      const speed = this.calculateSpeed(x, y);
      this.createFlameImage(speed);
    }
  }

  isInContainer(x, y) {
    const rect = this.container.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }

  hasMovedEnough() {
    const dx = this.pointer.x - this.lastPosition.x;
    const dy = this.pointer.y - this.lastPosition.y;
    return Math.hypot(dx, dy) > this.flameConfig.mouseThreshold;
  }

  hasMovedAtAll() {
    const dx = this.pointer.x - this.lastPosition.x;
    const dy = this.pointer.y - this.lastPosition.y;
    return Math.hypot(dx, dy) > this.flameConfig.minMovementForImage;
  }

  calculateSpeed(x, y) {
    const now = Date.now();
    const dt = now - this.lastFlameTime;
    if (dt <= 0) return 0.5;
    
    const dist = Math.hypot(x - this.lastPosition.x, y - this.lastPosition.y);
    const raw = dist / dt;
    const norm = Math.min(raw / 0.5, 1);
    
    this.lastFlameTime = now;
    return norm;
  }

  createFlameImage(speed = 0.5) {
    const imageSrc = this.flameImages[this.flameImageIndex];
    this.flameImageIndex = (this.flameImageIndex + 1) % this.flameImages.length;

    const size = this.flameConfig.minImageSize + 
      (this.flameConfig.maxImageSize - this.flameConfig.minImageSize) * speed;
    
    const img = document.createElement("img");
    img.className = "flame-trail-img";
    const rotFactor = 1 + speed * (this.flameConfig.maxRotationFactor - 1);
    const rot = (Math.random() - 0.5) * this.flameConfig.baseRotation * rotFactor;

    img.src = imageSrc;
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    
    const rect = this.container.getBoundingClientRect();
    const x = this.pointer.x - rect.left;
    const y = this.pointer.y - rect.top;
    
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(0)`;
    img.style.transition = `transform ${this.flameConfig.inDuration}ms ${this.flameConfig.inEasing}, opacity ${this.flameConfig.outDuration}ms ease-out`;
    img.style.opacity = '1';
    
    this.container.appendChild(img);

    setTimeout(() => {
      img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(1)`;
    }, 10);

    this.flameTrail.push({
      element: img,
      rotation: rot,
      removeTime: Date.now() + this.flameConfig.imageLifespan
    });

    // Limit trail length
    if (this.flameTrail.length > this.flameConfig.trailLength) {
      const oldFlame = this.flameTrail.shift();
      this.removeFlameImage(oldFlame);
    }

    this.lastPosition = { x: this.pointer.x, y: this.pointer.y };
  }

  removeFlameImage(flameObj) {
    flameObj.element.style.transform = `translate(-50%, -50%) rotate(${flameObj.rotation + 180}deg) scale(0)`;
    flameObj.element.style.opacity = '0';
    
    setTimeout(() => {
      if (flameObj.element.parentNode) {
        flameObj.element.parentNode.removeChild(flameObj.element);
      }
    }, this.flameConfig.outDuration);
  }

  removeOldFlameImages() {
    const now = Date.now();
    if (now - this.lastRemovalTime < this.flameConfig.removalDelay || !this.flameTrail.length) return;
    
    if (now >= this.flameTrail[0].removeTime) {
      const flameObj = this.flameTrail.shift();
      this.removeFlameImage(flameObj);
      this.lastRemovalTime = now;
    }
  }

  // Auto movement flame creation - behaves like user movement
  createAutoFlameImage(x, y) {
    const imageSrc = this.flameImages[this.flameImageIndex];
    this.flameImageIndex = (this.flameImageIndex + 1) % this.flameImages.length;

    // Calculate speed based on movement for auto mode too
    const dist = Math.hypot(x - this.lastPosition.x, y - this.lastPosition.y);
    const speed = Math.min(dist / 10, 1);
    
    const size = this.flameConfig.minImageSize + 
      (this.flameConfig.maxImageSize - this.flameConfig.minImageSize) * speed;
    
    const img = document.createElement("img");
    img.className = "flame-trail-img";
    const rot = (Math.random() - 0.5) * this.flameConfig.baseRotation * (1 + speed);

    img.src = imageSrc;
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    
    const rect = this.container.getBoundingClientRect();
    const relativeX = x - rect.left;
    const relativeY = y - rect.top;
    
    img.style.left = `${relativeX}px`;
    img.style.top = `${relativeY}px`;
    img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(0)`;
    img.style.transition = `transform ${this.flameConfig.inDuration}ms ${this.flameConfig.inEasing}, opacity ${this.flameConfig.outDuration}ms ease-out`;
    img.style.opacity = '1';
    
    this.container.appendChild(img);

    setTimeout(() => {
      img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(1)`;
    }, 10);

    this.flameTrail.push({
      element: img,
      rotation: rot,
      removeTime: Date.now() + this.flameConfig.imageLifespan
    });

    // Limit trail length
    if (this.flameTrail.length > this.flameConfig.trailLength) {
      const oldFlame = this.flameTrail.shift();
      this.removeFlameImage(oldFlame);
    }
  }

  // Original methods
  handleUserInteraction() {
    if (!this.userInteracted) {
      this.userInteracted = true;
      this.mouseMoved = true;
      this.statusMode.textContent = "User Control";
      this.statusMode.className = "status-user";
      this.dotCursor.classList.add("pulsing");
    }
  }

  updateMousePosition(x, y) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.mouseMoved = true;
  }

  updateDotCursorPosition(x, y) {
    this.dotCursor.style.left = x + "px";
    this.dotCursor.style.top = y + "px";
  }

  createCursorTrailDot(x, y) {
    const trailDot = document.createElement("div");
    trailDot.className = "cursor-trail-dot";
    trailDot.style.left = x + "px";
    trailDot.style.top = y + "px";
    document.body.appendChild(trailDot);

    this.cursorTrailDots.push(trailDot);

    setTimeout(() => {
      if (trailDot.parentNode) {
        trailDot.parentNode.removeChild(trailDot);
      }
      this.cursorTrailDots = this.cursorTrailDots.filter(
        (dot) => dot !== trailDot
      );
    }, 600);

    if (this.cursorTrailDots.length > this.maxTrailDots) {
      const oldDot = this.cursorTrailDots.shift();
      if (oldDot && oldDot.parentNode) {
        oldDot.parentNode.removeChild(oldDot);
      }
    }
  }

  updateDotCursor() {
    this.dotCursor.style.left = this.pointer.x + "px";
    this.dotCursor.style.top = this.pointer.y + "px";

    if (!this.userInteracted) {
      this.createCursorTrailDot(this.pointer.x, this.pointer.y);
    }
  }

  startAutoAnimation() {
    const animate = (t) => {
      this.animationId = requestAnimationFrame(animate);
      this.updateAutoPointer(t);
      this.updateTrailPhysics();
      this.updateDotCursor();
      this.removeOldFlameImages();

      // Continuous flame creation in auto mode - behaves like user movement
      if (!this.userInteracted && this.hasMovedAtAll()) {
        this.createAutoFlameImage(this.pointer.x, this.pointer.y);
        this.lastPosition = { x: this.pointer.x, y: this.pointer.y };
      }
    };
    this.animationId = requestAnimationFrame(animate);
  }

  updateAutoPointer(t) {
    if (!this.mouseMoved && !this.userInteracted) {
      this.autoMovementTime = t;
      const newPos = this.calculateInfinityPosition(t);
      
      this.pointer.x = newPos.x;
      this.pointer.y = newPos.y;
    }
  }

  updateTrailPhysics() {
    this.trail.forEach((p, pIdx) => {
      const prev = pIdx === 0 ? this.pointer : this.trail[pIdx - 1];
      const spring = pIdx === 0 ? 0.4 * this.params.spring : this.params.spring;
      p.dx += (prev.x - p.x) * spring;
      p.dy += (prev.y - p.y) * spring;
      p.dx *= this.params.friction;
      p.dy *= this.params.friction;
      p.x += p.dx;
      p.y += p.dy;
    });
  }

  resetAutoMovement() {
    this.userInteracted = false;
    this.mouseMoved = false;
    this.autoMovementTime = 0;

    // Reset to center
    this.infinityParams.centerX = 0.5 * window.innerWidth;
    this.infinityParams.centerY = 0.5 * window.innerHeight;
    
    this.pointer.x = this.infinityParams.centerX;
    this.pointer.y = this.infinityParams.centerY;

    // Reset trail
    for (let i = 0; i < this.params.pointsNumber; i++) {
      this.trail[i] = {
        x: this.pointer.x,
        y: this.pointer.y,
        dx: 0,
        dy: 0
      };
    }

    // Clear flame trail
    this.flameTrail.forEach((flame) => {
      this.removeFlameImage(flame);
    });
    this.flameTrail = [];

    this.statusMode.textContent = "Auto Movement";
    this.statusMode.className = "status-auto";
    this.dotCursor.classList.remove("pulsing");

    this.cursorTrailDots.forEach((dot) => {
      if (dot.parentNode) {
        dot.parentNode.removeChild(dot);
      }
    });
    this.cursorTrailDots = [];

    this.lastPosition = { x: this.pointer.x, y: this.pointer.y };
    this.updateDotCursorPosition(this.pointer.x, this.pointer.y);
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// Add flame cursor CSS optimized for white background
const flameCursorCSS = `
.flame-trail-img {
  position: absolute;
  object-fit: cover;
  transform-origin: center;
  pointer-events: none;
  will-change: transform;
  z-index: 12;
  border-radius: 12px;
  opacity: 1;
  filter: brightness(1.1) contrast(1.2) saturate(1.3);
  box-shadow: 0 4px 20px rgba(255, 69, 0, 0.3);
  transition: transform 0.4s cubic-bezier(.07,.5,.5,1), opacity 0.6s ease-out;
}

.flame-trail-img:hover {
  filter: brightness(1.3) contrast(1.4) saturate(1.5);
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = flameCursorCSS;
document.head.appendChild(style);

let cursorTrailInstance = null;
window.addEventListener("load", () => {
  cursorTrailInstance = new AutoImageCursorTrail();
});

window.addEventListener("resize", () => {
  if (cursorTrailInstance && !cursorTrailInstance.userInteracted) {
    cursorTrailInstance.infinityParams.centerX = 0.5 * window.innerWidth;
    cursorTrailInstance.infinityParams.centerY = 0.5 * window.innerHeight;
  }
});

window.addEventListener("beforeunload", () => {
  if (cursorTrailInstance) {
    cursorTrailInstance.stopAnimation();
  }
});