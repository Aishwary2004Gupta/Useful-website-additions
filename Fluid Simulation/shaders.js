// Note: shader variable/ uniform names are case-sensitive and must match the JS side.

export const simulationVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

/* Simulation shader: stores pressure in .r and velocity in .g
   Basic discrete wave equation with damping. Mouse injects impulses.
*/
export const simulationFragmentShader = `
precision highp float;

uniform sampler2D textureA; // previous state
uniform vec2 resolution;
uniform vec2 mouse;        // in pixels
uniform vec2 mousePrev;    // in pixels
uniform float time;
uniform int frame;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec2 texel = 1.0 / resolution;

  // read neighbors and center
  float c = texture2D(textureA, uv).r;
  float v = texture2D(textureA, uv).g;

  float l = texture2D(textureA, uv - vec2(texel.x,0.0)).r;
  float r = texture2D(textureA, uv + vec2(texel.x,0.0)).r;
  float u = texture2D(textureA, uv + vec2(0.0,texel.y)).r;
  float d = texture2D(textureA, uv - vec2(0.0,texel.y)).r;

  // Laplacian (approx)
  float lap = (l + r + u + d - 4.0 * c);

  // wave step
  float stiffness = 0.5; // how fast waves propagate
  float damping = 0.995; // damping factor
  float vel = v + lap * stiffness;
  float pressure = c + vel;

  // damping
  vel *= damping;
  pressure *= 1.0;

  // Mouse injection: compute distance to current mouse (in uv)
  vec2 mouseUV = mouse / resolution;
  vec2 mousePrevUV = mousePrev / resolution;

  // If mouse.x < 0 => no mouse
  if (mouse.x >= 0.0) {
    float dist = distance(uv, mouseUV);
    // Inject strength based on proximity and mouse speed
    float speed = length((mouse - mousePrev)) / max(resolution.x, 1.0);
    float strength = 0.45 + speed * 0.7;
    float radius = 0.035 + speed * 0.12;
    if (dist < radius) {
      float fall = (1.0 - dist / radius);
      // Add both pressure impulse and a velocity bump
      pressure += strength * fall * 0.8;
      vel += strength * fall * 0.6;
    }
  }

  // Prevent NaNs and keep values stable
  if (abs(pressure) < 1e-6) pressure = 0.0;
  if (abs(vel) < 1e-6) vel = 0.0;

  gl_FragColor = vec4(pressure, vel, 0.0, 1.0);
}
`;

/* Render shader: compute gradient (normal) and refract sampling of background texture
   textureA: simulation texture (pressure -> displacement)
   textureB: background texture (the text / image)
*/
export const renderVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;


export const renderFragmentShader = `
precision highp float;
uniform sampler2D textureA; // sim
uniform sampler2D textureB; // background
uniform vec2 resolution;
uniform vec3 lightDir;

varying vec2 vUv;

void main() {
  // read simulation data
  vec4 sim = texture2D(textureA, vUv);
  float h = sim.r;

  // compute gradient using neighbors
  vec2 texel = 1.0 / resolution;
  float hl = texture2D(textureA, vUv - vec2(texel.x, 0.0)).r;
  float hr = texture2D(textureA, vUv + vec2(texel.x, 0.0)).r;
  float hu = texture2D(textureA, vUv + vec2(0.0, texel.y)).r;
  float hd = texture2D(textureA, vUv - vec2(0.0, texel.y)).r;

  // gradient -> approximate normal
  vec3 normal = normalize(vec3((hr - hl) * 0.5, (hu - hd) * 0.5, 1.0));

  // distortion: use gradient to offset UV for refraction effect
  float distortionStrength = 0.025; // tweak for stronger/weaker refraction
  vec2 offset = vec2((hr - hl), (hu - hd)) * distortionStrength;

  vec2 sampleUV = vUv + offset;
  // sample background
  vec4 base = texture2D(textureB, sampleUV);

  // simple lighting/specular
  vec3 L = normalize(lightDir);
  float diff = clamp(dot(normal, L), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(normal, L), vec3(0.0,0.0,1.0)), 0.0, 1.0), 40.0);

  vec3 waterColor = mix(vec3(0.08,0.12,0.22), vec3(0.12,0.28,0.6), base.r);
  vec3 col = base.rgb * (0.6 + diff * 0.6) + vec3(1.0) * spec * 0.6;

  gl_FragColor = vec4(col, 1.0);
}
`;
