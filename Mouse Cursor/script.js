// script.js
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', (e) => {
    // Update cursor position
    const { clientX: x, clientY: y } = e;
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    // Calculate 3D rotation based on mouse position
    const { innerWidth, innerHeight } = window;
    const rotateX = ((y / innerHeight) - 0.5) * -30; // Invert direction for X
    const rotateY = ((x / innerWidth) - 0.5) * 30;

    cursor.style.transform = `translate(-50%, -50%) rotate3d(1, 0, 0, ${rotateX}deg) rotate3d(0, 1, 0, ${rotateY}deg)`;
});
