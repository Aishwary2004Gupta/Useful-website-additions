import { Pane } from 'https://cdn.skypack.dev/tweakpane@4.0.4';

const pane = new Pane({
  title: 'Controls',
  expanded: true,
});

const config = {
  uploadFile: null,
  imageUrl: '',
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
  image: 'https://images.unsplash.com/photo-1755380749576-c2372cc487a7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  fontSize: 10,
  spaceing: 8,
});

const map = (s, a1, a2, b1, b2) => b1 + (s - a1) * (b2 - b1) / (a2 - a1);

function print(config) {
  let original = new Image();
  original.crossOrigin = 'Anonymous';
  original.onload = function () {
    const targetWidth = 720;
    const targetHeight = 720;

    // Use the original dimensions if they are smaller than the target dimensions
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
      let grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3 | 0;
      let char = represenation[map(grayscale, 255, 0, 0, represenation.length - 1) | 0];

      ctx.fillStyle = `rgb(${grayscale},${grayscale},${grayscale})`;
      ctx.font = `${config.fontSize}px Courier New`;
      ctx.fillText(char, x * config.spaceing, y * config.spaceing);
    }
  };

  original.src = config.image;
}