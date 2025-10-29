// Get all layers
const layers = document.querySelectorAll('.layer');

// Function to update layer positions on scroll
function updateMotionLayer() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  layers.forEach(layer => {
    // Get depth and speed from data attributes
    const depth = parseFloat(layer.getAttribute('data-depth')) || 0;
    const speed = parseFloat(layer.getAttribute('data-speed')) || 0.02;

    // Calculate 3D translation (Y-axis movement based on scroll)
    const yTranslate = scrollTop * speed;
    
    // Apply 3D transform: 
    // - translateZ(depth) pushes layers away/toward the viewer
    // - translateY(yTranslate) moves layers vertically with scroll
    layer.style.transform = `translate(-50%, -50%) translateZ(${depth}px) translateY(${yTranslate}px)`;
  });
}

// Initialize on load
window.addEventListener('load', updateMotionLayer);

// Update on scroll (throttled for performance)
window.addEventListener('scroll', () => {
  // Request animation frame for smooth performance
  requestAnimationFrame(updateMotionLayer);
});