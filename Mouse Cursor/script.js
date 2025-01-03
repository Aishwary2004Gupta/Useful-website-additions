const cursor = document.getElementById('cursor');
const body = document.body;
const button = document.querySelector('.interactive');

let mouseX = 0, mouseY = 0;

// Cursor movement
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;

    // Add rainbow trail
    createRainbowTrail(mouseX, mouseY);
});

// Add confetti on button click
button.addEventListener('click', (e) => {
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const bottomY = rect.top + rect.height;

    for (let i = 0; i < 25; i++) {
        createParticle(centerX, bottomY);
    }
});

// Create particles for confetti effect with random shapes
function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    // Set random size
    const size = Math.random() * 12 + 8;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // Set random shape: circle, square, or triangle
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

    // Random color
    particle.style.background = shape !== 'triangle' 
        ? `hsl(${Math.random() * 360}, 100%, 50%)` 
        : 'none';

    // Position particle at click location
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    // Set random movement
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 3 + 2;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity;

    let lifespan = 100;

    const moveParticle = () => {
        particle.style.transform = `translate(${dx * lifespan}px, ${dy * lifespan}px) rotate(${lifespan * 15}deg)`;
        lifespan -= 2;

        if (lifespan > 0) {
            requestAnimationFrame(moveParticle);
        } else {
            particle.remove();
        }
    };

    document.body.appendChild(particle);
    moveParticle();
}

// Create rainbow trail
function createRainbowTrail(x, y) {
    const trail = document.createElement('div');
    trail.classList.add('cursor-tail');
    trail.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    trail.style.left = `${x}px`;
    trail.style.top = `${y}px`;
    body.appendChild(trail);

    setTimeout(() => {
        trail.remove();
    }, 600);
}
