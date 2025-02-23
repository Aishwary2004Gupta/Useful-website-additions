class FluidSimulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.config = {
            SIM_RESOLUTION: 128,
            DYE_RESOLUTION: 1024,
            DENSITY_DISSIPATION: 1,
            VELOCITY_DISSIPATION: 0.2,
            PRESSURE: 0.8,
            PRESSURE_ITERATIONS: 20,
            CURL: 30,
            SPLAT_RADIUS: 0.25,
            SPLAT_FORCE: 6000,
            SHADING: true,
            COLOR_UPDATE_SPEED: 10,
            TRANSPARENT: false,
            BACK_COLOR: { r: 0, g: 0, b: 0 }
        };

        this.initWebGL();
        this.initShaders();
        this.initBuffers();
        this.initFramebuffers();
        this.setupEventListeners();
        
        this.pointers = [new Pointer()];
        this.lastTime = Date.now();
        this.running = true;
        this.updateFrame();
    }

    initWebGL() {
        const { gl, ext } = this.createGLContext();
        this.gl = gl;
        this.ext = ext;
        this.resizeCanvas();
    }

    createGLContext() {
        const params = { 
            alpha: true,
            depth: false,
            stencil: false,
            antialias: false,
            preserveDrawingBuffer: false
        };

        let gl = this.canvas.getContext('webgl2', params);
        const isWebGL2 = !!gl;
        
        if (!isWebGL2) {
            gl = this.canvas.getContext('webgl', params) || 
                 this.canvas.getContext('experimental-webgl', params);
        }

        let halfFloat, supportLinearFiltering;
        if (isWebGL2) {
            gl.getExtension('EXT_color_buffer_float');
            supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
        } else {
            halfFloat = gl.getExtension('OES_texture_half_float');
            supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
        }

        gl.clearColor(0, 0, 0, 1);
        const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;

        return {
            gl,
            ext: {
                halfFloatTexType,
                supportLinearFiltering,
                formatRGBA: this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType),
                formatRG: this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType),
                formatR: this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType)
            }
        };
    }

    getSupportedFormat(gl, internalFormat, format, type) {
        if (!this.supportRenderTextureFormat(gl, internalFormat, format, type)) {
            switch (internalFormat) {
                case gl.R16F: return this.getSupportedFormat(gl, gl.RG16F, gl.RG, type);
                case gl.RG16F: return this.getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
                default: return null;
            }
        }
        return { internalFormat, format };
    }

    supportRenderTextureFormat(gl, internalFormat, format, type) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
        
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    }

    initShaders() {
        this.programs = {
            copy: this.createProgram(Shaders.baseVertex, Shaders.copy),
            clear: this.createProgram(Shaders.baseVertex, Shaders.clear),
            splat: this.createProgram(Shaders.baseVertex, Shaders.splat),
            advection: this.createProgram(Shaders.baseVertex, Shaders.advection),
            divergence: this.createProgram(Shaders.baseVertex, Shaders.divergence),
            curl: this.createProgram(Shaders.baseVertex, Shaders.curl),
            vorticity: this.createProgram(Shaders.baseVertex, Shaders.vorticity),
            pressure: this.createProgram(Shaders.baseVertex, Shaders.pressure),
            gradientSubtract: this.createProgram(Shaders.baseVertex, Shaders.gradientSubtract),
            display: this.createProgram(Shaders.baseVertex, Shaders.display)
        };
    }

    createProgram(vertexSrc, fragmentSrc) {
        const gl = this.gl;
        const vertex = this.compileShader(gl.VERTEX_SHADER, vertexSrc);
        const fragment = this.compileShader(gl.FRAGMENT_SHADER, fragmentSrc);
        const program = gl.createProgram();
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            return null;
        }
        
        return {
            program,
            uniforms: this.getUniforms(program)
        };
    }

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    getUniforms(program) {
        const gl = this.gl;
        const uniforms = {};
        const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        
        for (let i = 0; i < count; i++) {
            const info = gl.getActiveUniform(program, i);
            uniforms[info.name] = gl.getUniformLocation(program, info.name);
        }
        return uniforms;
    }

    initBuffers() {
        const gl = this.gl;
        // Vertex buffer
        const vertices = new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]);
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        // Index buffer
        const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }

    initFramebuffers() {
        const simRes = this.getResolution(this.config.SIM_RESOLUTION);
        const dyeRes = this.getResolution(this.config.DYE_RESOLUTION);
        
        this.dye = this.createDoubleFBO(dyeRes.width, dyeRes.height, 
            this.gl.RGBA, this.gl.RGBA, this.ext.halfFloatTexType, 
            this.ext.supportLinearFiltering ? this.gl.LINEAR : this.gl.NEAREST);
        
        this.velocity = this.createDoubleFBO(simRes.width, simRes.height, 
            this.gl.RGBA, this.gl.RGBA, this.ext.halfFloatTexType, 
            this.ext.supportLinearFiltering ? this.gl.LINEAR : this.gl.NEAREST);
        
        this.divergence = this.createFBO(simRes.width, simRes.height, 
            this.gl.RGBA, this.gl.RGBA, this.ext.halfFloatTexType, this.gl.NEAREST);
        
        this.curl = this.createFBO(simRes.width, simRes.height, 
            this.gl.RGBA, this.gl.RGBA, this.ext.halfFloatTexType, this.gl.NEAREST);
        
        this.pressure = this.createDoubleFBO(simRes.width, simRes.height, 
            this.gl.RGBA, this.gl.RGBA, this.ext.halfFloatTexType, this.gl.NEAREST);
    }

    createFBO(w, h, internalFormat, format, type, param) {
        const gl = this.gl;
        const fbo = gl.createFramebuffer();
        const texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        
        return {
            fbo,
            texture,
            width: w,
            height: h,
            texelSizeX: 1.0 / w,
            texelSizeY: 1.0 / h,
            attach(id) {
                gl.activeTexture(gl.TEXTURE0 + id);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                return id;
            }
        };
    }

    createDoubleFBO(w, h, internalFormat, format, type, param) {
        return {
            width: w,
            height: h,
            texelSizeX: 1.0 / w,
            texelSizeY: 1.0 / h,
            read: this.createFBO(w, h, internalFormat, format, type, param),
            write: this.createFBO(w, h, internalFormat, format, type, param),
            swap() { [this.read, this.write] = [this.write, this.read]; }
        };
    }

    // ... (Remaining simulation code from original React implementation)
    // Include all other methods: updateFrame, step, splat, etc.
}

class Pointer {
    constructor() {
        this.id = -1;
        this.down = false;
        this.moved = false;
        this.texcoordX = 0;
        this.texcoordY = 0;
        this.prevTexcoordX = 0;
        this.prevTexcoordY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.color = [0, 0, 0];
    }
}

// Initialize when ready
window.addEventListener('load', () => {
    const canvas = document.getElementById('fluid-canvas');
    new FluidSimulation(canvas);
});