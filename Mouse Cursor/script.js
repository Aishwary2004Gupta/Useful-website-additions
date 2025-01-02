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

// Confetti explosion effect below the button
const button = document.querySelector('.interactive');
button.addEventListener('click', (e) => {
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const bottomY = rect.top + rect.height;

    for (let i = 0; i < 25; i++) {
        createParticle(centerX, bottomY);
    }
});

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
