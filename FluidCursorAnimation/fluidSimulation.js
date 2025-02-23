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
        let formatRGBA, formatRG, formatR;
        if (isWebGL2) {
            formatRGBA = this.getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
            formatRG = this.getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
            formatR = this.getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
        } else {
            formatRGBA = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
            formatRG = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
            formatR = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        }

        return {
            gl,
            ext: {
                halfFloatTexType,
                supportLinearFiltering,
                formatRGBA,
                formatRG,
                formatR
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

    correctDeltaX(delta) {
        const aspectRatio = this.canvas.width / this.canvas.height;
        return aspectRatio < 1 ? delta * aspectRatio : delta;
    }
    
    correctDeltaY(delta) {
        const aspectRatio = this.canvas.width / this.canvas.height;
        return aspectRatio > 1 ? delta / aspectRatio : delta;
    }

    setupEventListeners() {
        const handleMove = (x, y) => {
            const rect = this.canvas.getBoundingClientRect();
            const pointer = this.pointers[0];
            pointer.prevTexcoordX = pointer.texcoordX;
            pointer.prevTexcoordY = pointer.texcoordY;
            pointer.texcoordX = (x - rect.left) / this.canvas.width;
            pointer.texcoordY = (y - rect.top) / this.canvas.height;
            pointer.deltaX = this.correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
            pointer.deltaY = this.correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
            pointer.moved = true;
            pointer.down = true;
        };
    
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            handleMove(e.clientX, e.clientY);
        });
    
        this.canvas.addEventListener('mousemove', (e) => {
            if (!pointer.down) return;
            handleMove(e.clientX, e.clientY);
        });
    
        window.addEventListener('mouseup', () => {
            this.pointers[0].down = false;
        });
    
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
        });
    
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });
    
        window.addEventListener('touchend', () => {
            this.pointers[0].down = false;
        });
    
        // Initial interaction listener
        document.addEventListener('mousemove', () => {
            this.running = true;
            document.removeEventListener('mousemove', this);
        });
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
    
    // Add this inside the FluidSimulation class
    getResolution(resolution) {
        const aspectRatio = this.canvas.width / this.canvas.height;
        const min = Math.round(resolution);
        const max = Math.round(resolution * (aspectRatio > 1 ? aspectRatio : 1));
        
        return {
            width: aspectRatio > 1 ? max : min,
            height: aspectRatio > 1 ? min : max
        };
    }

    // Add this after the createGLContext() method
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
    updateFrame() {
        if (!this.running) return;
        
        const now = Date.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.016);
        this.lastTime = now;
    
        this.resizeCanvas();
        this.updateColors(dt);
        this.applyInputs();
        this.step(dt);
        this.render(null);
        
        requestAnimationFrame(() => this.updateFrame());
    }
    
    step(dt) {
        this.gl.disable(this.gl.BLEND);
        
        // Curl calculation
        this.applyProgram(this.programs.curl, {
            uVelocity: this.velocity.read.attach(0),
            texelSize: [this.velocity.texelSizeX, this.velocity.texelSizeY]
        });
        this.blit(this.curl);
    
        // Vorticity confinement
        this.applyProgram(this.programs.vorticity, {
            uVelocity: this.velocity.read.attach(0),
            uCurl: this.curl.attach(1),
            curl: this.config.CURL,
            dt,
            texelSize: [this.velocity.texelSizeX, this.velocity.texelSizeY]
        });
        this.blit(this.velocity.write);
        this.velocity.swap();
    
        // Divergence calculation
        this.applyProgram(this.programs.divergence, {
            uVelocity: this.velocity.read.attach(0),
            texelSize: [this.velocity.texelSizeX, this.velocity.texelSizeY]
        });
        this.blit(this.divergence);
    
        // Pressure solve
        this.applyProgram(this.programs.clear, {
            uTexture: this.pressure.read.attach(0),
            value: this.config.PRESSURE
        });
        this.blit(this.pressure.write);
        this.pressure.swap();
    
        for (let i = 0; i < this.config.PRESSURE_ITERATIONS; i++) {
            this.applyProgram(this.programs.pressure, {
                uPressure: this.pressure.read.attach(0),
                uDivergence: this.divergence.attach(1),
                texelSize: [this.velocity.texelSizeX, this.velocity.texelSizeY]
            });
            this.blit(this.pressure.write);
            this.pressure.swap();
        }
    
        // Gradient subtract
        this.applyProgram(this.programs.gradientSubtract, {
            uPressure: this.pressure.read.attach(0),
            uVelocity: this.velocity.read.attach(1),
            texelSize: [this.velocity.texelSizeX, this.velocity.texelSizeY]
        });
        this.blit(this.velocity.write);
        this.velocity.swap();
    
        // Advection
        this.applyProgram(this.programs.advection, {
            uVelocity: this.velocity.read.attach(0),
            uSource: this.velocity.read.attach(0),
            dt,
            dissipation: this.config.VELOCITY_DISSIPATION,
            texelSize: [this.velocity.texelSizeX, this.velocity.texelSizeY]
        });
        this.blit(this.velocity.write);
        this.velocity.swap();
    
        this.applyProgram(this.programs.advection, {
            uVelocity: this.velocity.read.attach(0),
            uSource: this.dye.read.attach(1),
            dt,
            dissipation: this.config.DENSITY_DISSIPATION,
            texelSize: [this.dye.texelSizeX, this.dye.texelSizeY]
        });
        this.blit(this.dye.write);
        this.dye.swap();
    }
    
    splat(x, y, dx, dy, color) {
        this.applyProgram(this.programs.splat, {
            uTarget: this.velocity.read.attach(0),
            aspectRatio: this.canvas.width / this.canvas.height,
            point: [x, y],
            color: [dx, dy, 0],
            radius: this.correctRadius(this.config.SPLAT_RADIUS)
        });
        this.blit(this.velocity.write);
        this.velocity.swap();
    
        this.applyProgram(this.programs.splat, {
            uTarget: this.dye.read.attach(0),
            aspectRatio: this.canvas.width / this.canvas.height,
            point: [x, y],
            color: [color.r, color.g, color.b],
            radius: this.correctRadius(this.config.SPLAT_RADIUS)
        });
        this.blit(this.dye.write);
        this.dye.swap();
    }
    
    // Helper methods
    applyProgram(program, uniforms) {
        this.gl.useProgram(program.program);
        for (const [name, value] of Object.entries(uniforms)) {
            const location = program.uniforms[name];
            if (Array.isArray(value)) {
                this.gl[`uniform${value.length}fv`](location, value);
            } else if (typeof value === 'number') {
                this.gl.uniform1f(location, value);
            }
        }
    }
    
    blit(target) {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, target?.fbo || null);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
    
    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const width = Math.floor(this.canvas.clientWidth * dpr);
        const height = Math.floor(this.canvas.clientHeight * dpr);
        
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.initFramebuffers();
        }
    }
    
    correctRadius(radius) {
        const aspectRatio = this.canvas.width / this.canvas.height;
        return aspectRatio > 1 ? radius * aspectRatio : radius;
    }
    
    // Color and pointer methods
    updateColors(dt) {
        this.colorUpdateTimer += dt * this.config.COLOR_UPDATE_SPEED;
        if (this.colorUpdateTimer >= 1) {
            this.pointers.forEach(p => p.color = this.generateColor());
            this.colorUpdateTimer = 0;
        }
    }
    
    applyInputs() {
        this.pointers.forEach(pointer => {
            if (pointer.moved) {
                pointer.moved = false;
                this.splat(
                    pointer.texcoordX,
                    pointer.texcoordY,
                    pointer.deltaX * this.config.SPLAT_FORCE,
                    pointer.deltaY * this.config.SPLAT_FORCE,
                    pointer.color
                );
            }
        });
    }
    
    generateColor() {
        const c = this.HSVtoRGB(Math.random(), 1.0, 1.0);
        c.r *= 0.15;
        c.g *= 0.15;
        c.b *= 0.15;
        return c;
    }
    
    HSVtoRGB(h, s, v) {
        let r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return { r, g, b };
    }
    
    render(target) {
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
        this.applyProgram(this.programs.display, {
            uTexture: this.dye.read.attach(0),
            texelSize: [1/this.canvas.width, 1/this.canvas.height]
        });
        this.blit(target);
    }
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