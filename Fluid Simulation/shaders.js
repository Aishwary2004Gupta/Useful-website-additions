// shaders.js

// Note: shader variable and uniform names are case-sensitive
// and must match the JavaScript side.

export const simulationVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const simulationFragmentShader = `
precision highp float;

uniform sampler2D textureA;
uniform vec2 resolution;
uniform vec2 mouse;
uniform vec2 mousePrev;
uniform float time;
uniform int frame;

uniform float uMouseActive;
uniform float resetProgress;
uniform float idleProgress;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec2 texel = 1.0 / resolution;

  // Start with a completely calm state.
  if (frame == 0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Current pressure and velocity
  float c = texture2D(textureA, uv).r;
  float v = texture2D(textureA, uv).g;

  // Neighboring pressure values
  float l = texture2D(
    textureA,
    uv - vec2(texel.x, 0.0)
  ).r;

  float r = texture2D(
    textureA,
    uv + vec2(texel.x, 0.0)
  ).r;

  float u = texture2D(
    textureA,
    uv + vec2(0.0, texel.y)
  ).r;

  float d = texture2D(
    textureA,
    uv - vec2(0.0, texel.y)
  ).r;

  // Laplacian for wave propagation
  float lap = l + r + u + d - 4.0 * c;

  float stiffness = 0.5;
  float idle = clamp(idleProgress, 0.0, 1.0);

  /*
   * Normal velocity damping is gentle.
   * When idleProgress increases, damping becomes stronger.
   */
  float velocityDamping = mix(
    0.985,
    0.94,
    idle
  );

  float vel = v + lap * stiffness;
  vel *= velocityDamping;

  float pressure = c + vel;

  /*
   * Mouse speed is used to make faster movements
   * create slightly stronger and wider ripples.
   */
  vec2 mouseUV = mouse / resolution;
  vec2 mousePrevUV = mousePrev / resolution;

  float pointerSpeed = length(
    mouseUV - mousePrevUV
  );

  /*
   * Add energy only while the pointer is moving.
   *
   * uMouseActive fades out after movement stops.
   * idleProgress also suppresses new energy while
   * the existing waves dissolve.
   */
  if (
    mouse.x >= 0.0 &&
    uMouseActive > 0.0001
  ) {
    float dist = distance(uv, mouseUV);

    float strength =
      (5.15 + pointerSpeed * 25.0) *
      uMouseActive *
      (1.0 - idle) *
      (1.0 - resetProgress);

    float radius =
      0.015 +
      pointerSpeed * 0.05;

    if (dist < radius) {
      float falloff = 1.0 - dist / radius;

      pressure += strength * falloff * 0.5;
      vel += strength * falloff * 0.3;
    }
  }

  /*
   * Extra gradual settling while idle.
   * This pulls both values toward the original
   * calm state of zero.
   */
  float settleAmount = 0.012 * idle;

  pressure *= 1.0 - settleAmount;
  vel *= 1.0 - settleAmount;

  /*
   * Reset-button damping.
   * resetProgress follows a smooth 0 -> 1 -> 0 curve.
   * At the peak, the simulation is pulled to zero.
   */
  float rp = clamp(resetProgress, 0.0, 1.0);

  if (rp > 0.0) {
    pressure = mix(pressure, 0.0, rp);
    vel = mix(vel, 0.0, rp);

    // Additional damping during the reset animation
    pressure *= 1.0 - 0.5 * rp;
    vel *= 1.0 - 0.5 * rp;
  }

  // Remove tiny floating-point values
  if (abs(pressure) < 0.000001) {
    pressure = 0.0;
  }

  if (abs(vel) < 0.000001) {
    vel = 0.0;
  }

  // Pressure is stored in red, velocity in green
  gl_FragColor = vec4(
    pressure,
    vel,
    0.0,
    1.0
  );
}
`;

export const renderVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const renderFragmentShader = `
precision highp float;

uniform sampler2D textureA;
uniform sampler2D textureB;
uniform vec2 resolution;
uniform vec3 lightDir;

varying vec2 vUv;

void main() {
  vec4 sim = texture2D(textureA, vUv);
  float height = sim.r;

  vec2 texel = 1.0 / resolution;

  float hl = texture2D(
    textureA,
    vUv - vec2(texel.x, 0.0)
  ).r;

  float hr = texture2D(
    textureA,
    vUv + vec2(texel.x, 0.0)
  ).r;

  float hu = texture2D(
    textureA,
    vUv + vec2(0.0, texel.y)
  ).r;

  float hd = texture2D(
    textureA,
    vUv - vec2(0.0, texel.y)
  ).r;

  // Calculate the surface normal
  vec3 normal = normalize(
    vec3(
      (hr - hl) * 0.5,
      (hu - hd) * 0.5,
      1.0
    )
  );

  // Refraction distortion
  float distortionStrength = 0.045;

  vec2 offset = vec2(
    hr - hl,
    hu - hd
  ) * distortionStrength;

  vec2 sampleUV = clamp(
    vUv + offset,
    vec2(0.0),
    vec2(1.0)
  );

  vec4 base = texture2D(
    textureB,
    sampleUV
  );

  vec3 baseColor = base.rgb;

  // Lighting
  vec3 L = normalize(lightDir);

  float diffuse = clamp(
    dot(normal, L),
    0.0,
    1.0
  );

  float fresnel = pow(
    1.0 - clamp(
      dot(normal, vec3(0.0, 0.0, 1.0)),
      0.0,
      1.0
    ),
    3.0
  );

  float specular = pow(
    clamp(
      dot(
        reflect(-L, normal),
        vec3(0.0, 0.0, 1.0)
      ),
      0.0,
      1.0
    ),
    40.0
  ) * 0.9;

  float brightness = dot(
    baseColor,
    vec3(0.3333)
  );

  vec3 waterColor = mix(
    vec3(0.06, 0.10, 0.18),
    vec3(0.12, 0.28, 0.60),
    brightness
  );

  vec3 litColor =
    baseColor * (0.6 + diffuse * 0.6) +
    waterColor * 0.25 * fresnel +
    vec3(1.0) * specular * 0.7;

  gl_FragColor = vec4(litColor, 1.0);
}
`;