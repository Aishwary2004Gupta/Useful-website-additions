// Function to animate the search icon
function animateSearchIcon() {
    const searchIcon = document.querySelector('.search-icon');
    const positions = [
      { x: 40, y: 60 },
      { x: 250, y: 60 },
      { x: 460, y: 60 },
      { x: 40, y: 290 },
      { x: 250, y: 290 },
      { x: 460, y: 290 },
      { x: 40, y: 60 }, // Return to start
    ];
  
    let index = 0;
    function move() {
      const { x, y } = positions[index];
      searchIcon.style.transform = `translate(${x}px, ${y}px)`;
      index = (index + 1) % positions.length;
      setTimeout(move, 2000); // Move every 2 seconds
    }
  
    move();
  }
  
  // Start animations on page load
  window.addEventListener('load', () => {
    animateSearchIcon();
  });