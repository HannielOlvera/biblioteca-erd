// Enhanced Main JS for Biblioteca ERD
// - Professional lazy loading with intersection observer
// - Smooth animations and transitions
// - Better accessibility and UX improvements
// - Performance optimizations

(function() {
  'use strict';
  
  // Enhanced lazy loading with smooth transitions
  function initLazyLoading() {
    const lazyElements = document.querySelectorAll('[data-src]');
    
    if ('IntersectionObserver' in window && lazyElements.length > 0) {
      const lazyObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            
            // Add loading state
            element.classList.add('loading');
            
            // Load the content
            if (element.tagName === 'IFRAME') {
              element.src = element.dataset.src;
              element.onload = () => {
                element.classList.remove('loading');
                element.style.opacity = '1';
                observer.unobserve(element);
              };
            } else if (element.tagName === 'IMG') {
              const img = new Image();
              img.onload = () => {
                element.src = img.src;
                element.classList.remove('loading');
                element.style.opacity = '1';
                observer.unobserve(element);
              };
              img.src = element.dataset.src;
            }
            
            element.removeAttribute('data-src');
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.1
      });
      
      lazyElements.forEach(element => {
        element.style.opacity = '0.7';
        element.style.transition = 'opacity 0.3s ease';
        lazyObserver.observe(element);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      lazyElements.forEach(element => {
        if (element.tagName === 'IFRAME') {
          element.src = element.dataset.src;
        } else if (element.tagName === 'IMG') {
          element.src = element.dataset.src;
        }
        element.removeAttribute('data-src');
      });
    }
  }
  
  // Enhanced external links handling
  function initExternalLinks() {
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([data-internal])');
    
    externalLinks.forEach(link => {
      const isExternal = !link.href.startsWith(window.location.origin);
      
      if (isExternal) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Add external link indicator
        if (!link.querySelector('.external-icon')) {
          const icon = document.createElement('span');
          icon.className = 'external-icon';
          icon.innerHTML = ' ↗';
          icon.style.fontSize = '0.8em';
          icon.style.opacity = '0.7';
          link.appendChild(icon);
        }
      }
    });
  }
  
  // Smooth scroll for anchor links
  function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update URL without jumping
          history.pushState(null, null, `#${targetId}`);
        }
      });
    });
  }
  
  // Enhanced button interactions
  function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      // Add ripple effect on click
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          background-color: rgba(255, 255, 255, 0.3);
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          pointer-events: none;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
      
      // Enhanced hover effects
      button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px) scale(1.02)';
      });
      
      button.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });
    });
    
    // Add ripple animation styles
    if (!document.getElementById('ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        .btn {
          position: relative;
          overflow: hidden;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Performance monitoring
  function initPerformanceMonitoring() {
    if ('performance' in window && 'PerformanceObserver' in window) {
      try {
        // Monitor largest contentful paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime.toFixed(2), 'ms');
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Monitor cumulative layout shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          if (clsValue > 0) {
            console.log('CLS:', clsValue.toFixed(4));
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Silently fail if performance monitoring is not supported
      }
    }
  }
  
  // Accessibility improvements
  function initAccessibility() {
    // Add focus indicators for keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });
    
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
    
    // Add keyboard shortcuts info
    const addKeyboardShortcuts = () => {
      if (!document.getElementById('keyboard-help')) {
        const helpText = document.createElement('div');
        helpText.id = 'keyboard-help';
        helpText.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 10px;
          border-radius: 8px;
          font-size: 12px;
          z-index: 1000;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease;
          pointer-events: none;
          max-width: 200px;
        `;
        helpText.innerHTML = `
          <strong>Keyboard Shortcuts:</strong><br>
          Space: Auto-fit<br>
          +/-: Zoom in/out<br>
          Arrow keys: Pan<br>
          Tab: Navigate
        `;
        document.body.appendChild(helpText);
        
        // Show help on Alt+H
        document.addEventListener('keydown', (e) => {
          if (e.altKey && e.key === 'h') {
            e.preventDefault();
            helpText.style.opacity = '1';
            helpText.style.transform = 'translateY(0)';
            setTimeout(() => {
              helpText.style.opacity = '0';
              helpText.style.transform = 'translateY(20px)';
            }, 3000);
          }
        });
      }
    };
    
    // Add on diagrams pages
    if (document.querySelector('.diagram-container, .wrap')) {
      addKeyboardShortcuts();
    }
  }
  
  // Enhanced error handling
  function initErrorHandling() {
    window.addEventListener('error', (e) => {
      console.error('JavaScript Error:', e.error);
      
      // Show user-friendly error message for critical errors
      if (e.error.message.includes('Failed to fetch') || e.error.message.includes('Network')) {
        showNotification('Connection error. Please check your internet connection.', 'error');
      }
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled Promise Rejection:', e.reason);
      e.preventDefault();
    });
  }
  
  // Notification system
  function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
      font-size: 14px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });
    
    // Auto remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
  
  // Initialize everything
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    initLazyLoading();
    initExternalLinks();
    initSmoothScroll();
    initButtonEffects();
    initAccessibility();
    initErrorHandling();
    
    // Optional performance monitoring (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      initPerformanceMonitoring();
    }
    
    console.log('🚀 Biblioteca ERD initialized successfully');
  }
  
  // Start initialization
  init();
  
  // Export utilities for global use
  window.BibliotecaERD = {
    showNotification,
    initLazyLoading,
    initExternalLinks,
    initSmoothScroll
  };
})();
