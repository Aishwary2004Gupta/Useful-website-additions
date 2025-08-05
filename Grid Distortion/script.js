import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js";
import { Pane } from "https://cdn.skypack.dev/tweakpane@4.0.4";

const style = document.createElement('style');
style.innerHTML = `
      .tp-dfwv {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        left: auto !important;
        z-index: 1000 !important;
      }
      `;
document.head.appendChild(style);

const container = document.getElementById("container");

let config = {
    gridSize: 14,
    distortionPower: 0.15,
    distortionRadius: 0.2,
    distortEdges: true,
    changeImage: () => loadTexture(),
};

let nextTexture = null;

const ctrl = new Pane({ title: "Config", expanded: true });
ctrl
    .addBinding(config, "gridSize", {
        min: 4,
        max: 128,
        step: 1,
        label: "Grid Size",
    })
    .on("change", () => regenerateDistortion());
ctrl.addBinding(config, "distortionPower", {
    min: 0.01,
    max: 1,
    step: 0.01,
    label: "Power",
});
ctrl.addBinding(config, "distortionRadius", {
    min: 0.01,
    max: 1,
    step: 0.01,
    label: "Radius",
});
ctrl.addBinding(config, "distortEdges", { label: "Distort Edges" });
ctrl
    .addButton({ title: "Change Image" })
    .on("click", () => config.changeImage());

let renderer, scene, camera, plane, material, uniforms, dataTexture;

const initScene = () => {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1000, 1000);
    camera.position.z = 2;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    uniforms = {
        time: { value: 0 },
        resolution: {
            value: new THREE.Vector4(
                container.clientWidth,
                container.clientHeight,
                1,
                1
            ),
        },
        uTexture: { value: null },
        uDataTexture: { value: null },
    };

    const vertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

    const fragmentShader = `
        uniform sampler2D uDataTexture;
        uniform sampler2D uTexture;
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv;
          vec4 offset = texture2D(uDataTexture, uv);
          gl_FragColor = texture2D(uTexture, uv - 0.02 * offset.rg);
        }
      `;

    material = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms,
        vertexShader,
        fragmentShader,
    });

    generateDistortionGrid();
};

const generateDistortionGrid = () => {
    if (plane) {
        scene.remove(plane);
        plane.geometry.dispose();
    }

    const size = config.gridSize;
    const geometry = new THREE.PlaneGeometry(2, 2, size - 1, size - 1);
    plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    regenerateDistortion();
};

const regenerateDistortion = () => {
    const size = config.gridSize;
    const data = new Float32Array(4 * size * size);
    for (let i = 0; i < size * size; i++) {
        data[i * 4] = Math.random() * 255 - 125;
        data[i * 4 + 1] = Math.random() * 255 - 125;
    }

    dataTexture = new THREE.DataTexture(
        data,
        size,
        size,
        THREE.RGBAFormat,
        THREE.FloatType
    );
    dataTexture.needsUpdate = true;
    uniforms.uDataTexture.value = dataTexture;
};

const preloadNextTexture = () => {
    const url = `https://picsum.photos/1920/1080?random=${Date.now()}`;
    new THREE.TextureLoader().load(url, (texture) => {
        texture.minFilter = THREE.LinearFilter;
        nextTexture = texture;
    });
};

const loadTexture = () => {
    const url = `https://picsum.photos/1920/1080?random=${Date.now()}`;
    new THREE.TextureLoader().load(url, (texture) => {
        texture.minFilter = THREE.LinearFilter;
        uniforms.uTexture.value = texture;
    });
};

let mouse = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 };
container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    mouse.vX = x - mouse.prevX;
    mouse.vY = y - mouse.prevY;
    Object.assign(mouse, { x, y, prevX: x, prevY: y });
});

const animate = () => {
    requestAnimationFrame(animate);
    if (!dataTexture || !uniforms.uTexture.value) return;

    uniforms.time.value += 0.05;
    const d = dataTexture.image.data;
    const size = config.gridSize;
    const relax = 0.9;

    for (let i = 0; i < size * size; i++) {
        d[i * 4] *= relax;
        d[i * 4 + 1] *= relax;
    }

    const mx = size * mouse.x;
    const my = size * mouse.y;
    const r = size * config.distortionRadius;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const dist = (mx - i) ** 2 + (my - j) ** 2;
            if (dist < r * r) {
                if (
                    !config.distortEdges &&
                    (i < 2 || i > size - 3 || j < 2 || j > size - 3)
                )
                    continue;
                const idx = 4 * (i + size * j);
                const power = Math.min(r / Math.sqrt(dist + 0.001), 10);
                d[idx] += config.distortionPower * 100 * mouse.vX * power;
                d[idx + 1] -= config.distortionPower * 100 * mouse.vY * power;
            }
        }
    }

    dataTexture.needsUpdate = true;
    renderer.render(scene, camera);
};

initScene();
loadTexture();
animate();