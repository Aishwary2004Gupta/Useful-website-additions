const background = document.getElementById('background');

// Function to generate random shapes
function generateShapes() {
  const shape = document.createElement('div');
  shape.classList.add('shape');

  // Random size for the shape
  const size = Math.random() * 50 + 10; // between 10px and 60px
  shape.style.width = `${size}px`;
  shape.style.height = `${size}px`;

  // Random position and color
  shape.style.left = `${Math.random() * 100}vw`;
  shape.style.top = `${Math.random() * 100}vh`;
  shape.style.background = `hsl(${Math.random() * 360}, 100%, 70%)`;

  // Add to background
  background.appendChild(shape);

  // Remove shape after animation ends
  setTimeout(() => {
    shape.remove();
  }, 5000);
}

// Generate shapes on mouse move
document.addEventListener('mousemove', () => {
  generateShapes();
});

// Generate random floating shapes
setInterval(generateShapes, 300);
