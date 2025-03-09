// script.js
const hoverText = document.querySelector('.hover-text');
const imageContainer = document.getElementById('image-container');
const hoverImage = document.getElementById('hover-image');

// Update image position on mouse move
document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    // Move the image container to the cursor position with offset to center it
    imageContainer.style.left = `${x - imageContainer.offsetWidth / 2}px`;
    imageContainer.style.top = `${y - imageContainer.offsetHeight / 2}px`;
});

// Show image and add pop effect when hovering over text
hoverText.addEventListener('mouseenter', () => {
    imageContainer.style.opacity = '1';
    imageContainer.style.transform = 'scale(1.2)';
    imageContainer.style.transition = 'opacity 0.3s, transform 0.3s';
});

// Hide image and reset scale when leaving the text
hoverText.addEventListener('mouseleave', () => {
    imageContainer.style.opacity = '0';
    imageContainer.style.transform = 'scale(1)';
});