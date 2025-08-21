<script>
  const track = document.getElementById("logoTrack");
  const list = document.getElementById("logoList");
  const container = document.getElementById("logoLoop");
  const toggleBtn = document.getElementById("themeToggle");

  // Duplicate logos for seamless infinite scroll
  track.appendChild(list.cloneNode(true));

  let offset = 0;
  const baseSpeed = 100; // px per second
  let targetSpeed = baseSpeed;
  let currentSpeed = baseSpeed;

  container.addEventListener("mouseenter", () => {
    targetSpeed = 0; // gradually slow down
  });

  container.addEventListener("mouseleave", () => {
    targetSpeed = baseSpeed; // gradually speed up again
  });

  function animate(timestamp) {
    if (!animate.lastTime) animate.lastTime = timestamp;
    const delta = (timestamp - animate.lastTime) / 1000; // seconds
    animate.lastTime = timestamp;

    // Smoothly ease speed toward target
    const easing = 0.05; // smaller = slower braking
    currentSpeed += (targetSpeed - currentSpeed) * easing;

    offset -= currentSpeed * delta;
    const listWidth = list.offsetWidth;
    if (Math.abs(offset) >= listWidth) {
      offset = 0;
    }
    track.style.transform = `translate3d(${offset}px, 0, 0)`;

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  const toggleInput = document.getElementById("themeToggle");
  toggleInput.addEventListener("change", () => {
    document.body.classList.toggle("light", toggleInput.checked);
  });
</script>