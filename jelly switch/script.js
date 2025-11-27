import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Configuration
const CONFIG = {
    JELLY_RADIUS: 0.3,
    JELLY_HEIGHT: 0.25,
    PLATE_RADIUS: 0.8,
    PLATE_HEIGHT: 0.06,
    SPRING_STIFFNESS: 800,
    SPRING_DAMPING: 25,
    SPRING_MASS: 1,
};

// Global state
let isDarkMode = false;
let isAnimating = false;
const lightBg = new THREE.Color(0xf5f5f5);
const darkBg = new THREE.Color(0x0f0f0f);

// Spring system
class Spring {
    constructor(stiffness, damping, mass) {
        this.stiffness = stiffness;
        this.damping = damping;
        this.mass = mass;
        this.value = 0;
        this.velocity = 0;
        this.target = 0;
    }

    update(dt) {
        if (dt <= 0 || dt > 0.05) return;
        
        const force = -this.stiffness * (this.value - this.target) - this.damping * this.velocity;
        const acceleration = force / this.mass;
        
        this.velocity += acceleration * dt;
        this.value += this.velocity * dt;
        
        // Dampen to rest when very close
        if (Math.abs(this.value - this.target) < 0.001 && Math.abs(this.velocity) < 0.01) {
            this.value = this.target;
            this.velocity = 0;
        }
    }

    setTarget(target) {
        this.target = target;
    }

    reset() {
        this.value = 0;
        this.velocity = 0;
        this.target = 0;
    }
}

// Jelly controller
class JellyController {
    constructor() {
        this.isPressed = false;
        this.isDark = false;
        
        this.squashX = new Spring(CONFIG.SPRING_STIFFNESS, CONFIG.SPRING_DAMPING, CONFIG.SPRING_MASS);
        this.squashY = new Spring(CONFIG.SPRING_STIFFNESS * 1.2, CONFIG.SPRING_DAMPING * 1.5, CONFIG.SPRING_MASS);
        this.squashZ = new Spring(CONFIG.SPRING_STIFFNESS, CONFIG.SPRING_DAMPING, CONFIG.SPRING_MASS);
        this.wiggle = new Spring(CONFIG.SPRING_STIFFNESS * 0.6, CONFIG.SPRING_DAMPING * 0.8, CONFIG.SPRING_MASS);
    }

    press() {
        if (this.isPressed) return;
        this.isPressed = true;
        this.squashY.velocity = -3;
        this.squashX.velocity = (Math.random() - 0.5) * 2;
        this.squashZ.velocity = (Math.random() - 0.5) * 2;
    }

    release() {
        if (!this.isPressed) return;
        this.isPressed = false;
        this.squashY.velocity = 2.5;
        this.squashX.velocity = 0;
        this.squashZ.velocity = 0;
    }

    click() {
        this.isDark = !this.isDark;
        this.squashY.velocity = -4;
        this.squashX.velocity = (Math.random() - 0.5) * 6;
        this.squashZ.velocity = (Math.random() - 0.5) * 6;
        this.wiggle.velocity = (Math.random() - 0.5) * 8;
        return this.isDark;
    }

    update(dt) {
        this.squashX.update(dt);
        this.squashY.update(dt);
        this.squashZ.update(dt);
        this.wiggle.update(dt);
    }

    getState() {
        return {
            squashX: this.squashX.value,
            squashY: this.squashY.value,
            squashZ: this.squashZ.value,
            wiggle: this.wiggle.value,
            isDark: this.isDark,
        };
    }
}

// Scene setup
const canvas = document.getElementById('canvas');
const scene = new THREE.Scene();
scene.background = lightBg;
document.body.style.background = '#f5f5f5';

// Camera
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(0, 0.3, 1.2);
camera.lookAt(0, 0.2, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1.5;
controls.maxDistance = 3;
controls.maxPolarAngle = Math.PI * 0.6;
controls.minPolarAngle = Math.PI * 0.3;
controls.enablePan = false;
controls.enableZoom = true;
controls.autoRotate = false;
controls.target.set(0, 0.2, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
directionalLight.position.set(3, 4, 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.bias = -0.0005;
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-2, 2, -2);
scene.add(fillLight);

// Create jelly mold shape (dome with ridges)
function createJellyGeometry() {
    const group = new THREE.Group();
    
    // Main dome
    const domeGeometry = new THREE.IcosahedronGeometry(CONFIG.JELLY_RADIUS, 5);
    
    // Scale to make it more dome-like
    const positions = domeGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        if (y < 0) {
            positions.setY(i, -0.05);
        } else {
            positions.setY(i, y * 0.7);
        }
    }
    positions.needsUpdate = true;
    domeGeometry.computeVertexNormals();
    
    // Add vertical ridges using lathe geometry
    const points = [];
    points.push(new THREE.Vector2(0, 0));
    for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        const x = Math.sin(t * Math.PI) * (CONFIG.JELLY_RADIUS - 0.02);
        const y = Math.cos(t * Math.PI) * (CONFIG.JELLY_RADIUS - 0.02) * 0.5;
        points.push(new THREE.Vector2(x, y));
    }
    points.push(new THREE.Vector2(0, CONFIG.JELLY_RADIUS * 0.5));
    
    const latheGeometry = new THREE.LatheGeometry(points, 12, 0, Math.PI * 2);
    
    // Combine geometries
    const combinedGeometry = new THREE.BufferGeometry();
    
    // Merge dome and lathe
    const domePositions = domeGeometry.attributes.position.array;
    const lathePositions = latheGeometry.attributes.position.array;
    
    const totalLength = domePositions.length + lathePositions.length;
    const positions_combined = new Float32Array(totalLength);
    positions_combined.set(domePositions);
    positions_combined.set(lathePositions, domePositions.length);
    
    combinedGeometry.setAttribute('position', new THREE.BufferAttribute(positions_combined, 3));
    combinedGeometry.computeVertexNormals();
    
    return latheGeometry;
}

// Jelly material
const jellyMaterialLight = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x2e8fc9),
    transparent: true,
    opacity: 0.7,
    roughness: 0.08,
    metalness: 0,
    ior: 1.42,
    transmission: 0.9,
    thickness: 0.4,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.2,
    side: THREE.FrontSide,
});

const jellyMaterialDark = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xff5722),
    transparent: true,
    opacity: 0.7,
    roughness: 0.08,
    metalness: 0,
    ior: 1.42,
    transmission: 0.9,
    thickness: 0.4,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.2,
    side: THREE.FrontSide,
});

const jellyGeometry = createJellyGeometry();
const jellyMesh = new THREE.Mesh(jellyGeometry, jellyMaterialLight);
jellyMesh.castShadow = true;
jellyMesh.receiveShadow = false;
jellyMesh.position.y = 0.3;
scene.add(jellyMesh);

// Create plate
const plateGeometry = new THREE.CylinderGeometry(CONFIG.PLATE_RADIUS, CONFIG.PLATE_RADIUS, CONFIG.PLATE_HEIGHT, 64);
const plateMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.3,
    side: THREE.DoubleSide,
});
const plateMesh = new THREE.Mesh(plateGeometry, plateMaterial);
plateMesh.castShadow = true;
plateMesh.receiveShadow = true;
plateMesh.position.y = 0;
scene.add(plateMesh);

// Plate rim
const rimGeometry = new THREE.TorusGeometry(CONFIG.PLATE_RADIUS, 0.03, 16, 100);
const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    metalness: 0.15,
    roughness: 0.2,
});
const rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
rimMesh.position.y = CONFIG.PLATE_HEIGHT / 2;
rimMesh.rotation.x = Math.PI / 2;
rimMesh.castShadow = true;
rimMesh.receiveShadow = true;
scene.add(rimMesh);

// Jelly controller
const jellyCtrl = new JellyController();

// Raycaster for clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function updateMouse(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function isJellyClicked(event) {
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObject(jellyMesh).length > 0;
}

// Event listeners
let mousePressed = false;
let mouseStartPos = { x: 0, y: 0 };
let mouseDragged = false;

canvas.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    
    mouseStartPos = { x: e.clientX, y: e.clientY };
    mouseDragged = false;
    
    if (isJellyClicked(e)) {
        mousePressed = true;
        jellyCtrl.press();
        controls.enabled = false;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!mousePressed) return;
    
    const dx = Math.abs(e.clientX - mouseStartPos.x);
    const dy = Math.abs(e.clientY - mouseStartPos.y);
    
    if (dx > 5 || dy > 5) {
        mouseDragged = true;
        jellyCtrl.release();
        controls.enabled = true;
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (e.button !== 0) return;
    
    controls.enabled = true;
    
    if (mousePressed && !mouseDragged && isJellyClicked(e)) {
        const newMode = jellyCtrl.click();
        toggleDarkMode(newMode);
    }
    
    jellyCtrl.release();
    mousePressed = false;
    mouseDragged = false;
});

canvas.addEventListener('mouseleave', () => {
    controls.enabled = true;
    jellyCtrl.release();
    mousePressed = false;
    mouseDragged = false;
});

// Touch events
let touchStartPos = { x: 0, y: 0 };
let touchDragged = false;
let touchPressed = false;

canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    touchStartPos = { x: touch.clientX, y: touch.clientY };
    touchDragged = false;
    
    if (isTouchOnJelly(touch)) {
        touchPressed = true;
        jellyCtrl.press();
        controls.enabled = false;
    }
});

canvas.addEventListener('touchmove', (e) => {
    if (!touchPressed || e.touches.length !== 1) return;
    
    const dx = Math.abs(e.touches[0].clientX - touchStartPos.x);
    const dy = Math.abs(e.touches[0].clientY - touchStartPos.y);
    
    if (dx > 10 || dy > 10) {
        touchDragged = true;
        jellyCtrl.release();
        controls.enabled = true;
    }
});

canvas.addEventListener('touchend', (e) => {
    if (!touchPressed) return;
    
    controls.enabled = true;
    
    if (!touchDragged && e.changedTouches.length > 0) {
        if (isTouchOnJelly(e.changedTouches[0])) {
            const newMode = jellyCtrl.click();
            toggleDarkMode(newMode);
        }
    }
    
    jellyCtrl.release();
    touchPressed = false;
    touchDragged = false;
});

function isTouchOnJelly(touch) {
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObject(jellyMesh).length > 0;
}

// Toggle dark mode
function toggleDarkMode(darkMode) {
    isDarkMode = darkMode;
    
    const targetBg = darkMode ? darkBg : lightBg;
    const targetPlateColor = darkMode ? new THREE.Color(0x2a2a2a) : new THREE.Color(0xffffff);
    const targetRimColor = darkMode ? new THREE.Color(0x404040) : new THREE.Color(0xe0e0e0);
    
    const startBg = scene.background.clone();
    const startPlateColor = plateMaterial.color.clone();
    const startRimColor = rimMaterial.color.clone();
    
    let progress = 0;
    const duration = 600;
    const startTime = performance.now();
    
    function updateColors() {
        const elapsed = performance.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        // Ease in-out cubic
        const t = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        scene.background.lerpColors(startBg, targetBg, t);
        plateMaterial.color.lerpColors(startPlateColor, targetPlateColor, t);
        rimMaterial.color.lerpColors(startRimColor, targetRimColor, t);
        
        // Update jelly material
        if (darkMode) {
            jellyMesh.material = jellyMaterialDark;
        } else {
            jellyMesh.material = jellyMaterialLight;
        }
        
        const hexColor = scene.background.getHexString();
        document.body.style.background = `#${hexColor}`;
        
        if (progress < 1) {
            requestAnimationFrame(updateColors);
        }
    }
    
    updateColors();
}

// Animation loop
let lastTime = performance.now();

function animate(currentTime) {
    const deltaTime = Math.min((currentTime - lastTime) * 0.001, 0.016);
    lastTime = currentTime;
    
    // Update jelly
    jellyCtrl.update(deltaTime);
    const state = jellyCtrl.getState();
    
    // Apply deformations
    const scaleX = 1 + state.squashX * 0.15;
    const scaleY = Math.max(0.7, 1 + state.squashY * 0.2);
    const scaleZ = 1 + state.squashZ * 0.15;
    
    jellyMesh.scale.set(scaleX, scaleY, scaleZ);
    jellyMesh.rotation.z = state.wiggle * 0.08;
    jellyMesh.rotation.x = state.wiggle * 0.05;
    
    // Update controls
    controls.update();
    
    // Render
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start
animate(performance.now());
