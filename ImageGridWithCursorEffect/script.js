// script.js
const { motion, useMotionValue, useSpring } = window.framerMotion;

// Initialize cursor position
const cursorX = useMotionValue(0);
const cursorY = useMotionValue(0);
const cursorScale = useMotionValue(1);

// Smooth spring animation for cursor position
const cursorXSpring = useSpring(cursorX, { stiffness: 500, damping: 30 });
const cursorYSpring = useSpring(cursorY, { stiffness: 500, damping: 30 });
const cursorScaleSpring = useSpring(cursorScale, { stiffness: 500, damping: 30 });

// Update cursor position on mouse move
document.addEventListener('mousemove', (e) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
});

// Scale up cursor when hovering over elements
const hoverables = document.querySelectorAll('.hoverable');
hoverables.forEach((item) => {
    item.addEventListener('mouseenter', () => {
        cursorScale.set(2); // Scale up
    });
    item.addEventListener('mouseleave', () => {
        cursorScale.set(1); // Reset scale
    });
});

// Apply cursor position and scale to the DOM
const cursor = document.getElementById('cursor');
cursorXSpring.onChange((x) => {
    cursor.style.left = `${x}px`;
});
cursorYSpring.onChange((y) => {
    cursor.style.top = `${y}px`;
});
cursorScaleSpring.onChange((scale) => {
    cursor.style.transform = `translate(-50%, -50%) scale(${scale})`;
});