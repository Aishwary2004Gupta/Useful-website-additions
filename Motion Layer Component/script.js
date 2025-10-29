class MotionLayerScroller {
    constructor(container, options = {}) {
        this.container = container;
        this.wrapper = container.parentElement;
        this.layers = Array.from(container.querySelectorAll('.motion-layer'));
        
        this.options = {
            perspective: options.perspective || 1000,
            scrollSpeed: options.scrollSpeed || 1,
            smoothness: options.smoothness || 0.1,
            ...options
        };
        
        this.scrollProgress = 0;
        this.currentProgress = 0;
        
        this.layerData = this.layers.map(layer => ({
            element: layer,
            startZ: parseFloat(layer.dataset.startZ) || 0,
            endZ: parseFloat(layer.dataset.endZ) || 0,
            startY: parseFloat(layer.dataset.startY) || 0,
            endY: parseFloat(layer.dataset.endY) || 0,
            startX: parseFloat(layer.dataset.startX) || 0,
            endX: parseFloat(layer.dataset.endX) || 0,
            startRotate: parseFloat(layer.dataset.startRotate) || 0,
            endRotate: parseFloat(layer.dataset.endRotate) || 0,
            startRotateX: parseFloat(layer.dataset.startRotateX) || 0,
            endRotateX: parseFloat(layer.dataset.endRotateX) || 0,
            startRotateY: parseFloat(layer.dataset.startRotateY) || 0,
            endRotateY: parseFloat(layer.dataset.endRotateY) || 0,
            startScale: parseFloat(layer.dataset.startScale) || 1,
            endScale: parseFloat(layer.dataset.endScale) || 1,
            startOpacity: parseFloat(layer.dataset.startOpacity) ?? 1,
            endOpacity: parseFloat(layer.dataset.endOpacity) ?? 1
        }));
        
        this.init();
    }
    
    init() {
        this.updatePerspective();
        this.setupScrollObserver();
        this.animate();
    }
    
    updatePerspective() {
        this.container.style.perspective = `${this.options.perspective}px`;
    }
    
    setupScrollObserver() {
        const updateScroll = () => {
            const rect = this.wrapper.getBoundingClientRect();
            const wrapperHeight = this.wrapper.offsetHeight;
            const windowHeight = window.innerHeight;
            
            // Calculate scroll progress (0 to 1)
            const scrollStart = rect.top;
            const scrollEnd = rect.top - (wrapperHeight - windowHeight);
            
            if (scrollStart <= 0 && scrollEnd <= 0) {
                this.scrollProgress = Math.abs(scrollStart) / (wrapperHeight - windowHeight);
                this.scrollProgress = Math.max(0, Math.min(1, this.scrollProgress));
            } else if (scrollStart > 0) {
                this.scrollProgress = 0;
            } else {
                this.scrollProgress = 1;
            }
        };
        
        window.addEventListener('scroll', updateScroll, { passive: true });
        updateScroll();
    }
    
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    animate() {
        // Smooth interpolation
        this.currentProgress += (this.scrollProgress - this.currentProgress) * this.options.smoothness;
        
        // Apply transforms to each layer
        this.layerData.forEach(layer => {
            const progress = this.currentProgress * this.options.scrollSpeed;
            
            const z = this.lerp(layer.startZ, layer.endZ, progress);
            const y = this.lerp(layer.startY, layer.endY, progress);
            const x = this.lerp(layer.startX, layer.endX, progress);
            const rotate = this.lerp(layer.startRotate, layer.endRotate, progress);
            const rotateX = this.lerp(layer.startRotateX, layer.endRotateX, progress);
            const rotateY = this.lerp(layer.startRotateY, layer.endRotateY, progress);
            const scale = this.lerp(layer.startScale, layer.endScale, progress);
            const opacity = this.lerp(layer.startOpacity, layer.endOpacity, progress);
            
            let transform = `
                translate3d(${x}px, ${y}px, ${z}px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                rotateZ(${rotate}deg)
                scale(${scale})
            `;
            
            layer.element.style.transform = transform;
            layer.element.style.opacity = opacity;
        });
        
        requestAnimationFrame(() => this.animate());
    }
    
    setPerspective(value) {
        this.options.perspective = value;
        this.updatePerspective();
    }
    
    setScrollSpeed(value) {
        this.options.scrollSpeed = value;
    }
    
    setSmoothness(value) {
        this.options.smoothness = value;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all motion scrollers
    const scroller1 = new MotionLayerScroller(
        document.getElementById('motionScroller'),
        {
            perspective: 1000,
            scrollSpeed: 1,
            smoothness: 0.1
        }
    );
    
    const scroller2 = new MotionLayerScroller(
        document.getElementById('motionScroller2'),
        {
            perspective: 1200,
            scrollSpeed: 1,
            smoothness: 0.08
        }
    );
    
    const scroller3 = new MotionLayerScroller(
        document.getElementById('motionScroller3'),
        {
            perspective: 1500,
            scrollSpeed: 1,
            smoothness: 0.12
        }
    );
    
    // Configuration panel
    const configPanel = document.getElementById('configPanel');
    const configToggle = document.getElementById('configToggle');
    
    configToggle.addEventListener('click', () => {
        configPanel.classList.toggle('active');
    });
    
    // Perspective control
    const perspectiveSlider = document.getElementById('perspectiveSlider');
    const perspectiveValue = document.getElementById('perspectiveValue');
    
    perspectiveSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        perspectiveValue.textContent = value;
        scroller1.setPerspective(value);
        scroller2.setPerspective(value);
        scroller3.setPerspective(value);
    });
    
    // Speed control
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    
    speedSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        speedValue.textContent = value;
        scroller1.setScrollSpeed(value);
        scroller2.setScrollSpeed(value);
        scroller3.setScrollSpeed(value);
    });
    
    // Smoothness control
    const smoothnessSlider = document.getElementById('smoothnessSlider');
    const smoothnessValue = document.getElementById('smoothnessValue');
    
    smoothnessSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        smoothnessValue.textContent = value;
        scroller1.setSmoothness(value);
        scroller2.setSmoothness(value);
        scroller3.setSmoothness(value);
    });
    
    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', () => {
        perspectiveSlider.value = 1000;
        speedSlider.value = 1;
        smoothnessSlider.value = 0.1;
        
        perspectiveValue.textContent = 1000;
        speedValue.textContent = 1;
        smoothnessValue.textContent = 0.1;
        
        scroller1.setPerspective(1000);
        scroller1.setScrollSpeed(1);
        scroller1.setSmoothness(0.1);
        
        scroller2.setPerspective(1000);
        scroller2.setScrollSpeed(1);
        scroller2.setSmoothness(0.1);
        
        scroller3.setPerspective(1000);
        scroller3.setScrollSpeed(1);
        scroller3.setSmoothness(0.1);
    });
    
    // Scroll progress indicator
    const progressFill = document.getElementById('progressFill');
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressFill.style.width = scrolled + '%';
    });
    
    // Intersection Observer for animations
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
    
    // Animate content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(section);
    });
    
    // Close config panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!configPanel.contains(e.target)) {
            configPanel.classList.remove('active');
        }
    });
    
    configPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Performance monitoring
    let lastTime = performance.now();
    let frames = 0;
    let fps = 0;
    
    function measureFPS() {
        const currentTime = performance.now();
        frames++;
        
        if (currentTime >= lastTime + 1000) {
            fps = Math.round((frames * 1000) / (currentTime - lastTime));
            frames = 0;
            lastTime = currentTime;
            
            // Console log FPS for debugging
            // console.log('FPS:', fps);
        }
        
        requestAnimationFrame(measureFPS);
    }
    
    measureFPS();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'c' || e.key === 'C') {
            configPanel.classList.toggle('active');
        }
        if (e.key === 'r' || e.key === 'R') {
            resetBtn.click();
        }
    });
    
    // Add scroll hint animation
    const addScrollHint = () => {
        const hint = document.createElement('div');
        hint.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            opacity: 1;
            transition: opacity 0.5s ease;
            pointer-events: none;
        `;
        hint.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                animation: bounce 2s infinite;
            ">
                <span style="font-size: 0.9rem; opacity: 0.7;">Scroll to explore</span>
                <div style="
                    width: 2px;
                    height: 30px;
                    background: linear-gradient(to bottom, rgba(255,255,255,0.5), transparent);
                "></div>
            </div>
        `;
        
        document.body.appendChild(hint);
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 100) {
                hint.style.opacity = '0';
                setTimeout(() => hint.remove(), 500);
            }
        }, { once: true });
    };
    
    // Add CSS for bounce animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
    
    addScrollHint();
});