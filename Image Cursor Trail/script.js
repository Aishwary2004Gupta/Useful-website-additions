
class AutoImageCursorTrail {
    constructor() {
        this.container = document.getElementById('cursorTrailContainer');
        this.dotCursor = document.getElementById('dotCursor');
        this.statusMode = document.getElementById('status-mode');
        this.resetButton = document.getElementById('resetButton');

        this.images = [
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=300&auto=format",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format",
            "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=300&auto=format",
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=300&auto=format",
            "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=300&auto=format",
            "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=300&auto=format",
            "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=300&auto=format",
            "https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=300&auto=format",
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=300&auto=format",
        ];

        this.imageElements = [];
        this.refs = [];
        this.currentZIndex = 1;
        this.globalIndex = 0;
        this.lastPosition = { x: 0, y: 0 };
        this.maxNumberOfImages = 5;
        this.distance = 25;

        // Auto movement variables
        this.mouseMoved = false;
        this.pointer = {
            x: 0.5 * window.innerWidth,
            y: 0.5 * window.innerHeight,
        };
        this.params = {
            pointsNumber: 40,
            widthFactor: 0.3,
            mouseThreshold: 0.6,
            spring: 0.4,
            friction: 0.5
        };
        this.trail = new Array(this.params.pointsNumber);
        for (let i = 0; i < this.params.pointsNumber; i++) {
            this.trail[i] = {
                x: this.pointer.x,
                y: this.pointer.y,
                dx: 0,
                dy: 0,
            };
        }

        // Cursor trail dots
        this.cursorTrailDots = [];
        this.maxTrailDots = 8;

        this.lastImageTime = 0;
        this.imageInterval = 120;
        this.userInteracted = false;
        this.animationId = null;

        this.init();
    }

    init() {
        this.createImageElements();
        this.setupEventListeners();
        this.startAutoAnimation();
        this.updateDotCursor();
    }

    createImageElements() {
        this.images.forEach((src, index) => {
            const img = document.createElement('img');
            img.className = 'trail-image image-small';
            img.src = src;
            img.alt = `Trail image ${index + 1}`;
            img.dataset.status = 'inactive';
            img.dataset.index = index;

            this.container.appendChild(img);
            this.imageElements.push(img);
            this.refs.push({ current: img });
        });
    }

    setupEventListeners() {
        // Mouse movement - ONLY inside container triggers user control
        this.container.addEventListener('mousemove', (e) => {
            this.handleUserInteraction();
            this.updateMousePosition(e.clientX, e.clientY);
            this.updateDotCursorPosition(e.clientX, e.clientY);
            this.createCursorTrailDot(e.clientX, e.clientY);
            this.handleOnMove(e.clientX, e.clientY);
        });

        // Touch movement - ONLY inside container
        this.container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleUserInteraction();
            if (e.touches[0]) {
                this.updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
                this.updateDotCursorPosition(e.touches[0].clientX, e.touches[0].clientY);
                this.handleOnMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        });

        // Global mouse move for cursor visibility only (doesn't trigger user control)
        document.addEventListener('mousemove', (e) => {
            this.updateDotCursorPosition(e.clientX, e.clientY);
            this.createCursorTrailDot(e.clientX, e.clientY);
        });

        // Click also counts as interaction - ONLY inside container
        this.container.addEventListener('click', (e) => {
            this.handleUserInteraction();
            this.updateMousePosition(e.clientX, e.clientY);
        });

        // Reset button
        this.resetButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.resetAutoMovement();
        });

        // Hide default cursor only in container
        this.container.style.cursor = 'none';
    }

    handleUserInteraction() {
        if (!this.userInteracted) {
            this.userInteracted = true;
            this.mouseMoved = true;
            this.statusMode.textContent = 'User Control';
            this.statusMode.className = 'status-user';
            this.dotCursor.classList.add('pulsing');
        }
    }

    updateMousePosition(x, y) {
        this.pointer.x = x;
        this.pointer.y = y;
        this.mouseMoved = true;
    }

    updateDotCursorPosition(x, y) {
        this.dotCursor.style.left = x + 'px';
        this.dotCursor.style.top = y + 'px';
    }

    createCursorTrailDot(x, y) {
        const trailDot = document.createElement('div');
        trailDot.className = 'cursor-trail-dot';
        trailDot.style.left = x + 'px';
        trailDot.style.top = y + 'px';
        document.body.appendChild(trailDot);

        this.cursorTrailDots.push(trailDot);

        setTimeout(() => {
            if (trailDot.parentNode) {
                trailDot.parentNode.removeChild(trailDot);
            }
            this.cursorTrailDots = this.cursorTrailDots.filter(dot => dot !== trailDot);
        }, 600);

        if (this.cursorTrailDots.length > this.maxTrailDots) {
            const oldDot = this.cursorTrailDots.shift();
            if (oldDot && oldDot.parentNode) {
                oldDot.parentNode.removeChild(oldDot);
            }
        }
    }

    updateDotCursor() {
        this.dotCursor.style.left = this.pointer.x + 'px';
        this.dotCursor.style.top = this.pointer.y + 'px';

        if (!this.userInteracted) {
            this.createCursorTrailDot(this.pointer.x, this.pointer.y);
        }
    }

    startAutoAnimation() {
        const animate = (t) => {
            this.animationId = requestAnimationFrame(animate);
            this.updateAutoPointer(t);
            this.updateTrailPhysics();
            this.updateDotCursor();

            const currentTime = performance.now();
            if (!this.userInteracted && currentTime - this.lastImageTime > this.imageInterval) {
                this.spawnImageAtPosition(this.pointer.x, this.pointer.y);
                this.lastImageTime = currentTime;
            }
        };
        this.animationId = requestAnimationFrame(animate);
    }

    updateAutoPointer(t) {
        if (!this.mouseMoved && !this.userInteracted) {
            this.pointer.x = (0.5 + 0.2 * Math.cos(0.002 * t) * (Math.sin(0.005 * t))) * window.innerWidth;
            this.pointer.y = (0.5 + 0.3 * (Math.cos(0.005 * t)) + 0.1 * Math.cos(0.01 * t)) * window.innerHeight;
        }
    }

    updateTrailPhysics() {
        this.trail.forEach((p, pIdx) => {
            const prev = pIdx === 0 ? this.pointer : this.trail[pIdx - 1];
            const spring = pIdx === 0 ? 0.4 * this.params.spring : this.params.spring;
            p.dx += (prev.x - p.x) * spring;
            p.dy += (prev.y - p.y) * spring;
            p.dx *= this.params.friction;
            p.dy *= this.params.friction;
            p.x += p.dx;
            p.y += p.dy;
        });
    }

    handleOnMove(x, y) {
        const distance = this.distanceFromLast(x, y);

        // React-style distance-based image popping
        if (distance > (window.innerWidth / this.distance)) {
            const lead = this.refs[this.globalIndex % this.refs.length].current;
            const tailIndex = (this.globalIndex - this.maxNumberOfImages) % this.refs.length;
            const tail = tailIndex >= 0 ? this.refs[tailIndex].current : null;

            if (lead) this.activateImage(lead, x, y);
            if (tail) this.deactivateImage(tail);

            this.globalIndex++;
            this.lastPosition = { x, y };
        }
    }

    spawnImageAtPosition(x, y) {
        const distance = this.distanceFromLast(x, y);
        if (distance > (window.innerWidth / this.distance)) {
            const lead = this.refs[this.globalIndex % this.refs.length].current;
            const tailIndex = (this.globalIndex - this.maxNumberOfImages) % this.refs.length;
            const tail = tailIndex >= 0 ? this.refs[tailIndex].current : null;

            if (lead) this.activateImage(lead, x, y);
            if (tail) this.deactivateImage(tail);

            this.globalIndex++;
            this.lastPosition = { x, y };
        }
    }

    distanceFromLast(x, y) {
        return Math.hypot(x - this.lastPosition.x, y - this.lastPosition.y);
    }

    activateImage(image, x, y) {
        const containerRect = this.container.getBoundingClientRect();
        const relativeX = x - containerRect.left;
        const relativeY = y - containerRect.top;

        image.style.left = `${relativeX}px`;
        image.style.top = `${relativeY}px`;

        if (this.currentZIndex > 40) {
            this.currentZIndex = 1;
        }
        image.style.zIndex = this.currentZIndex;
        this.currentZIndex++;

        // React-style activation
        image.dataset.status = 'active';

        // Auto deactivate after 1.5 seconds (like React version)
        setTimeout(() => {
            if (image.dataset.status === 'active') {
                this.deactivateImage(image);
            }
        }, 1500);
    }

    deactivateImage(image) {
        // React-style deactivation
        image.dataset.status = 'inactive';
    }

    resetAutoMovement() {
        this.userInteracted = false;
        this.mouseMoved = false;

        this.pointer.x = 0.5 * window.innerWidth;
        this.pointer.y = 0.5 * window.innerHeight;

        for (let i = 0; i < this.params.pointsNumber; i++) {
            this.trail[i] = {
                x: this.pointer.x,
                y: this.pointer.y,
                dx: 0,
                dy: 0,
            };
        }

        this.globalIndex = 0;
        this.lastPosition = { x: this.pointer.x, y: this.pointer.y };
        this.lastImageTime = 0;

        this.statusMode.textContent = 'Auto Movement';
        this.statusMode.className = 'status-auto';
        this.dotCursor.classList.remove('pulsing');

        this.cursorTrailDots.forEach(dot => {
            if (dot.parentNode) {
                dot.parentNode.removeChild(dot);
            }
        });
        this.cursorTrailDots = [];

        this.imageElements.forEach(img => {
            this.deactivateImage(img);
        });

        this.updateDotCursorPosition(this.pointer.x, this.pointer.y);
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

let cursorTrailInstance = null;
window.addEventListener('load', () => {
    cursorTrailInstance = new AutoImageCursorTrail();
});

window.addEventListener('resize', () => {
    // Auto movement adapts to new window size
});

window.addEventListener('beforeunload', () => {
    if (cursorTrailInstance) {
        cursorTrailInstance.stopAnimation();
    }
});
