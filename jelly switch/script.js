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
        this.progress = 0;
        this.velocity = 0;
        this.squashXSpring = new Spring(squashXProperties);
        this.squashZSpring = new Spring(squashZProperties);
        this.wiggleXSpring = new Spring(wiggleXProperties);
    }

    update(dt) {
        if (dt <= 0) return;

        let acc = 0;
        if (this.toggled && this.progress < 1) {
            acc = SWITCH_ACCELERATION;
        }
        if (!this.toggled && this.progress > 0) {
            acc = -SWITCH_ACCELERATION;
        }

        // Anticipating movement
        if (this.pressed) {
            this.squashXSpring.velocity = -2;
            this.squashZSpring.velocity = 1;
            this.wiggleXSpring.velocity = 1 * Math.sign(this.progress - 0.5);
        }

        this.velocity += acc * dt;
        if (this.progress > 0 && this.progress < 1) {
            this.wiggleXSpring.velocity = this.velocity;
        }

        this.progress += this.velocity * dt;

        // Overshoot handling
        if (this.progress > 1) {
            this.progress = 1;
            this.velocity = 0;
            this.squashXSpring.velocity = -5;
            this.squashZSpring.velocity = 5;
            this.wiggleXSpring.velocity = -10;
        }
        if (this.progress < 0) {
            this.progress = 0;
            this.velocity = 0;
            this.squashXSpring.velocity = -5;
            this.squashZSpring.velocity = 5;
            this.wiggleXSpring.velocity = 10;
        }
        this.progress = Math.max(0, Math.min(1, this.progress));

        // Spring dynamics
        this.squashXSpring.update(dt);
        this.squashZSpring.update(dt);
        this.wiggleXSpring.update(dt);
    }

    getState() {
        return {
            progress: this.progress,
            squashX: this.squashXSpring.value,
            squashZ: this.squashZSpring.value,
            wiggleX: this.wiggleXSpring.value,
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

// Orbit Controls
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

// Minimalist surface - light grey panel
const surfaceSize = 3;
const surfaceThickness = 0.05;
const surfaceGeometry = new THREE.BoxGeometry(surfaceSize, surfaceThickness, surfaceSize);
const surfaceMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8e8e8, // Light grey (slightly lighter)
    roughness: 0.2,
    metalness: 0.0,
});
const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
surface.rotation.x = -Math.PI / 2;
surface.position.y = 0;
surface.receiveShadow = true;
surface.castShadow = false;
scene.add(surface);

// Recessed rail slot (darker grey groove)
const railLength = SWITCH_RAIL_LENGTH + 0.4;
const railWidth = 0.18;
const railDepth = 0.025;
const railGeometry = new THREE.BoxGeometry(railLength, railDepth, railWidth);
const railMaterial = new THREE.MeshStandardMaterial({
    color: 0x999999, // Darker grey for the recessed slot
    roughness: 0.7,
    metalness: 0.0,
});
const rail = new THREE.Mesh(railGeometry, railMaterial);
rail.rotation.x = -Math.PI / 2;
rail.position.y = -railDepth / 2 + 0.001; // Slightly recessed
rail.receiveShadow = false; // Disable for performance
scene.add(rail);

// Add subtle shadow/depth to the rail edges for better definition
const railEdgeGeometry = new THREE.BoxGeometry(railLength, 0.005, railWidth + 0.01);
const railEdgeMaterial = new THREE.MeshStandardMaterial({
    color: 0x777777,
    roughness: 0.8,
    metalness: 0.0,
});
const railEdge = new THREE.Mesh(railEdgeGeometry, railEdgeMaterial);
railEdge.rotation.x = -Math.PI / 2;
railEdge.position.y = -railDepth / 2 - 0.002;
scene.add(railEdge);

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

    // Update jelly position and transform
    const switchX = (state.progress - 0.5) * SWITCH_RAIL_LENGTH;
    const jellyX = switchX - state.squashX * (state.progress - 0.5) * 0.2;
    // Position button so it sits in the recessed rail, slightly above the surface
    const jellyY = JELLY_HALFSIZE.y * 0.5 + 0.01;
    
    jellyMesh.position.set(jellyX, jellyY, 0);

    // Apply squash and stretch
    const scaleX = 1 - state.squashX;
    const scaleZ = 1 - state.squashZ;
    jellyMesh.scale.set(scaleX, 1, scaleZ);

    // Apply wiggle rotation
    jellyMesh.rotation.z = state.wiggleX;

    // Apply subtle bend effect (simplified)
    jellyMesh.rotation.x = Math.sin(jellyX * 0.8) * 0.1;

    // Subtle emission for glow effect
    const emission = Math.max(0.3, Math.smoothstep(0.5, 1, state.progress) * 0.5);
    jellyMaterial.emissive = JELLY_COLOR.clone();
    jellyMaterial.emissiveIntensity = emission * 0.15;

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
        // Only toggle if it was a click (not a drag)
        if (isPressed && !hasDragged) {
            switchBehavior.toggled = !switchBehavior.toggled;
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
        switchBehavior.toggled = !switchBehavior.toggled;
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
