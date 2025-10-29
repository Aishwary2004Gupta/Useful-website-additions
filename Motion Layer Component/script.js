class MotionLayer {
    constructor(container, options = {}) {
        this.container = container;
        this.layers = container.querySelectorAll('.motion-layer');
        this.options = {
            perspectiveX: options.perspectiveX || 50,
            perspectiveY: options.perspectiveY || 50,
            depthMultiplier: options.depthMultiplier || 1,
            smoothness: options.smoothness || 0.1,
            ...options
        };
        
        this.scrollY = 0;
        this.currentScroll = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.currentMouseX = 0;
        this.currentMouseY = 0;
        
        this.init();
    }
    
    init() {
        this.updatePerspectiveOrigin();
        this.setupEventListeners();
        this.animate();
    }
    
    setupEventListeners() {
        // Scroll event
        window.addEventListener('scroll', () => {
            this.scrollY = window.pageYOffset;
        });
        
        // Mouse move event
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            this.mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        });
        
        // Mouse leave event
        this.container.addEventListener('mouseleave', () => {
            this.mouseX = 0;
            this.mouseY = 0;
        });
    }
    
    updatePerspectiveOrigin() {
        this.container.style.perspectiveOrigin = 
            `${this.options.perspectiveX}% ${this.options.perspectiveY}%`;
    }
    
    animate() {
        // Smooth scroll interpolation
        this.currentScroll += (this.scrollY - this.currentScroll) * this.options.smoothness;
        
        // Smooth mouse interpolation
        this.currentMouseX += (this.mouseX - this.currentMouseX) * this.options.smoothness;
        this.currentMouseY += (this.mouseY - this.currentMouseY) * this.options.smoothness;
        
        // Update each layer
        this.layers.forEach((layer, index) => {
            const depth = parseFloat(layer.dataset.depth) || 0;
            const shouldRotate = layer.dataset.rotate === 'true';
            
            // Get container position relative to viewport
            const rect = this.container.getBoundingClientRect();
            const containerCenter = rect.top + rect.height / 2;
            const viewportCenter = window.innerHeight / 2;
            const distanceFromCenter = (containerCenter - viewportCenter) / viewportCenter;
            
            // Calculate transforms
            const translateZ = depth * this.options.depthMultiplier;
            const scrollEffect = distanceFromCenter * depth * 0.5;
            const mouseEffectX = this.currentMouseX * depth * 0.3;
            const mouseEffectY = this.currentMouseY * depth * 0.3;
            
            let transform = `
                translateZ(${-translateZ}px)
                translateY(${scrollEffect}px)
                translateX(${mouseEffectX}px)
                rotateX(${-this.currentMouseY * depth * 0.1}deg)
                rotateY(${this.currentMouseX * depth * 0.1}deg)
            `;
            
            if (shouldRotate) {
                const rotation = (this.currentScroll * 0.05) + (index * 45);
                transform += ` rotateZ(${rotation}deg)`;
            }
            
            layer.style.transform = transform;
        });
        
        requestAnimationFrame(() => this.animate());
    }
    
    setPerspective(x, y) {
        this.options.perspectiveX = x;
        this.options.perspectiveY = y;
        this.updatePerspectiveOrigin();
    }
    
    setDepthMultiplier(value) {
        this.options.depthMultiplier = value;
    }
}

// Initialize Motion Layers
document.addEventListener('DOMContentLoaded', () => {
    // Hero Motion Layer
    const heroMotion = new MotionLayer(
        document.getElementById('heroMotion'),
        {
            perspectiveX: 50,
            perspectiveY: 50,
            depthMultiplier: 1,
            smoothness: 0.1
        }
    );
    
    // Second Motion Layer
    const secondMotion = new MotionLayer(
        document.getElementById('secondMotion'),
        {
            perspectiveX: 50,
            perspectiveY: 50,
            depthMultiplier: 1.2,
            smoothness: 0.08
        }
    );
    
    // Third Motion Layer
    const thirdMotion = new MotionLayer(
        document.getElementById('thirdMotion'),
        {
            perspectiveX: 50,
            perspectiveY: 50,
            depthMultiplier: 0.8,
            smoothness: 0.12
        }
    );
    
    // Control handlers
    const perspectiveXInput = document.getElementById('perspectiveX');
    const perspectiveYInput = document.getElementById('perspectiveY');
    const depthInput = document.getElementById('depth');
    
    const perspXValue = document.getElementById('perspXValue');
    const perspYValue = document.getElementById('perspYValue');
    const depthValue = document.getElementById('depthValue');
    
    perspectiveXInput.addEventListener('input', (e) => {
        const value = e.target.value;
        perspXValue.textContent = value;
        heroMotion.setPerspective(value, perspectiveYInput.value);
        secondMotion.setPerspective(value, perspectiveYInput.value);
        thirdMotion.setPerspective(value, perspectiveYInput.value);
    });
    
    perspectiveYInput.addEventListener('input', (e) => {
        const value = e.target.value;
        perspYValue.textContent = value;
        heroMotion.setPerspective(perspectiveXInput.value, value);
        secondMotion.setPerspective(perspectiveXInput.value, value);
        thirdMotion.setPerspective(perspectiveXInput.value, value);
    });
    
    depthInput.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        depthValue.textContent = value;
        heroMotion.setDepthMultiplier(value);
        secondMotion.setDepthMultiplier(value);
        thirdMotion.setDepthMultiplier(value);
    });
    
    // Parallax scroll effect for info sections
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.feature-section, .info-section');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos * 0.1}px)`;
        });
    });
    
    // Add scroll progress indicator
    const createScrollIndicator = () => {
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(indicator);
        
        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (window.pageYOffset / windowHeight) * 100;
            indicator.style.width = scrolled + '%';
        });
    };
    
    createScrollIndicator();
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.card, .control-group').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
});

// Performance optimization: Throttle resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Reinitialize if needed
        window.dispatchEvent(new Event('scroll'));
    }, 250);
});