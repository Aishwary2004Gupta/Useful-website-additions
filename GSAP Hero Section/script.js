document.addEventListener("DOMContentLoaded", () => {
  // GSAP text animations
  const animateTextColumns = () => {
    console.log("Starting GSAP animations");
    console.log("GSAP version:", gsap.version);
    const tl = gsap.timeline();
    // Animate text columns with stagger
    tl.to(".text-item", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.8,
      ease: "power2.out",
      stagger: {
        amount: 3,
        from: "start"
      }
    })
      // Animate rotated text
      .to(
        ".rotated-item",
        {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.2
        },
        "-=2"
      );
    console.log("GSAP timeline created");
  };
  // Start text animation after a brief delay
  setTimeout(animateTextColumns, 200);

  const container = document.querySelector(".hero-section");
  const speedIndicator = document.querySelector(".speed-indicator");
  const isMobile =
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    window.innerWidth <= 768;

  const config = {
    imageCount: 14,
    imageLifespan: 600, // REDUCED from 1200 - images disappear faster
    removalDelay: 16, // REDUCED from 30 - cleanup happens more frequently
    mouseThreshold: isMobile ? 20 : 40,
    scrollThreshold: 50,
    inDuration: 600,
    outDuration: 800,
    inEasing: "cubic-bezier(.07,.5,.5,1)",
    outEasing: "cubic-bezier(.87, 0, .13, 1)",
    touchImageInterval: 40,
    minMovementForImage: isMobile ? 3 : 5,
    baseImageSize: isMobile ? 180 : 240,
    minImageSize: isMobile ? 120 : 160,
    maxImageSize: isMobile ? 260 : 340,
    baseRotation: 30,
    maxRotationFactor: 3,
    speedSmoothingFactor: 0.25,
    showSpeedIndicator: true,
    staggerRange: 50,
    easing: {
      scale: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      reveal: "cubic-bezier(0.87, 0, 0.13, 1)"
    }
  };

  const images = [
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

  // Pattern definitions (unchanged)
  const PATTERNS = {
    flame: {
      name: "Flame Trail",
      create: (container, imageSrc, size) => {
        // Original flame effect - just a simple image
        const img = document.createElement("img");
        img.className = "trail-img";
        img.src = imageSrc;
        img.width = img.height = size;
        return [
          {
            element: img,
            index: 0,
            reveal: () => {},
            collapse: () => {}
          }
        ];
      },
      revealTiming: () => 0,
      collapseTiming: () => 0
    },
    venetian: {
      name: "Venetian Blinds",
      create: (container, imageSrc, size) => {
        const fragments = [];
        const stripCount = 12;
        const stripHeight = 100 / stripCount;
        for (let i = 0; i < stripCount; i++) {
          const fragment = document.createElement("div");
          fragment.className = "image-fragment";
          const bg = document.createElement("div");
          bg.className = "fragment-bg";
          bg.style.backgroundImage = `url(${imageSrc})`;
          const y = i * stripHeight;
          fragment.style.cssText = `
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                transform: translate3d(0, 0, 0) rotateX(90deg);
                transform-origin: 50% ${y + stripHeight / 2}%;
                clip-path: polygon(0% ${y}%, 100% ${y}%, 100% ${
            y + stripHeight
          }%, 0% ${y + stripHeight}%);
                transition: transform ${config.inDuration}ms ${
            config.easing.reveal
          };
              `;
          fragment.appendChild(bg);
          fragments.push({
            element: fragment,
            index: i,
            reveal: () => {
              fragment.style.transform = `translate3d(0, 0, 0) rotateX(0deg)`;
            },
            collapse: () => {
              fragment.style.transform = `translate3d(0, 0, 0) rotateX(-90deg)`;
            }
          });
        }
        return fragments;
      },
      revealTiming: (i, total) => Math.abs(i - total / 2) * 0.08,
      collapseTiming: (i, total) => i * 0.04
    },
    liquid: {
      name: "Liquid Drops",
      create: (container, imageSrc, size) => {
        const fragments = [];
        const positions = [
          { x: 25, y: 20, r: 16 },
          { x: 70, y: 15, r: 12 },
          { x: 45, y: 35, r: 18 },
          { x: 15, y: 55, r: 14 },
          { x: 80, y: 45, r: 15 },
          { x: 55, y: 70, r: 20 },
          { x: 30, y: 80, r: 13 },
          { x: 75, y: 75, r: 17 }
        ];
        positions.forEach((pos, i) => {
          const fragment = document.createElement("div");
          fragment.className = "image-fragment";
          const bg = document.createElement("div");
          bg.className = "fragment-bg";
          bg.style.backgroundImage = `url(${imageSrc})`;
          fragment.style.cssText = `
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                clip-path: circle(0% at ${pos.x}% ${pos.y}%);
                transition: clip-path ${config.inDuration}ms ${config.easing.reveal};
              `;
          fragment.appendChild(bg);
          fragments.push({
            element: fragment,
            index: i,
            reveal: () => {
              fragment.style.clipPath = `circle(${pos.r}% at ${pos.x}% ${pos.y}%)`;
            },
            collapse: () => {
              fragment.style.clipPath = `circle(0% at ${pos.x}% ${pos.y}%)`;
            }
          });
        });
        return fragments;
      },
      revealTiming: (i, total) => (i / total) * 0.4,
      collapseTiming: (i, total) => ((total - 1 - i) / total) * 0.25
    },
    curtain: {
      name: "Curtain Sweep",
      create: (container, imageSrc, size) => {
        const fragments = [];
        const stripCount = 10;
        for (let i = 0; i < stripCount; i++) {
          const fragment = document.createElement("div");
          fragment.className = "image-fragment";
          const bg = document.createElement("div");
          bg.className = "fragment-bg";
          bg.style.backgroundImage = `url(${imageSrc})`;
          const x = (i / stripCount) * 100;
          const w = 100 / stripCount;
          fragment.style.cssText = `
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                clip-path: polygon(${x + w / 2}% 0%, ${x + w / 2}% 0%, ${
            x + w / 2
          }% 100%, ${x + w / 2}% 100%);
                transition: clip-path ${config.inDuration}ms ${
            config.easing.reveal
          };
              `;
          fragment.appendChild(bg);
          fragments.push({
            element: fragment,
            index: i,
            reveal: () => {
              fragment.style.clipPath = `polygon(${x}% 0%, ${x + w}% 0%, ${
                x + w
              }% 100%, ${x}% 100%)`;
            },
            collapse: () => {
              fragment.style.clipPath = `polygon(${x + w / 2}% 0%, ${
                x + w / 2
              }% 0%, ${x + w / 2}% 100%, ${x + w / 2}% 100%)`;
            }
          });
        }
        return fragments;
      },
      revealTiming: (i, total) => (i / total) * 0.6,
      collapseTiming: (i, total) => ((total - 1 - i) / total) * 0.3
    },
    hexagon: {
      name: "Hexagon Bloom",
      create: (container, imageSrc, size) => {
        const fragments = [];
        const hexagons = [
          { x: 50, y: 50, size: 20 },
          { x: 25, y: 25, size: 15 },
          { x: 75, y: 25, size: 15 },
          { x: 85, y: 50, size: 15 },
          { x: 75, y: 75, size: 15 },
          { x: 25, y: 75, size: 15 },
          { x: 15, y: 50, size: 15 }
        ];
        hexagons.forEach((hex, i) => {
          const fragment = document.createElement("div");
          fragment.className = "image-fragment";
          const bg = document.createElement("div");
          bg.className = "fragment-bg";
          bg.style.backgroundImage = `url(${imageSrc})`;
          const s = hex.size;
          const x = hex.x;
          const y = hex.y;
          const hexShape = `polygon(${x - s * 0.5}% ${y - s * 0.87}%, ${
            x + s * 0.5
          }% ${y - s * 0.87}%, ${x + s}% ${y}%, ${x + s * 0.5}% ${
            y + s * 0.87
          }%, ${x - s * 0.5}% ${y + s * 0.87}%, ${x - s}% ${y}%)`;
          fragment.style.cssText = `
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                clip-path: polygon(${x}% ${y}%, ${x}% ${y}%, ${x}% ${y}%);
                transition: clip-path ${config.inDuration}ms ${config.easing.reveal};
              `;
          fragment.appendChild(bg);
          fragments.push({
            element: fragment,
            index: i,
            reveal: () => {
              fragment.style.clipPath = hexShape;
            },
            collapse: () => {
              fragment.style.clipPath = `polygon(${x}% ${y}%, ${x}% ${y}%, ${x}% ${y}%)`;
            }
          });
        });
        return fragments;
      },
      revealTiming: (i, total) => (i === 0 ? 0 : 0.2 + (i - 1) * 0.06),
      collapseTiming: (i, total) => (i === 0 ? 0.3 : (i - 1) * 0.04)
    },
    zoomsplit: {
      name: "Zoom Split",
      create: (container, imageSrc, size) => {
        const fragments = [];
        const gridSize = 3;
        for (let row = 0; row < gridSize; row++) {
          for (let col = 0; col < gridSize; col++) {
            const fragment = document.createElement("div");
            fragment.className = "image-fragment";
            const bg = document.createElement("div");
            bg.className = "fragment-bg";
            bg.style.backgroundImage = `url(${imageSrc})`;
            const x = (col / gridSize) * 100;
            const y = (row / gridSize) * 100;
            const w = 100 / gridSize;
            const h = 100 / gridSize;
            fragment.style.cssText = `
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  clip-path: polygon(${x + w / 2}% ${y + h / 2}%, ${
              x + w / 2
            }% ${y + h / 2}%, ${x + w / 2}% ${y + h / 2}%, ${x + w / 2}% ${
              y + h / 2
            }%);
                  transition: clip-path ${config.inDuration}ms ${
              config.easing.scale
            };
                `;
            fragment.appendChild(bg);
            fragments.push({
              element: fragment,
              index: row * gridSize + col,
              reveal: () => {
                fragment.style.clipPath = `polygon(${x}% ${y}%, ${
                  x + w
                }% ${y}%, ${x + w}% ${y + h}%, ${x}% ${y + h}%)`;
              },
              collapse: () => {
                fragment.style.clipPath = `polygon(${x + w / 2}% ${
                  y + h / 2
                }%, ${x + w / 2}% ${y + h / 2}%, ${x + w / 2}% ${y + h / 2}%, ${
                  x + w / 2
                }% ${y + h / 2}%)`;
              }
            });
          }
        }
        return fragments;
      },
      revealTiming: (i, total) => {
        const gridSize = Math.sqrt(total);
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        const centerX = (gridSize - 1) / 2;
        const centerY = (gridSize - 1) / 2;
        const distance = Math.hypot(col - centerX, row - centerY);
        return distance * 0.15;
      },
      collapseTiming: (i, total) => {
        const gridSize = Math.sqrt(total);
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        const centerX = (gridSize - 1) / 2;
        const centerY = (gridSize - 1) / 2;
        const distance = Math.hypot(col - centerX, row - centerY);
        return distance * 0.08;
      }
    }
  };

  const trail = [];
  let mouseX = 0,
    mouseY = 0,
    lastMouseX = 0,
    lastMouseY = 0,
    prevMouseX = 0,
    prevMouseY = 0;
  let isMoving = false,
    isCursorInContainer = false,
    isTouching = false;
  let lastRemovalTime = 0,
    lastTouchImageTime = 0,
    lastScrollTime = 0,
    lastMoveTime = Date.now();
  let isScrolling = false,
    scrollTicking = false;
  let smoothedSpeed = 0,
    maxSpeed = 0;
  let currentEffect = "flame";
  let imageIndex = 0;
  const imagePool = [];

  const isInContainer = (x, y) => {
    const rect = container.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  };

  // Set initial mouse position
  document.addEventListener("mouseover", function setInitialMousePos(e) {
    mouseX = lastMouseX = prevMouseX = e.clientX;
    mouseY = lastMouseY = prevMouseY = e.clientY;
    isCursorInContainer = isInContainer(mouseX, mouseY);
    document.removeEventListener("mouseover", setInitialMousePos);
  });

  const hasMovedEnough = () => {
    const dx = mouseX - lastMouseX,
      dy = mouseY - lastMouseY;
    return Math.hypot(dx, dy) > config.mouseThreshold;
  };

  const hasMovedAtAll = () => {
    const dx = mouseX - prevMouseX,
      dy = mouseY - prevMouseY;
    return Math.hypot(dx, dy) > config.minMovementForImage;
  };

  const calculateSpeed = () => {
    const now = Date.now(),
      dt = now - lastMoveTime;
    if (dt <= 0) return 0;
    const dist = Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY);
    const raw = dist / dt;
    if (raw > maxSpeed) maxSpeed = raw;
    const norm = Math.min(raw / (maxSpeed || 0.5), 1);
    smoothedSpeed =
      smoothedSpeed * (1 - config.speedSmoothingFactor) +
      norm * config.speedSmoothingFactor;
    lastMoveTime = now;

    if (config.showSpeedIndicator) {
      const effectName = PATTERNS[currentEffect].name;
      speedIndicator.textContent = `${effectName} Intensity: ${(
        smoothedSpeed * 100
      ).toFixed(0)}%`;
      speedIndicator.style.opacity = "1";
      clearTimeout(window.speedTimeout);
      window.speedTimeout = setTimeout(
        () => (speedIndicator.style.opacity = "0"),
        1500
      );
    }
    return smoothedSpeed;
  };

  const createImageElement = () => {
    if (imagePool.length > 0) {
      return imagePool.pop();
    }
    const element = document.createElement("div");
    element.className = "trail-image";
    return element;
  };

  const returnToPool = (element) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
    element.innerHTML = "";
    element.style.cssText = "";
    element.className = "trail-image";
    if (imagePool.length < 20) {
      imagePool.push(element);
    }
  };

  const createImage = (speed = 0.5) => {
    const imageSrc = images[imageIndex];
    imageIndex = (imageIndex + 1) % images.length;

    const size =
      config.minImageSize + (config.maxImageSize - config.minImageSize) * speed;
    const pattern = PATTERNS[currentEffect];

    if (currentEffect === "flame") {
      // Original flame effect
      const img = document.createElement("img");
      img.className = "trail-img";
      const rotFactor = 1 + speed * (config.maxRotationFactor - 1);
      const rot = (Math.random() - 0.5) * config.baseRotation * rotFactor;

      img.src = imageSrc;
      img.width = img.height = size;
      const rect = container.getBoundingClientRect();
      const x = mouseX - rect.left,
        y = mouseY - rect.top;
      img.style.left = `${x}px`;
      img.style.top = `${y}px`;
      img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(0)`;
      img.style.transition = `transform ${config.inDuration}ms ${config.inEasing}`;
      container.appendChild(img);

      setTimeout(() => {
        img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(1)`;
      }, 10);

      trail.push({
        element: img,
        rotation: rot,
        removeTime: Date.now() + config.imageLifespan,
        isFlame: true
      });
    } else {
      // Pattern effects
      const imageContainer = createImageElement();
      const rect = container.getBoundingClientRect();
      const x = mouseX - rect.left,
        y = mouseY - rect.top;

      imageContainer.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            transform: translate3d(-50%, -50%, 0) scale(0);
            transition: transform ${config.inDuration}ms ${config.easing.scale};
          `;

      const fragments = pattern.create(imageContainer, imageSrc, size);

      // Add fragments to container
      fragments.forEach((fragment) => {
        imageContainer.appendChild(fragment.element);
      });

      container.appendChild(imageContainer);

      requestAnimationFrame(() => {
        imageContainer.style.transform = "translate3d(-50%, -50%, 0) scale(1)";
        fragments.forEach((fragment) => {
          const revealTime = pattern.revealTiming(
            fragment.index,
            fragments.length,
            fragment
          );
          const delay = revealTime * config.staggerRange;
          setTimeout(() => {
            fragment.reveal();
          }, delay);
        });
      });

      trail.push({
        element: imageContainer,
        fragments,
        pattern: currentEffect,
        removeTime: Date.now() + config.imageLifespan
      });
    }
  };

  const createTrailImage = () => {
    if (!isCursorInContainer) return;
    if ((isMoving || isTouching) && hasMovedEnough() && hasMovedAtAll()) {
      lastMouseX = mouseX;
      lastMouseY = mouseY;
      const speed = calculateSpeed();
      createImage(speed);
      prevMouseX = mouseX;
      prevMouseY = mouseY;
    }
  };

  const createTouchTrailImage = () => {
    if (!isCursorInContainer || !isTouching || !hasMovedAtAll()) return;
    const now = Date.now();
    if (now - lastTouchImageTime < config.touchImageInterval) return;
    lastTouchImageTime = now;
    const speed = calculateSpeed();
    createImage(speed);
    prevMouseX = mouseX;
    prevMouseY = mouseY;
  };

  const createScrollTrailImage = () => {
    if (!isCursorInContainer || !isScrolling) return;
    lastMouseX += (config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);
    lastMouseY += (config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);
    createImage(0.5);
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  };

  const removeOldImages = () => {
    const now = Date.now();
    if (now - lastRemovalTime < config.removalDelay || !trail.length) return;
    if (now >= trail[0].removeTime) {
      const imgObj = trail.shift();

      if (imgObj.isFlame) {
        // Original flame removal
        imgObj.element.style.transition = `transform ${config.outDuration}ms ${config.outEasing}`;
        imgObj.element.style.transform = `translate(-50%, -50%) rotate(${
          imgObj.rotation + 360
        }deg) scale(0)`;
        setTimeout(() => {
          imgObj.element.remove();
        }, config.outDuration);
      } else {
        // Pattern removal
        const { element, fragments, pattern: imagePattern } = imgObj;
        const pattern = PATTERNS[imagePattern];

        if (fragments) {
          fragments.forEach((fragment) => {
            const collapseTime = pattern.collapseTiming(
              fragment.index,
              fragments.length,
              fragment
            );
            const delay = collapseTime * config.staggerRange;
            setTimeout(() => {
              fragment.collapse();
            }, delay);
          });
        }

        element.style.transition = `transform ${config.outDuration}ms ${config.outEasing}`;
        element.style.transform = "translate3d(-50%, -50%, 0) scale(0)";
        setTimeout(() => returnToPool(element), config.outDuration);
      }

      lastRemovalTime = now;
    }
  };

  // Effect switching
  const effectLinks = document.querySelectorAll("[data-effect]");
  effectLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      effectLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      currentEffect = link.dataset.effect;
    });
  });

  // Mouse events
  document.addEventListener("mousemove", (e) => {
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    isCursorInContainer = isInContainer(mouseX, mouseY);
    if (isCursorInContainer && hasMovedAtAll()) {
      isMoving = true;
      clearTimeout(window.moveTimeout);
      window.moveTimeout = setTimeout(() => (isMoving = false), 100);
    }
  });

  // Touch events
  container.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = touch.clientX;
    mouseY = touch.clientY;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    isCursorInContainer = true;
    isTouching = true;
    lastMoveTime = Date.now();
  });

  container.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - prevMouseX);
    const dy = Math.abs(touch.clientY - prevMouseY);
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = touch.clientX;
    mouseY = touch.clientY;
    isCursorInContainer = true;
    if (dy > dx) return;
    createTouchTrailImage();
  });

  container.addEventListener("touchend", () => {
    isTouching = false;
  });

  document.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    if (!isInContainer(t.clientX, t.clientY)) {
      isCursorInContainer = false;
      isTouching = false;
    }
  });

  // Scroll handlers
  window.addEventListener(
    "scroll",
    () => {
      isCursorInContainer = isInContainer(mouseX, mouseY);
      if (isCursorInContainer) {
        isScrolling = true;
        clearTimeout(window.scrollTimeout);
        window.scrollTimeout = setTimeout(() => (isScrolling = false), 100);
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      const now = Date.now();
      if (now - lastScrollTime < config.scrollThreshold) return;
      lastScrollTime = now;
      if (!scrollTicking && isCursorInContainer) {
        requestAnimationFrame(() => {
          if (isScrolling) createScrollTrailImage();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    },
    { passive: true }
  );

  // Main animation loop
  (function animate() {
    if (isMoving || isTouching || isScrolling) createTrailImage();
    removeOldImages();
    requestAnimationFrame(animate);
  })();
});
