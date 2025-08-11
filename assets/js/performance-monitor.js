/**
 * Performance Monitor and Optimization Helper
 * Monitors system performance and provides optimization suggestions
 */

class PerformanceMonitor {
  constructor() {
    this.enabled = true;
    this.metrics = {
      fps: 0,
      memory: 0,
      renderTime: 0,
      lastFrame: performance.now()
    };
    this.history = [];
    this.maxHistory = 60; // Keep 60 measurements
    
    this.init();
  }
  
  init() {
    if (!this.enabled) return;
    
    this.startMonitoring();
    this.addPerformanceHUD();
  }
  
  startMonitoring() {
    const monitor = () => {
      if (!this.enabled) return;
      
      const now = performance.now();
      const deltaTime = now - this.metrics.lastFrame;
      this.metrics.lastFrame = now;
      
      // Calculate FPS
      this.metrics.fps = Math.round(1000 / deltaTime);
      
      // Memory usage (if available)
      if (performance.memory) {
        this.metrics.memory = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      }
      
      // Add to history
      this.history.push({
        timestamp: now,
        fps: this.metrics.fps,
        memory: this.metrics.memory
      });
      
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
      
      // Check for performance issues
      this.checkPerformance();
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }
  
  checkPerformance() {
    if (this.history.length < 10) return;
    
    const recent = this.history.slice(-10);
    const avgFPS = recent.reduce((sum, item) => sum + item.fps, 0) / recent.length;
    
    // Performance warnings
    if (avgFPS < 30 && !this.lowFPSWarningShown) {
      this.showPerformanceWarning('low-fps', 'FPS bajo detectado. Considera reducir el zoom o cerrar otras pestañas.');
      this.lowFPSWarningShown = true;
      setTimeout(() => { this.lowFPSWarningShown = false; }, 30000);
    }
    
    if (this.metrics.memory > 100 && !this.highMemoryWarningShown) {
      this.showPerformanceWarning('high-memory', 'Alto uso de memoria detectado. Considera recargar la página.');
      this.highMemoryWarningShown = true;
      setTimeout(() => { this.highMemoryWarningShown = false; }, 60000);
    }
  }
  
  showPerformanceWarning(type, message) {
    if (window.BibliotecaERD?.showNotification) {
      window.BibliotecaERD.showNotification(message, 'warning', 8000, 'Rendimiento');
    }
  }
  
  addPerformanceHUD() {
    // Only show in development or when explicitly enabled
    const showHUD = window.location.search.includes('debug=true') || 
                   localStorage.getItem('show-performance-hud') === 'true';
    
    if (!showHUD) return;
    
    const hud = document.createElement('div');
    hud.id = 'performance-hud';
    hud.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      z-index: 9999;
      backdrop-filter: blur(10px);
      min-width: 120px;
    `;
    
    document.body.appendChild(hud);
    
    const updateHUD = () => {
      if (!this.enabled || !hud.parentNode) return;
      
      hud.innerHTML = `
        <div>FPS: ${this.metrics.fps}</div>
        <div>Memory: ${this.metrics.memory}MB</div>
        <div>Render: ${this.metrics.renderTime.toFixed(1)}ms</div>
      `;
      
      requestAnimationFrame(updateHUD);
    };
    
    updateHUD();
  }
  
  enable() {
    this.enabled = true;
    this.init();
  }
  
  disable() {
    this.enabled = false;
    const hud = document.getElementById('performance-hud');
    if (hud) hud.remove();
  }
  
  getMetrics() {
    return {
      current: this.metrics,
      history: this.history,
      average: this.getAverageMetrics()
    };
  }
  
  getAverageMetrics() {
    if (this.history.length === 0) return null;
    
    const sum = this.history.reduce((acc, item) => ({
      fps: acc.fps + item.fps,
      memory: acc.memory + item.memory
    }), { fps: 0, memory: 0 });
    
    return {
      fps: Math.round(sum.fps / this.history.length),
      memory: Math.round(sum.memory / this.history.length)
    };
  }
}

// Initialize performance monitor
window.BibliotecaERD = window.BibliotecaERD || {};
window.BibliotecaERD.performanceMonitor = new PerformanceMonitor();

// Expose for debugging
window.PerformanceMonitor = PerformanceMonitor;
