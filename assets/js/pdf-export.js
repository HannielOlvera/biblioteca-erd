(function(global){
  function parseViewBox(svg){
    const vb = svg.getAttribute('viewBox');
    if(vb){
      const parts = vb.trim().split(/[ ,]+/).map(Number);
      if(parts.length === 4){ return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] }; }
    }
    return { x: 0, y: 0, w: (svg.width && svg.width.baseVal && svg.width.baseVal.value) || 1000, h: (svg.height && svg.height.baseVal && svg.height.baseVal.value) || 1000 };
  }

  function exportSvgToPdf(svgOrSelector, filename='diagrama.pdf', options={}){
    const svg = typeof svgOrSelector === 'string' ? document.querySelector(svgOrSelector) : svgOrSelector;
    if(!svg){ alert('No se encontró el SVG para exportar.'); return; }
    if(!window.jspdf || !window.svg2pdf){ alert('Falta la librería de exportación.'); return; }

    const { jsPDF } = window.jspdf;
    const vb = parseViewBox(svg);

    const orientation = (vb.w >= vb.h) ? 'landscape' : 'portrait';
    const format = options.format || 'a3'; // a3 para más detalle
    const pdf = new jsPDF({ orientation, unit: 'pt', format });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const scale = Math.min(pageW / vb.w, pageH / vb.h);
    const offsetX = (pageW - vb.w * scale) / 2;
    const offsetY = (pageH - vb.h * scale) / 2;

    // Clonar e inyectar fondo blanco para evitar fondo negro
    const clone = svg.cloneNode(true);
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', vb.x);
    rect.setAttribute('y', vb.y);
    rect.setAttribute('width', vb.w);
    rect.setAttribute('height', vb.h);
    rect.setAttribute('fill', '#ffffff');
    clone.insertBefore(rect, clone.firstChild);

    // Renderizar SVG al PDF
    window.svg2pdf(clone, pdf, { x: offsetX, y: offsetY, scale });
    pdf.save(filename);
  }

  global.exportSvgToPdf = exportSvgToPdf;
})(window);
