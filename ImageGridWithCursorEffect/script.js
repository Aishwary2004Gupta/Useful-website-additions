// script.js
const { motion, useMotionValue, useSpring } = window.framerMotion;

// Initialize image position
const imageX = useMotionValue(0);
const imageY = useMotionValue(0);

// Smooth spring animation for image position
const imageXSpring = useSpring(imageX, { stiffness: 500, damping: 30 });
const imageYSpring = useSpring(imageY, { stiffness: 500, damping: 30 });

// Get DOM elements
const hoverText = document.querySelector('.hover-text');
const imageContainer = document.getElementById('image-container');
const hoverImage = document.getElementById('hover-image');

// Update image position on mouse move
document.addEventListener('mousemove', (e) => {
    imageX.set(e.clientX);
    imageY.set(e.clientY);
});

// Show image and update position when hovering over text
hoverText.addEventListener('mouseenter', () => {
    imageContainer.style.opacity = '1'; // Show the image
});

hoverText.addEventListener('mouseleave', () => {
    imageContainer.style.opacity = '0'; // Hide the image
});

// Apply image position to the DOM
imageXSpring.onChange((x) => {
    imageContainer.style.left = `${x}px`;
});
imageYSpring.onChange((y) => {
    imageContainer.style.top = `${y}px`;
});