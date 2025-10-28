export const simulationVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const simulationFragmentShader = `
uniform sampler2D TextureA;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float time;
uniform int frame;
varying vec2 vUv;

const float delta = 1.4;

void main() {
    vec2 uv = vUv;
    if (frame == 0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec4 data = texture2D(TextureA, uv);
    float pressure = data.x;
    float pVel = data.y;

    vec2 texelSize = 1.0 / resolution;
    float p_right = texture2D(TextureA, uv + vec2(texelSize.x, 0.0)).x;
    float p_left = texture2D(TextureA, uv + vec2(-texelSize.x, 0.0)).x;
    float p_up = texture2D(TextureA, uv + vec2(0.0, texelSize.y)).x;
    float p_down = texture2D(TextureA, uv + vec2(0.0, -texelSize.y)).x;

    if (uv.x <= texelSize.x) p_left = p_right;
    if (uv.x >= 1.0 - texelSize.x) p_right = p_left;
    if (uv.y <= texelSize.y) p_down = p_up;
    if (uv.y >= 1.0 - texelSize.y) p_up = p_down;

    //Enhanced wave equation matching ShaderToy
    pVel += delta * (-2.0 * pressure + p_right + p_left) / 4.0;
    pVel += delta * (-2.0 * pressure + p_up + p_down) / 4.0;

    pressure += delta * pVel;

    pVel *= 0.005 * delta * pressure;

    pvel *= 1.0 - 0.002 * delta;
    pressure *= 0.999;

    vec2 mouseUV = mouse / resolution;
    if (mouse.x >= 0.0) {
        float dist = distance(uv, mouseUV);
        if (dist < 0.02) {
            pressure += 2.0 * (1.0 - dist / 0.02);
        }
    }

    gl_FragColor = vec4(pressure, pVel, 
        (p_right - p_left) / 2.0,
        (p_up - p_down) / 2.0);
}
`;

