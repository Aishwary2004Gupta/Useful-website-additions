
// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 1000, 6000);

const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    10000
);
camera.position.set(0, 300, 1200);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById("container").appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(1, 1, 1);
scene.add(light);
scene.add(new THREE.AmbientLight(0x222222));

// Platform geometry
const width = 6000,
    height = 6000,
    segments = 150;
const geometry = new THREE.PlaneGeometry(
    width,
    height,
    segments,
    segments
);

// Materials
const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x0077ff,
    wireframe: true,
    transparent: true,
    opacity: 0.8,
});

const blackWireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true,
    transparent: true,
    opacity: 0.9,
});

const surfaceMaterial = new THREE.MeshPhongMaterial({
    color: 0x0077ff,
    emissive: 0x001020,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    shininess: 100,
});

// Meshes
const surfaceMesh = new THREE.Mesh(geometry, surfaceMaterial);
surfaceMesh.rotation.x = -Math.PI / 2;
scene.add(surfaceMesh);

const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
wireframeMesh.rotation.x = -Math.PI / 2;
scene.add(wireframeMesh);

const blackWireframeMesh = new THREE.Mesh(
    geometry,
    blackWireframeMaterial
);
blackWireframeMesh.rotation.x = -Math.PI / 2;
scene.add(blackWireframeMesh);

// Default mode: Wireframe Over Surface
let currentMode = 3;
wireframeMesh.visible = false;
surfaceMesh.visible = true;
blackWireframeMesh.visible = true;

const modeIndicator = document.getElementById("mode-indicator");

// Function to change modes
function cycleMode() {
    currentMode = (currentMode % 3) + 1;

    if (currentMode === 1) {
        // Surface Only
        wireframeMesh.visible = false;
        surfaceMesh.visible = true;
        blackWireframeMesh.visible = false;
        modeIndicator.textContent =
            "Surface Only - Double-click or Press Space to change";
    } else if (currentMode === 2) {
        // Wireframe Only
        wireframeMesh.visible = true;
        surfaceMesh.visible = false;
        blackWireframeMesh.visible = false;
        modeIndicator.textContent =
            "Wireframe Only - Double-click or Press Space to change";
    } else {
        // Wireframe Over Surface
        wireframeMesh.visible = false;
        surfaceMesh.visible = true;
        blackWireframeMesh.visible = true;
        modeIndicator.textContent =
            "Wireframe Over Surface - Double-click or Press Space to change";
    }
}

// Double-click listener
renderer.domElement.addEventListener("dblclick", cycleMode);

// Spacebar listener
window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        event.preventDefault();
        cycleMode();
    }
});

// Simplex-like noise implementation
class ImprovedNoise {
    constructor() {
        this.p = new Array(512);
        const permutation = [
            151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7,
            225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6,
            148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35,
            11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171,
            168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231,
            83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245,
            40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76,
            132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86,
            164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5,
            202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16,
            58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
            154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253,
            19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246,
            97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
            81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199,
            106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
            138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78,
            66, 215, 61, 156, 180,
        ];
        for (let i = 0; i < 256; i++) {
            this.p[i] = this.p[i + 256] = permutation[i];
        }
    }
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    lerp(t, a, b) {
        return a + t * (b - a);
    }
    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    noise(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        const u = this.fade(x),
            v = this.fade(y),
            w = this.fade(z);
        const A = this.p[X] + Y,
            AA = this.p[A] + Z,
            AB = this.p[A + 1] + Z;
        const B = this.p[X + 1] + Y,
            BA = this.p[B] + Z,
            BB = this.p[B + 1] + Z;
        return (
            this.lerp(
                w,
                this.lerp(
                    v,
                    this.lerp(
                        u,
                        this.grad(this.p[AA], x, y, z),
                        this.grad(this.p[BA], x - 1, y, z)
                    ),
                    this.lerp(
                        u,
                        this.grad(this.p[AB], x, y - 1, z),
                        this.grad(this.p[BB], x - 1, y - 1, z)
                    )
                ),
                this.lerp(
                    v,
                    this.lerp(
                        u,
                        this.grad(this.p[AA + 1], x, y, z - 1),
                        this.grad(this.p[BA + 1], x - 1, y, z - 1)
                    ),
                    this.lerp(
                        u,
                        this.grad(this.p[AB + 1], x, y - 1, z - 1),
                        this.grad(this.p[BB + 1], x - 1, y - 1, z - 1)
                    )
                )
            ) *
            0.5 +
            0.5
        );
    }
}

const noise = new ImprovedNoise();
let t = 0;

function animate() {
    requestAnimationFrame(animate);
    t += 0.013;

    [surfaceMesh, wireframeMesh, blackWireframeMesh].forEach((mesh) => {
        const pos = mesh.geometry.attributes.position;
        const arr = pos.array;
        for (let i = 0; i < arr.length; i += 3) {
            const x = arr[i];
            const y = arr[i + 1];
            const val = noise.noise(x * 0.002, (y + t * 1000) * 0.002, t * 0.5);
            arr[i + 2] = val * 800 - 400;
        }
        pos.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
    });

    const hue = (Math.sin(t * 0.3) * 0.5 + 0.5) * 0.7;
    const color = new THREE.Color().setHSL(hue, 1.0, 0.5);

    wireframeMaterial.color.copy(color);
    surfaceMaterial.color.copy(color);

    renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
