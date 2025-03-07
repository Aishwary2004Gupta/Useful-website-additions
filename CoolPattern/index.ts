import * as THREE from 'three';
import { WebGPURenderer } from 'three/examples/jsm/renderers/webgpu/WebGPURenderer';

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
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const xPos = (x - width / 2) * size;
        const yPos = (y - height / 2) * size;
  
        vertices.push(xPos, yPos, 0); // Vertex 1
        vertices.push(xPos + size, yPos, 0); // Vertex 2
        vertices.push(xPos, yPos + size, 0); // Vertex 3
  
        const baseIndex = (y * width + x) * 3;
        indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
  
        vertices.push(xPos + size, yPos + size, 0); // Vertex 4
        vertices.push(xPos, yPos + size, 0); // Vertex 5
        vertices.push(xPos + size, yPos, 0); // Vertex 6
  
        indices.push(baseIndex + 3, baseIndex + 4, baseIndex + 5);
      }
    }
  
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }

  async function createWebGPUMaterial(renderer: WebGPURenderer): Promise<THREE.ShaderMaterial> {
    const vertexShader = `
      struct Uniforms {
        time: f32,
      };
      @binding(0) @group(0) var<uniform> uniforms: Uniforms;
  
      @vertex
      fn main(@location(0) position: vec3<f32>) -> @builtin(position) vec4<f32> {
        var pos = position;
        pos.z = sin(pos.x * 5.0 + pos.y * 5.0 + uniforms.time) * 0.5; // Up-down animation
        return vec4<f32>(pos, 1.0);
      }
    `;
  
    const fragmentShader = `
      @fragment
      fn main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
        let red = vec3<f32>(1.0, 0.0, 0.0);
        let black = vec3<f32>(0.0, 0.0, 0.0);
        let color = mix(red, black, position.z + 0.5); // Gradient based on Z position
        return vec4<f32>(color, 1.0);
      }
    `;
  
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
      },
    });
  
    await renderer.initTexture(material); // Important for WebGPU materials!
  
    return material;
  }

init();