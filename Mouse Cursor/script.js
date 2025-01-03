const cursor = document.getElementById('cursor');
const body = document.body;
const button = document.querySelector('.interactive');

let mouseX = 0, mouseY = 0;

// Update cursor position and leave a smooth neon trail
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Update cursor position
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;

    // Create improved neon trail
    const trail = document.createElement('div');
    trail.classList.add('neon-trail');
    trail.style.left = `${mouseX}px`;
    trail.style.top = `${mouseY}px`;

    // Append and cleanup trail
    body.appendChild(trail);
    setTimeout(() => trail.remove(), 1000);
});

// Button click creates an explosion effect
button.addEventListener('click', () => {
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    createExplosion(centerX, centerY, 40); // Create 40 particles
});

// Improved explosion
function createExplosion(x, y, particleCount) {
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Set random size and shape
        const size = Math.random() * 12 + 8;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        const shapes = ['circle', 'square', 'triangle'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        if (shape === 'circle') {
            particle.style.borderRadius = '50%';
        } else if (shape === 'square') {
            particle.style.borderRadius = '0';
        } else if (shape === 'triangle') {
            particle.style.width = '0';
            particle.style.height = '0';
            particle.style.borderLeft = `${size / 2}px solid transparent`;
            particle.style.borderRight = `${size / 2}px solid transparent`;
            particle.style.borderBottom = `${size}px solid hsl(${Math.random() * 360}, 100%, 50%)`;
        }

        // Set random color
        particle.style.backgroundColor =
            shape !== 'triangle'
                ? `hsl(${Math.random() * 360}, 100%, 50%)`
                : 'none';

        // Position particle at button center
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        // Calculate random direction for explosion
        const angle = Math.random() * Math.PI * 2; // Random angle
        const distance = Math.random() * 200;     // Random distance
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        // CSS variables for movement
        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);

        // Append particle and cleanup
        body.appendChild(particle);
        particle.addEventListener('animationend', () => particle.remove());
    }
}
