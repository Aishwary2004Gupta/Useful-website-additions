document.addEventListener('DOMContentLoaded', () => {
  const silkPlane = document.getElementById('silk-plane');

  // Add noise effect using JavaScript
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  function drawNoise() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < canvas.width; i += 10) {
      for (let j = 0; j < canvas.height; j += 10) {
        const noise = Math.random() * 255;
        ctx.fillStyle = `rgba(255, 255, 255, ${noise / 255})`;
        ctx.fillRect(i, j, 10, 10);
      }
    }
  }

  setInterval(drawNoise, 100);
});