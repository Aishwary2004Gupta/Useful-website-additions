let mouseMoved = true;

function n(e) {
    this.init(e || {});
}

n.prototype = {
    init: function (e) {
        this.phase = e.phase || 0;
        this.offset = e.offset || 0;
        this.frequency = e.frequency || 0.001;
        this.amplitude = e.amplitude || 1;
    },
    update: function () {
        return (
            (this.phase += this.frequency),
            (e = this.offset + Math.sin(this.phase) * this.amplitude)
        );
    },
    value: function () {
        return e;
    },
};

function Line(e) {
    this.init(e || {});
}

Line.prototype = {
    init: function (e) {
        this.spring = e.spring + 0.1 * Math.random() - 0.02;
        this.friction = E.friction + 0.01 * Math.random() - 0.002;
        this.nodes = [];
        for (var t, n = 0; n < E.size; n++) {
            t = new Node();
            t.x = pos.x;
            t.y = pos.y;
            this.nodes.push(t);
        }
    },
    update: function () {
        var e = this.spring,
            t = this.nodes[0];
        t.vx += (pos.x - t.x) * e;
        t.vy += (pos.y - t.y) * e;
        for (var n, i = 0, a = this.nodes.length; i < a; i++)
            (t = this.nodes[i]),
            0 < i &&
            ((n = this.nodes[i - 1]),
                (t.vx += (n.x - t.x) * e),
                (t.vy += (n.y - t.y) * e),
                (t.vx += n.vx * E.dampening),
                (t.vy += n.vy * E.dampening)),
            (t.vx *= this.friction),
            (t.vy *= this.friction),
            (t.x += t.vx),
            (t.y += t.vy),
            (e *= E.tension);
    },
    draw: function () {
        var e,
            t,
            n = this.nodes[0].x,
            i = this.nodes[0].y;
        ctx.beginPath();
        ctx.moveTo(n, i);
        for (var a = 1, o = this.nodes.length - 2; a < o; a++) {
            e = this.nodes[a];
            t = this.nodes[a + 1];
            n = 0.5 * (e.x + t.x);
            i = 0.5 * (e.y + t.y);
            ctx.quadraticCurveTo(e.x, e.y, n, i);
        }
        e = this.nodes[a];
        t = this.nodes[a + 1];
        ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
        ctx.stroke();
        ctx.closePath();
    },
};

function onMousemove(e) {
    function o() {
        lines = [];
        for (var e = 0; e < E.trails; e++)
            lines.push(new Line({ spring: 0.4 + (e / E.trails) * 0.025 }));
    }

    function c(e) {
        e.touches
            ? ((pos.x = e.touches[0].pageX), (pos.y = e.touches[0].pageY))
            : ((pos.x = e.clientX), (pos.y = e.clientY)),
            e.preventDefault();
    }

    function l(e) {
        1 == e.touches.length &&
        ((pos.x = e.touches[0].pageX), (pos.y = e.touches[0].pageY));
    }

    document.removeEventListener('mousemove', onMousemove),
    document.removeEventListener('touchstart', onMousemove),
    document.addEventListener('mousemove', c),
    document.addEventListener('touchmove', c),
    document.addEventListener('touchstart', l),
    c(e),
    o(),
    render();
}

function render() {
    if (ctx.running) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'hsla(' + Math.round
        (f.update()) + ',50%,20%,0.8)';
        ctx.lineWidth = 3;
        for (var e, t = 0; t < E.trails; t++) {
            (e = lines[t]).update();
            e.draw();
        }
        ctx.frame++;
        window.requestAnimationFrame(render);
    }
}

function resizeCanvas() {
    ctx.canvas.width = window.innerWidth - 20;
    ctx.canvas.height = window.innerHeight;
}

var ctx,
    f,
    e = 0,
    pos = {},
    lines = [],
    E = {
        debug: true,
        friction: 0.5,
        trails: 20,
        size: 50,
        dampening: 0.25,
        tension: 0.98,
    };

function Node() {
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.vx = 0;
}

const renderCanvas = function () {
    ctx = document.getElementById('canvas').getContext('2d');
    ctx.running = true;
    ctx.frame = 1;
    f = new n({
        phase: Math.random() * 2 * Math.PI,
        amplitude: 85,
        frequency: 0.0015,
        offset: 285,
    });
    document.addEventListener('mousemove', onMousemove);
    document.addEventListener('touchstart', onMousemove);
    document.body.addEventListener('orientationchange', resizeCanvas);
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('focus', () => {
        if (!ctx.running) {
            ctx.running = true;
            render();
        }
    });
    window.addEventListener('blur', () => {
        ctx.running = true;
    });
    resizeCanvas();
};

window.onload = function () {
    renderCanvas();
};

const trail = new Array(params.pointsNumber);
for (let i = 0; i < params.pointsNumber; i++) {
    trail[i] = {
        x: pointer.x,
        y: pointer.y,
        dx: 0,
        dy: 0,
    }
}

window.addEventListener("click", e => {
    updateMousePosition(e.pageX, e.pageY);
});
window.addEventListener("mousemove", e => {
    mouseMoved = true;
    updateMousePosition(e.pageX, e.pageY);
});
window.addEventListener("touchmove", e => {
    mouseMoved = true;
    updateMousePosition(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
});

function updateMousePosition(eX, eY) {
    pointer.x = eX;
    pointer.y = eY;
}

setupCanvas();
update(0);
window.addEventListener("resize", setupCanvas);


function update(t) {

    // for intro motion
    if (!mouseMoved) {
        pointer.x =
            window.innerWidth / 2 +
            Math.sin(t * 0.001) * 200 +
            Math.cos(t * 0.002) * 150;
        pointer.y =
            window.innerHeight / 2 +
            Math.cos(t * 0.0013) * 150 +
            Math.sin(t * 0.0025) * 100;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    trail.forEach((p, pIdx) => {
        const prev = pIdx === 0 ? pointer : trail[pIdx - 1];
        const spring = pIdx === 0 ? .4 * params.spring : params.spring;
        p.dx += (prev.x - p.x) * spring;
        p.dy += (prev.y - p.y) * spring;
        p.dx *= params.friction;
        p.dy *= params.friction;
        p.x += p.dx;
        p.y += p.dy;
    });

    ctx.lineCap = "round";
	 ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);

    for (let i = 1; i < trail.length - 1; i++) {
        const xc = .5 * (trail[i].x + trail[i + 1].x);
        const yc = .5 * (trail[i].y + trail[i + 1].y);
        ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
        ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
        ctx.stroke();
    }
    ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
    ctx.stroke();
    
    window.requestAnimationFrame(update);
}

function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}