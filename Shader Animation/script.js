import { Pane } from 'https://cdn.skypack.dev/tweakpane@4.0.4';

    // Default parameters
    const PARAMS = {
      showText: true,
      text: "Shader Animation",
      glow: true,
    };

    const shaderText = document.getElementById("shader-text");

    // Setup control panel
    const pane = new Pane({ title: "Controls" });

    pane.addBinding(PARAMS, "showText", { label: "Show Text" })
      .on("change", (ev) => {
        shaderText.style.display = ev.value ? "block" : "none";
      });

    pane.addBinding(PARAMS, "text", { label: "Text" })
      .on("change", (ev) => {
        shaderText.textContent = ev.value;
      });

    pane.addBinding(PARAMS, "glow", { label: "Glow Effect" })
      .on("change", (ev) => {
        if (ev.value) {
          shaderText.classList.add("glow");
        } else {
          shaderText.classList.remove("glow");
        }
      });

    // ---- THREE.js setup ----
    const container = document.getElementById("shader-container");
    const camera = new THREE.Camera();
    camera.position.z = 1;
    const scene = new THREE.Scene();

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time*0.05;
        float lineWidth = 0.002;

        vec3 color = vec3(0.0);
        for(int j = 0; j < 3; j++){
          for(int i=0; i < 5; i++){
            color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*5.0 - length(uv) + mod(uv.x+uv.y, 0.2));
          }
        }
        
        gl_FragColor = vec4(color[0],color[1],color[2],1.0);
      }
    `;

    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    function onWindowResize() {
      renderer.setSize(container.clientWidth, container.clientHeight);
      uniforms.resolution.value.x = renderer.domElement.width;
      uniforms.resolution.value.y = renderer.domElement.height;
    }

    window.addEventListener("resize", onWindowResize);
    onWindowResize();

    function animate() {
      requestAnimationFrame(animate);
      uniforms.time.value += 0.05;
      renderer.render(scene, camera);
    }

    animate();