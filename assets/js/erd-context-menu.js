/**
 * Enhanced Right-Click Context Menu System for ERD Chen
 * Provides intuitive context-based actions with smooth animations
 */

class ERDContextMenu {
  constructor(svgElement, panZoomInstance) {
    this.svg = svgElement;
    this.panZoom = panZoomInstance;
    this.menu = null;
    this.isVisible = false;
    this.selectedElement = null;
    
    this.init();
  }
  
  init() {
    this.createMenuStyles();
    this.setupEventListeners();
  }
  
  createMenuStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .erd-context-menu {
        position: fixed;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        padding: 8px 0;
        min-width: 180px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        opacity: 0;
        transform: scale(0.95) translateY(-5px);
        transition: all 0.15s cubic-bezier(0.4, 0.0, 0.2, 1);
        pointer-events: none;
      }
      
      .erd-context-menu.visible {
        opacity: 1;
        transform: scale(1) translateY(0);
        pointer-events: auto;
      }
      
      .erd-context-menu-item {
        display: flex;
        align-items: center;
        padding: 10px 16px;
        color: #333;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.1s ease;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        font-size: inherit;
      }
      
      .erd-context-menu-item:hover {
        background: rgba(59, 130, 246, 0.1);
        color: #1d4ed8;
      }
      
      .erd-context-menu-item.disabled {
        color: #9ca3af;
        cursor: not-allowed;
      }
      
      .erd-context-menu-item.disabled:hover {
        background: none;
        color: #9ca3af;
      }
      
      .erd-context-menu-icon {
        margin-right: 12px;
        width: 16px;
        height: 16px;
        opacity: 0.7;
      }
      
      .erd-context-menu-separator {
        height: 1px;
        background: rgba(0, 0, 0, 0.1);
        margin: 6px 0;
      }
      
      .erd-context-menu-shortcut {
        margin-left: auto;
        font-size: 12px;
        color: #6b7280;
        opacity: 0.8;
      }
    `;
    document.head.appendChild(style);
  }
  
  setupEventListeners() {
    // Override default right-click behavior
    this.svg.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showMenu(e);
    });
    
    // Hide menu on clicks outside
    document.addEventListener('click', (e) => {
      if (!this.menu || !this.menu.contains(e.target)) {
        this.hideMenu();
      }
    });
    
    // Hide menu on scroll
    document.addEventListener('scroll', () => {
      this.hideMenu();
    });
    
    // Hide menu on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideMenu();
      }
    });
  }
  
  showMenu(event) {
    // Get element under cursor
    this.selectedElement = event.target.closest('g, rect, circle, ellipse, path, text');
    const elementType = this.getElementType(this.selectedElement);
    
    // Create menu
    this.menu = this.createMenu(elementType);
    document.body.appendChild(this.menu);
    
    // Position menu
    this.positionMenu(event.clientX, event.clientY);
    
    // Show with animation
    requestAnimationFrame(() => {
      this.menu.classList.add('visible');
      this.isVisible = true;
    });
  }
  
  hideMenu() {
    if (this.menu && this.isVisible) {
      this.menu.classList.remove('visible');
      this.isVisible = false;
      
      setTimeout(() => {
        if (this.menu && this.menu.parentNode) {
          this.menu.parentNode.removeChild(this.menu);
        }
        this.menu = null;
        this.selectedElement = null;
      }, 150);
    }
  }
  
  createMenu(elementType) {
    const menu = document.createElement('div');
    menu.className = 'erd-context-menu';
    
    const items = this.getMenuItems(elementType);
    
    items.forEach((item, index) => {
      if (item.type === 'separator') {
        const separator = document.createElement('div');
        separator.className = 'erd-context-menu-separator';
        menu.appendChild(separator);
      } else {
        const menuItem = document.createElement('button');
        menuItem.className = 'erd-context-menu-item';
        if (item.disabled) menuItem.classList.add('disabled');
        
        menuItem.innerHTML = `
          ${item.icon ? `<span class="erd-context-menu-icon">${item.icon}</span>` : ''}
          <span>${item.label}</span>
          ${item.shortcut ? `<span class="erd-context-menu-shortcut">${item.shortcut}</span>` : ''}
        `;
        
        if (!item.disabled && item.action) {
          menuItem.addEventListener('click', (e) => {
            e.preventDefault();
            item.action();
            this.hideMenu();
          });
        }
        
        menu.appendChild(menuItem);
      }
    });
    
    return menu;
  }
  
  getMenuItems(elementType) {
    const baseItems = [
      {
        label: 'Zoom to Fit',
        icon: '🔍',
        shortcut: 'F',
        action: () => this.panZoom.autoFit(true)
      },
      {
        label: 'Reset Zoom',
        icon: '🏠',
        shortcut: 'R',
        action: () => this.panZoom.reset()
      },
      { type: 'separator' },
      {
        label: 'Zoom In',
        icon: '➕',
        shortcut: '+',
        action: () => this.panZoom.zoomIn()
      },
      {
        label: 'Zoom Out',
        icon: '➖',
        shortcut: '-',
        action: () => this.panZoom.zoomOut()
      }
    ];
    
    // Add element-specific items
    if (elementType !== 'background') {
      const elementItems = [
        { type: 'separator' },
        {
          label: 'Focus on Element',
          icon: '🎯',
          action: () => this.focusOnElement()
        },
        {
          label: 'Highlight Element',
          icon: '✨',
          action: () => this.highlightElement()
        }
      ];
      
      if (elementType === 'entity') {
        elementItems.push({
          label: 'Show Entity Details',
          icon: '📋',
          action: () => this.showEntityDetails()
        });
      } else if (elementType === 'relationship') {
        elementItems.push({
          label: 'Show Relationship Info',
          icon: '🔗',
          action: () => this.showRelationshipInfo()
        });
      }
      
      return [...baseItems, ...elementItems];
    }
    
    return baseItems;
  }
  
  getElementType(element) {
    if (!element) return 'background';
    
    // Analyze element and its classes/attributes to determine type
    const classList = element.classList ? Array.from(element.classList) : [];
    const id = element.id || '';
    const tagName = element.tagName.toLowerCase();
    
    // Check for entity patterns
    if (classList.includes('entity') || id.includes('entity') || 
        (tagName === 'rect' && element.getAttribute('fill') !== 'none')) {
      return 'entity';
    }
    
    // Check for relationship patterns
    if (classList.includes('relationship') || id.includes('relationship') ||
        tagName === 'path' || (tagName === 'line')) {
      return 'relationship';
    }
    
    // Check for attribute patterns
    if (classList.includes('attribute') || id.includes('attribute') ||
        tagName === 'ellipse' || tagName === 'circle') {
      return 'attribute';
    }
    
    return 'element';
  }
  
  positionMenu(x, y) {
    const rect = this.menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate position with viewport boundaries
    let left = x;
    let top = y;
    
    // Adjust if menu would overflow right edge
    if (left + rect.width > viewportWidth - 10) {
      left = x - rect.width;
    }
    
    // Adjust if menu would overflow bottom edge
    if (top + rect.height > viewportHeight - 10) {
      top = y - rect.height;
    }
    
    // Ensure menu doesn't go off-screen
    left = Math.max(10, Math.min(left, viewportWidth - rect.width - 10));
    top = Math.max(10, Math.min(top, viewportHeight - rect.height - 10));
    
    this.menu.style.left = `${left}px`;
    this.menu.style.top = `${top}px`;
  }
  
  focusOnElement() {
    if (!this.selectedElement) return;
    
    try {
      const bbox = this.selectedElement.getBBox();
      const containerRect = this.svg.parentElement.getBoundingClientRect();
      
      // Calculate center of element
      const centerX = bbox.x + bbox.width / 2;
      const centerY = bbox.y + bbox.height / 2;
      
      // Calculate zoom to fit element with padding
      const padding = 50;
      const scaleX = (containerRect.width - padding * 2) / bbox.width;
      const scaleY = (containerRect.height - padding * 2) / bbox.height;
      const scale = Math.min(scaleX, scaleY, 3); // Max zoom of 3x
      
      // Set target transform
      this.panZoom.state.targetScale = scale;
      this.panZoom.state.targetX = containerRect.width / 2 - centerX * scale;
      this.panZoom.state.targetY = containerRect.height / 2 - centerY * scale;
      
      // Show notification
      if (window.notificationSystem) {
        window.notificationSystem.show('Focused on element', 'success');
      }
    } catch (error) {
      console.warn('Could not focus on element:', error);
    }
  }
  
  highlightElement() {
    if (!this.selectedElement) return;
    
    // Remove previous highlights
    document.querySelectorAll('.erd-highlighted').forEach(el => {
      el.classList.remove('erd-highlighted');
    });
    
    // Add highlight class
    this.selectedElement.classList.add('erd-highlighted');
    
    // Add highlight styles if not exist
    if (!document.getElementById('erd-highlight-styles')) {
      const style = document.createElement('style');
      style.id = 'erd-highlight-styles';
      style.textContent = `
        .erd-highlighted {
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6)) !important;
          animation: erdHighlight 2s ease-in-out;
        }
        
        @keyframes erdHighlight {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Remove highlight after animation
    setTimeout(() => {
      this.selectedElement?.classList.remove('erd-highlighted');
    }, 2000);
    
    if (window.notificationSystem) {
      window.notificationSystem.show('Element highlighted', 'info');
    }
  }
  
  showEntityDetails() {
    if (!this.selectedElement) return;
    
    // Extract entity information
    const entityName = this.extractEntityName();
    const attributes = this.extractEntityAttributes();
    
    // Create details modal
    this.showDetailsModal('Entity Details', {
      'Name': entityName,
      'Attributes': attributes.join(', ') || 'None found',
      'Type': 'Entity'
    });
  }
  
  showRelationshipInfo() {
    if (!this.selectedElement) return;
    
    const relationshipName = this.extractRelationshipName();
    
    this.showDetailsModal('Relationship Details', {
      'Name': relationshipName,
      'Type': 'Relationship',
      'Cardinality': 'Not specified'
    });
  }
  
  extractEntityName() {
    // Try to find text content in the element or nearby
    const textElement = this.selectedElement.querySelector('text') || 
                       this.selectedElement.nextElementSibling?.querySelector('text') ||
                       this.selectedElement.previousElementSibling?.querySelector('text');
    
    return textElement?.textContent?.trim() || 'Unknown Entity';
  }
  
  extractEntityAttributes() {
    // This would need to be customized based on your specific ERD structure
    // For now, return empty array
    return [];
  }
  
  extractRelationshipName() {
    const textElement = this.selectedElement.querySelector('text') || 
                       this.selectedElement.nextElementSibling?.querySelector('text') ||
                       this.selectedElement.previousElementSibling?.querySelector('text');
    
    return textElement?.textContent?.trim() || 'Unknown Relationship';
  }
  
  showDetailsModal(title, details) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(5px);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      transform: scale(0.9) translateY(20px);
      transition: transform 0.2s ease;
    `;
    
    // Create content
    modal.innerHTML = `
      <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">${title}</h3>
      ${Object.entries(details).map(([key, value]) => `
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">${key}:</strong>
          <span style="margin-left: 8px; color: #6b7280;">${value}</span>
        </div>
      `).join('')}
      <button id="close-modal" style="
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 8px 16px;
        cursor: pointer;
        margin-top: 16px;
        font-size: 14px;
      ">Close</button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Show with animation
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      modal.style.transform = 'scale(1) translateY(0)';
    });
    
    // Close handlers
    const closeModal = () => {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.9) translateY(20px)';
      setTimeout(() => {
        overlay.remove();
      }, 200);
    };
    
    modal.querySelector('#close-modal').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    });
  }
}

// Export for global use
window.ERDContextMenu = ERDContextMenu;
