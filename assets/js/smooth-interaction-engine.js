/**
 * Enhanced Smooth Interaction System for ERD Diagrams
 * Provides ultra-fluid drag experience with advanced physics
 */

class SmoothInteractionEngine {
  constructor(svgElement, panZoomInstance) {
    this.svg = svgElement;
    this.panZoom = panZoomInstance;
    this.interactions = new Map();
    
    // Enhanced configuration for ultra-smooth experience
    this.config = {
      smoothingFactor: 0.12,        // Higher for more responsiveness
      dragThreshold: 3,             // Lower threshold for immediate response
      velocityDecay: 0.88,          // Higher decay for smoother stops
      maxVelocity: 40,              // Higher max velocity
      adaptiveSmoothing: true,      // Adapt smoothing based on device
      highDPI: window.devicePixelRatio > 1,
      touchOptimization: 'ontouchstart' in window,
      
      // Gesture recognition
      doubleTapDelay: 300,
      longPressDelay: 500,
      pinchThreshold: 10,
      
      // Visual feedback
      cursorFeedback: true,
      rippleEffect: true,
      hoverPreview: true
    };
    
    // State management
    this.state = {
      isInteracting: false,
      interactionType: null,
      startTime: 0,
      lastPosition: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      smoothedPosition: { x: 0, y: 0 },
      
      // Gesture state
      tapCount: 0,
      lastTapTime: 0,
      isLongPress: false,
      longPressTimer: null,
      
      // Touch state
      touchPoints: new Map(),
      initialDistance: 0,
      initialAngle: 0
    };
    
    // Performance optimization
    this.performance = {
      useRAF: true,
      batchUpdates: true,
      adaptiveQuality: this.config.highDPI,
      frameSkipping: false
    };
    
    this.init();
  }
  
  init() {
    this.setupAdvancedEventListeners();
    this.createVisualEffects();
    this.startUpdateLoop();
    this.optimizeForDevice();
  }
  
  optimizeForDevice() {
    // Detect device capabilities and adjust settings
    if (this.config.touchOptimization) {
      this.config.smoothingFactor *= 0.8; // Slightly less smoothing for touch
      this.config.dragThreshold = 5; // Higher threshold for touch
    }
    
    if (this.config.highDPI) {
      this.performance.batchUpdates = true;
      this.config.smoothingFactor *= 1.1; // More smoothing for high DPI
    }
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.config.smoothingFactor = 0.2;
      this.config.rippleEffect = false;
    }
  }
  
  setupAdvancedEventListeners() {
    // Enhanced mouse events with passive optimization
    const mouseOptions = { passive: false, capture: true };
    
    this.svg.addEventListener('mousedown', this.handleMouseDown.bind(this), mouseOptions);
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
    document.addEventListener('mouseup', this.handleMouseUp.bind(this), { passive: true });
    
    // Enhanced touch events
    if (this.config.touchOptimization) {
      this.svg.addEventListener('touchstart', this.handleTouchStart.bind(this), mouseOptions);
      this.svg.addEventListener('touchmove', this.handleTouchMove.bind(this), mouseOptions);
      this.svg.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
      this.svg.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: true });
    }
    
    // Enhanced wheel with momentum
    this.svg.addEventListener('wheel', this.handleWheelEnhanced.bind(this), mouseOptions);
    
    // Pointer events for modern browsers
    if (window.PointerEvent) {
      this.svg.addEventListener('pointerdown', this.handlePointerDown.bind(this), mouseOptions);
      this.svg.addEventListener('pointermove', this.handlePointerMove.bind(this), { passive: true });
      this.svg.addEventListener('pointerup', this.handlePointerUp.bind(this), { passive: true });
    }
    
    // Hover effects
    if (this.config.hoverPreview) {
      this.svg.addEventListener('mouseover', this.handleMouseOver.bind(this), { passive: true });
      this.svg.addEventListener('mouseout', this.handleMouseOut.bind(this), { passive: true });
    }
  }
  
  handleMouseDown(e) {
    e.preventDefault();
    
    this.startInteraction('mouse', e.clientX, e.clientY, e);
    
    if (this.config.cursorFeedback) {
      document.body.style.cursor = e.button === 2 ? 'move' : 'grabbing';
    }
    
    if (this.config.rippleEffect) {
      this.createRipple(e.clientX, e.clientY);
    }
  }
  
  handleMouseMove(e) {
    if (!this.state.isInteracting) return;
    
    this.updateInteraction(e.clientX, e.clientY, e);
  }
  
  handleMouseUp(e) {
    this.endInteraction(e);
    
    if (this.config.cursorFeedback) {
      document.body.style.cursor = '';
    }
  }
  
  handleTouchStart(e) {
    e.preventDefault();
    
    // Update touch points
    for (const touch of e.changedTouches) {
      this.state.touchPoints.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY,
        startTime: Date.now()
      });
    }
    
    if (this.state.touchPoints.size === 1) {
      // Single touch - pan or tap
      const touch = Array.from(this.state.touchPoints.values())[0];
      this.startInteraction('touch', touch.x, touch.y, e);
      this.startTapDetection(touch);
    } else if (this.state.touchPoints.size === 2) {
      // Two fingers - pinch/zoom
      this.startPinchInteraction();
    }
  }
  
  handleTouchMove(e) {
    e.preventDefault();
    
    // Update touch points
    for (const touch of e.changedTouches) {
      if (this.state.touchPoints.has(touch.identifier)) {
        this.state.touchPoints.set(touch.identifier, {
          ...this.state.touchPoints.get(touch.identifier),
          x: touch.clientX,
          y: touch.clientY
        });
      }
    }
    
    if (this.state.touchPoints.size === 1 && this.state.isInteracting) {
      const touch = Array.from(this.state.touchPoints.values())[0];
      this.updateInteraction(touch.x, touch.y, e);
      this.cancelLongPress();
    } else if (this.state.touchPoints.size === 2) {
      this.updatePinchInteraction();
    }
  }
  
  handleTouchEnd(e) {
    // Remove ended touches
    for (const touch of e.changedTouches) {
      this.state.touchPoints.delete(touch.identifier);
    }
    
    if (this.state.touchPoints.size === 0) {
      this.endInteraction(e);
      this.handleTapGesture();
    } else if (this.state.touchPoints.size === 1) {
      // Transition from pinch to pan
      const touch = Array.from(this.state.touchPoints.values())[0];
      this.startInteraction('touch', touch.x, touch.y, e);
    }
  }
  
  handleTouchCancel(e) {
    this.state.touchPoints.clear();
    this.endInteraction(e);
    this.cancelLongPress();
  }
  
  handleWheelEnhanced(e) {
    e.preventDefault();
    
    // Enhanced wheel handling with momentum
    const momentum = this.calculateWheelMomentum(e);
    const rect = this.svg.getBoundingClientRect();
    const centerX = e.clientX - rect.left;
    const centerY = e.clientY - rect.top;
    
    // Apply zoom with momentum
    const factor = momentum > 0 ? 1 + (momentum * 0.001) : 1 - (Math.abs(momentum) * 0.001);
    this.panZoom.zoomToPoint(centerX, centerY, factor);
    
    if (this.config.rippleEffect) {
      this.createRipple(e.clientX, e.clientY, 'zoom');
    }
  }
  
  calculateWheelMomentum(e) {
    // Calculate wheel momentum based on deltaY and timing
    const now = Date.now();
    const timeDelta = now - (this.lastWheelTime || now);
    this.lastWheelTime = now;
    
    let momentum = e.deltaY;
    
    // Apply acceleration for rapid scrolling
    if (timeDelta < 50) {
      momentum *= 1.5;
    }
    
    // Clamp momentum
    return Math.max(-100, Math.min(100, momentum));
  }
  
  startInteraction(type, x, y, event) {
    this.state.isInteracting = true;
    this.state.interactionType = type;
    this.state.startTime = Date.now();
    this.state.lastPosition = { x, y };
    this.state.smoothedPosition = { x, y };
    this.state.velocity = { x: 0, y: 0 };
    
    // Store interaction for gesture recognition
    this.interactions.set(Date.now(), { type, x, y, event });
    
    // Clean old interactions
    this.cleanOldInteractions();
  }
  
  updateInteraction(x, y, event) {
    if (!this.state.isInteracting) return;
    
    const now = Date.now();
    const deltaTime = now - this.state.startTime;
    const deltaX = x - this.state.lastPosition.x;
    const deltaY = y - this.state.lastPosition.y;
    
    // Calculate velocity with smoothing
    if (deltaTime > 0) {
      const rawVelocityX = deltaX / (deltaTime / 16); // Normalize to 60fps
      const rawVelocityY = deltaY / (deltaTime / 16);
      
      // Apply velocity smoothing
      this.state.velocity.x = this.lerp(this.state.velocity.x, rawVelocityX, 0.3);
      this.state.velocity.y = this.lerp(this.state.velocity.y, rawVelocityY, 0.3);
      
      // Clamp velocity
      this.state.velocity.x = Math.max(-this.config.maxVelocity, 
                                      Math.min(this.config.maxVelocity, this.state.velocity.x));
      this.state.velocity.y = Math.max(-this.config.maxVelocity, 
                                      Math.min(this.config.maxVelocity, this.state.velocity.y));
    }
    
    // Apply position smoothing
    const targetX = this.state.smoothedPosition.x + deltaX;
    const targetY = this.state.smoothedPosition.y + deltaY;
    
    this.state.smoothedPosition.x = this.lerp(this.state.smoothedPosition.x, targetX, this.config.smoothingFactor);
    this.state.smoothedPosition.y = this.lerp(this.state.smoothedPosition.y, targetY, this.config.smoothingFactor);
    
    // Update pan/zoom with smoothed position
    const scaleFactor = 1 / this.panZoom.state.scale;
    const smoothDeltaX = (this.state.smoothedPosition.x - this.state.lastPosition.x) * scaleFactor;
    const smoothDeltaY = (this.state.smoothedPosition.y - this.state.lastPosition.y) * scaleFactor;
    
    this.panZoom.state.targetX += smoothDeltaX;
    this.panZoom.state.targetY += smoothDeltaY;
    
    // Update last position
    this.state.lastPosition = { x, y };
  }
  
  endInteraction(event) {
    if (!this.state.isInteracting) return;
    
    // Apply inertia based on final velocity
    if (this.panZoom.config.enableInertia) {
      const velocityMagnitude = Math.sqrt(
        this.state.velocity.x ** 2 + this.state.velocity.y ** 2
      );
      
      if (velocityMagnitude > 1) {
        this.applyInertia();
      }
    }
    
    this.state.isInteracting = false;
    this.state.interactionType = null;
    this.cancelLongPress();
  }
  
  applyInertia() {
    const applyInertiaStep = () => {
      // Apply velocity to position
      const scaleFactor = 1 / this.panZoom.state.scale;
      this.panZoom.state.targetX += this.state.velocity.x * scaleFactor;
      this.panZoom.state.targetY += this.state.velocity.y * scaleFactor;
      
      // Apply decay
      this.state.velocity.x *= this.config.velocityDecay;
      this.state.velocity.y *= this.config.velocityDecay;
      
      // Continue if velocity is significant
      const velocityMagnitude = Math.sqrt(
        this.state.velocity.x ** 2 + this.state.velocity.y ** 2
      );
      
      if (velocityMagnitude > 0.1) {
        requestAnimationFrame(applyInertiaStep);
      }
    };
    
    requestAnimationFrame(applyInertiaStep);
  }
  
  startTapDetection(touch) {
    // Start long press detection
    this.state.longPressTimer = setTimeout(() => {
      this.state.isLongPress = true;
      this.handleLongPress(touch);
    }, this.config.longPressDelay);
  }
  
  handleTapGesture() {
    if (this.state.isLongPress) {
      this.state.isLongPress = false;
      return;
    }
    
    const now = Date.now();
    const timeSinceLastTap = now - this.state.lastTapTime;
    
    if (timeSinceLastTap < this.config.doubleTapDelay) {
      this.state.tapCount++;
    } else {
      this.state.tapCount = 1;
    }
    
    this.state.lastTapTime = now;
    
    // Handle different tap counts
    setTimeout(() => {
      if (this.state.tapCount === 2) {
        this.handleDoubleTap();
      } else if (this.state.tapCount === 1) {
        this.handleSingleTap();
      }
      this.state.tapCount = 0;
    }, this.config.doubleTapDelay);
  }
  
  handleSingleTap() {
    // Single tap action (could be element selection)
    console.log('Single tap detected');
  }
  
  handleDoubleTap() {
    // Double tap to auto-fit
    this.panZoom.autoFit(true);
    
    if (window.notificationSystem) {
      window.notificationSystem.show('Auto-fit activated', 'info', 1000);
    }
  }
  
  handleLongPress(touch) {
    // Long press action (could show context menu)
    console.log('Long press detected');
    
    if (this.config.rippleEffect) {
      this.createRipple(touch.x, touch.y, 'longpress');
    }
  }
  
  cancelLongPress() {
    if (this.state.longPressTimer) {
      clearTimeout(this.state.longPressTimer);
      this.state.longPressTimer = null;
    }
    this.state.isLongPress = false;
  }
  
  startPinchInteraction() {
    const touches = Array.from(this.state.touchPoints.values());
    if (touches.length !== 2) return;
    
    this.state.initialDistance = this.calculateDistance(touches[0], touches[1]);
    this.state.initialAngle = this.calculateAngle(touches[0], touches[1]);
  }
  
  updatePinchInteraction() {
    const touches = Array.from(this.state.touchPoints.values());
    if (touches.length !== 2) return;
    
    const currentDistance = this.calculateDistance(touches[0], touches[1]);
    const scale = currentDistance / this.state.initialDistance;
    
    // Calculate center point
    const centerX = (touches[0].x + touches[1].x) / 2;
    const centerY = (touches[0].y + touches[1].y) / 2;
    
    // Apply zoom
    const rect = this.svg.getBoundingClientRect();
    this.panZoom.zoomToPoint(centerX - rect.left, centerY - rect.top, scale);
    
    this.state.initialDistance = currentDistance;
  }
  
  calculateDistance(point1, point2) {
    const deltaX = point1.x - point2.x;
    const deltaY = point1.y - point2.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
  
  calculateAngle(point1, point2) {
    return Math.atan2(point2.y - point1.y, point2.x - point1.x);
  }
  
  createRipple(x, y, type = 'default') {
    if (!this.config.rippleEffect) return;
    
    const ripple = document.createElement('div');
    ripple.className = `smooth-ripple smooth-ripple-${type}`;
    
    // Position ripple
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    document.body.appendChild(ripple);
    
    // Trigger animation
    requestAnimationFrame(() => {
      ripple.classList.add('animate');
    });
    
    // Remove after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
  
  createVisualEffects() {
    if (!document.getElementById('smooth-interaction-styles')) {
      const style = document.createElement('style');
      style.id = 'smooth-interaction-styles';
      style.textContent = `
        .smooth-ripple {
          position: fixed;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%) scale(0);
          opacity: 0.6;
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      opacity 0.6s ease-out;
        }
        
        .smooth-ripple-default {
          background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
        }
        
        .smooth-ripple-zoom {
          background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%);
        }
        
        .smooth-ripple-longpress {
          background: radial-gradient(circle, rgba(245, 101, 101, 0.4) 0%, transparent 70%);
        }
        
        .smooth-ripple.animate {
          transform: translate(-50%, -50%) scale(3);
          opacity: 0;
        }
        
        .dragging {
          user-select: none !important;
          -webkit-user-select: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  handleMouseOver(e) {
    // Add hover effects for interactive elements
    const element = e.target.closest('g, rect, circle, ellipse, path');
    if (element && element !== this.svg) {
      element.style.filter = 'brightness(1.05)';
      element.style.transition = 'filter 0.15s ease';
    }
  }
  
  handleMouseOut(e) {
    // Remove hover effects
    const element = e.target.closest('g, rect, circle, ellipse, path');
    if (element && element !== this.svg) {
      element.style.filter = '';
    }
  }
  
  startUpdateLoop() {
    if (!this.performance.useRAF) return;
    
    const update = () => {
      // Batch updates for performance
      if (this.performance.batchUpdates) {
        this.processBatchedUpdates();
      }
      
      requestAnimationFrame(update);
    };
    
    requestAnimationFrame(update);
  }
  
  processBatchedUpdates() {
    // Process any queued updates here
    // This can be used for batching DOM updates
  }
  
  cleanOldInteractions() {
    const cutoff = Date.now() - 5000; // Keep 5 seconds of history
    for (const [timestamp] of this.interactions) {
      if (timestamp < cutoff) {
        this.interactions.delete(timestamp);
      }
    }
  }
  
  lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  // Public API
  setSmoothing(factor) {
    this.config.smoothingFactor = Math.max(0.01, Math.min(1, factor));
  }
  
  enableRippleEffect(enabled) {
    this.config.rippleEffect = enabled;
  }
  
  getInteractionStats() {
    return {
      activeInteractions: this.interactions.size,
      currentVelocity: Math.sqrt(this.state.velocity.x ** 2 + this.state.velocity.y ** 2),
      interactionType: this.state.interactionType,
      isInteracting: this.state.isInteracting
    };
  }
}

// Export for global use
window.SmoothInteractionEngine = SmoothInteractionEngine;
