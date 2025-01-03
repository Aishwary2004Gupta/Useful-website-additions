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

    // Add rainbow tail
    createRainbowTrail(mouseX, mouseY);
});

// Button swinging effect
document.addEventListener('mousemove', (e) => {
    const rect = button.getBoundingClientRect();
    const buttonCenterX = rect.left + rect.width / 2;
    const buttonCenterY = rect.top + rect.height / 2;

    const deltaX = mouseX - buttonCenterX;
    const deltaY = mouseY - buttonCenterY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    const maxSwing = 30; // max swing in degrees
    const swing = Math.min(maxSwing, (100 / distance) * maxSwing);

    button.style.transform = `rotate(${swing}deg)`;
    if (distance > 100) {
        button.style.transform = 'rotate(0deg)';
    }
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

// Create particles for confetti effect
function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    document.body.appendChild(particle);

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 3 + 2;
    const size = Math.random() * 6 + 4;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = `hsl(${Math.random() * 360}, 70%, 50%)`;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity;

    let lifespan = 100;

    const moveParticle = () => {
        particle.style.transform = `translate(${dx * lifespan}px, ${dy * lifespan}px) rotate(${lifespan * 10}deg)`;
        lifespan -= 2;

        if (lifespan > 0) {
            requestAnimationFrame(moveParticle);
        } else {
            particle.remove();
        }
    };
    moveParticle();
}

// Create rainbow tail
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
