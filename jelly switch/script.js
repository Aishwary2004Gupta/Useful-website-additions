import * as THREE from 'three';

// Constants matching the original
const JELLY_HALFSIZE = new THREE.Vector3(0.35, 0.3, 0.3);
const SWITCH_RAIL_LENGTH = 0.4;
const SWITCH_ACCELERATION = 100;
const JELLY_IOR = 1.42;
const JELLY_COLOR = new THREE.Color(1.0, 0.45, 0.075);

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
scene.background = new THREE.Color(0x1a1a1a);

// Camera setup (adjusted for better button view)
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(0.024, 1.8, 2.2);
camera.lookAt(0, 0.3, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6 * 0.6);
scene.add(ambientLight);

const lightDir = new THREE.Vector3(0.19, -0.24, 0.75).normalize();
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.copy(lightDir.clone().multiplyScalar(-10));
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -5;
directionalLight.shadow.camera.right = 5;
directionalLight.shadow.camera.top = 5;
directionalLight.shadow.camera.bottom = -5;
scene.add(directionalLight);

// Button housing group
const buttonHousing = new THREE.Group();
scene.add(buttonHousing);

// Main base panel (the button housing)
const baseSize = 1.2;
const baseThickness = 0.15;
const baseGeometry = new THREE.BoxGeometry(baseSize, baseThickness, baseSize * 0.6);
const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.4,
    metalness: 0.3,
});
const base = new THREE.Mesh(baseGeometry, baseMaterial);
base.position.y = baseThickness / 2;
base.castShadow = true;
base.receiveShadow = true;
buttonHousing.add(base);

// Top panel (the surface where the button slides)
const topPanelGeometry = new THREE.BoxGeometry(baseSize, 0.02, baseSize * 0.6);
const topPanelMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.1,
});
const topPanel = new THREE.Mesh(topPanelGeometry, topPanelMaterial);
topPanel.position.y = baseThickness + 0.01;
topPanel.receiveShadow = true;
buttonHousing.add(topPanel);

// Rail track (the groove where the button slides)
const railLength = SWITCH_RAIL_LENGTH + 0.2;
const railWidth = 0.12;
const railDepth = 0.03;
const railGeometry = new THREE.BoxGeometry(railLength, railDepth, railWidth);
const railMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8,
    metalness: 0.0,
});
const rail = new THREE.Mesh(railGeometry, railMaterial);
rail.position.y = baseThickness + 0.01 - railDepth / 2;
rail.receiveShadow = true;
buttonHousing.add(rail);

// Rail edges (left and right walls of the track)
const railEdgeHeight = 0.08;
const railEdgeThickness = 0.01;
const railEdgeGeometry = new THREE.BoxGeometry(railEdgeThickness, railEdgeHeight, railWidth + 0.02);

// Left rail edge
const leftEdge = new THREE.Mesh(railEdgeGeometry, baseMaterial);
leftEdge.position.set(-railLength / 2, baseThickness + railEdgeHeight / 2, 0);
leftEdge.castShadow = true;
buttonHousing.add(leftEdge);

// Right rail edge
const rightEdge = new THREE.Mesh(railEdgeGeometry, baseMaterial);
rightEdge.position.set(railLength / 2, baseThickness + railEdgeHeight / 2, 0);
rightEdge.castShadow = true;
buttonHousing.add(rightEdge);

// End stops/indicators
const endStopSize = 0.04;
const endStopGeometry = new THREE.BoxGeometry(endStopSize, 0.02, railWidth);
const endStopMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.5,
    metalness: 0.2,
});

// Left end stop (OFF position)
const leftEndStop = new THREE.Mesh(endStopGeometry, endStopMaterial);
leftEndStop.position.set(-railLength / 2, baseThickness + 0.02, 0);
buttonHousing.add(leftEndStop);

// Right end stop (ON position)
const rightEndStop = new THREE.Mesh(endStopGeometry, endStopMaterial);
rightEndStop.position.set(railLength / 2, baseThickness + 0.02, 0);
buttonHousing.add(rightEndStop);

// Add corner screws for realism
const screwGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.02, 16);
const screwMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    roughness: 0.3,
    metalness: 0.8,
});
const screwPositions = [
    [-baseSize / 2 + 0.05, baseThickness + 0.01, -baseSize * 0.3 + 0.05],
    [baseSize / 2 - 0.05, baseThickness + 0.01, -baseSize * 0.3 + 0.05],
    [-baseSize / 2 + 0.05, baseThickness + 0.01, baseSize * 0.3 - 0.05],
    [baseSize / 2 - 0.05, baseThickness + 0.01, baseSize * 0.3 - 0.05],
];
screwPositions.forEach(([x, y, z]) => {
    const screw = new THREE.Mesh(screwGeometry, screwMaterial);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(x, y, z);
    screw.castShadow = true;
    buttonHousing.add(screw);
});

// Labels (ON/OFF text indicators)
function createTextSprite(text, color = 0x888888) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.font = 'Bold 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 128, 32);
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.15, 0.05, 1);
    return sprite;
}

const offLabel = createTextSprite('OFF', 0x666666);
offLabel.position.set(-railLength / 2 - 0.15, baseThickness + 0.1, 0);
buttonHousing.add(offLabel);

const onLabel = createTextSprite('ON', 0x888888);
onLabel.position.set(railLength / 2 + 0.15, baseThickness + 0.1, 0);
buttonHousing.add(onLabel);

// Ground plane (background)
const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8,
    metalness: 0.0,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;
scene.add(ground);

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
        
        // Check if we're near a corner
        if (nx > 0.7 && ny > 0.7 && nz > 0.7) {
            const dist = Math.sqrt((nx - 1) ** 2 + (ny - 1) ** 2 + (nz - 1) ** 2);
            if (dist < 0.3) {
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
    0.1,
    12
);

// Jelly material with transparency and refraction
const jellyMaterial = new THREE.MeshPhysicalMaterial({
    color: JELLY_COLOR,
    transparent: true,
    opacity: 0.9,
    roughness: 0.1,
    metalness: 0.0,
    ior: JELLY_IOR,
    transmission: 0.95,
    thickness: 0.6,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5,
});

// Create environment map for reflections
// Using a simple cube render target for environment
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const envMap = pmremGenerator.fromScene(scene).texture;
jellyMaterial.envMap = envMap;

const jellyMesh = new THREE.Mesh(jellyGeometry, jellyMaterial);
jellyMesh.castShadow = true;
jellyMesh.receiveShadow = true;
scene.add(jellyMesh);

// Add subtle emission based on progress
jellyMaterial.emissive = JELLY_COLOR.clone();
jellyMaterial.emissiveIntensity = 0.2;

// Animation loop
let lastTime = performance.now();

function animate() {
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - lastTime) * 0.001, 0.1);
    lastTime = currentTime;

    // Update switch behavior
    switchBehavior.update(deltaTime);
    const state = switchBehavior.getState();

    // Update jelly position and transform
    const switchX = (state.progress - 0.5) * SWITCH_RAIL_LENGTH;
    const jellyX = switchX - state.squashX * (state.progress - 0.5) * 0.2;
    // Position button so it sits in the rail track, slightly above the top panel
    const jellyY = baseThickness + 0.02 + JELLY_HALFSIZE.y;
    
    jellyMesh.position.set(jellyX, jellyY, 0);

    // Apply squash and stretch
    const scaleX = 1 - state.squashX;
    const scaleZ = 1 - state.squashZ;
    jellyMesh.scale.set(scaleX, 1, scaleZ);

    // Apply wiggle rotation
    jellyMesh.rotation.z = state.wiggleX;

    // Apply subtle bend effect (simplified)
    jellyMesh.rotation.x = Math.sin(jellyX * 0.8) * 0.1;

    // Update emission based on progress
    const emission = Math.max(0.7, Math.smoothstep(0.7, 1, state.progress) * 2 + 0.7);
    jellyMaterial.emissiveIntensity = emission * 0.2;

    // Update ON/OFF label colors based on state
    const labelColor = state.progress > 0.5 ? 0x00ff00 : 0x666666;
    const offColor = state.progress < 0.5 ? 0xff0000 : 0x666666;
    
    // Update label materials
    if (offLabel.material) {
        offLabel.material.color.setHex(offColor);
    }
    if (onLabel.material) {
        onLabel.material.color.setHex(labelColor);
    }

    // Update top panel bounce light
    const bounceLight = JELLY_COLOR.clone().multiplyScalar(
        1 / (jellyMesh.position.lengthSq() * 15 + 1) * 0.4 * emission
    );
    topPanelMaterial.emissive.copy(bounceLight);
    topPanelMaterial.emissiveIntensity = 0.2;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Event handlers
let isPressed = false;

canvas.addEventListener('mousedown', (e) => {
    switchBehavior.pressed = true;
    isPressed = true;
    e.preventDefault();
});

canvas.addEventListener('mouseup', (e) => {
    switchBehavior.pressed = false;
    if (isPressed) {
        switchBehavior.toggled = !switchBehavior.toggled;
    }
    isPressed = false;
    e.preventDefault();
});

canvas.addEventListener('mouseleave', () => {
    switchBehavior.pressed = false;
    isPressed = false;
});

canvas.addEventListener('touchstart', (e) => {
    switchBehavior.pressed = true;
    isPressed = true;
    e.preventDefault();
});

canvas.addEventListener('touchend', (e) => {
    switchBehavior.pressed = false;
    if (isPressed) {
        switchBehavior.toggled = !switchBehavior.toggled;
    }
    isPressed = false;
    e.preventDefault();
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
animate();
