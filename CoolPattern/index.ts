import * as THREE from 'three';
import { WebGPURenderer } from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';

async function init() {
  // 1. Renderer Setup
  const renderer = new WebGPURenderer();
  await renderer.init();
  document.body.appendChild(renderer.domElement);

  // 2. Scene Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // 3. Geometry Generation
  const geometry = createTriangleGrid(50, 50, 1); // 50x50 grid of triangles, size 1

  // 4. WebGPU Material
  const material = await createWebGPUMaterial(renderer);

  // 5. Mesh Creation
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // 6. Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    material.uniforms.time.value = performance.now() / 1000; // Pass time to shader
    renderer.render(scene, camera);
  }
  animate();
}

// Helper Functions (Implement these below)
function createTriangleGrid(width: number, height: number, size: number): THREE.BufferGeometry {
    const vertices = [];
    const indices = [];
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const xPos = (x - width/2) * size;
            const yPos = (y - height/2) * size;
            
            vertices.push(xPos, yPos, 0);
            vertices.push(xPos + size, yPos, 0);
            vertices.push(xPos + size/2, yPos + size, 0);
        }
    }
    
    for (let i = 0; i < width * height; i++) {
        const baseIndex = i * 3;
        indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
}

async function createWebGPUMaterial(renderer: WebGPURenderer): Promise<THREE.ShaderMaterial> {
    const vertexShader = `
        uniform float time;
        varying vec2 vUv;
        
        void main() {
            vUv = position.xy;
            vec3 pos = position;
            pos.z = sin(time + position.x) * cos(time + position.y) * 0.5;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `;
    
    const fragmentShader = `
        uniform float time;
        varying vec2 vUv;
        
        void main() {
            vec3 color = 0.5 + 0.5 * cos(time + vUv.xyx + vec3(0,2,4));
            gl_FragColor = vec4(color, 1.0);
        }
    `;
    
    return new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader,
        fragmentShader
    });
}

init();