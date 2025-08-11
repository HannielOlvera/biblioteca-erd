/**
 * Ultra-Advanced Pan/Zoom Engine for ERD Diagrams
 * Professional-grade smooth interactions with physics simulation
 */

class UltraAdvancedPanZoom {
  constructor(svgElement, options = {}) {
    this.svg = svgElement;
    this.container = svgElement.parentElement;
    
    // Enhanced configuration
    this.config = {
      enablePan: true,
      enableZoom: true,
      enableAutoFit: true,
      enableSmoothing: true,
      enableAutoPan: false,
      enableInertia: true,
      enableBoundaries: true,
      
      // Physics parameters
      smoothingFactor: 0.08,    // More responsive
      zoomStep: 0.12,           // Smaller steps for precision
      maxZoom: 15,              // Higher max zoom
      minZoom: 0.03,            // Lower min zoom
      inertia: 0.96,            // Higher inertia for smoother stops
      friction: 0.82,           // Lower friction for longer glides
      
      // Auto-pan parameters
      edgePanSpeed: 35,
      edgePanMargin: 80,
      edgePanAcceleration: 1.2,
      
      // Interaction parameters
      doubleClickZoom: true,
      mouseWheelZoom: true,
      touchSupport: true,
      rightClickPan: true,      // NEW: Right click for alternative panning
      
      // Visual feedback
      showCursor: true,
      cursorTransition: true,
      
      ...options
    };
    
    // State management
    this.state = {
      scale: 1,
      x: 0,
      y: 0,
      targetScale: 1,
      targetX: 0,
      targetY: 0,
      isDragging: false,
      isRightDragging: false,
      lastInteraction: Date.now(),
      
      // Velocity for inertia
      velocityX: 0,
      velocityY: 0,
      velocityScale: 0,
      
      // Touch state
      touches: new Map(),
      lastTouchDistance: 0
    };
    
    // Performance optimization
    this.performance = {
      lastFrame: 0,
      frameCount: 0,
      fps: 60,
      adaptiveQuality: true
    };
    
    this.originalViewBox = this.getOriginalViewBox();
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupStyles();
    this.startAnimationLoop();
    this.autoFit(false); // Silent auto-fit on init
  }
  
  setupStyles() {
    if (this.config.showCursor) {
      this.container.style.cursor = 'grab';
      if (this.config.cursorTransition) {
        this.container.style.transition = 'cursor 0.1s ease';
      }
    }
    
    // Prevent context menu on right click for better UX
    if (this.config.rightClickPan) {
      this.container.style.userSelect = 'none';
      this.container.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    // Smooth transitions for transform
    this.svg.style.transition = 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  }
  
  setupEventListeners() {
    // Mouse events with enhanced handling
    this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Wheel event with passive: false for preventDefault
    this.container.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    
    // Double click
    if (this.config.doubleClickZoom) {
      this.container.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    }
    
    // Touch events for mobile
    if (this.config.touchSupport) {
      this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
      this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    
    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Window events
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  handleMouseDown(e) {
    e.preventDefault();
    
    // Stop any ongoing animations
    this.stopInertia();
    
    const isRightClick = e.button === 2;
    const isLeftClick = e.button === 0;
    
    if ((isLeftClick && this.config.enablePan) || (isRightClick && this.config.rightClickPan)) {
      this.state.isDragging = isLeftClick;
      this.state.isRightDragging = isRightClick;
      
      this.dragStart = {
        x: e.clientX,
        y: e.clientY,
        stateX: this.state.x,
        stateY: this.state.y,
        time: Date.now()
      };
      
      // Enhanced cursor feedback
      if (this.config.showCursor) {
        this.container.style.cursor = isRightClick ? 'move' : 'grabbing';
        this.container.classList.add('dragging');
      }
      
      // Reset velocity
      this.state.velocityX = 0;
      this.state.velocityY = 0;
    }
  }
  
  handleMouseMove(e) {
    if (!this.state.isDragging && !this.state.isRightDragging) {
      // Auto-pan on edge hover
      if (this.config.enableAutoPan) {
        this.handleEdgePan(e);
      }
      return;
    }
    
    const deltaX = e.clientX - this.dragStart.x;
    const deltaY = e.clientY - this.dragStart.y;
    const deltaTime = Date.now() - this.dragStart.time;
    
    // Calculate velocity for inertia
    if (deltaTime > 0) {
      this.state.velocityX = deltaX / deltaTime * 16; // Normalize to 60fps
      this.state.velocityY = deltaY / deltaTime * 16;
    }
    
    // Apply movement with scale compensation
    const scaleFactor = 1 / this.state.scale;
    this.state.targetX = this.dragStart.stateX + deltaX * scaleFactor;
    this.state.targetY = this.dragStart.stateY + deltaY * scaleFactor;
    
    // Apply boundaries if enabled
    if (this.config.enableBoundaries) {
      this.applyBoundaries();
    }
    
    this.state.lastInteraction = Date.now();
  }
  
  handleMouseUp(e) {
    if (this.state.isDragging || this.state.isRightDragging) {
      // Start inertia if enabled and there's enough velocity
      if (this.config.enableInertia) {
        const velocityMagnitude = Math.sqrt(
          this.state.velocityX ** 2 + this.state.velocityY ** 2
        );
        
        if (velocityMagnitude > 0.5) {
          this.startInertia();
        }
      }
      
      this.state.isDragging = false;
      this.state.isRightDragging = false;
      
      // Reset cursor
      if (this.config.showCursor) {
        this.container.style.cursor = 'grab';
        this.container.classList.remove('dragging');
      }
    }
  }
  
  handleWheel(e) {
    if (!this.config.enableZoom) return;
    
    e.preventDefault();
    this.stopInertia();
    
    // Enhanced wheel handling with acceleration
    const rect = this.container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Dynamic zoom step based on current zoom level
    let dynamicZoomStep = this.config.zoomStep;
    if (this.state.scale < 0.5) dynamicZoomStep *= 0.7;
    if (this.state.scale > 5) dynamicZoomStep *= 1.3;
    
    const factor = e.deltaY > 0 ? (1 - dynamicZoomStep) : (1 + dynamicZoomStep);
    
    this.zoomToPoint(mouseX, mouseY, factor);
    this.state.lastInteraction = Date.now();
  }
  
  handleDoubleClick(e) {
    e.preventDefault();
    this.autoFit(true);
  }
  
  handleTouchStart(e) {
    e.preventDefault();
    this.stopInertia();
    
    // Update touch state
    for (const touch of e.changedTouches) {
      this.state.touches.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      });
    }
    
    if (this.state.touches.size === 1) {
      // Single touch - pan
      const touch = Array.from(this.state.touches.values())[0];
      this.dragStart = {
        x: touch.x,
        y: touch.y,
        stateX: this.state.x,
        stateY: this.state.y,
        time: touch.time
      };
      this.state.isDragging = true;
    } else if (this.state.touches.size === 2) {
      // Two touches - zoom
      const touches = Array.from(this.state.touches.values());
      this.state.lastTouchDistance = this.getTouchDistance(touches[0], touches[1]);
    }
  }
  
  handleTouchMove(e) {
    e.preventDefault();
    
    // Update touch positions
    for (const touch of e.changedTouches) {
      if (this.state.touches.has(touch.identifier)) {
        this.state.touches.set(touch.identifier, {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        });
      }
    }
    
    if (this.state.touches.size === 1 && this.state.isDragging) {
      // Handle pan
      const touch = Array.from(this.state.touches.values())[0];
      const deltaX = touch.x - this.dragStart.x;
      const deltaY = touch.y - this.dragStart.y;
      
      const scaleFactor = 1 / this.state.scale;
      this.state.targetX = this.dragStart.stateX + deltaX * scaleFactor;
      this.state.targetY = this.dragStart.stateY + deltaY * scaleFactor;
      
      if (this.config.enableBoundaries) {
        this.applyBoundaries();
      }
    } else if (this.state.touches.size === 2) {
      // Handle zoom
      const touches = Array.from(this.state.touches.values());
      const currentDistance = this.getTouchDistance(touches[0], touches[1]);
      
      if (this.state.lastTouchDistance > 0) {
        const factor = currentDistance / this.state.lastTouchDistance;
        const centerX = (touches[0].x + touches[1].x) / 2;
        const centerY = (touches[0].y + touches[1].y) / 2;
        
        const rect = this.container.getBoundingClientRect();
        this.zoomToPoint(centerX - rect.left, centerY - rect.top, factor);
      }
      
      this.state.lastTouchDistance = currentDistance;
    }
    
    this.state.lastInteraction = Date.now();
  }
  
  handleTouchEnd(e) {
    // Remove ended touches
    for (const touch of e.changedTouches) {
      this.state.touches.delete(touch.identifier);
    }
    
    if (this.state.touches.size === 0) {
      this.state.isDragging = false;
      this.state.lastTouchDistance = 0;
    } else if (this.state.touches.size === 1) {
      // Transition from zoom to pan
      const touch = Array.from(this.state.touches.values())[0];
      this.dragStart = {
        x: touch.x,
        y: touch.y,
        stateX: this.state.x,
        stateY: this.state.y,
        time: touch.time
      };
      this.state.isDragging = true;
      this.state.lastTouchDistance = 0;
    }
  }
  
  handleKeyDown(e) {
    // Enhanced keyboard navigation
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    const panStep = 50 / this.state.scale;
    let handled = true;
    
    switch (e.code) {
      case 'ArrowUp':
        this.pan(0, panStep);
        break;
      case 'ArrowDown':
        this.pan(0, -panStep);
        break;
      case 'ArrowLeft':
        this.pan(panStep, 0);
        break;
      case 'ArrowRight':
        this.pan(-panStep, 0);
        break;
      case 'Equal':
      case 'NumpadAdd':
        this.zoomIn();
        break;
      case 'Minus':
      case 'NumpadSubtract':
        this.zoomOut();
        break;
      case 'Space':
      case 'KeyF':
        this.autoFit(true);
        break;
      case 'Digit0':
      case 'KeyR':
        this.reset();
        break;
      default:
        handled = false;
    }
    
    if (handled) {
      e.preventDefault();
      this.state.lastInteraction = Date.now();
    }
  }
  
  handleResize() {
    // Debounce resize events
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.autoFit(false);
    }, 250);
  }
  
  handleEdgePan(e) {
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const margin = this.config.edgePanMargin;
    
    let panX = 0, panY = 0;
    
    if (x < margin) panX = (margin - x) / margin;
    if (x > rect.width - margin) panX = -(x - (rect.width - margin)) / margin;
    if (y < margin) panY = (margin - y) / margin;
    if (y > rect.height - margin) panY = -(y - (rect.height - margin)) / margin;
    
    if (panX !== 0 || panY !== 0) {
      const speed = this.config.edgePanSpeed / this.state.scale;
      this.state.targetX += panX * speed * this.config.edgePanAcceleration;
      this.state.targetY += panY * speed * this.config.edgePanAcceleration;
      
      if (this.config.enableBoundaries) {
        this.applyBoundaries();
      }
    }
  }
  
  startInertia() {
    if (!this.config.enableInertia) return;
    
    const inertiaStep = () => {
      // Apply inertia to position
      this.state.targetX += this.state.velocityX;
      this.state.targetY += this.state.velocityY;
      
      // Apply friction
      this.state.velocityX *= this.config.friction;
      this.state.velocityY *= this.config.friction;
      
      // Apply boundaries
      if (this.config.enableBoundaries) {
        this.applyBoundaries();
      }
      
      // Continue if velocity is significant
      const velocityMagnitude = Math.sqrt(
        this.state.velocityX ** 2 + this.state.velocityY ** 2
      );
      
      if (velocityMagnitude > 0.1) {
        this.inertiaId = requestAnimationFrame(inertiaStep);
      } else {
        this.stopInertia();
      }
    };
    
    this.inertiaId = requestAnimationFrame(inertiaStep);
  }
  
  stopInertia() {
    if (this.inertiaId) {
      cancelAnimationFrame(this.inertiaId);
      this.inertiaId = null;
    }
    this.state.velocityX = 0;
    this.state.velocityY = 0;
  }
  
  startAnimationLoop() {
    const animate = (timestamp) => {
      // Performance monitoring
      if (this.performance.lastFrame) {
        const deltaTime = timestamp - this.performance.lastFrame;
        this.performance.fps = Math.round(1000 / deltaTime);
      }
      this.performance.lastFrame = timestamp;
      this.performance.frameCount++;
      
      // Smooth interpolation
      if (this.config.enableSmoothing) {
        const factor = this.config.smoothingFactor;
        
        this.state.x += (this.state.targetX - this.state.x) * factor;
        this.state.y += (this.state.targetY - this.state.y) * factor;
        this.state.scale += (this.state.targetScale - this.state.scale) * factor;
      } else {
        this.state.x = this.state.targetX;
        this.state.y = this.state.targetY;
        this.state.scale = this.state.targetScale;
      }
      
      // Apply transform
      this.applyTransform();
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    this.animationId = requestAnimationFrame(animate);
  }
  
  applyTransform() {
    const transform = `translate(${this.state.x}px, ${this.state.y}px) scale(${this.state.scale})`;
    this.svg.style.transform = transform;
    
    // Dispatch custom event for external listeners
    this.container.dispatchEvent(new CustomEvent('panZoomChange', {
      detail: {
        x: this.state.x,
        y: this.state.y,
        scale: this.state.scale,
        fps: this.performance.fps
      }
    }));
  }
  
  applyBoundaries() {
    // Enhanced boundary logic to prevent over-panning
    const containerRect = this.container.getBoundingClientRect();
    const svgRect = this.svg.getBoundingClientRect();
    
    // Calculate boundaries based on current scale
    const maxX = (containerRect.width - svgRect.width * this.state.scale) / 2;
    const maxY = (containerRect.height - svgRect.height * this.state.scale) / 2;
    
    // Apply soft boundaries with elastic effect
    const elasticity = 0.1;
    
    if (this.state.targetX > maxX) {
      this.state.targetX = maxX + (this.state.targetX - maxX) * elasticity;
    }
    if (this.state.targetX < -maxX) {
      this.state.targetX = -maxX + (this.state.targetX + maxX) * elasticity;
    }
    if (this.state.targetY > maxY) {
      this.state.targetY = maxY + (this.state.targetY - maxY) * elasticity;
    }
    if (this.state.targetY < -maxY) {
      this.state.targetY = -maxY + (this.state.targetY + maxY) * elasticity;
    }
  }
  
  zoomToPoint(pointX, pointY, factor) {
    const newScale = Math.max(
      this.config.minZoom,
      Math.min(this.config.maxZoom, this.state.targetScale * factor)
    );
    
    if (newScale !== this.state.targetScale) {
      // Calculate zoom point transformation
      const scaleFactor = newScale / this.state.targetScale;
      
      this.state.targetX = pointX - (pointX - this.state.targetX) * scaleFactor;
      this.state.targetY = pointY - (pointY - this.state.targetY) * scaleFactor;
      this.state.targetScale = newScale;
      
      if (this.config.enableBoundaries) {
        this.applyBoundaries();
      }
    }
  }
  
  getTouchDistance(touch1, touch2) {
    const deltaX = touch1.x - touch2.x;
    const deltaY = touch1.y - touch2.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
  
  getOriginalViewBox() {
    const viewBox = this.svg.getAttribute('viewBox');
    if (viewBox) {
      const values = viewBox.split(/[\s,]+/).map(Number);
      return { x: values[0], y: values[1], width: values[2], height: values[3] };
    }
    return { x: 0, y: 0, width: 1000, height: 1000 };
  }
  
  // Public API methods
  zoomIn() {
    const factor = 1 + this.config.zoomStep;
    const rect = this.container.getBoundingClientRect();
    this.zoomToPoint(rect.width / 2, rect.height / 2, factor);
  }
  
  zoomOut() {
    const factor = 1 - this.config.zoomStep;
    const rect = this.container.getBoundingClientRect();
    this.zoomToPoint(rect.width / 2, rect.height / 2, factor);
  }
  
  pan(deltaX, deltaY) {
    this.state.targetX += deltaX;
    this.state.targetY += deltaY;
    
    if (this.config.enableBoundaries) {
      this.applyBoundaries();
    }
  }
  
  reset() {
    this.state.targetScale = 1;
    this.state.targetX = 0;
    this.state.targetY = 0;
    this.stopInertia();
  }
  
  autoFit(animated = true) {
    const containerRect = this.container.getBoundingClientRect();
    const originalAspect = this.originalViewBox.width / this.originalViewBox.height;
    const containerAspect = containerRect.width / containerRect.height;
    
    let scale;
    if (originalAspect > containerAspect) {
      scale = (containerRect.width * 0.9) / this.originalViewBox.width;
    } else {
      scale = (containerRect.height * 0.9) / this.originalViewBox.height;
    }
    
    this.state.targetScale = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, scale));
    this.state.targetX = 0;
    this.state.targetY = 0;
    
    if (!animated) {
      this.state.scale = this.state.targetScale;
      this.state.x = this.state.targetX;
      this.state.y = this.state.targetY;
    }
    
    this.stopInertia();
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.stopInertia();
    
    // Remove event listeners
    // (Implementation would remove all added listeners)
  }
  
  // Getters for external access
  get currentState() {
    return { ...this.state };
  }
  
  get performanceMetrics() {
    return { ...this.performance };
  }
}

// Backward compatibility with original SVGPanZoom
class SVGPanZoom extends UltraAdvancedPanZoom {
  constructor(svgElement, options = {}) {
    super(svgElement, options);
  }
}

// Export for global use
window.UltraAdvancedPanZoom = UltraAdvancedPanZoom;
window.SVGPanZoom = SVGPanZoom;
