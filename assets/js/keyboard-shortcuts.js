/**
 * Advanced Keyboard Shortcuts for ERD Navigation
 * Provides professional keyboard controls for diagram navigation
 */

class KeyboardShortcuts {
  constructor(panZoomInstance) {
    this.panZoom = panZoomInstance;
    this.keys = new Set();
    this.shortcuts = new Map();
    this.enabled = true;
    
    this.init();
  }
  
  init() {
    // Define shortcuts
    this.shortcuts.set('Space', () => this.panZoom.autoFit());
    this.shortcuts.set('Equal', () => this.panZoom.zoomIn());
    this.shortcuts.set('Minus', () => this.panZoom.zoomOut());
    this.shortcuts.set('Digit0', () => this.panZoom.reset());
    this.shortcuts.set('KeyF', () => this.panZoom.autoFit());
    this.shortcuts.set('KeyR', () => this.panZoom.reset());
    
    // Arrow keys for panning
    this.shortcuts.set('ArrowUp', () => this.panZoom.pan(0, 50));
    this.shortcuts.set('ArrowDown', () => this.panZoom.pan(0, -50));
    this.shortcuts.set('ArrowLeft', () => this.panZoom.pan(50, 0));
    this.shortcuts.set('ArrowRight', () => this.panZoom.pan(-50, 0));
    
    // Advanced shortcuts
    this.shortcuts.set('KeyH', (e) => e.altKey && this.showHelp());
    this.shortcuts.set('KeyP', (e) => e.ctrlKey && this.exportToPdf(e));
    this.shortcuts.set('Escape', () => this.hideHelp());
    
    this.bindEvents();
  }
  
  bindEvents() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Prevent default for navigation keys
    document.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        if (e.target === document.body || e.target.classList.contains('svg-container')) {
          e.preventDefault();
        }
      }
    });
  }
  
  handleKeyDown(e) {
    if (!this.enabled) return;
    
    // Skip if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    this.keys.add(e.code);
    
    const shortcut = this.shortcuts.get(e.code);
    if (shortcut) {
      try {
        shortcut(e);
        if (!['KeyH', 'KeyP'].includes(e.code)) {
          e.preventDefault();
        }
      } catch (error) {
        console.warn('Keyboard shortcut error:', error);
      }
    }
  }
  
  handleKeyUp(e) {
    this.keys.delete(e.code);
  }
  
  showHelp() {
    const existingHelp = document.getElementById('keyboard-help');
    if (existingHelp) {
      existingHelp.remove();
      return;
    }
    
    const helpModal = document.createElement('div');
    helpModal.id = 'keyboard-help';
    helpModal.innerHTML = `
      <div class="help-overlay">
        <div class="help-modal">
          <div class="help-header">
            <h3>⌨️ Atajos de Teclado</h3>
            <button class="help-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
          </div>
          <div class="help-content">
            <div class="help-section">
              <h4>🔍 Zoom y Vista</h4>
              <div class="help-shortcuts">
                <div><kbd>Espacio</kbd> o <kbd>F</kbd> Auto-ajustar vista</div>
                <div><kbd>+</kbd> Acercar zoom</div>
                <div><kbd>-</kbd> Alejar zoom</div>
                <div><kbd>0</kbd> o <kbd>R</kbd> Restablecer vista</div>
              </div>
            </div>
            
            <div class="help-section">
              <h4>🧭 Navegación</h4>
              <div class="help-shortcuts">
                <div><kbd>↑</kbd> Mover hacia arriba</div>
                <div><kbd>↓</kbd> Mover hacia abajo</div>
                <div><kbd>←</kbd> Mover hacia la izquierda</div>
                <div><kbd>→</kbd> Mover hacia la derecha</div>
              </div>
            </div>
            
            <div class="help-section">
              <h4>🔧 Acciones</h4>
              <div class="help-shortcuts">
                <div><kbd>Ctrl</kbd> + <kbd>P</kbd> Exportar a PDF</div>
                <div><kbd>Alt</kbd> + <kbd>H</kbd> Mostrar/ocultar ayuda</div>
                <div><kbd>Esc</kbd> Cerrar ayuda</div>
              </div>
            </div>
            
            <div class="help-section">
              <h4>🖱️ Mouse</h4>
              <div class="help-shortcuts">
                <div><strong>Arrastrar</strong> Mover diagrama</div>
                <div><strong>Rueda</strong> Zoom in/out</div>
                <div><strong>Doble clic</strong> Auto-ajustar</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .help-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .help-modal {
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);
        max-width: 600px;
        width: 90vw;
        max-height: 80vh;
        overflow: hidden;
        animation: slideUp 0.3s ease;
      }
      
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      .help-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      
      .help-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
      }
      
      .help-close {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        font-size: 1.5rem;
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      
      .help-close:hover {
        background: rgba(255,255,255,0.3);
      }
      
      .help-content {
        padding: 1.5rem;
        overflow-y: auto;
        max-height: 60vh;
      }
      
      .help-section {
        margin-bottom: 1.5rem;
      }
      
      .help-section:last-child {
        margin-bottom: 0;
      }
      
      .help-section h4 {
        margin: 0 0 0.75rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: #374151;
      }
      
      .help-shortcuts {
        display: grid;
        gap: 0.5rem;
      }
      
      .help-shortcuts > div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background: #f9fafb;
        border-radius: 8px;
        font-size: 0.9rem;
      }
      
      .help-shortcuts kbd {
        background: #374151;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8rem;
        font-weight: 500;
        min-width: 1.5rem;
        text-align: center;
        display: inline-block;
        margin-right: 0.25rem;
      }
      
      .help-shortcuts kbd:last-child {
        margin-right: 0;
      }
    `;
    
    helpModal.appendChild(style);
    document.body.appendChild(helpModal);
    
    // Close on click outside
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) {
        helpModal.remove();
      }
    });
  }
  
  hideHelp() {
    const helpModal = document.getElementById('keyboard-help');
    if (helpModal) {
      helpModal.remove();
    }
  }
  
  exportToPdf(e) {
    e.preventDefault();
    const pdfButton = document.getElementById('btnPdf');
    if (pdfButton) {
      pdfButton.click();
    }
  }
  
  enable() {
    this.enabled = true;
  }
  
  disable() {
    this.enabled = false;
  }
}

// Export for use in other modules
window.KeyboardShortcuts = KeyboardShortcuts;
