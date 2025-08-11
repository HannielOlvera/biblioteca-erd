/**
 * Enhanced Notification System for ERD Diagrams
 * Provides beautiful toast notifications with professional styling
 */

class NotificationSystem {
  constructor() {
    this.container = null;
    this.notifications = new Map();
    this.defaultDuration = 3000;
    this.maxNotifications = 5;
    
    this.init();
  }
  
  init() {
    this.createContainer();
    this.addStyles();
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.className = 'notification-container';
    document.body.appendChild(this.container);
  }
  
  addStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification-container {
        position: fixed;
        top: 5rem;
        right: 1rem;
        z-index: 9999;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        max-width: 400px;
        width: calc(100vw - 2rem);
      }
      
      @media (max-width: 640px) {
        .notification-container {
          top: 4rem;
          left: 1rem;
          right: 1rem;
          max-width: none;
          width: calc(100vw - 2rem);
        }
      }
      
      .notification {
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
        border: 1px solid rgba(0,0,0,0.05);
        pointer-events: auto;
        transform: translateX(100%);
        animation: slideInNotification 0.3s ease forwards;
        backdrop-filter: blur(20px);
        overflow: hidden;
        position: relative;
      }
      
      @keyframes slideInNotification {
        to { transform: translateX(0); }
      }
      
      .notification.removing {
        animation: slideOutNotification 0.2s ease forwards;
      }
      
      @keyframes slideOutNotification {
        to { transform: translateX(100%); opacity: 0; }
      }
      
      .notification-content {
        padding: 1rem 1.25rem;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
      }
      
      .notification-icon {
        font-size: 1.25rem;
        line-height: 1;
        margin-top: 0.125rem;
        flex-shrink: 0;
      }
      
      .notification-text {
        flex: 1;
        min-width: 0;
      }
      
      .notification-title {
        font-weight: 600;
        font-size: 0.9rem;
        line-height: 1.4;
        margin: 0 0 0.25rem 0;
        color: #111827;
      }
      
      .notification-message {
        font-size: 0.85rem;
        line-height: 1.4;
        color: #6b7280;
        margin: 0;
      }
      
      .notification-close {
        background: none;
        border: none;
        padding: 0.25rem;
        margin: -0.25rem -0.25rem -0.25rem 0.5rem;
        cursor: pointer;
        color: #9ca3af;
        border-radius: 4px;
        transition: all 0.2s;
        font-size: 1.1rem;
        line-height: 1;
        flex-shrink: 0;
      }
      
      .notification-close:hover {
        background: rgba(0,0,0,0.05);
        color: #374151;
      }
      
      .notification-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        border-radius: 0 0 12px 12px;
        animation: progressBar linear;
      }
      
      @keyframes progressBar {
        from { width: 100%; }
        to { width: 0%; }
      }
      
      /* Type-specific styles */
      .notification.success .notification-icon { color: #10b981; }
      .notification.success .notification-progress { background: linear-gradient(90deg, #10b981, #34d399); }
      
      .notification.error .notification-icon { color: #ef4444; }
      .notification.error .notification-progress { background: linear-gradient(90deg, #ef4444, #f87171); }
      
      .notification.warning .notification-icon { color: #f59e0b; }
      .notification.warning .notification-progress { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
      
      .notification.info .notification-icon { color: #3b82f6; }
      .notification.info .notification-progress { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
      
      /* Enhanced shadow for different types */
      .notification.success { box-shadow: 0 10px 25px -5px rgba(16,185,129,0.1), 0 10px 10px -5px rgba(16,185,129,0.04); }
      .notification.error { box-shadow: 0 10px 25px -5px rgba(239,68,68,0.1), 0 10px 10px -5px rgba(239,68,68,0.04); }
      .notification.warning { box-shadow: 0 10px 25px -5px rgba(245,158,11,0.1), 0 10px 10px -5px rgba(245,158,11,0.04); }
      .notification.info { box-shadow: 0 10px 25px -5px rgba(59,130,246,0.1), 0 10px 10px -5px rgba(59,130,246,0.04); }
    `;
    
    document.head.appendChild(style);
  }
  
  show(message, type = 'info', duration = this.defaultDuration, title = null) {
    // Limit number of notifications
    if (this.notifications.size >= this.maxNotifications) {
      const oldestId = Array.from(this.notifications.keys())[0];
      this.remove(oldestId);
    }
    
    const id = this.generateId();
    const notification = this.createNotification(id, message, type, duration, title);
    
    this.container.appendChild(notification);
    this.notifications.set(id, {
      element: notification,
      timeout: duration > 0 ? setTimeout(() => this.remove(id), duration) : null
    });
    
    return id;
  }
  
  createNotification(id, message, type, duration, title) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.dataset.id = id;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    const defaultTitles = {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información'
    };
    
    const icon = icons[type] || icons.info;
    const notificationTitle = title || defaultTitles[type];
    
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">${icon}</div>
        <div class="notification-text">
          ${notificationTitle ? `<div class="notification-title">${notificationTitle}</div>` : ''}
          <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="window.BibliotecaERD?.notifications?.remove('${id}')" aria-label="Cerrar notificación">×</button>
      </div>
      ${duration > 0 ? `<div class="notification-progress" style="animation-duration: ${duration}ms;"></div>` : ''}
    `;
    
    return notification;
  }
  
  remove(id) {
    const notification = this.notifications.get(id);
    if (!notification) return;
    
    // Clear timeout
    if (notification.timeout) {
      clearTimeout(notification.timeout);
    }
    
    // Add removing animation
    notification.element.classList.add('removing');
    
    // Remove after animation
    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.remove();
      }
      this.notifications.delete(id);
    }, 200);
  }
  
  removeAll() {
    Array.from(this.notifications.keys()).forEach(id => this.remove(id));
  }
  
  generateId() {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Convenience methods
  success(message, duration = 3000, title = null) {
    return this.show(message, 'success', duration, title);
  }
  
  error(message, duration = 5000, title = null) {
    return this.show(message, 'error', duration, title);
  }
  
  warning(message, duration = 4000, title = null) {
    return this.show(message, 'warning', duration, title);
  }
  
  info(message, duration = 3000, title = null) {
    return this.show(message, 'info', duration, title);
  }
  
  // Persistent notification (no auto-remove)
  persistent(message, type = 'info', title = null) {
    return this.show(message, type, 0, title);
  }
}

// Initialize and expose globally
if (!window.BibliotecaERD) {
  window.BibliotecaERD = {};
}

window.BibliotecaERD.notifications = new NotificationSystem();

// Convenience methods for global access
window.BibliotecaERD.showNotification = (message, type, duration) => {
  return window.BibliotecaERD.notifications.show(message, type, duration);
};

// Export for modules
window.NotificationSystem = NotificationSystem;
