import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';

let scene, camera, renderer, controls, particleSystem, currentGeometry;
const numParticles = 25000;
const clock = new THREE.Clock();
let targetPositions = [];
let animationProgress = 1;
const animationDuration = 1.5;
let selectedButton = null;
let composer, bloomPass;
let trailTexture, trailScene, trailCamera, trailComposer;

const params = {
    particleSize: 0.035,
    particleColor: 0xf00,
    rotationSpeed: 0.1,
    bloomStrength: 0.8,
    bloomRadius: 0.5,
    bloomThreshold: 0.85,
    ambientLightIntensity: 0.7,
    directionalLightIntensity: 1,
    motionTrail: 0.3
};

init();
animate();

function init() {
    initScenes();
    initLights();
    initComposers();
    initControls();
    createParticleSystem();
    initEventListeners();
    initTrailEffect();
}

function initScenes() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.Fog(0x050505, 10, 50);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    document.getElementById('container').appendChild(renderer.domElement);

    trailScene = new THREE.Scene();
    trailCamera = camera.clone();
    trailTexture = new THREE.WebGLRenderTarget(
        window.innerWidth,
        window.innerHeight,
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        }
    );
}

function initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, params.ambientLightIntensity);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, params.directionalLightIntensity);
    directionalLight.position.set(1, 3, 2);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}

function initComposers() {
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        params.bloomStrength,
        params.bloomRadius,
        params.bloomThreshold
    );
    composer.addPass(bloomPass);

    const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
    composer.addPass(gammaCorrectionPass);

    trailComposer = new EffectComposer(renderer, trailTexture);
    const trailRenderPass = new RenderPass(trailScene, trailCamera);
    trailComposer.addPass(trailRenderPass);
}

function initControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    
    controls.addEventListener('start', () => {
        document.body.style.cursor = 'grabbing';
    });
    
    controls.addEventListener('end', () => {
        document.body.style.cursor = 'grab';
    });
}

function createParticleSystem() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(numParticles * 3);
    const colors = new Float32Array(numParticles * 3);
    const sizes = new Float32Array(numParticles);

    targetPositions = new Float32Array(numParticles * 3);

    for (let i = 0; i < numParticles; i++) {
        const phi = Math.acos(-1 + (2 * i) / numParticles);
        const theta = Math.sqrt(numParticles * Math.PI) * phi;
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);
        const z = Math.cos(phi);

        positions[i * 3] = x * 1.5;
        positions[i * 3 + 1] = y * 1.5;
        positions[i * 3 + 2] = z * 1.5;

        targetPositions[i * 3] = positions[i * 3];
        targetPositions[i * 3 + 1] = positions[i * 3 + 1];
        targetPositions[i * 3 + 2] = positions[i * 3 + 2];

        const color = new THREE.Color(params.particleColor);
        color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.5);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = params.particleSize * (0.8 + Math.random() * 0.4);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: params.particleSize,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthTest: true,
        depthWrite: false,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    const trailParticles = particleSystem.clone();
    trailScene.add(trailParticles);
}

function initTrailEffect() {
    const trailMaterial = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { value: null },
            opacity: { value: 0.9 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float opacity;
            varying vec2 vUv;
            void main() {
                vec4 texel = texture2D(tDiffuse, vUv);
                gl_FragColor = opacity * texel;
            }
        `
    });

    const trailPass = new ShaderPass(trailMaterial);
    trailPass.renderToScreen = true;
    composer.addPass(trailPass);
}

function initEventListeners() {
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });

    const initialShape = 'sphere';
    document.querySelector(`[data-shape="${initialShape}"]`).classList.add('active');
    selectedButton = document.querySelector(`[data-shape="${initialShape}"]`);
    morphToShape(initialShape);

    document.getElementById('particleSize').addEventListener('input', (e) => {
        params.particleSize = parseFloat(e.target.value);
        document.getElementById('sizeValue').textContent = params.particleSize.toFixed(3);
        updateParticleSystem();
    });

    document.getElementById('rotationSpeed').addEventListener('input', (e) => {
        params.rotationSpeed = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = params.rotationSpeed.toFixed(2);
    });

    document.getElementById('particleColor').addEventListener('input', (e) => {
        params.particleColor = new THREE.Color(e.target.value).getHex();
        updateParticleSystem();
    });

    document.getElementById('bloomStrength').addEventListener('input', (e) => {
        params.bloomStrength = parseFloat(e.target.value);
        document.getElementById('bloomValue').textContent = params.bloomStrength.toFixed(1);
        bloomPass.strength = params.bloomStrength;
    });

    document.getElementById('motionTrail').addEventListener('input', (e) => {
        params.motionTrail = parseFloat(e.target.value);
        document.getElementById('trailValue').textContent = params.motionTrail.toFixed(2);
    });

    window.addEventListener('resize', onWindowResize, false);

    renderer.domElement.addEventListener('dblclick', () => {
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
        controls.reset();
    });
}

function handleButtonClick(event) {
    const shape = event.target.dataset.shape;
    if (selectedButton) {
        selectedButton.classList.remove('active');
    }
    selectedButton = event.target;
    selectedButton.classList.add('active');
    morphToShape(shape);
}

function createDNAShape() {
    const points = [];
    const numPoints = 100;
    const radius = 1;
    const height = 3;
    const turns = 2;
    
    for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2 * turns;
        const x = Math.cos(t) * radius;
        const y = (i / numPoints) * height - height / 2;
        const z = Math.sin(t) * radius;
        points.push(new THREE.Vector3(x, y, z));
        
        const offset = Math.PI;
        const x2 = Math.cos(t + offset) * radius;
        const z2 = Math.sin(t + offset) * radius;
        points.push(new THREE.Vector3(x2, y, z2));
    }
    
    return points;
}

function createTorusKnotShape() {
    const points = [];
    const numPoints = 200;
    const radius = 1.5;
    const tubeRadius = 0.4;
    const p = 3;
    const q = 2;
    
    for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        const x = radius * (2 + Math.cos(q * t)) * Math.cos(p * t);
        const y = radius * (2 + Math.cos(q * t)) * Math.sin(p * t);
        const z = tubeRadius * Math.sin(q * t);
        points.push(new THREE.Vector3(x, y, z));
    }
    
    return points;
}

function createStarShape() {
    const points = [];
    const numPoints = 100;
    const radius = 1.5;
    const spikes = 5;
    
    for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        const r = radius * (1 + 0.5 * Math.sin(spikes * t));
        const x = r * Math.cos(t);
        const y = r * Math.sin(t);
        const z = 0;
        points.push(new THREE.Vector3(x, y, z));
    }
    
    return points;
}

function morphToShape(shapeType) {
    let targetGeometry;
    let targetVertices = [];

    switch (shapeType) {
        case 'sphere':
            targetGeometry = new THREE.SphereGeometry(1.5, 64, 64);
            break;
        case 'cube':
            targetGeometry = new THREE.BoxGeometry(2.2, 2.2, 2.2);
            break;
        case 'torus':
            targetGeometry = new THREE.TorusGeometry(1.2, 0.4, 32, 200);
            break;
        case 'icosahedron':
            targetGeometry = new THREE.IcosahedronGeometry(1.7, 3);
            break;
        case 'teapot':
            targetGeometry = new TeapotGeometry(1.2, 16);
            break;
        case 'dna':
            targetVertices = createDNAShape();
            break;
        case 'torusKnot':
            targetVertices = createTorusKnotShape();
            break;
        case 'star':
            targetVertices = createStarShape();
            break;
        default:
            return;
    }

    if (shapeType !== 'dna' && shapeType !== 'torusKnot' && shapeType !== 'star') {
        targetGeometry.computeVertexNormals();
        const targetPositionAttribute = targetGeometry.getAttribute('position');
        for (let i = 0; i < targetPositionAttribute.count; i++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(targetPositionAttribute, i);
            targetVertices.push(vertex);
        }
    }

    for (let i = 0; i < numParticles; i++) {
        const vertexIndex = i % targetVertices.length;
        const targetVertex = targetVertices[vertexIndex];
        targetPositions[i * 3] = targetVertex.x;
        targetPositions[i * 3 + 1] = targetVertex.y;
        targetPositions[i * 3 + 2] = targetVertex.z;
    }

    animationProgress = 0;
    if (shapeType !== 'dna' && shapeType !== 'torusKnot' && shapeType !== 'star') {
        currentGeometry = targetGeometry;
    }
}

function updateParticleSystem() {
    if (!particleSystem) return;

    const colors = particleSystem.geometry.attributes.color.array;
    const sizes = particleSystem.geometry.attributes.size.array;

    for (let i = 0; i < numParticles; i++) {
        const color = new THREE.Color(params.particleColor);
        color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.5);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = params.particleSize * (0.8 + Math.random() * 0.4);
    }

    particleSystem.geometry.attributes.color.needsUpdate = true;
    particleSystem.geometry.attributes.size.needsUpdate = true;
    particleSystem.material.size = params.particleSize;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    trailTexture.setSize(window.innerWidth, window.innerHeight);
    trailComposer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (particleSystem) {
        particleSystem.rotation.y += delta * params.rotationSpeed;

        if (animationProgress < 1) {
            animationProgress += delta / animationDuration;
            animationProgress = Math.min(animationProgress, 1);

            const positions = particleSystem.geometry.attributes.position.array;
            for (let i = 0; i < numParticles * 3; i++) {
                positions[i] += (targetPositions[i] - positions[i]) * (delta / animationDuration);
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;
        }
    }

    renderer.setRenderTarget(trailTexture);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    controls.update();
    composer.render();
}