document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('lightning-canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    const resizeCanvas = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const compileShader = (source, type) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    };

    const vertexShaderSource = `
        attribute vec2 aPosition;
        void main() {
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;
        uniform vec2 iResolution;
        uniform float iTime;
        uniform float uHue;
        uniform float uXOffset;
        uniform float uSpeed;
        uniform float uIntensity;
        uniform float uSize;

        #define OCTAVE_COUNT 10

        vec3 hsv2rgb(vec3 c) {
            vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0, 4, 2), 6.0) - 3.0) - 1.0, 0.0, 1.0);
            return c.z * mix(vec3(1.0), rgb, c.y);
        }

        float hash12(vec2 p) {
            vec3 p3 = fract(vec3(p.xyx) * .1031);
            p3 += dot(p3, p3.yzx + 33.33);
            return fract((p3.x + p3.y) * p3.z);
        }

        mat2 rotate2d(float theta) {
            float c = cos(theta), s = sin(theta);
            return mat2(c, -s, s, c);
        }

        float noise(vec2 p) {
            vec2 ip = floor(p), fp = fract(p);
            float a = hash12(ip);
            float b = hash12(ip + vec2(1, 0));
            float c = hash12(ip + vec2(0, 1));
            float d = hash12(ip + vec2(1, 1));
            vec2 t = smoothstep(0.0, 1.0, fp);
            return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
        }

        float fbm(vec2 p) {
            float value = 0.0, amp = 0.5;
            for (int i = 0; i < OCTAVE_COUNT; ++i) {
                value += amp * noise(p);
                p *= rotate2d(0.45) * 2.0;
                amp *= 0.5;
            }
            return value;
        }

        float hash11(float p) {
            p = fract(p * .1031);
            p *= p + 33.33;
            p *= p + p;
            return fract(p);
        }

        void mainImage(out vec4 fragColor, in vec2 fragCoord) {
            vec2 uv = fragCoord / iResolution;
            uv = 2.0 * uv - 1.0;
            uv.x *= iResolution.x / iResolution.y;
            uv.x += uXOffset;

            uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;

            float dist = abs(uv.x);
            vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
            vec3 col = baseColor * pow(mix(0.0, 0.07, hash11(iTime * uSpeed)) / dist, 1.0) * uIntensity;
            fragColor = vec4(col, 1.0);
        }

        void main() {
            mainImage(gl_FragColor, gl_FragCoord.xy);
        }
    `;

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
        iResolution: gl.getUniformLocation(program, 'iResolution'),
        iTime: gl.getUniformLocation(program, 'iTime'),
        uHue: gl.getUniformLocation(program, 'uHue'),
        uXOffset: gl.getUniformLocation(program, 'uXOffset'),
        uSpeed: gl.getUniformLocation(program, 'uSpeed'),
        uIntensity: gl.getUniformLocation(program, 'uIntensity'),
        uSize: gl.getUniformLocation(program, 'uSize'),
    };

    const sliders = ['hue', 'xOffset', 'speed', 'intensity', 'size'];
    const values = {};
    sliders.forEach(id => {
        const el = document.getElementById(id);
        values[id] = parseFloat(el.value);
        el.addEventListener('input', () => {
            values[id] = parseFloat(el.value);
        });
    });

    const start = performance.now();
    const render = () => {
        const now = performance.now();
        gl.uniform2f(uniforms.iResolution, canvas.width, canvas.height);
        gl.uniform1f(uniforms.iTime, (now - start) / 1000);
        gl.uniform1f(uniforms.uHue, values.hue);
        gl.uniform1f(uniforms.uXOffset, values.xOffset);
        gl.uniform1f(uniforms.uSpeed, values.speed);
        gl.uniform1f(uniforms.uIntensity, values.intensity);
        gl.uniform1f(uniforms.uSize, values.size);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
});
