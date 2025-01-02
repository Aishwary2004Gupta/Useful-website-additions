// script.js
const cursor = document.getElementById('cursor');
const body = document.body;

// Smooth follow mouse
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Add trail effect
    const trail = document.createElement('div');
    trail.classList.add('trail');
    trail.style.left = `${mouseX}px`;
    trail.style.top = `${mouseY}px`;
    body.appendChild(trail);

    setTimeout(() => {
        trail.remove();
    }, 500);
});

// Smooth follow animation
function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    requestAnimationFrame(animateCursor);
}
animateCursor();

// Interactive element hover effect
document.querySelectorAll('.interactive').forEach((el) => {
    el.addEventListener('mouseenter', () => {
        cursor.style.width = '60px';
        cursor.style.height = '60px';
        cursor.style.boxShadow = '0 0 30px rgba(255, 0, 150, 0.8)';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.width = '30px';
        cursor.style.height = '30px';
        cursor.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.6)';
    });
});
