// Grab the theme toggle switch
const modeSwitch = document.getElementById("modeSwitch");

// Set up Three.js components: scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create particle system
const particleCount = 2000; // Total number of particles
const particleGeometry = new THREE.BufferGeometry();
const particleMaterial = new THREE.PointsMaterial({
    size: 2,
    transparent: true,
    opacity: 0.8,
    color: 0x000000, // Default to black for light mode
});

const positions = new Float32Array(particleCount * 3); // x, y, z for each particle
for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 200; // Spread particles in 3D space
}

particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// Responsive canvas size
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
const animate = () => {
    particles.rotation.y += 0.001;
    particles.rotation.x += 0.0005;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

// Handle light/dark mode toggle
let theme = "light"; // Default mode
modeSwitch.addEventListener("change", () => {
    theme = modeSwitch.checked ? "dark" : "light";
    document.body.style.background = theme === "dark" ? "#141e30" : "#e4e5e6";
    particleMaterial.color.set(theme === "dark" ? 0xffffff : 0x000000); // White particles in dark mode
});

// Start animation
animate();
