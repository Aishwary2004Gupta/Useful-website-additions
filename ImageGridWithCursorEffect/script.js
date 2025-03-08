// script.js
const hoverText = document.querySelector('.hover-text');
const imageContainer = document.getElementById('image-container');
const hoverImage = document.getElementById('hover-image');

// Update image position on mouse move
document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    // Move the image container to the cursor position
    imageContainer.style.left = `${x}px`;
    imageContainer.style.top = `${y}px`;
});

// Show image when hovering over text
hoverText.addEventListener('mouseenter', () => {
    imageContainer.style.opacity = '1'; // Show the image
});

// Hide image when leaving the text
hoverText.addEventListener('mouseleave', () => {
    imageContainer.style.opacity = '0'; // Hide the image
});