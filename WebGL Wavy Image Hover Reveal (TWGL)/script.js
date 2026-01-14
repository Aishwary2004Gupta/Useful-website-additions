class Ting {
    constructor() {
        this.canvas = document.getElementById("canvas");

        this.setup = this.setup.bind(this);
        this.render = this.render.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);

        this.setup();
        this.addEvents();
    }

    addEvents() {
        window.addEventListener("mousemove", this.onMouseMove);
        // window.addEventListener('touchmove', this.onMouseMove)
    }

    setup() {
        this.mousePerspective = {
            _x: 0,
            _y: 0,
            x: 0,
            y: 0,
            origin: {
                x: 0,
                y: 0
            },
            updatePosition: function (e) {
                var e = event || window.event;
                this.x = e.clientX - this.origin.x;
                this.y = (e.clientY - this.origin.y) * -1;
            },
            setOrigin: function (e) {
                this.origin.x = e.offsetLeft + Math.floor(e.offsetWidth / 2);
                this.origin.y = e.offsetTop + Math.floor(e.offsetHeight / 2);
            }
        };

        this.mouseCanvas = { x: -500, y: -500, _x: -500, _y: -500 };

        this.gl = this.canvas.getContext("webgl", { premultipliedAlpha: false });
        this.rect = this.canvas.getBoundingClientRect();

        // compile shaders, link program, lookup location
        this.programInfo = twgl.createProgramInfo(this.gl, ["vs", "fs"]);
        this.bufferInfo = twgl.primitives.createXYQuadBufferInfo(this.gl);

        this.mousePerspective.setOrigin(this.canvas);

        this.imageSize = { width: 1, height: 1 }; // replaced after loading
        this.texture = twgl.createTextures(
            this.gl,
            {
                darkTexture: {
                    src:
                        "https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?q=80&w=802&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                }
            },
            (err, textures, sources) => {
                // Textures Loaded

                if (err) {
                    console.error(err);
                }

                this.imageSize = sources.darkTexture;
                this.darkTexture = textures.darkTexture;

                this.render();
            }
        );
    }

    render(time) {
        twgl.resizeCanvasToDisplaySize(this.gl.canvas);

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.programInfo.program);

        // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);

        const canvasAspect =
            this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        const imageAspect = this.imageSize.width / this.imageSize.height;
        const mat = this.scaling(imageAspect / canvasAspect, -1);

        // calls gl.activeTexture, gl.bindTexture, gl.uniformXXX
        twgl.setUniforms(this.programInfo, {
            u_matrix: mat,
            u_darkImage: this.darkTexture,
            u_mouse: [this.mouseCanvas.x, this.mouseCanvas.y],
            u_time: time * 0.001
        });

        this.mouseCanvas.x = this.lerp(
            this.mouseCanvas.x,
            this.mouseCanvas._x,
            0.1
        );
        this.mouseCanvas.y = this.lerp(
            this.mouseCanvas.y,
            this.mouseCanvas._y,
            0.1
        );
        this.mousePerspective.x = this.lerp(
            this.mousePerspective.x,
            this.mousePerspective._x,
            0.1
        );
        this.mousePerspective.y = this.lerp(
            this.mousePerspective.y,
            this.mousePerspective._y,
            0.1
        );
        this.canvas.style.transform = `rotateX(${this.mousePerspective._x
            }deg) rotateY(${this.mousePerspective._y}deg)`;

        // calls gl.drawArrays or gl.drawElements
        twgl.drawBufferInfo(this.gl, this.bufferInfo);

        requestAnimationFrame(this.render);
    }

    onMouseMove(e) {
        this.mousePerspective.updatePosition(e);
        this.mouseCanvas._x =
            (e.clientX - this.rect.left) * this.canvas.width / this.rect.width;
        this.mouseCanvas._y =
            this.canvas.height -
            (e.clientY - this.rect.top) * this.canvas.height / this.rect.height;
        this.mousePerspective._x = (
            this.mousePerspective.y /
            this.canvas.offsetHeight /
            2
        ).toFixed(2);
        this.mousePerspective._y = (
            this.mousePerspective.x /
            this.canvas.offsetWidth /
            2
        ).toFixed(2);
    }

    /**
     * Creates a 2D scaling matrix
     * @param {number} sx amount to scale in x
     * @param {number} sy amount to scale in y
     * @return {Matrix3} a scale matrix that scales by sx and sy.
     */
    scaling(sx, sy) {
        return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
    }

    lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }

    destroy() {
        // TODO: clean
    }
}

new Ting();
