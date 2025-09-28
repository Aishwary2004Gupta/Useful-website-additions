// Utility function
const map = (s, a1, a2, b1, b2) => b1 + (s - a1) * (b2 - b1) / (a2 - a1);

function print(config) {
  let original = new Image();
  original.crossOrigin = 'Anonymous';
  original.onload = function () {
    const targetWidth = 1200;
    const targetHeight = 700;

    const canvasWidth = Math.min(this.width, targetWidth);
    const canvasHeight = Math.min(this.height, targetHeight);

    let dataCtx = document.createElement('canvas').getContext('2d');
    config.canvas.width = dataCtx.canvas.width = canvasWidth;
    config.canvas.height = dataCtx.canvas.height = canvasHeight;

    dataCtx.drawImage(this, 0, 0, canvasWidth / config.spaceing, canvasHeight / config.spaceing);
    let data = dataCtx.getImageData(0, 0, canvasWidth, canvasHeight).data;

    let ctx = config.canvas.getContext('2d');
    ctx.fillStyle = '#fff';

    let represenation = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^'. ";

    for (let i = 0, ii = 0; i < data.length; i += 4, ii++) {
      let x = ii % canvasWidth;
      let y = ii / canvasWidth | 0;
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      let grayscale = (r + g + b) / 3 | 0;
      let char = represenation[map(grayscale, 255, 0, 0, represenation.length - 1) | 0];

      ctx.fillStyle = config.useColor ? `rgb(${r},${g},${b})` : `rgb(${grayscale},${grayscale},${grayscale})`;

      ctx.font = `${config.fontSize}px Courier New`;
      ctx.fillText(char, x * config.spaceing, y * config.spaceing);
    }

    // 🔥 Adjust wrapper size dynamically
    const wrapper = document.querySelector(".ascii-wrapper");
    if (wrapper) {
      wrapper.style.width = config.canvas.width + "px";
      wrapper.style.height = config.canvas.height + "px";
    }
  };

  original.src = config.image;
}

// Default config
const defaultImageUrl = 'https://images.unsplash.com/photo-1756877468830-9fbf44ee34a8?q=80&w=1170&auto=format&fit=crop';
print({
  canvas: document.getElementById('ascii'),
  image: defaultImageUrl,
  fontSize: 10,
  spaceing: 8,
  useColor: true,
});
