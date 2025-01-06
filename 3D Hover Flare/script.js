const modeSwitch = document.getElementById("modeSwitch");

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Particle Geometry
const particles = new THREE.BufferGeometry();
const particleCount = 1000;
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
    particlePositions[i] = (Math.random() - 0.5) * 100; // Spread particles randomly
}

particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

// Particle Material
let theme = "light"; // Default
const particleMaterial = new THREE.PointsMaterial({
    size: 1.5,
    transparent: true,
    opacity: 0.8,
    color: theme === "dark" ? 0xffffff : 0x000000
});

// Points Mesh
const particleMesh = new THREE.Points(particles, particleMaterial);
scene.add(particleMesh);

// Mouse Interaction
const mouse = new THREE.Vector2();
window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update particle size based on proximity
    const positions = particleMesh.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        const dx = mouse.x * 50 - positions[i * 3];
        const dy = mouse.y * 50 - positions[i * 3 + 1];
        const dz = 0 - positions[i * 3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < 10) {
            particleMesh.geometry.attributes.size = 5.0;
        } else {
            particleMesh.geometry.attributes.size = 1.5;
        }
    }
});

// Animation Loop
function animate() {
    particleMesh.rotation.y += 0.001;
    particleMesh.rotation.x += 0.0005;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Handle Resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Theme Toggle
modeSwitch.addEventListener("change", () => {
    theme = modeSwitch.checked ? "dark" : "light";
    particleMaterial.color.set(theme === "dark" ? 0xffffff : 0x000000);
    document.body.style.background = theme === "dark" ? "#141e30" : "#e4e5e6";
});

// Start Animation
animate();
