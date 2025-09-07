import { Pane } from 'https://cdn.skypack.dev/tweakpane@4.0.4';

const pane = new Pane({
  title: 'Controls',
  expanded: true,
});

const config = {
  uploadFile: null,
  imageUrl: '',
  width: 820, // Default width
  height: 720, // Default height
};

// Add a button for file upload
pane.addButton({ title: 'Choose File' }).on('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        print({
          canvas: document.getElementById('ascii'),
          image: e.target.result,
          fontSize: 10,
          spaceing: 8,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
});

// Add a text input for image URL
pane.addBinding(config, 'imageUrl', { label: 'Image URL' });

// Add inputs for width and height
pane.addBinding(config, 'width', { label: 'Width', min: 100, max: 2000, step: 10 });
pane.addBinding(config, 'height', { label: 'Height', min: 100, max: 2000, step: 10 });

// Add a button to convert the URL
pane.addButton({ title: 'Convert URL' }).on('click', () => {
  if (config.imageUrl) {
    print({
      canvas: document.getElementById('ascii'),
      image: config.imageUrl,
      fontSize: 10,
      spaceing: 8,
    });
  }
});

// Display the default ASCII image
print({
  canvas: document.getElementById('ascii'),
  image: 'https://plus.unsplash.com/premium_photo-1664300362291-16264cacd847?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  fontSize: 10,
  spaceing: 8,
});

const map = (s, a1, a2, b1, b2) => b1 + (s - a1) * (b2 - b1) / (a2 - a1);

function print(config) {
  let original = new Image();
  original.crossOrigin = 'Anonymous';
  original.onload = function () {
    // Use the user-defined dimensions or the image's original dimensions if smaller
    const canvasWidth = Math.min(this.width, Math.max(100, Math.floor(config.width)));
    const canvasHeight = Math.min(this.height, Math.max(100, Math.floor(config.height)));

    let dataCtx = document.createElement('canvas').getContext('2d');
    config.canvas.width = dataCtx.canvas.width = canvasWidth;
    config.canvas.height = dataCtx.canvas.height = canvasHeight;

    dataCtx.drawImage(this, 0, 0, canvasWidth, canvasHeight);
    let data = dataCtx.getImageData(0, 0, canvasWidth, canvasHeight).data;

    let ctx = config.canvas.getContext('2d');
    ctx.fillStyle = '#fff';

    let represenation = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^'. ";

    for (let i = 0, ii = 0; i < data.length; i += 4, ii++) {
      let x = ii % canvasWidth;
      let y = ii / canvasWidth | 0;
      let grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3 | 0;
      let char = represenation[map(grayscale, 255, 0, 0, represenation.length - 1) | 0];

      ctx.fillStyle = `rgb(${grayscale},${grayscale},${grayscale})`;
      ctx.font = `${config.fontSize}px Courier New`;
      ctx.fillText(char, x * config.spaceing, y * config.spaceing);
    }
  };

  original.src = config.image;
}