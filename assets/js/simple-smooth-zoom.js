/**
 * Simple & Smooth Zoom/Pan System
 * Diseñado para ser intuitivo y funcionar perfectamente para usuarios humanos
 */

class SimpleSmoothZoom {
  constructor(svgElement, options = {}) {
    this.svg = svgElement;
    this.container = svgElement.parentElement;
    
    // Configuración simple pero potente
    this.config = {
      minZoom: 0.1,
      maxZoom: 5,
      zoomStep: 0.1,
      smoothness: 0.15,
      enablePan: true,
      enableZoom: true,
      enableDoubleClick: true,
      enableKeyboard: true,
      ...options
    };
    
    // Estado del zoom/pan
    this.state = {
      scale: 1,
      x: 0,
      y: 0,
      isDragging: false
    };
    
    this.init();
  }
  
  init() {
    this.setupStyles();
    this.setupEventListeners();
    this.autoFit();
    console.log('✅ Simple Smooth Zoom initialized');
  }
  
  setupStyles() {
    // Estilos básicos para el contenedor
    this.container.style.overflow = 'hidden';
    this.container.style.cursor = 'grab';
    this.container.style.userSelect = 'none';
    
    // Transición suave para el SVG
    this.svg.style.transition = 'transform 0.2s ease-out';
    this.svg.style.transformOrigin = 'center center';
  }
  
  setupEventListeners() {
    // Eventos de mouse
    this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    // Zoom con rueda del mouse
    this.container.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    
    // Doble click para auto-fit
    if (this.config.enableDoubleClick) {
      this.container.addEventListener('dblclick', this.autoFit.bind(this));
    }
    
    // Eventos de teclado
    if (this.config.enableKeyboard) {
      document.addEventListener('keydown', this.onKeyDown.bind(this));
    }
    
    // Eventos de ventana
    window.addEventListener('resize', this.autoFit.bind(this));
  }
  
  onMouseDown(e) {
    if (!this.config.enablePan) return;
    
    e.preventDefault();
    this.state.isDragging = true;
    this.container.style.cursor = 'grabbing';
    
    this.dragStart = {
      x: e.clientX - this.state.x,
      y: e.clientY - this.state.y
    };
  }
  
  onMouseMove(e) {
    if (!this.state.isDragging) return;
    
    e.preventDefault();
    this.state.x = e.clientX - this.dragStart.x;
    this.state.y = e.clientY - this.dragStart.y;
    
    this.updateTransform();
  }
  
  onMouseUp(e) {
    this.state.isDragging = false;
    this.container.style.cursor = 'grab';
  }
  
  onWheel(e) {
    if (!this.config.enableZoom) return;
    
    e.preventDefault();
    
    // Calcular el nuevo zoom
    const delta = e.deltaY > 0 ? -this.config.zoomStep : this.config.zoomStep;
    const newScale = Math.max(this.config.minZoom, 
                             Math.min(this.config.maxZoom, this.state.scale + delta));
    
    // Obtener posición del mouse
    const rect = this.container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calcular el zoom centrado en el mouse
    const scaleRatio = newScale / this.state.scale;
    
    this.state.x = mouseX - (mouseX - this.state.x) * scaleRatio;
    this.state.y = mouseY - (mouseY - this.state.y) * scaleRatio;
    this.state.scale = newScale;
    
    this.updateTransform();
    this.notifyZoomChange();
  }
  
  onKeyDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    const step = 50;
    let handled = true;
    
    switch (e.key) {
      case 'ArrowUp':
        this.state.y += step;
        break;
      case 'ArrowDown':
        this.state.y -= step;
        break;
      case 'ArrowLeft':
        this.state.x += step;
        break;
      case 'ArrowRight':
        this.state.x -= step;
        break;
      case '+':
      case '=':
        this.zoomIn();
        break;
      case '-':
        this.zoomOut();
        break;
      case ' ':
      case 'f':
      case 'F':
        this.autoFit();
        break;
      case 'r':
      case 'R':
        this.reset();
        break;
      default:
        handled = false;
    }
    
    if (handled) {
      e.preventDefault();
      this.updateTransform();
    }
  }
  
  updateTransform() {
    this.svg.style.transform = `translate(${this.state.x}px, ${this.state.y}px) scale(${this.state.scale})`;
    
    // Dispatch evento personalizado
    this.container.dispatchEvent(new CustomEvent('zoomchange', {
      detail: {
        scale: this.state.scale,
        x: this.state.x,
        y: this.state.y
      }
    }));
  }
  
  // Métodos públicos para controlar el zoom
  zoomIn() {
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const newScale = Math.min(this.config.maxZoom, this.state.scale + this.config.zoomStep);
    const scaleRatio = newScale / this.state.scale;
    
    this.state.x = centerX - (centerX - this.state.x) * scaleRatio;
    this.state.y = centerY - (centerY - this.state.y) * scaleRatio;
    this.state.scale = newScale;
    
    this.updateTransform();
    this.notifyZoomChange();
  }
  
  zoomOut() {
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const newScale = Math.max(this.config.minZoom, this.state.scale - this.config.zoomStep);
    const scaleRatio = newScale / this.state.scale;
    
    this.state.x = centerX - (centerX - this.state.x) * scaleRatio;
    this.state.y = centerY - (centerY - this.state.y) * scaleRatio;
    this.state.scale = newScale;
    
    this.updateTransform();
    this.notifyZoomChange();
  }
  
  autoFit() {
    try {
      // Obtener dimensiones del SVG
      const svgRect = this.svg.getBBox();
      const containerRect = this.container.getBoundingClientRect();
      
      // Calcular escala para que quepa todo con padding
      const padding = 40;
      const scaleX = (containerRect.width - padding) / svgRect.width;
      const scaleY = (containerRect.height - padding) / svgRect.height;
      const scale = Math.min(scaleX, scaleY, this.config.maxZoom);
      
      // Centrar el contenido
      const scaledWidth = svgRect.width * scale;
      const scaledHeight = svgRect.height * scale;
      
      this.state.scale = scale;
      this.state.x = (containerRect.width - scaledWidth) / 2 - svgRect.x * scale;
      this.state.y = (containerRect.height - scaledHeight) / 2 - svgRect.y * scale;
      
      this.updateTransform();
      this.notifyZoomChange();
      
      console.log('✅ Auto-fit aplicado');
    } catch (error) {
      console.warn('Auto-fit fallback usado:', error);
      this.reset();
    }
  }
  
  reset() {
    this.state.scale = 1;
    this.state.x = 0;
    this.state.y = 0;
    this.updateTransform();
    this.notifyZoomChange();
  }
  
  notifyZoomChange() {
    if (window.updateStatusBar) {
      window.updateStatusBar(this.state);
    }
  }
  
  // Getters para acceso externo
  getState() {
    return { ...this.state };
  }
  
  getZoomPercent() {
    return Math.round(this.state.scale * 100);
  }
}

// Export global
window.SimpleSmoothZoom = SimpleSmoothZoom;
