# 📚 Sistema de Biblioteca - Diagramas ER Profesionales

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen)](https://hannielovera.github.io/biblioteca-erd/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://www.w3.org/html/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

Implementación profesional de diagramas Entidad-Relación para un sistema de biblioteca universitaria, con navegación interactiva avanzada, exportación a PDF de alta calidad y diseño responsive moderno.

## 🎯 Características Principales

### 📊 Diagramas Profesionales
- **Diagrama Conceptual (Chen)**: Modelo tradicional con entidades, atributos y relaciones
- **Diagrama Lógico (Crow's Foot)**: Modelo implementable con llaves primarias/foráneas
- **Renderizado de Alta Calidad**: SVG escalable con tipografía profesional

### 🚀 Navegación Avanzada
- **Pan/Zoom Fluido**: Navegación suave con interpolación y física realista
- **Atajos de Teclado**: Control completo desde el teclado (Alt+H para ayuda)
- **Auto-Pan Inteligente**: Navegación automática al acercarse a los bordes
- **Doble Clic Auto-Fit**: Ajuste automático con doble clic

### 📄 Exportación Profesional
- **PDF de Alta Calidad**: Exportación en formato A3 con fondo blanco
- **Resolución Optimizada**: Calidad profesional para impresión
- **Metadatos Completos**: Información del documento incluida

### 🎨 Diseño Moderno
- **Glassmorphism UI**: Efectos de cristal y transparencias modernas
- **Sistema de Design Tokens**: CSS custom properties para consistencia
- **Responsive Design**: Optimizado para todos los dispositivos
- **Tipografía Profesional**: Inter + JetBrains Mono

### 🔧 Funcionalidades Avanzadas
- **Sistema de Notificaciones**: Feedback visual elegante para todas las acciones
- **Monitor de Rendimiento**: Optimización automática y avisos de performance
- **Lazy Loading**: Carga optimizada de recursos
- **Accesibilidad Completa**: ARIA labels y navegación por teclado

## 🖥️ Demo en Vivo

Visita la **[Demo en GitHub Pages](https://hannielovera.github.io/biblioteca-erd/)** para ver el proyecto en acción.

## 📱 Capturas de Pantalla

### Página Principal
![Página Principal](docs/screenshots/index.png)

### Diagrama Chen Interactivo
![Diagrama Chen](docs/screenshots/chen-diagram.png)

### Diagrama Lógico Mermaid
![Diagrama Lógico](docs/screenshots/logical-diagram.png)

## 🛠️ Tecnologías Utilizadas

### Frontend Core
- **HTML5** - Estructura semántica moderna
- **CSS3** - Diseño avanzado con custom properties y glassmorphism
- **JavaScript ES6+** - Funcionalidades interactivas avanzadas

### Librerías y Frameworks
- **[Mermaid.js v10.9.1](https://mermaid.js.org/)** - Generación de diagramas Crow's Foot
- **[jsPDF v2.5.1](https://github.com/parallax/jsPDF)** - Exportación a PDF
- **[svg2pdf.js v2.2.1](https://github.com/yWorks/svg2pdf.js)** - Conversión SVG a PDF

### Tipografía
- **[Inter](https://rsms.me/inter/)** - Fuente principal optimizada para UI
- **[JetBrains Mono](https://www.jetbrains.com/lp/mono/)** - Fuente monoespaciada para código

### Hosting
- **[GitHub Pages](https://pages.github.com/)** - Hosting estático optimizado

## 🏗️ Arquitectura del Proyecto

```
biblioteca-erd/
├── 📄 index.html                    # Página principal
├── 📄 erd_chen.html                 # Diagrama conceptual Chen
├── 📄 erd_logico_mermaid.html       # Diagrama lógico Crow's Foot
├── 📁 assets/
│   ├── 📁 css/
│   │   └── 🎨 styles.css            # Sistema de diseño principal
│   └── 📁 js/
│       ├── 🧠 main.js               # Funcionalidades principales
│       ├── 🔧 advanced-pan-zoom.js  # Motor de navegación avanzada
│       ├── 📄 pdf-export.js         # Sistema de exportación PDF
│       ├── 🔔 notifications.js      # Sistema de notificaciones
│       ├── ⌨️ keyboard-shortcuts.js  # Atajos de teclado
│       └── 📊 performance-monitor.js # Monitor de rendimiento
├── 📚 docs/                         # Documentación y capturas
└── 📖 README.md                     # Este archivo
```

## ⌨️ Atajos de Teclado

### 🔍 Zoom y Vista
- `Espacio` o `F` - Auto-ajustar vista
- `+` - Acercar zoom
- `-` - Alejar zoom
- `0` o `R` - Restablecer vista

### 🧭 Navegación
- `↑` - Mover hacia arriba
- `↓` - Mover hacia abajo
- `←` - Mover hacia la izquierda
- `→` - Mover hacia la derecha

### 🔧 Acciones
- `Ctrl` + `P` - Exportar a PDF
- `Alt` + `H` - Mostrar/ocultar ayuda
- `Esc` - Cerrar ayuda

### 🖱️ Mouse
- **Arrastrar** - Mover diagrama
- **Rueda** - Zoom in/out
- **Doble clic** - Auto-ajustar

## 🚀 Instalación y Uso

### Método 1: GitHub Pages (Recomendado)
Simplemente visita: https://hannielovera.github.io/biblioteca-erd/

### Método 2: Copia Local
```bash
# Clonar el repositorio
git clone https://github.com/HannielOlvera/biblioteca-erd.git

# Navegar al directorio
cd biblioteca-erd

# Abrir con servidor local (recomendado)
# Opción A: Python
python -m http.server 8000

# Opción B: Node.js
npx serve .

# Opción C: PHP
php -S localhost:8000

# Luego abrir http://localhost:8000
```

### Método 3: Descarga Directa
1. Descargar el archivo ZIP del repositorio
2. Extraer en una carpeta local
3. Abrir `index.html` en cualquier navegador moderno

## 🎨 Personalización

### Cambiar Colores del Tema
Edita las variables CSS en `assets/css/styles.css`:

```css
:root {
  --primary-600: #3b82f6;    /* Color principal */
  --accent: #8b5cf6;         /* Color de acento */
  --bg-start: #667eea;       /* Gradiente inicio */
  --bg-end: #764ba2;         /* Gradiente fin */
}
```

### Modificar Diagramas
- **Chen**: Edita el SVG en `erd_chen.html`
- **Lógico**: Modifica el código Mermaid en `erd_logico_mermaid.html`

### Ajustar Funcionalidades
Configuraciones en cada archivo JavaScript:
- `advanced-pan-zoom.js` - Parámetros de navegación
- `pdf-export.js` - Opciones de exportación
- `notifications.js` - Estilos de notificaciones

## 📊 Modelo de Base de Datos

### Entidades Principales
- **👥 USUARIO** - Estudiantes y profesores
- **📚 LIBRO** - Catálogo de publicaciones
- **📄 EJEMPLAR** - Copias físicas disponibles
- **🔄 PRÉSTAMO** - Transacciones de préstamo
- **👨‍💻 AUTOR** - Escritores de libros
- **🏷️ GÉNERO** - Clasificación temática

### Características del Sistema
- ✅ Gestión completa de usuarios por tipo
- ✅ Control de múltiples ejemplares por libro
- ✅ Sistema de préstamos con fechas automáticas
- ✅ Soporte para múltiples autores por libro
- ✅ Clasificación por géneros literarios
- ✅ Información editorial completa
- ✅ Control geográfico de direcciones

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### 🐛 Reportar Bugs
Usa las [GitHub Issues](https://github.com/HannielOlvera/biblioteca-erd/issues) para reportar problemas.

### 💡 Sugerir Mejoras
¡Comparte tus ideas en las [Discussions](https://github.com/HannielOlvera/biblioteca-erd/discussions)!

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Hanniel Olvera**
- GitHub: [@HannielOlvera](https://github.com/HannielOlvera)
- LinkedIn: [Hanniel Olvera](https://linkedin.com/in/hannielovera)

## 🙏 Agradecimientos

- [Mermaid.js](https://mermaid.js.org/) por la excelente librería de diagramas
- [Inter Font](https://rsms.me/inter/) por la tipografía moderna
- [JetBrains](https://www.jetbrains.com/) por la fuente monoespaciada
- [GitHub Pages](https://pages.github.com/) por el hosting gratuito

## 📈 Estadísticas del Proyecto

- 🌟 **Líneas de Código**: ~2,500+
- 📁 **Archivos**: 12
- 🎨 **Componentes CSS**: 25+
- ⚡ **Funciones JavaScript**: 40+
- 📱 **Responsive Breakpoints**: 3
- ⌨️ **Atajos de Teclado**: 10+

---

<div align="center">

**[⬆️ Volver al inicio](#-sistema-de-biblioteca---diagramas-er-profesionales)**

Hecho con ❤️ para la comunidad de desarrollo

</div>
