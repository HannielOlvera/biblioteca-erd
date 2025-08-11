// JS para navegación y exportación del diagrama Mermaid, inspirado en el manejo de erd_chen.html

// Estado de vista
let currentScale = 1;
let currentX = 0;
let currentY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let svg = null;
let resizeTimer = null;

// Configurar Mermaid: desactivar auto para aplicar tema y ejecutar manualmente
if (window.mermaid) {
  window.mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    themeVariables: {
      primaryColor: '#e7f0ff',
      primaryTextColor: '#1f2937',
      primaryBorderColor: '#3b82f6',
      lineColor: '#374151',
      background: '#ffffff'
    }
  });
}

function waitForMermaid() {
  svg = document.querySelector('#diagram svg');
  if (svg) {
    setupDiagram();
  } else {
    setTimeout(waitForMermaid, 100);
  }
}

function setupDiagram() {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';

  // Asegurar viewBox
  if (svg && !svg.getAttribute('viewBox')) {
    const bbox = svg.getBBox();
    svg.setAttribute('viewBox', `${bbox.x - 20} ${bbox.y - 20} ${bbox.width + 40} ${bbox.height + 40}`);
  }

  const container = document.getElementById('diagram');
  if (!container || !svg) return;

  // Eventos como en el Chen (simples y robustos)
  container.addEventListener('mousedown', startDragHandler);
  document.addEventListener('mousemove', dragHandler);
  document.addEventListener('mouseup', endDragHandler);
  container.addEventListener('mouseleave', endDragHandler);

  container.addEventListener('wheel', handleWheel, { passive: false });
  container.addEventListener('dblclick', autoFit);
  document.addEventListener('keydown', handleKeyboard);

  // Auto-fit inicial y al cambiar tamaño
  setTimeout(autoFit, 400);
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(autoFit, 250);
  });

  console.log('✅ Diagrama ERD Mermaid listo');
}

function startDragHandler(e) {
  isDragging = true;
  startX = e.clientX - currentX;
  startY = e.clientY - currentY;
  const c = document.getElementById('diagram');
  if (c) c.style.cursor = 'grabbing';
}

function dragHandler(e) {
  if (!isDragging) return;
  e.preventDefault();
  currentX = e.clientX - startX;
  currentY = e.clientY - startY;
  updateTransform();
}

function endDragHandler() {
  isDragging = false;
  const c = document.getElementById('diagram');
  if (c) c.style.cursor = 'grab';
}

function handleWheel(e) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  const rect = e.currentTarget.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const newScale = Math.max(0.1, Math.min(5, currentScale * delta));
  const ratio = newScale / currentScale;

  currentX = mouseX - (mouseX - currentX) * ratio;
  currentY = mouseY - (mouseY - currentY) * ratio;
  currentScale = newScale;
  updateTransform();
}

function handleKeyboard(e) {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  const step = 50;
  switch (e.key) {
    case 'ArrowUp': currentY += step; break;
    case 'ArrowDown': currentY -= step; break;
    case 'ArrowLeft': currentX += step; break;
    case 'ArrowRight': currentX -= step; break;
    case '+': zoomIn(); return;
    case '-': zoomOut(); return;
    case ' ': case 'f': e.preventDefault(); autoFit(); return;
    case 'r': resetView(); return;
    default: return;
  }
  e.preventDefault();
  updateTransform();
}

function updateTransform() {
  if (svg) {
    svg.style.transformOrigin = '0 0';
    svg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
    updateStatus();
  }
}

function updateStatus() {
  const status = document.getElementById('status');
  if (!status) return;
  const z = Math.round(currentScale * 100);
  const x = Math.round(currentX);
  const y = Math.round(currentY);
  status.textContent = `📊 Zoom: ${z}% | Posición: (${x}, ${y}) | Arrastra para navegar`;
}

function autoFit() {
  if (!svg) return;
  try {
    const container = document.getElementById('diagram');
    const bbox = svg.getBBox();
    const r = container.getBoundingClientRect();

    const scaleX = (r.width - 40) / bbox.width;
    const scaleY = (r.height - 40) / bbox.height;
    const s = Math.min(scaleX, scaleY, 2);

    currentScale = s;
    currentX = (r.width - bbox.width * s) / 2 - bbox.x * s;
    currentY = (r.height - bbox.height * s) / 2 - bbox.y * s;
    updateTransform();
    showNotification('Vista ajustada automáticamente');
  } catch (e) {
    resetView();
  }
}

function zoomIn() {
  const c = document.getElementById('diagram');
  const rect = c.getBoundingClientRect();
  const cx = rect.width / 2; const cy = rect.height / 2;
  const ns = Math.min(5, currentScale * 1.2);
  const ratio = ns / currentScale;
  currentX = cx - (cx - currentX) * ratio;
  currentY = cy - (cy - currentY) * ratio;
  currentScale = ns;
  updateTransform();
  showNotification(`Zoom: ${Math.round(currentScale * 100)}%`);
}

function zoomOut() {
  const c = document.getElementById('diagram');
  const rect = c.getBoundingClientRect();
  const cx = rect.width / 2; const cy = rect.height / 2;
  const ns = Math.max(0.1, currentScale * 0.8);
  const ratio = ns / currentScale;
  currentX = cx - (cx - currentX) * ratio;
  currentY = cy - (cy - currentY) * ratio;
  currentScale = ns;
  updateTransform();
  showNotification(`Zoom: ${Math.round(currentScale * 100)}%`);
}

function resetView() {
  currentScale = 1; currentX = 0; currentY = 0;
  updateTransform();
  showNotification('Vista restablecida');
}

async function exportPDF() {
  if (!svg || !window.jsPDF || !window.svg2pdf) {
    showNotification('Error: PDF no disponible', 'error');
    return;
  }
  try {
    showNotification('Generando PDF...');
    const pdf = new window.jsPDF('l', 'pt', 'a3');
    await window.svg2pdf(svg, pdf, { xOffset: 50, yOffset: 50, scale: 0.8 });
    pdf.save('Sistema_Biblioteca_ERD_Mermaid.pdf');
    showNotification('PDF exportado exitosamente');
  } catch (err) {
    console.error(err);
    showNotification('Error al exportar PDF', 'error');
  }
}

function showNotification(message, type = 'info') {
  const n = document.createElement('div');
  n.className = `notification${type === 'error' ? ' error' : ''}`;
  n.textContent = message;
  document.body.appendChild(n);
  setTimeout(() => { n.style.animation = 'slideOut 0.3s ease'; setTimeout(() => n.remove(), 300); }, 3000);
}

// Exponer funciones a los botones del HTML
window.autoFit = autoFit;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetView = resetView;
window.exportPDF = exportPDF;

// Inicializar cuando el DOM esté listo: ejecutar Mermaid y preparar navegación
document.addEventListener('DOMContentLoaded', async () => {
  try {
    if (window.mermaid && window.mermaid.run) {
      await window.mermaid.run({ query: '.mermaid' });
    }
  } catch (e) {
    console.warn('Mermaid run falló, esperando SVG...', e);
  }
  setTimeout(waitForMermaid, 200);

  console.log('📚 Sistema de diagrama ERD Mermaid inicializado');
});
