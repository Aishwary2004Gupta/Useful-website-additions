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

// Function to generate confetti
function createConfetti(x, y) {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'absolute';
    confettiContainer.style.left = `${x}px`;
    confettiContainer.style.top = `${y}px`;
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = 1000;

    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = `${Math.random() * 8 + 4}px`;
        confetti.style.height = `${Math.random() * 8 + 4}px`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.opacity = 0.8;
        confetti.style.borderRadius = `${Math.random() < 0.5 ? '50%' : '0'}`;
        confetti.style.left = '0';
        confetti.style.top = '0';

        // Generate random angles and distances for more dynamic scattering
        const angle = Math.random() * 360; // Random rotation angle
        const distanceX = Math.random() * 200 - 100; // Horizontal spread
        const distanceY = Math.random() * 200 + 50;  // Vertical fall

        confetti.style.transform = `translate(${distanceX}px, ${distanceY}px) rotate(${angle}deg)`;
        confetti.style.animation = `fade-and-fall 1s ease-out forwards`;

        confettiContainer.appendChild(confetti);
    }

    document.body.appendChild(confettiContainer);

    setTimeout(() => confettiContainer.remove(), 1000); // Remove confetti after 1 second
}

// Add click event to the button
const button = document.querySelector('.interactive');
button.addEventListener('click', (event) => {
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    createConfetti(x, y);
});
