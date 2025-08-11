/**
 * Enhanced User Interface System
 * Sistema mejorado para feedback visual y controles intuitivos
 */

class EnhancedUI {
  constructor() {
    this.notifications = [];
    this.init();
  }
  
  init() {
    this.createNotificationContainer();
    this.createGlobalStyles();
    this.setupGlobalEventListeners();
  }
  
  createNotificationContainer() {
    if (document.getElementById('notification-container')) return;
    
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  
  createGlobalStyles() {
    if (document.getElementById('enhanced-ui-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'enhanced-ui-styles';
    style.textContent = `
      /* Notificaciones mejoradas */
      .notification {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        padding: 16px 20px;
        margin-bottom: 10px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 350px;
        pointer-events: auto;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .notification.show {
        transform: translateX(0);
        opacity: 1;
      }
      
      .notification.success {
        border-left: 4px solid #10b981;
      }
      
      .notification.error {
        border-left: 4px solid #ef4444;
      }
      
      .notification.warning {
        border-left: 4px solid #f59e0b;
      }
      
      .notification.info {
        border-left: 4px solid #3b82f6;
      }
      
      .notification-title {
        font-weight: 600;
        margin-bottom: 4px;
        color: #111827;
      }
      
      .notification-message {
        color: #6b7280;
        line-height: 1.4;
      }
      
      .notification-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #9ca3af;
        padding: 4px;
        border-radius: 4px;
        transition: color 0.2s ease;
      }
      
      .notification-close:hover {
        color: #374151;
      }
      
      /* Mejoras para botones */
      .btn {
        position: relative;
        overflow: hidden;
        transition: all 0.2s ease;
      }
      
      .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .btn:active {
        transform: translateY(0);
      }
      
      .btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: width 0.3s ease, height 0.3s ease;
      }
      
      .btn:active::before {
        width: 100px;
        height: 100px;
      }
      
      /* Mejoras para cursor */
      .diagram-container {
        cursor: grab !important;
      }
      
      .diagram-container.dragging {
        cursor: grabbing !important;
      }
      
      /* Loader mejorado */
      .loading-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        color: #6b7280;
      }
      
      .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #e5e7eb;
        border-top: 3px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Status bar mejorado */
      .status-bar {
        font-family: 'JetBrains Mono', 'Consolas', monospace !important;
        font-size: 12px !important;
        background: rgba(0, 0, 0, 0.85) !important;
        backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
      
      /* Tooltips simples */
      [data-tooltip] {
        position: relative;
      }
      
      [data-tooltip]:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
        margin-bottom: 5px;
      }
      
      [data-tooltip]:hover::before {
        content: '';
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: rgba(0, 0, 0, 0.9);
        z-index: 1000;
      }
      
      /* Mejoras para móviles */
      @media (max-width: 768px) {
        .notification {
          max-width: calc(100vw - 40px);
          right: 20px;
          left: 20px;
        }
        
        .enhanced-toolbar {
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .btn {
          min-width: 44px;
          min-height: 44px;
        }
      }
      
      /* Animaciones de entrada suaves */
      .fade-in {
        animation: fadeIn 0.3s ease-out;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
  
  setupGlobalEventListeners() {
    // Prevenir menú contextual en áreas de diagrama
    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.diagram-container')) {
        e.preventDefault();
      }
    });
    
    // Mejorar accesibilidad con teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearAllNotifications();
      }
    });
  }
  
  showNotification(message, type = 'info', duration = 4000, title = null) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => this.removeNotification(notification);
    
    let content = '';
    if (title) {
      content += `<div class="notification-title">${title}</div>`;
    }
    content += `<div class="notification-message">${message}</div>`;
    
    notification.innerHTML = content;
    notification.appendChild(closeBtn);
    
    const container = document.getElementById('notification-container');
    container.appendChild(notification);
    
    // Animar entrada
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
    
    // Auto-remove
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification);
      }, duration);
    }
    
    this.notifications.push(notification);
    return notification;
  }
  
  removeNotification(notification) {
    if (!notification.parentNode) return;
    
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      const index = this.notifications.indexOf(notification);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    }, 300);
  }
  
  clearAllNotifications() {
    this.notifications.forEach(notification => {
      this.removeNotification(notification);
    });
  }
  
  showLoadingSpinner(container, message = 'Cargando...') {
    const loader = document.createElement('div');
    loader.className = 'loading-indicator fade-in';
    loader.innerHTML = `
      <div class="loading-spinner"></div>
      <div>${message}</div>
    `;
    container.appendChild(loader);
    return loader;
  }
  
  hideLoadingSpinner(loader) {
    if (loader && loader.parentNode) {
      loader.style.opacity = '0';
      setTimeout(() => {
        if (loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }
      }, 200);
    }
  }
  
  addTooltips() {
    // Auto-agregar tooltips a botones sin título
    document.querySelectorAll('.btn:not([title]):not([data-tooltip])').forEach(btn => {
      const text = btn.textContent.trim();
      if (text) {
        btn.setAttribute('data-tooltip', text);
      }
    });
  }
}

// Crear instancia global
window.enhancedUI = new EnhancedUI();

// Función global para notificaciones (compatibilidad)
window.showNotification = (message, type, duration, title) => {
  return window.enhancedUI.showNotification(message, type, duration, title);
};
