<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background: #000;
            cursor: none;
        }

        canvas {
            position: fixed;
            top: 0;
            left: 0;
        }
    </style>
</head>

<body>
    <canvas id="fluid"></canvas>

    <script>
        const canvas = document.getElementById('fluid');
        const ctx = canvas.getContext('2d');

        // Initialize canvas
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            mouse.x = canvas.width / 2;
            mouse.y = canvas.height / 2;
        }
        resize();
        window.addEventListener('resize', resize);

        // Fluid configuration
        const particles = [];
        const particleCount = 2000;
        const mouse = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            px: canvas.width / 2,
            py: canvas.height / 2,
            vx: 0,
            vy: 0
        };

        const physics = {
            velocity: 0.6,
            smoothness: 0.15,
            blobSize: 50,
            blobForce: 0.08,
            friction: 0.82,
            spacing: 1.5
        };

        // Particle class
        class Particle {
            constructor() {
                this.pos = {
                    x: mouse.x + (Math.random() - 0.5) * 100,
                    y: mouse.y + (Math.random() - 0.5) * 100
                };
                this.vel = { x: 0, y: 0 };
                this.acc = { x: 0, y: 0 };
                this.size = Math.random() * 3 + 1;
                this.hue = Math.random() * 360;
            }

            update() {
                // Mouse interaction
                const dx = mouse.x - this.pos.x;
                const dy = mouse.y - this.pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const force = distance < physics.blobSize ? physics.blobForce : -physics.blobForce;

                this.acc.x += (dx / (distance || 1)) * force;
                this.acc.y += (dy / (distance || 1)) * force;

                // Physics
                this.vel.x += this.acc.x * physics.velocity;
                this.vel.y += this.acc.y * physics.velocity;
                this.pos.x += this.vel.x;
                this.pos.y += this.vel.y;

                // Damping
                this.vel.x *= physics.friction;
                this.vel.y *= physics.friction;
                this.acc.x = 0;
                this.acc.y = 0;

                // Color transition
                this.hue = (this.hue + 0.5) % 360;
            }

            draw() {
                ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, 0.5)`;
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            mouse.px = mouse.x;
            mouse.py = mouse.y;
            mouse.x = e.clientX;
            mouse.y = e.clientY;

            mouse.vx = (mouse.x - mouse.px) * physics.smoothness;
            mouse.vy = (mouse.y - mouse.py) * physics.smoothness;
        });

        // Animation loop
        function animate() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            requestAnimationFrame(animate);
        }

        // Start animation
        animate();
    </script>
</body>

</html>