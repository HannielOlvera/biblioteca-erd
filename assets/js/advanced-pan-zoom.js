// Advanced Pan/Zoom Engine with Natural Interactions
class AdvancedPanZoom {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      enablePan: true,
      enableZoom: true,
      enableAutoFit: true,
      enableSmoothing: true,
      smoothingFactor: 0.1,
      zoomStep: 0.1,
      maxZoom: 10,
      minZoom: 0.1,
      edgePanSpeed: 20,
      edgePanMargin: 40,
      inertia: 0.95,
      friction: 0.85,
      ...options
    };
    
    this.state = {
      scale: 1,
      x: 0,
      y: 0,
      isDragging: false,
      lastPointer: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      targetTransform: { x: 0, y: 0, scale: 1 }
    };
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.startRenderLoop();
    
    // Auto-fit on load
    if (this.options.enableAutoFit) {
      setTimeout(() => this.autoFit(), 100);
    }
  }
  
  setupEventListeners() {
    const { element } = this;
    
    // Mouse events
    element.addEventListener('mousedown', this.handlePointerDown.bind(this));
    element.addEventListener('mousemove', this.handlePointerMove.bind(this));
    element.addEventListener('mouseup', this.handlePointerUp.bind(this));
    element.addEventListener('mouseleave', this.handlePointerUp.bind(this));
    
    // Touch events
    element.addEventListener('touchstart', this.handlePointerDown.bind(this), { passive: false });
    element.addEventListener('touchmove', this.handlePointerMove.bind(this), { passive: false });
    element.addEventListener('touchend', this.handlePointerUp.bind(this));
    
    // Wheel events
    element.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  getPointerPosition(event) {
    const rect = this.element.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0]?.clientX) || 0;
    const clientY = event.clientY || (event.touches && event.touches[0]?.clientY) || 0;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }
  
  handlePointerDown(event) {
    if (!this.options.enablePan) return;
    
    event.preventDefault();
    this.state.isDragging = true;
    this.state.lastPointer = this.getPointerPosition(event);
    this.state.velocity = { x: 0, y: 0 };
    
    this.element.style.cursor = 'grabbing';
    this.element.classList.add('dragging');
  }
  
  handlePointerMove(event) {
    event.preventDefault();
    
    const pointer = this.getPointerPosition(event);
    
    if (this.state.isDragging) {
      const deltaX = pointer.x - this.state.lastPointer.x;
      const deltaY = pointer.y - this.state.lastPointer.y;
      
      // Update velocity for inertia
      this.state.velocity.x = deltaX * 0.8 + this.state.velocity.x * 0.2;
      this.state.velocity.y = deltaY * 0.8 + this.state.velocity.y * 0.2;
      
      // Apply movement
      this.state.targetTransform.x += deltaX / this.state.scale;
      this.state.targetTransform.y += deltaY / this.state.scale;
      
      this.state.lastPointer = pointer;
    } else if (this.options.enableAutoPan) {
      // Edge panning
      this.handleEdgePan(pointer);
    }
  }
  
  handlePointerUp(event) {
    if (!this.state.isDragging) return;
    
    this.state.isDragging = false;
    this.element.style.cursor = 'default';
    this.element.classList.remove('dragging');
    
    // Apply inertia
    if (this.options.enableSmoothing) {
      this.applyInertia();
    }
  }
  
  handleWheel(event) {
    if (!this.options.enableZoom) return;
    
    event.preventDefault();
    
    const pointer = this.getPointerPosition(event);
    const delta = -event.deltaY * 0.01;
    const scaleFactor = 1 + delta * this.options.zoomStep;
    
    this.zoomAt(pointer.x, pointer.y, scaleFactor);
  }
  
  handleKeyDown(event) {
    if (event.target.tagName === 'INPUT') return;
    
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        this.autoFit();
        break;
      case 'Equal':
      case 'NumpadAdd':
        event.preventDefault();
        this.zoomIn();
        break;
      case 'Minus':
      case 'NumpadSubtract':
        event.preventDefault();
        this.zoomOut();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.pan(0, -50);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.pan(0, 50);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.pan(-50, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.pan(50, 0);
        break;
    }
  }
  
  handleResize() {
    // Recalculate bounds and constraints
    this.constrainTransform();
  }
  
  handleEdgePan(pointer) {
    const rect = this.element.getBoundingClientRect();
    const margin = this.options.edgePanMargin;
    const speed = this.options.edgePanSpeed;
    
    let deltaX = 0, deltaY = 0;
    
    if (pointer.x < margin) deltaX = (margin - pointer.x) / margin * speed;
    if (pointer.x > rect.width - margin) deltaX = -(pointer.x - (rect.width - margin)) / margin * speed;
    if (pointer.y < margin) deltaY = (margin - pointer.y) / margin * speed;
    if (pointer.y > rect.height - margin) deltaY = -(pointer.y - (rect.height - margin)) / margin * speed;
    
    if (deltaX !== 0 || deltaY !== 0) {
      this.pan(deltaX, deltaY);
    }
  }
  
  applyInertia() {
    const applyFrame = () => {
      if (Math.abs(this.state.velocity.x) < 0.1 && Math.abs(this.state.velocity.y) < 0.1) {
        return;
      }
      
      this.state.targetTransform.x += this.state.velocity.x / this.state.scale;
      this.state.targetTransform.y += this.state.velocity.y / this.state.scale;
      
      this.state.velocity.x *= this.options.friction;
      this.state.velocity.y *= this.options.friction;
      
      requestAnimationFrame(applyFrame);
    };
    
    requestAnimationFrame(applyFrame);
  }
  
  zoomAt(x, y, scaleFactor) {
    const newScale = Math.max(this.options.minZoom, Math.min(this.options.maxZoom, this.state.targetTransform.scale * scaleFactor));
    
    if (newScale === this.state.targetTransform.scale) return;
    
    // Calculate zoom center in content coordinates
    const contentX = (x - this.state.targetTransform.x * this.state.scale) / this.state.scale;
    const contentY = (y - this.state.targetTransform.y * this.state.scale) / this.state.scale;
    
    // Update scale
    this.state.targetTransform.scale = newScale;
    
    // Adjust position to keep zoom center fixed
    this.state.targetTransform.x = (x - contentX * newScale) / newScale;
    this.state.targetTransform.y = (y - contentY * newScale) / newScale;
    
    this.constrainTransform();
  }
  
  zoomIn() {
    const rect = this.element.getBoundingClientRect();
    this.zoomAt(rect.width / 2, rect.height / 2, 1 + this.options.zoomStep);
  }
  
  zoomOut() {
    const rect = this.element.getBoundingClientRect();
    this.zoomAt(rect.width / 2, rect.height / 2, 1 - this.options.zoomStep);
  }
  
  pan(deltaX, deltaY) {
    this.state.targetTransform.x += deltaX / this.state.scale;
    this.state.targetTransform.y += deltaY / this.state.scale;
    this.constrainTransform();
  }
  
  autoFit() {
    // Implementation depends on content type (SVG vs other)
    if (this.element.querySelector('svg')) {
      this.autoFitSVG();
    } else {
      this.reset();
    }
  }
  
  autoFitSVG() {
    const svg = this.element.querySelector('svg');
    if (!svg) return;
    
    const viewBox = svg.getAttribute('viewBox');
    if (viewBox) {
      const [vx, vy, vw, vh] = viewBox.split(/[,\s]+/).map(Number);
      const rect = this.element.getBoundingClientRect();
      
      const scaleX = (rect.width - 40) / vw;
      const scaleY = (rect.height - 40) / vh;
      const scale = Math.min(scaleX, scaleY, 1);
      
      this.state.targetTransform.scale = scale;
      this.state.targetTransform.x = (rect.width - vw * scale) / 2 / scale;
      this.state.targetTransform.y = (rect.height - vh * scale) / 2 / scale;
    }
  }
  
  reset() {
    this.state.targetTransform = { x: 0, y: 0, scale: 1 };
  }
  
  constrainTransform() {
    // Basic constraint implementation - can be overridden
    const { targetTransform } = this.state;
    
    // Constrain scale
    targetTransform.scale = Math.max(this.options.minZoom, Math.min(this.options.maxZoom, targetTransform.scale));
  }
  
  startRenderLoop() {
    const render = () => {
      if (this.options.enableSmoothing) {
        // Smooth interpolation
        const factor = this.options.smoothingFactor;
        this.state.x += (this.state.targetTransform.x - this.state.x) * factor;
        this.state.y += (this.state.targetTransform.y - this.state.y) * factor;
        this.state.scale += (this.state.targetTransform.scale - this.state.scale) * factor;
      } else {
        // Direct assignment
        this.state.x = this.state.targetTransform.x;
        this.state.y = this.state.targetTransform.y;
        this.state.scale = this.state.targetTransform.scale;
      }
      
      this.applyTransform();
      requestAnimationFrame(render);
    };
    
    requestAnimationFrame(render);
  }
  
  applyTransform() {
    // To be implemented by subclasses
  }
}

// SVG-specific implementation
class SVGPanZoom extends AdvancedPanZoom {
  constructor(svgElement, options = {}) {
    const container = svgElement.parentElement;
    super(container, options);
    this.svg = svgElement;
    this.originalViewBox = this.svg.getAttribute('viewBox') || '0 0 1000 1000';
  }
  
  applyTransform() {
    const [ox, oy, ow, oh] = this.originalViewBox.split(/[,\s]+/).map(Number);
    
    const viewX = ox - this.state.x;
    const viewY = oy - this.state.y;
    const viewW = ow / this.state.scale;
    const viewH = oh / this.state.scale;
    
    this.svg.setAttribute('viewBox', `${viewX} ${viewY} ${viewW} ${viewH}`);
  }
  
  constrainTransform() {
    super.constrainTransform();
    
    const [ox, oy, ow, oh] = this.originalViewBox.split(/[,\s]+/).map(Number);
    const rect = this.element.getBoundingClientRect();
    
    const { targetTransform } = this.state;
    
    // Calculate content bounds in screen space
    const contentW = ow * targetTransform.scale;
    const contentH = oh * targetTransform.scale;
    
    // Constrain position to keep content visible
    const maxX = (contentW - rect.width) / targetTransform.scale;
    const maxY = (contentH - rect.height) / targetTransform.scale;
    
    if (contentW <= rect.width) {
      targetTransform.x = (rect.width - contentW) / 2 / targetTransform.scale;
    } else {
      targetTransform.x = Math.max(-maxX, Math.min(0, targetTransform.x));
    }
    
    if (contentH <= rect.height) {
      targetTransform.y = (rect.height - contentH) / 2 / targetTransform.scale;
    } else {
      targetTransform.y = Math.max(-maxY, Math.min(0, targetTransform.y));
    }
  }
}

// Export for global use
window.AdvancedPanZoom = AdvancedPanZoom;
window.SVGPanZoom = SVGPanZoom;
