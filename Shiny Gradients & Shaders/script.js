import * as THREE from "https://esm.sh/three@0.178.0";
import { Pane } from "https://cdn.skypack.dev/tweakpane@4.0.4";

console.log("🎨 Shiny Gradients & Shaders - Initializing...");
console.log("THREE.js version:", THREE.REVISION);
console.log("Pane loaded:", typeof Pane);

// Check WebGL support
if (!window.WebGLRenderingContext) {
  console.error("WebGL is not supported in this browser");
  alert("WebGL is not supported in this browser. Please use a modern browser.");
}

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

if (!renderer.getContext()) {
  console.error("Failed to get WebGL context");
  alert("Failed to initialize WebGL. Please check your browser settings.");
}

// Get the actual pixel ratio but clamp it
const pixelRatio = Math.min(window.devicePixelRatio, 2);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(pixelRatio);
document.getElementById("container").appendChild(renderer.domElement);

let isPlaying = false;
let audioContext = null;
let analyser = null;
let dataArray = null;
let source = null;
let panelVisible = false;
let audioLevels = {
  bassLevel: 0,
  midLevel: 0,
  trebleLevel: 0,
  overallLevel: 0
};
let bassMonitor, midMonitor, trebleMonitor, overallMonitor;

const audio = new Audio();
// Using a working audio file
audio.src = "https://assets.codepen.io/4295/sample.mp3";
audio.preload = "auto";
audio.volume = 1.0;
audio.crossOrigin = "anonymous";
audio.addEventListener("ended", () => {
  if (isPlaying) {
    audio.currentTime = 0;
    audio.play();
  }
});
audio.load();

function initAudioAnalysis() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      console.log("Web Audio API initialized successfully");
      console.log("Audio context state:", audioContext.state);
    }
  } catch (e) {
    console.error("Web Audio API failed to initialize:", e);
    analyser = null;
    dataArray = null;
    // Fallback: continue without audio analysis
    console.warn("Continuing without audio analysis features");
  }
}

const waterSettings = {
  resolution: 256,
  damping: 0.913,
  tension: 0.02,
  rippleStrength: 0.2,
  mouseIntensity: 1.2,
  clickIntensity: 3.0,
  rippleRadius: 8,
  splatForce: 50000,
  splatThickness: 0.1,
  vorticityInfluence: 0.2,
  swirlIntensity: 0.2,
  pressure: 0.3,
  velocityDissipation: 0.08,
  densityDissipation: 1.0,
  displacementScale: 0.01
};

const resolution = waterSettings.resolution;
let waterBuffers = {
  current: new Float32Array(resolution * resolution),
  previous: new Float32Array(resolution * resolution),
  velocity: new Float32Array(resolution * resolution * 2),
  vorticity: new Float32Array(resolution * resolution),
  pressure: new Float32Array(resolution * resolution)
};

for (let i = 0; i < resolution * resolution; i++) {
  waterBuffers.current[i] = 0.0;
  waterBuffers.previous[i] = 0.0;
  waterBuffers.velocity[i * 2] = 0.0;
  waterBuffers.velocity[i * 2 + 1] = 0.0;
  waterBuffers.vorticity[i] = 0.0;
  waterBuffers.pressure[i] = 0.0;
}

const waterTexture = new THREE.DataTexture(
  waterBuffers.current,
  waterSettings.resolution,
  waterSettings.resolution,
  THREE.RedFormat,
  THREE.FloatType
);
waterTexture.minFilter = THREE.LinearFilter;
waterTexture.magFilter = THREE.LinearFilter;
waterTexture.needsUpdate = true;

// Create logo texture - FIXED for Retina displays
function createLogoTexture() {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Use logical dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Set canvas size to logical dimensions (no DPR scaling)
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Calculate logo size based on logical dimensions
      const logoSize = Math.max(180, Math.min(360, width * 0.18));
      const x = width / 2 - logoSize / 2;
      const y = height / 2 - logoSize / 2 - 100;

      ctx.drawImage(img, x, y, logoSize, logoSize);

      // Add text below logo
      const scale = Math.max(0.4, Math.min(1.2, width / 1920));
      const fontSize = Math.max(16, Math.min(28, 22 * scale));
      const textY = y + logoSize + 60;

      ctx.font = `400 ${fontSize}px "GT Standard", Arial, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const paragraphText =
        "Reality bends to the rhythm of consciousness, where every thought\nripples through the quantum field of infinite possibility.\nWe are not mere observers but co-creators in this dance\nof energy, frequency, and vibrational harmony.";

      const paragraphLines = paragraphText.split("\n");
      const lineHeight = fontSize * 1.5;
      paragraphLines.forEach((line, index) => {
        const y = textY + index * lineHeight;
        ctx.fillText(line, width / 2, y);
      });

      resolve(canvas);
    };

    img.src = "https://assets.codepen.io/7558/sphere.png";
  });
}

const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

const fragmentShader = `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_speed;
      uniform sampler2D u_waterTexture;
      uniform float u_waterStrength;
      uniform float u_ripple_time;
      uniform vec2 u_ripple_position;
      uniform float u_ripple_strength;
      uniform sampler2D u_logoTexture;
      uniform bool u_showLogo;
      uniform float u_audioLow;
      uniform float u_audioMid;
      uniform float u_audioHigh;
      uniform float u_audioOverall;
      uniform float u_audioReactivity;
      uniform int u_gradientTheme;
      
      varying vec2 vUv;

      // Gradient shader functions
      vec4 electricPlasma(vec2 u, float t) {
        float a=0., d=0., i=0.;
        for (; i < 8.; d += sin(i++ * u.y + a))
           a += sin(i - d + 0.15 * t - a * u.x);
        vec3 c = mix(vec3(0.1,0.0,0.8), vec3(0.5,0.2,1.0), .5+.5*cos(a));
        c = mix(c, vec3(1.0), .5+.5*sin(d));
        return vec4(c, 1.0);
      }

      vec4 moltenGold(vec2 u, float t) {
        float a=0., d=0., i=0.;
        for (; i < 10.; d += cos(i++ * u.y * 0.8 + a))
          a += cos(i - d + 0.1 * t - a * u.x + length(u));
        vec3 c = mix(vec3(0.), vec3(0.6,0.1,0.0), smoothstep(-1.,1.,cos(d)));
        c = mix(c, vec3(1.0,0.5,0.0), smoothstep(-.5,.5,sin(a)));
        c = mix(c, vec3(1.0,0.9,0.3), smoothstep(0.8,1.,cos(a+d)));
        return vec4(pow(c, vec3(1.5)), 1.0);
      }

      vec4 emeraldMist(vec2 u, float t) {
        float angle = t * 0.05;
        mat2 rot = mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
        u = rot * u;
        float a=0., d=0., i=0.;
        for (; i < 5.; d += sin(i++ * u.y + a) * 0.5)
          a += cos(i - d + 0.1 * t - a * u.x);
        vec3 c = mix(vec3(0.0,0.1,0.1), vec3(0.1,0.8,0.6), .5+.5*cos(a));
        c = mix(c, vec3(0.9,1.0,0.9), .5+.5*sin(d));
        return vec4(c, 1.0);
      }

      vec4 auroraWarp(vec2 u, float t) {
        float a=0., d=0., i=0.;
        for (; i < 12.; d += sin(i++ * u.y + a))
           a += sin(i - d + 0.1 * t - a * u.x);
        vec4 o;
        o.r = .5 + .5 * cos(a + d);
        o.g = .5 + .5 * cos(a + d + 2.09);
        o.b = .5 + .5 * cos(a + d + 4.18);
        o.a = 1.0;
        return cos(.5 + .5 * cos(vec4(d,a,2.5,0)) * o);
      }

      vec4 cosmicOcean(vec2 u, float t) {
        vec2 p = vec2(u.x * 0.2, u.y);
        float a=0., d=0., i=0.;
        for (; i < 8.; d += sin(i++ * p.y + a + t*0.08))
           a += cos(i - d + 0.1 * t - a * p.x);
        vec3 c = mix(vec3(0,0.05,0.2), vec3(0.1,0.2,0.7), smoothstep(-1.,1.,cos(a)));
        c = mix(c, vec3(0.8,0.8,1.0), pow(smoothstep(0.5,1.,sin(d*2.)), 4.0));
        return vec4(c, 1.0);
      }

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
      }

      vec4 staticInterference(vec2 u, float t) {
        u += (random(u + t * 0.5) - 0.5) * 0.02;
        float a=0., d=0., i=0.;
        for (; i < 8.; d += sin(i++ * u.y + a))
           a += cos(i - d + 0.3 * t - a * u.x);
        float grey = .5 + .5 * cos(a + d);
        grey += (random(u * 150.0) - 0.5) * 0.15;
        return vec4(vec3(grey), 1.0);
      }

      vec4 liquidCrystal(vec2 u, float t) {
        u *= 1.2;
        float a=0., d=0., i=0.;
        for (; i < 9.; d += cos(i++ * u.y + a))
           a += sin(i*0.5 - d + 0.1 * t - a * u.x);
        vec3 c = 0.6 + 0.4 * cos(vec3(0.0, 2.1, 4.2) + a + d);
        float gloss = pow(smoothstep(0.6, 1.0, sin(d * 2.0 + a)), 10.0);
        c += vec3(0.8) * gloss;
        return vec4(clamp(c, 0.0, 1.0), 1.0);
      }

      vec4 solarFlare(vec2 u, float t) {
        float a=0., d=0., i=0.;
        for (; i < 9.; d += sin(i++ * u.y + a))
           a += cos(i - d + 0.05 * t - a * u.x);
        float v = .5 + .5 * cos(a+d);
        vec3 c = mix(vec3(0.0), vec3(1.,0.1,0.), smoothstep(0.6, 0.7, v));
        c = mix(c, vec3(1.,0.8,0.2), smoothstep(0.85, 0.9, v));
        c = mix(c, vec3(1.), smoothstep(0.98, 0.99, v));
        return vec4(c, 1.0);
      }

      vec4 dreamscapePastel(vec2 u, float t) {
        float a=0., d=0., i=0.;
        for (; i < 6.; d += sin(i++ * u.y + a))
           a += cos(i - d + 0.04 * t - a * u.x);
        vec3 c1 = vec3(1.0, 0.8, 0.9), c2 = vec3(0.8, 0.9, 1.0), c3 = vec3(0.9, 0.8, 1.0);
        vec3 c = mix(c1, c2, .5+.5*cos(a+d));
        c = mix(c, c3, .5+.5*sin(d));
        return vec4(c, 1.0);
      }

      vec4 dataStream(vec2 u, float t) {
        float a=0., d=0., i=0.;
        for (; i < 8.; d+=sin(i++*u.y+a)) a+=cos(i-d+0.1*t-a*u.x);
        float g=0.;
        for (i=0.; i<4.; g+=cos(i++*u.x+a)) a+=sin(i-d+2.*t-g*u.y);
        vec3 color = 0.5 + 0.5*cos(vec3(0,1,2)+d);
        vec2 grid_uv = u * 8.0;
        vec2 grid = abs(fract(grid_uv) - 0.5);
        float lines = pow(1. - (grid.x+grid.y), 40.0);
        float glitch = pow(fract(g*4.0), 20.0);
        return vec4(color * (lines*0.5 + glitch*2.0), 1.0);
      }

      float gradientPattern(vec2 u, float t) {
        float a=0., d=0., i=0.;
        for (; i < 8.; d += sin(i++ * u.y + a))
          a += cos(i - d + 0.2 * t - a * u.x);
        return .5 + .5 * cos(a + d);
      }

      vec4 chromaticFlow(vec2 u, float t) {
        vec2 oR = vec2(cos(t*0.2),sin(t*0.2))*0.015;
        vec2 oG = vec2(cos(t*0.25),sin(t*0.25))*0.015;
        vec2 oB = vec2(cos(t*0.3),sin(t*0.3))*0.015;
        float r = gradientPattern(u + oR, t);
        float g = gradientPattern(u - oG, t);
        float b = gradientPattern(u + oB, t);
        return vec4(pow(r,2.), pow(g,2.), pow(b,2.), 1.0);
      }

      vec4 wovenDimensions(vec2 u, float t) {
        float a1=0., d1=0., i=0.;
        for (i=0.; i < 8.; d1 += sin(i++ * u.y + a1))
           a1 += cos(i - d1 + 0.1 * t - a1 * u.x);
        float a2=0., d2=0.;
        for (i=0.; i < 8.; d2 += sin(i++ * u.x + a2))
          a2 += cos(i - d2 + 0.12 * t - a2 * u.y);
        float v1 = 0.5 + 0.5 * sin(a1 + d1);
        float v2 = 0.5 + 0.5 * cos(a2 + d2);
        vec3 c = vec3(0.6, 0.7, 0.8) * v1 * v2 * 2.5;
        return vec4(pow(c, vec3(1.2)), 1.0);
      }

      vec2 hash2(vec2 p) {
        return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
      }

      vec4 cellularMatrix(vec2 u, float t) {
        u *= 2.0;
        vec2 i_u = floor(u);
        vec2 f_u = fract(u);
        float m_dist = 1.0;
        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec2 n = vec2(float(x), float(y));
            vec2 p = hash2(i_u + n);
            p = 0.5 + 0.5 * sin(t * 0.2 + 6.2831 * p);
            m_dist = min(m_dist, length(n + p - f_u));
          }
        }
        float a=0., d=0., i=0.;
        for (i=0.; i<5.; d+=sin(i++*u.y+a)) a+=cos(i-d+0.1*t-a*u.x);
        vec3 c = 0.5 + 0.5 * cos(vec3(0,2,4) + a + d);
        return vec4(c * (1.0 - m_dist) + pow(m_dist, 5.0) * c, 1.0);
      }

      float cellularNoise(vec2 u, float t) {
        float a=0., d=0., i=0.;
        for (; i<5.; d+=sin(i++*u.y+a)) a+=cos(i-d+t-a*u.x);
        return a + d;
      }

      vec4 pearlBloom(vec2 u, float t) {
        float w = cellularNoise(u, t * 0.05) * 0.2;
        vec2 off = vec2(cos(w), sin(w)) * 0.1;
        float f = 0.5 + 0.5 * cellularNoise(u + off, t * 0.1);
        vec3 base = vec3(0.85 + f * 0.15);
        float edge = smoothstep(0.1, 0.0, fwidth(f * 5.0));
        vec3 spec = 0.5 + 0.5 * cos(f * 10.0 + vec3(0,2,4));
        return vec4(mix(base, spec, pow(edge, 2.0)), 1.0);
      }

      float darkNoise(vec2 u, float t) {
        float a=0., d=0., i=0.;
        for (; i<8.; d+=sin(i++*u.y+a)) a+=cos(i-d+t-a*u.x);
        return a + d;
      }

      vec4 darkBloom(vec2 u, float t) {
        float w = darkNoise(u, t * 0.05) * 0.2;
        vec2 off = vec2(cos(w), sin(w)) * 0.1;
        float f = 0.5 + 0.5 * cos(darkNoise(u + off, t * 0.1));
        vec3 c = vec3(0.05);
        c = mix(c, vec3(0.25), smoothstep(0.5, 0.8, f));
        return vec4(c, 1.0);
      }

      vec4 voxelSunset(vec2 u, float t) {
        vec2 b = floor(u * 25.0) / 25.0;
        float a=0., d=0., i=0.;
        for (; i<8.; d+=sin(i++*b.y+a)) a+=cos(i-d+0.15*t-a*b.x);
        vec3 c = 0.5 + 0.5 * cos(vec3(0,1,2) + d * 2.0);
        float l = dot(normalize(vec2(1,1)), u);
        return vec4(c * (0.8 + l * 0.4), 1.0);
      }

      float inkNoise(vec2 u, float t) {
        float a=0., d=0., i=0.;
        for (; i<8.; d+=sin(i++*u.y+a)) a+=cos(i-d+t-a*u.x);
        return a + d;
      }

      vec4 inkBloom(vec2 u, float t) {
        float w = inkNoise(u, t * 0.05) * 0.2;
        vec2 off = vec2(cos(w), sin(w)) * 0.1;
        float f = inkNoise(u + off, t * 0.1);
        return vec4(vec3(0.5 + 0.5 * cos(f)), 1.0);
      }

      float strataFloor(vec3 u, float t) {
        u += t;
        float a=0., d=0., i=0.;
        for (; i<5.; d+=sin(i++*u.y+a)) a+=cos(i-d+u.z-a*u.x);
        return a + d;
      }

      vec4 etherealStrata(vec2 u, float t) {
        vec3 pos = vec3(u * 1.5, t * 0.1);
        float v = strataFloor(pos, 0.0);
        return vec4(0.6 + 0.4 * cos(v + vec3(0,2,4)), 1.0);
      }

      float solarNoise(vec2 u, float t) {
        float a=0., d=0., i=0.;
        for (; i<5.; d+=sin(i++*u.y+a)) a+=cos(i-d+t-a*u.x);
        return 0.5 + 0.5*cos(a+d);
      }

      vec4 solarPlasma(vec2 u, float t) {
        float f = 0.0;
        vec2 p = u * 1.5;
        mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
        f = 0.5 * solarNoise(p, t * 0.1);
        p = m * p;
        f += 0.25 * solarNoise(p, t * 0.1);
        vec3 c = mix(vec3(0.1, 0.0, 0.0), vec3(1.0, 0.2, 0.0), smoothstep(0.4, 0.7, f));
        c = mix(c, vec3(1.0, 0.9, 0.5), pow(smoothstep(0.8, 0.85, f), 10.0));
        return vec4(c, 1.0);
      }

      float silkNoise(vec2 u, float t) {
        float a=0., d=0., i=0.;
        for (; i<5.; d+=sin(i++*u.y+a)) a+=cos(i-d+t-a*u.x);
        return 0.5 + 0.5*cos(a+d);
      }

      vec4 warpedSilk(vec2 u, float t) {
        vec2 p = u;
        p.y *= 5.0;
        p.x += sin(p.y * 0.5 + t) * 0.2;
        float n = silkNoise(p, t * 0.1);
        vec3 base_color = vec3(0.2, 0.1, 0.5);
        float sheen = pow(smoothstep(0.5, -0.5, u.x + n * 0.2), 2.0);
        return vec4(base_color + sheen, 1.0);
      }

      float cellPattern(vec2 u, float t) {
        float a=0., d=0., i=0.;
        for (; i<8.; d+=sin(i++*u.y+a)) a+=cos(i-d+t-a*u.x);
        return 0.5 + 0.5*cos(a+d);
      }

      vec4 livingCells(vec2 u, float t) {
        float w = cellPattern(u, t * 0.05) * 6.28;
        vec2 off = vec2(cos(w), sin(w)) * 0.1;
        float cell_shape = cellPattern(u + off, t * 0.1);
        float mask = smoothstep(0.4, 0.6, cell_shape);
        float internal_noise = cellPattern(u * 3.0, t * 0.2);
        vec3 c1 = vec3(0.2, 0.8, 0.5), c2 = vec3(0.8, 0.5, 0.2);
        vec3 internal_color = mix(c1, c2, internal_noise);
        return vec4(mix(vec3(0.05), internal_color, mask), 1.0);
      }

      vec4 getGradientColor(vec2 u, float t, int theme) {
        if (theme == 0) return electricPlasma(u, t);
        else if (theme == 1) return moltenGold(u, t);
        else if (theme == 2) return emeraldMist(u, t);
        else if (theme == 3) return auroraWarp(u, t);
        else if (theme == 4) return cosmicOcean(u, t);
        else if (theme == 5) return staticInterference(u, t);
        else if (theme == 6) return liquidCrystal(u, t);
        else if (theme == 7) return solarFlare(u, t);
        else if (theme == 8) return dreamscapePastel(u, t);
        else if (theme == 9) return dataStream(u, t);
        else if (theme == 10) return chromaticFlow(u, t);
        else if (theme == 11) return wovenDimensions(u, t);
        else if (theme == 12) return cellularMatrix(u, t);
        else if (theme == 13) return pearlBloom(u, t);
        else if (theme == 14) return darkBloom(u, t);
        else if (theme == 15) return voxelSunset(u, t);
        else if (theme == 16) return inkBloom(u, t);
        else if (theme == 17) return etherealStrata(u, t);
        else if (theme == 18) return solarPlasma(u, t);
        else if (theme == 19) return warpedSilk(u, t);
        else return livingCells(u, t);
      }

      void main() {
        vec2 r = u_resolution;
        vec2 FC = gl_FragCoord.xy;
        vec2 uv = vec2(FC.x / r.x, 1.0 - FC.y / r.y);
        vec2 screenP = (FC.xy * 2.0 - r) / r.y;
        
        vec2 wCoord = vec2(FC.x / r.x, FC.y / r.y);
        float waterHeight = texture2D(u_waterTexture, wCoord).r;
        float waterInfluence = clamp(waterHeight * u_waterStrength, -0.5, 0.5);
        
        float audioPulse = u_audioOverall * u_audioReactivity * 0.1;
        float waterPulse = waterInfluence * 0.3;
        
        // Get gradient background
        vec2 gradientUV = screenP;
        float totalWaterInfluence = clamp(waterInfluence * u_waterStrength, -0.8, 0.8);
        float audioInfluence = (u_audioLow * 0.3 + u_audioMid * 0.4 + u_audioHigh * 0.3) * u_audioReactivity;
        
        // Apply water distortion to gradient
        gradientUV += vec2(totalWaterInfluence * 0.3, totalWaterInfluence * 0.2);
        gradientUV += vec2(audioInfluence * 0.1, audioInfluence * 0.15);
        
        // Add ripple effects
        float rippleTime = u_time - u_ripple_time;
        vec2 ripplePos = u_ripple_position * r;
        float rippleDist = distance(FC.xy, ripplePos);
        
        float clickRipple = 0.0;
        if (rippleTime < 3.0 && rippleTime > 0.0) {
          float rippleRadius = rippleTime * 150.0;
          float rippleWidth = 30.0;
          float rippleDecay = 1.0 - rippleTime / 3.0;
          clickRipple = exp(-abs(rippleDist - rippleRadius) / rippleWidth) * rippleDecay * u_ripple_strength;
        }
        
        float totalWaterEffect = totalWaterInfluence + clickRipple * 0.2;
        gradientUV += vec2(totalWaterEffect * 0.4, totalWaterEffect * 0.3);
        
        float modifiedTime = u_time * u_speed + totalWaterEffect * 2.0 + audioInfluence * 1.5;
        vec4 gradientColor = getGradientColor(gradientUV, modifiedTime, u_gradientTheme);
        
        vec3 finalColor = gradientColor.rgb;
        
        if (u_showLogo) {
          vec2 waterCoords = vec2(FC.x / r.x, FC.y / r.y);
          float step = 1.0 / r.x;
          vec2 waterGrad = clamp(vec2(
            texture2D(u_waterTexture, vec2(waterCoords.x + step, waterCoords.y)).r - 
            texture2D(u_waterTexture, vec2(waterCoords.x - step, waterCoords.y)).r,
            texture2D(u_waterTexture, vec2(waterCoords.x, waterCoords.y + step)).r - 
            texture2D(u_waterTexture, vec2(waterCoords.x, waterCoords.y - step)).r
          ) * u_waterStrength, -0.3, 0.3);
          
          // Much stronger distortion for visible water effects
          vec2 logoDistortedUV = uv + waterGrad * 0.25;
          
          // Only sample if we're within bounds to avoid dark edges
          if (logoDistortedUV.x >= 0.0 && logoDistortedUV.x <= 1.0 && 
              logoDistortedUV.y >= 0.0 && logoDistortedUV.y <= 1.0) {
            vec4 logoColor = texture2D(u_logoTexture, logoDistortedUV);
            // Only blend if there's actual content (alpha > threshold)
            if (logoColor.a > 0.1) {
              finalColor = mix(finalColor, logoColor.rgb, logoColor.a);
            }
          }
        }
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    u_time: {
      value: 0.0
    },
    u_resolution: {
      // FIXED: Pass actual canvas size including pixel ratio
      value: new THREE.Vector2(
        window.innerWidth * pixelRatio,
        window.innerHeight * pixelRatio
      )
    },
    u_speed: {
      value: 1.3
    },
    u_waterTexture: {
      value: waterTexture
    },
    u_waterStrength: {
      value: 0.55
    },
    u_ripple_time: {
      value: -10.0
    },
    u_ripple_position: {
      value: new THREE.Vector2(0.5, 0.5)
    },
    u_ripple_strength: {
      value: 0.5
    },
    u_logoTexture: {
      value: null
    },
    u_showLogo: {
      value: true
    },
    u_audioLow: {
      value: 0.0
    },
    u_audioMid: {
      value: 0.0
    },
    u_audioHigh: {
      value: 0.0
    },
    u_audioOverall: {
      value: 0.0
    },
    u_audioReactivity: {
      value: 1.0
    },
    u_gradientTheme: {
      value: 0
    }
  }
});

const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
camera.position.z = 1;

const gradientThemes = {
  "Electric Plasma": 0,
  "Molten Gold": 1,
  "Emerald Mist": 2,
  "Aurora Warp": 3,
  "Cosmic Ocean": 4,
  "Static Interference": 5,
  "Liquid Crystal": 6,
  "Solar Flare": 7,
  "Dreamscape Pastel": 8,
  "Data Stream": 9,
  "Chromatic Flow": 10,
  "Woven Dimensions": 11,
  "Cellular Matrix": 12,
  "Pearl Bloom": 13,
  "Dark Bloom": 14,
  "Voxel Sunset": 15,
  "Ink Bloom": 16,
  "Ethereal Strata": 17,
  "Solar Plasma": 18,
  "Warped Silk": 19,
  "Living Cells": 20
};

// Get theme names as array for cycling
const themeNames = Object.keys(gradientThemes);
let currentThemeIndex = 0;

const settings = {
  gradientTheme: "Electric Plasma",
  animationSpeed: 1.3,
  waterStrength: 0.55,
  mouseIntensity: 1.2,
  clickIntensity: 3.0,
  rippleStrength: 0.5,
  damping: 0.913,
  showLogo: true,
  audioVolume: 1.0,
  impactForce: 50000,
  rippleSize: 0.1,
  swirlingMotion: 0.2,
  spiralIntensity: 0.2,
  fluidPressure: 0.3,
  motionDecay: 0.08,
  rippleDecay: 1.0,
  waveHeight: 0.01,
  audioReactivity: 1.0,
  bassResponse: 1.0,
  midResponse: 1.0,
  trebleResponse: 1.0
};

// Function to cycle to next theme
function cycleTheme() {
  currentThemeIndex = (currentThemeIndex + 1) % themeNames.length;
  const newTheme = themeNames[currentThemeIndex];
  settings.gradientTheme = newTheme;
  material.uniforms.u_gradientTheme.value = gradientThemes[newTheme];
  // Update the tweakpane if it exists
  if (themeBinding) {
    themeBinding.refresh();
  }
}

// Update coordinates display
function updateCoordinates() {
  const coords = document.getElementById("coordinates");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lon = position.coords.longitude.toFixed(4);
        const latDir = lat >= 0 ? "N" : "S";
        const lonDir = lon >= 0 ? "E" : "W";
        coords.textContent = `LAT: ${Math.abs(lat)}° ${latDir}, LON: ${Math.abs(
          lon
        )}° ${lonDir}`;
      },
      () => {
        coords.textContent = "LAT: 40.7128° N, LON: 74.0060° W";
      }
    );
  }
}

function updateAudioAnalysis() {
  if (analyser && dataArray && isPlaying) {
    analyser.getByteFrequencyData(dataArray);
    const bassEnd = Math.floor(dataArray.length * 0.1);
    const midEnd = Math.floor(dataArray.length * 0.5);
    let bass = 0,
      mid = 0,
      treble = 0;

    for (let i = 0; i < bassEnd; i++) bass += dataArray[i];
    bass = (bass / bassEnd / 255) * settings.bassResponse;

    for (let i = bassEnd; i < midEnd; i++) mid += dataArray[i];
    mid = (mid / (midEnd - bassEnd) / 255) * settings.midResponse;

    for (let i = midEnd; i < dataArray.length; i++) treble += dataArray[i];
    treble =
      (treble / (dataArray.length - midEnd) / 255) * settings.trebleResponse;

    const overall = (bass + mid + treble) / 3;

    audioLevels.bassLevel = bass;
    audioLevels.midLevel = mid;
    audioLevels.trebleLevel = treble;
    audioLevels.overallLevel = overall;

    if (bassMonitor) {
      bassMonitor.refresh();
      midMonitor.refresh();
      trebleMonitor.refresh();
      overallMonitor.refresh();
    }

    const smoothing = 0.8;
    material.uniforms.u_audioLow.value =
      material.uniforms.u_audioLow.value * smoothing + bass * (1 - smoothing);
    material.uniforms.u_audioMid.value =
      material.uniforms.u_audioMid.value * smoothing + mid * (1 - smoothing);
    material.uniforms.u_audioHigh.value =
      material.uniforms.u_audioHigh.value * smoothing +
      treble * (1 - smoothing);
    material.uniforms.u_audioOverall.value =
      material.uniforms.u_audioOverall.value * smoothing +
      overall * (1 - smoothing);
  }
}

function setupLogoTexture() {
  createLogoTexture()
    .then((logoCanvas) => {
      const logoTexture = new THREE.CanvasTexture(logoCanvas);
      logoTexture.flipY = false;
      logoTexture.generateMipmaps = false;
      logoTexture.minFilter = THREE.LinearFilter;
      logoTexture.magFilter = THREE.LinearFilter;
      logoTexture.wrapS = THREE.RepeatWrapping;
      logoTexture.wrapT = THREE.RepeatWrapping;
      material.uniforms.u_logoTexture.value = logoTexture;
    })
    .catch(() => {
      console.warn("Logo texture failed to load, using fallback");
    });
}

function updateWaterSimulation() {
  const { current, previous, velocity, vorticity } = waterBuffers;
  const { damping, resolution } = waterSettings;
  const safeTension = Math.min(waterSettings.tension, 0.05);
  const velocityDissipation = settings.motionDecay;
  const densityDissipation = settings.rippleDecay;
  const vorticityInfluence = Math.min(
    Math.max(settings.swirlingMotion, 0.0),
    0.5
  );

  for (let i = 0; i < resolution * resolution * 2; i++) {
    velocity[i] *= 1.0 - velocityDissipation;
  }

  for (let i = 1; i < resolution - 1; i++) {
    for (let j = 1; j < resolution - 1; j++) {
      const index = i * resolution + j;
      const left = velocity[(index - 1) * 2 + 1];
      const right = velocity[(index + 1) * 2 + 1];
      const bottom = velocity[(index - resolution) * 2];
      const top = velocity[(index + resolution) * 2];
      vorticity[index] = (right - left - (top - bottom)) * 0.5;
    }
  }

  if (vorticityInfluence > 0.001) {
    for (let i = 1; i < resolution - 1; i++) {
      for (let j = 1; j < resolution - 1; j++) {
        const index = i * resolution + j;
        const velIndex = index * 2;
        const left = Math.abs(vorticity[index - 1]);
        const right = Math.abs(vorticity[index + 1]);
        const bottom = Math.abs(vorticity[index - resolution]);
        const top = Math.abs(vorticity[index + resolution]);
        const gradX = (right - left) * 0.5;
        const gradY = (top - bottom) * 0.5;
        const length = Math.sqrt(gradX * gradX + gradY * gradY) + 1e-5;
        const safeVorticity = Math.max(-1.0, Math.min(1.0, vorticity[index]));
        const forceX =
          (gradY / length) * safeVorticity * vorticityInfluence * 0.1;
        const forceY =
          (-gradX / length) * safeVorticity * vorticityInfluence * 0.1;
        velocity[velIndex] += Math.max(-0.1, Math.min(0.1, forceX));
        velocity[velIndex + 1] += Math.max(-0.1, Math.min(0.1, forceY));
      }
    }
  }

  for (let i = 1; i < resolution - 1; i++) {
    for (let j = 1; j < resolution - 1; j++) {
      const index = i * resolution + j;
      const velIndex = index * 2;
      const top = previous[index - resolution];
      const bottom = previous[index + resolution];
      const left = previous[index - 1];
      const right = previous[index + 1];

      current[index] = (top + bottom + left + right) / 2 - current[index];
      current[index] =
        current[index] * damping + previous[index] * (1 - damping);
      current[index] += (0 - previous[index]) * safeTension;

      const velMagnitude = Math.sqrt(
        velocity[velIndex] * velocity[velIndex] +
        velocity[velIndex + 1] * velocity[velIndex + 1]
      );
      const safeVelInfluence = Math.min(
        velMagnitude * settings.waveHeight,
        0.1
      );
      current[index] += safeVelInfluence;
      current[index] *= 1.0 - densityDissipation * 0.01;
      current[index] = Math.max(-2.0, Math.min(2.0, current[index]));
    }
  }

  for (let i = 0; i < resolution; i++) {
    current[i] = 0;
    current[(resolution - 1) * resolution + i] = 0;
    velocity[i * 2] = 0;
    velocity[i * 2 + 1] = 0;
    velocity[((resolution - 1) * resolution + i) * 2] = 0;
    velocity[((resolution - 1) * resolution + i) * 2 + 1] = 0;
    current[i * resolution] = 0;
    current[i * resolution + (resolution - 1)] = 0;
    velocity[i * resolution * 2] = 0;
    velocity[i * resolution * 2 + 1] = 0;
    velocity[(i * resolution + (resolution - 1)) * 2] = 0;
    velocity[(i * resolution + (resolution - 1)) * 2 + 1] = 0;
  }

  [waterBuffers.current, waterBuffers.previous] = [
    waterBuffers.previous,
    waterBuffers.current
  ];

  waterTexture.image.data = waterBuffers.current;
  waterTexture.needsUpdate = true;
}

function addRipple(x, y, strength = 1.0) {
  const { resolution, rippleRadius } = waterSettings;
  const normalizedX = x / window.innerWidth;
  const normalizedY = 1.0 - y / window.innerHeight;
  const texX = Math.floor(normalizedX * resolution);
  const texY = Math.floor(normalizedY * resolution);
  const radius = Math.max(
    rippleRadius,
    Math.floor(settings.rippleSize * resolution)
  );
  const rippleStrength = strength * (settings.impactForce / 100000);
  const radiusSquared = radius * radius;

  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      const distanceSquared = i * i + j * j;
      if (distanceSquared <= radiusSquared) {
        const posX = texX + i;
        const posY = texY + j;
        if (posX >= 0 && posX < resolution && posY >= 0 && posY < resolution) {
          const index = posY * resolution + posX;
          const velIndex = index * 2;
          const distance = Math.sqrt(distanceSquared);
          const falloff = 1.0 - distance / radius;
          const rippleValue =
            Math.cos((distance / radius) * Math.PI * 0.5) *
            rippleStrength *
            falloff;

          waterBuffers.previous[index] += rippleValue;

          const angle = Math.atan2(j, i);
          const velocityStrength = rippleValue * settings.spiralIntensity;
          waterBuffers.velocity[velIndex] += Math.cos(angle) * velocityStrength;
          waterBuffers.velocity[velIndex + 1] +=
            Math.sin(angle) * velocityStrength;

          const swirlAngle = angle + Math.PI * 0.5;
          const swirlStrength = Math.min(velocityStrength * 0.3, 0.1);
          waterBuffers.velocity[velIndex] +=
            Math.cos(swirlAngle) * swirlStrength;
          waterBuffers.velocity[velIndex + 1] +=
            Math.sin(swirlAngle) * swirlStrength;
        }
      }
    }
  }
}

const pane = new Pane({
  title: "Audio-Reactive Water Shader with Gradients"
});

function togglePanel() {
  panelVisible = !panelVisible;
  const paneElement = document.querySelector(".tp-dfwv");
  const helpHint = document.getElementById("helpHint");
  if (panelVisible) {
    paneElement.classList.add("visible");
    helpHint.classList.add("hidden");
  } else {
    paneElement.classList.remove("visible");
    helpHint.classList.remove("hidden");
  }
}

// Enhanced keyboard event handler
document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "h") {
    togglePanel();
  } else if (event.code === "Space") {
    event.preventDefault(); // Prevent page scroll
    cycleTheme();
  }
});

const themeBinding = pane.addBinding(settings, "gradientTheme", {
  options: Object.keys(gradientThemes).reduce((acc, key) => {
    acc[key] = key;
    return acc;
  }, {})
});

themeBinding.on("change", (ev) => {
  material.uniforms.u_gradientTheme.value = gradientThemes[ev.value];
  // Update current theme index when changed via panel
  currentThemeIndex = themeNames.indexOf(ev.value);
});

const animFolder = pane.addFolder({
  title: "Animation"
});

animFolder
  .addBinding(settings, "animationSpeed", {
    min: 0.1,
    max: 3.0,
    step: 0.1
  })
  .on("change", (ev) => (material.uniforms.u_speed.value = ev.value));

const audioFolder = pane.addFolder({
  title: "Audio Reactive Settings"
});

bassMonitor = audioFolder.addBinding(audioLevels, "bassLevel", {
  readonly: true,
  min: 0,
  max: 1,
  label: "Bass Level"
});

midMonitor = audioFolder.addBinding(audioLevels, "midLevel", {
  readonly: true,
  min: 0,
  max: 1,
  label: "Mid Level"
});

trebleMonitor = audioFolder.addBinding(audioLevels, "trebleLevel", {
  readonly: true,
  min: 0,
  max: 1,
  label: "Treble Level"
});

overallMonitor = audioFolder.addBinding(audioLevels, "overallLevel", {
  readonly: true,
  min: 0,
  max: 1,
  label: "Overall Level"
});

audioFolder
  .addBinding(settings, "audioReactivity", {
    min: 0.0,
    max: 3.0,
    step: 0.1
  })
  .on("change", (ev) => (material.uniforms.u_audioReactivity.value = ev.value));

audioFolder.addBinding(settings, "bassResponse", {
  min: 0.0,
  max: 3.0,
  step: 0.1
});

audioFolder.addBinding(settings, "midResponse", {
  min: 0.0,
  max: 3.0,
  step: 0.1
});

audioFolder.addBinding(settings, "trebleResponse", {
  min: 0.0,
  max: 3.0,
  step: 0.1
});

const waterFolder = pane.addFolder({
  title: "Water Settings"
});

waterFolder
  .addBinding(settings, "waterStrength", {
    min: 0.0,
    max: 1.0,
    step: 0.05
  })
  .on("change", (ev) => {
    material.uniforms.u_waterStrength.value = ev.value;
    waterSettings.rippleStrength = ev.value;
  });

waterFolder
  .addBinding(settings, "rippleStrength", {
    min: 0.0,
    max: 1.0,
    step: 0.05
  })
  .on("change", (ev) => (material.uniforms.u_ripple_strength.value = ev.value));

waterFolder
  .addBinding(settings, "mouseIntensity", {
    min: 0.1,
    max: 3.0,
    step: 0.1
  })
  .on("change", (ev) => (waterSettings.mouseIntensity = ev.value));

waterFolder
  .addBinding(settings, "clickIntensity", {
    min: 0.5,
    max: 6.0,
    step: 0.1
  })
  .on("change", (ev) => (waterSettings.clickIntensity = ev.value));

const logoFolder = pane.addFolder({
  title: "Logo & Text Display"
});

logoFolder
  .addBinding(settings, "showLogo")
  .on("change", (ev) => (material.uniforms.u_showLogo.value = ev.value));

const audioControlFolder = pane.addFolder({
  title: "Audio"
});

audioControlFolder
  .addBinding(settings, "audioVolume", {
    min: 0.0,
    max: 1.0,
    step: 0.1
  })
  .on("change", (ev) => (audio.volume = ev.value));

let lastMousePosition = {
  x: 0,
  y: 0
};
let mouseThrottleTime = 0;

function onMouseMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const now = performance.now();

  if (now - mouseThrottleTime < 8) return;
  mouseThrottleTime = now;

  const dx = x - lastMousePosition.x;
  const dy = y - lastMousePosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const velocity = distance / 8;

  if (distance > 1) {
    const velocityInfluence = Math.min(velocity / 10, 2.0);
    const baseIntensity = Math.min(distance / 20, 1.0);
    const fluidIntensity =
      baseIntensity * velocityInfluence * waterSettings.mouseIntensity;
    const variation = Math.random() * 0.3 + 0.7;
    const finalIntensity = fluidIntensity * variation;

    const jitterX = x + (Math.random() - 0.5) * 3;
    const jitterY = y + (Math.random() - 0.5) * 3;

    addRipple(jitterX, jitterY, finalIntensity);

    lastMousePosition.x = x;
    lastMousePosition.y = y;
  }
}

function onMouseClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  addRipple(x, y, waterSettings.clickIntensity);

  const clickX = x / window.innerWidth;
  const clickY = 1.0 - y / window.innerHeight;
  material.uniforms.u_ripple_position.value.set(clickX, clickY);
  material.uniforms.u_ripple_time.value = clock.getElapsedTime();
}

function onTouchMove(event) {
  event.preventDefault();
  const rect = renderer.domElement.getBoundingClientRect();
  const touch = event.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  const now = performance.now();

  if (now - mouseThrottleTime < 8) return;
  mouseThrottleTime = now;

  const dx = x - lastMousePosition.x;
  const dy = y - lastMousePosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const velocity = distance / 8;

  if (distance > 1) {
    const velocityInfluence = Math.min(velocity / 10, 2.0);
    const baseIntensity = Math.min(distance / 20, 1.0);
    const fluidIntensity =
      baseIntensity * velocityInfluence * waterSettings.mouseIntensity;
    const variation = Math.random() * 0.3 + 0.7;
    const finalIntensity = fluidIntensity * variation;

    const jitterX = x + (Math.random() - 0.5) * 3;
    const jitterY = y + (Math.random() - 0.5) * 3;

    addRipple(jitterX, jitterY, finalIntensity);

    lastMousePosition.x = x;
    lastMousePosition.y = y;
  }
}

function onTouchStart(event) {
  event.preventDefault();
  const rect = renderer.domElement.getBoundingClientRect();
  const touch = event.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  addRipple(x, y, waterSettings.clickIntensity);

  const clickX = x / window.innerWidth;
  const clickY = 1.0 - y / window.innerHeight;
  material.uniforms.u_ripple_position.value.set(clickX, clickY);
  material.uniforms.u_ripple_time.value = clock.getElapsedTime();
}

window.addEventListener("mousemove", onMouseMove);
window.addEventListener("click", onMouseClick);
window.addEventListener("touchmove", onTouchMove, {
  passive: false
});
window.addEventListener("touchstart", onTouchStart, {
  passive: false
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  material.uniforms.u_time.value = elapsed;
  updateAudioAnalysis();
  updateWaterSimulation();
  renderer.render(scene, camera);
}

const audioBtn = document.getElementById("audioBtn");
audioBtn.addEventListener("click", () => {
  console.log("Audio button clicked, current state:", isPlaying);

  if (!isPlaying) {
    try {
      initAudioAnalysis();

      // Check if audio context needs to be resumed (Chrome autoplay policy)
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('Audio context resumed');
        });
      }

      audio
        .play()
        .then(() => {
          isPlaying = true;
          audioBtn.textContent = "[ stop ]";
          console.log("Audio started successfully, analyser available:", !!analyser);
        })
        .catch((e) => {
          console.error("Audio play failed:", e);
          audioBtn.textContent = "[ audio failed ]";
          setTimeout(() => {
            audioBtn.textContent = "[ play ]";
          }, 2000);
        });
    } catch (error) {
      console.error("Error in audio initialization:", error);
      audioBtn.textContent = "[ error ]";
      setTimeout(() => {
        audioBtn.textContent = "[ play ]";
      }, 2000);
    }
  } else {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    audioBtn.textContent = "[ play ]";
    console.log("Audio stopped");
  }
});

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const currentPixelRatio = Math.min(window.devicePixelRatio, 2);

  renderer.setSize(width, height);
  renderer.setPixelRatio(currentPixelRatio);

  // FIXED: Update resolution uniform with actual canvas size
  material.uniforms.u_resolution.value.set(
    width * currentPixelRatio,
    height * currentPixelRatio
  );

  setupLogoTexture();
}

window.addEventListener("resize", onWindowResize);

// Initialize everything
updateCoordinates();
setupLogoTexture();
animate();

material.uniforms.u_ripple_strength.value = settings.rippleStrength;
material.uniforms.u_waterStrength.value = settings.waterStrength;
material.uniforms.u_speed.value = settings.animationSpeed;
material.uniforms.u_audioReactivity.value = settings.audioReactivity;
material.uniforms.u_gradientTheme.value =
  gradientThemes[settings.gradientTheme];

setTimeout(() => {
  addRipple(window.innerWidth / 2, window.innerHeight / 2, 1.5);
  console.log("✅ Shiny Gradients & Shaders - Initialization complete!");
  console.log("🎵 Audio ready:", !!audio);
  console.log("🌊 Water simulation ready:", !!waterBuffers);
  console.log("🎨 Shader material ready:", !!material);
  console.log("🎛️ Control panel ready:", !!pane);
  console.log("Click the [play] button to start audio visualization!");
}, 500);