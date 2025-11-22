import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Constants matching the original
const JELLY_HALFSIZE = new THREE.Vector3(0.35, 0.3, 0.3);
const SWITCH_RAIL_LENGTH = 0.4;
const SWITCH_ACCELERATION = 100;
const JELLY_IOR = 1.42;
const JELLY_COLOR = new THREE.Color(0.3, 0.6, 0.95); // Translucent blue

// Spring properties
const squashXProperties = { mass: 1, stiffness: 1000, damping: 10 };
const squashZProperties = { mass: 1, stiffness: 900, damping: 12 };
const wiggleXProperties = { mass: 1, stiffness: 1000, damping: 20 };

class Spring {
    constructor(properties) {
        this.target = 0;
        this.value = 0;
        this.velocity = 0;
        this.properties = properties;
    }

    update(dt) {
        const F_spring = -this.properties.stiffness * (this.value - this.target);
        const F_damp = -this.properties.damping * this.velocity;
        const a = (F_spring + F_damp) / this.properties.mass;
        this.velocity += a * dt;
        this.value += this.velocity * dt;
    }
}

class SwitchBehavior {
    constructor() {
        this.toggled = false;
        this.pressed = false;
        this.squashXSpring = new Spring(squashXProperties);
        this.squashZSpring = new Spring(squashZProperties);
        this.wiggleXSpring = new Spring(wiggleXProperties);
        this.pressYSpring = new Spring({ mass: 1, stiffness: 1200, damping: 15 }); // Vertical press animation
    }

    // Trigger click animation
    click() {
        this.toggled = !this.toggled;
        
        // Satisfying jelly bounce on click
        this.squashXSpring.velocity = -4;
        this.squashZSpring.velocity = 3;
        this.wiggleXSpring.velocity = (Math.random() - 0.5) * 8; // Random wiggle
        this.pressYSpring.velocity = -2; // Press down
    }

    update(dt) {
        if (dt <= 0) return;

        // Anticipating movement when pressed (before click)
        if (this.pressed) {
            this.squashXSpring.velocity = -1.5;
            this.squashZSpring.velocity = 0.8;
            this.pressYSpring.velocity = -0.5; // Slight press down
        }

        // Spring dynamics
        this.squashXSpring.update(dt);
        this.squashZSpring.update(dt);
        this.wiggleXSpring.update(dt);
        this.pressYSpring.update(dt);
    }

    getState() {
        return {
            toggled: this.toggled,
            squashX: this.squashXSpring.value,
            squashZ: this.squashZSpring.value,
            wiggleX: this.wiggleXSpring.value,
            pressY: this.pressYSpring.value,
        };
    }
}

// Create scene
const canvas = document.getElementById('canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd0d0d0); // Light grey background

// Camera setup
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(1, 0, 0); // Initial position for orbit controls
camera.lookAt(0, 0, 0);

// Renderer - optimized for performance
const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true, // Keep for visual quality
    alpha: true,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Limit pixel ratio
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; // Faster than PCFSoft
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Orbit Controls - use right mouse for rotation to allow left-click for button
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; // Smooth camera movement
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 8;
controls.maxPolarAngle = Math.PI / 1.5; // Prevent going below the ground
controls.minPolarAngle = Math.PI / 3; // Prevent going too high
controls.enablePan = false; // Disable panning to keep focus on the button
controls.enableZoom = true; // Allow zooming with scroll
controls.autoRotate = false; // Disable auto-rotation
controls.target.set(0, 0, 0); // Focus on the center

// Use right mouse button for orbit controls, leaving left mouse for button clicks
controls.mouseButtons = {
    LEFT: null, // Disable left mouse for orbit controls
    MIDDLE: THREE.MOUSE.DOLLY, // Middle mouse for zoom
    RIGHT: THREE.MOUSE.ROTATE // Right mouse for rotation
};

controls.update();

// Soft, diffused lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Soft directional light from above - optimized shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(0, 5, 2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024; // Reduced from 2048
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 10;
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.radius = 4; // Reduced for better performance
directionalLight.shadow.bias = -0.0001;
scene.add(directionalLight);

// Additional fill light for softness (no shadows for performance)
const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-2, 3, -1);
fillLight.castShadow = false; // No shadows for fill light
scene.add(fillLight);

// Surface and rail removed - just the floating jelly button

// Jelly switch
const switchBehavior = new SwitchBehavior();

// Create rounded box geometry for jelly
// Using a subdivided box with smooth normals for rounded appearance
function createRoundedBox(width, height, depth, radius, segments) {
    const geometry = new THREE.BoxGeometry(width, height, depth, segments, segments, segments);
    const position = geometry.attributes.position;
    const vertices = position.array;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfDepth = depth / 2;
    
    // Round the corners
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        const z = vertices[i + 2];
        
        // Normalize to corner distance
        const nx = Math.abs(x) / halfWidth;
        const ny = Math.abs(y) / halfHeight;
        const nz = Math.abs(z) / halfDepth;
        
        // Check if we're near a corner (optimized)
        if (nx > 0.7 && ny > 0.7 && nz > 0.7) {
            const dx = nx - 1;
            const dy = ny - 1;
            const dz = nz - 1;
            const distSq = dx * dx + dy * dy + dz * dz;
            if (distSq < 0.09) { // 0.3^2 = 0.09 (avoid sqrt)
                const dist = Math.sqrt(distSq);
                const factor = Math.max(0, 1 - dist / 0.3);
                const r = radius * factor;
                const signX = Math.sign(x);
                const signY = Math.sign(y);
                const signZ = Math.sign(z);
                
                vertices[i] = signX * (halfWidth - r);
                vertices[i + 1] = signY * (halfHeight - r);
                vertices[i + 2] = signZ * (halfDepth - r);
            }
        }
    }
    
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
}

const jellyGeometry = createRoundedBox(
    JELLY_HALFSIZE.x * 2,
    JELLY_HALFSIZE.y * 2,
    JELLY_HALFSIZE.z * 2,
    0.15, // Larger radius for smoother, more rounded appearance
    10 // Reduced segments for better performance (still looks smooth)
);

// Jelly material - highly translucent, glossy, refractive (optimized)
const jellyMaterial = new THREE.MeshPhysicalMaterial({
    color: JELLY_COLOR,
    transparent: true,
    opacity: 0.4, // More translucent
    roughness: 0.05, // Very glossy
    metalness: 0.0,
    ior: JELLY_IOR,
    transmission: 0.95, // Slightly reduced for performance
    thickness: 0.6,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05, // Very smooth clearcoat
    envMapIntensity: 1.8, // Slightly reduced
    side: THREE.FrontSide, // Render only front side for better performance
});

// Create environment map for reflections - generate once
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Create environment map once (not updating for performance)
const envMap = pmremGenerator.fromScene(scene, 0.04).texture;
jellyMaterial.envMap = envMap;

const jellyMesh = new THREE.Mesh(jellyGeometry, jellyMaterial);
jellyMesh.castShadow = true;
jellyMesh.receiveShadow = false; // Disable receive shadow for performance
scene.add(jellyMesh);

// Animation loop - optimized
let lastTime = performance.now();

function animate(currentTime) {
    const deltaTime = Math.min((currentTime - lastTime) * 0.001, 0.1);
    lastTime = currentTime;

    // Update switch behavior
    switchBehavior.update(deltaTime);
    const state = switchBehavior.getState();

    // Update jelly position and transform - button stays centered
    const jellyX = 0; // Always centered
    // Position button with vertical press animation
    const baseY = JELLY_HALFSIZE.y * 0.5 + 0.01;
    const jellyY = baseY + state.pressY * 0.05; // Press down effect
    
    jellyMesh.position.set(jellyX, jellyY, 0);

    // Apply squash and stretch for satisfying click feedback
    const scaleX = 1 - state.squashX;
    const scaleZ = 1 - state.squashZ;
    const scaleY = 1 + state.squashZ * 0.3; // Slight vertical stretch when squashed
    jellyMesh.scale.set(scaleX, scaleY, scaleZ);

    // Apply wiggle rotation for playful bounce
    jellyMesh.rotation.z = state.wiggleX * 0.3;
    jellyMesh.rotation.x = state.wiggleX * 0.1;

    // Emission based on toggle state
    const emission = state.toggled ? 0.8 : 0.3;
    jellyMaterial.emissive = JELLY_COLOR.clone();
    jellyMaterial.emissiveIntensity = emission * 0.2;

    // Update orbit controls
    controls.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Event handlers - work with orbit controls
let isPressed = false;
let mouseDownPos = { x: 0, y: 0 };
let hasDragged = false;

canvas.addEventListener('mousedown', (e) => {
    // Only handle left mouse button for button toggle
    if (e.button === 0) {
        mouseDownPos.x = e.clientX;
        mouseDownPos.y = e.clientY;
        hasDragged = false;
        switchBehavior.pressed = true;
        isPressed = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isPressed) {
        // Check if mouse moved significantly (dragging)
        const dx = Math.abs(e.clientX - mouseDownPos.x);
        const dy = Math.abs(e.clientY - mouseDownPos.y);
        if (dx > 5 || dy > 5) {
            hasDragged = true;
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        switchBehavior.pressed = false;
        // Only trigger click if it was a click (not a drag)
        if (isPressed && !hasDragged) {
            switchBehavior.click(); // Trigger satisfying click animation
        }
        isPressed = false;
        hasDragged = false;
    }
});

canvas.addEventListener('mouseleave', () => {
    switchBehavior.pressed = false;
    isPressed = false;
    hasDragged = false;
});

// Touch handlers - simplified for mobile
let touchStartPos = { x: 0, y: 0 };
let touchHasDragged = false;

canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        touchStartPos.x = e.touches[0].clientX;
        touchStartPos.y = e.touches[0].clientY;
        touchHasDragged = false;
        switchBehavior.pressed = true;
        isPressed = true;
    }
});

canvas.addEventListener('touchmove', (e) => {
    if (isPressed && e.touches.length === 1) {
        const dx = Math.abs(e.touches[0].clientX - touchStartPos.x);
        const dy = Math.abs(e.touches[0].clientY - touchStartPos.y);
        if (dx > 10 || dy > 10) {
            touchHasDragged = true;
        }
    }
});

canvas.addEventListener('touchend', (e) => {
    switchBehavior.pressed = false;
    if (isPressed && !touchHasDragged) {
        switchBehavior.click(); // Trigger satisfying click animation
    }
    isPressed = false;
    touchHasDragged = false;
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Smoothstep helper
Math.smoothstep = function(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
};

// Start animation
animate(performance.now());
