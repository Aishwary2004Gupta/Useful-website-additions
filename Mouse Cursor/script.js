const cursor = document.getElementById('cursor');
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

// Smooth follow cursor
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Animate cursor position
function followCursor() {
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    requestAnimationFrame(followCursor);
}
followCursor();

// Magnetic button effect
const button = document.querySelector('.interactive');
button.addEventListener('mousemove', (e) => {
    const rect = button.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 100) {
        button.style.transform = `translate(${dx * 0.1}px, ${dy * 0.1}px)`;
    } else {
        button.style.transform = 'translate(0, 0)';
    }
});

button.addEventListener('mouseleave', () => {
    button.style.transform = 'translate(0, 0)';
});

// Confetti explosion
button.addEventListener('click', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    for (let i = 0; i < 25; i++) {
        createParticle(x, y);
    }
});

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    document.body.appendChild(particle);

    const angle = Math.random() * 360;
    const velocity = Math.random() * 2 + 1;
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
        particle.style.transform = `translate(${dx * lifespan}px, ${dy * lifespan}px)`;
        lifespan -= 2;

        if (lifespan > 0) {
            requestAnimationFrame(moveParticle);
        } else {
            particle.remove();
        }
    };
    moveParticle();
}
