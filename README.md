# Smart Spaces - PDF Converter

## 🎯 Descripción del Proyecto

Aplicación web de conversión de documentos PDF a imágenes JPG de alta calidad. Diseño minimalista, monocromático y luxury que refleja la excelencia y sofisticación de Smart Spaces.

**Software Propietario de Smart Spaces** - Todos los derechos reservados.

## ✨ Características Implementadas

- ✅ **Diseño minimalista luxury** con tipografías Cormorant Garamond e Inter
- ✅ **Paleta monocromática** en escala de grises con detalles elegantes
- ✅ **Carga de archivos PDF** mediante drag & drop elegante
- ✅ **Control de calidad JPG** de 10-100% con slider minimalista
- ✅ **Control de resolución** desde 72 DPI hasta 300 DPI
- ✅ **Estimación de tamaño de salida** en tiempo real
- ✅ **Advertencia de límites de Miro** (32MP/8192×4096 px) automática
- ✅ **Conversión página por página** con barra de progreso discreta
- ✅ **Vista previa de imágenes** en grid responsive con bordes sutiles
- ✅ **Marca de agua Smart Spaces** integrada sutilmente en cada imagen
- ✅ **Metadatos ocultos** en cada JPG generado:
  - Codificación universal: 5197148520
  - Mensaje espiritual: "Te amo, Lo siento, Perdón y Gracias"
  - Marca Smart Spaces (casi invisible al ojo humano)
- ✅ **Descarga individual o masiva** de todas las páginas
- ✅ **Procesamiento 100% local** - máxima privacidad

## 🌐 URLs

- **🚀 Producción**: https://pdf2jpg-smart.pages.dev
- **🔗 GitHub Repository**: https://github.com/giancarlomunozm-ai/SmartSpacesPDFtoJPG-Converter
- **🔧 Desarrollo (Sandbox)**: https://3000-imkosxcdcm9xz1pt3lqd4-8f57ffe2.sandbox.novita.ai
- **💾 Backup Final**: https://www.genspark.ai/api/files/s/2vr08ROx

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Backend**: Hono Framework (Cloudflare Workers)
- **Frontend**: HTML5, JavaScript Vanilla
- **Estilos**: Tailwind CSS + CSS personalizado
- **Tipografías**: Cormorant Garamond (serif luxury) + Inter (sans-serif moderna)
- **Procesamiento PDF**: pdf-lib + pdf.js (Mozilla)
- **Deployment**: Cloudflare Pages

### Diseño Visual
- **Paleta de colores**: Escala de grises (#FFFFFF → #1A1A1A)
- **Tipografía principal**: Inter (weights: 100-700)
- **Tipografía display**: Cormorant Garamond (serif elegante)
- **Estilo**: Minimalista, espacios amplios, líneas delgadas
- **Elementos**: Bordes sutiles, sombras suaves, transiciones elegantes

### Flujo de Datos
1. Usuario carga archivo PDF (drag & drop luxury)
2. PDF se carga en memoria usando pdf-lib y pdf.js
3. Se extrae información (páginas, dimensiones)
4. Usuario ajusta calidad (10-100%) y resolución (72-300 DPI)
5. Estimación de tamaño en tiempo real
6. Al convertir:
   - Cada página se renderiza en canvas con pdf.js
   - Se aplica marca de agua Smart Spaces (sutil, esquina inferior)
   - Se agrega codificación universal: 5 1 9 7 1 4 8 5 2 0
   - Se convierte a JPEG con calidad especificada
   - Se genera data URL con metadatos
7. Imágenes se muestran en grid minimalista
8. Descarga individual o masiva con branding Smart Spaces

### Estructura de Archivos
```
webapp/
├── src/
│   └── index.tsx          # Aplicación Hono con HTML luxury
├── public/
│   └── static/
│       └── app.js         # Lógica de conversión con watermark
├── ecosystem.config.cjs   # Configuración PM2
├── package.json           # Dependencias
└── wrangler.jsonc         # Config Cloudflare
```

## 📊 Modelos de Datos

### Información de PDF
```typescript
interface PDFInfo {
  pageCount: number;      // Número de páginas
  width: number;          // Ancho en puntos (72 DPI)
  height: number;         // Alto en puntos (72 DPI)
  fileSize: number;       // Tamaño del archivo PDF
}
```

### Configuración de Conversión
```typescript
interface ConversionSettings {
  quality: number;        // 10-100 (%)
  resolution: number;     // 72-300 (DPI)
}
```

### Resultado de Imagen con Metadatos Ocultos
```typescript
interface ImageResult {
  dataUrl: string;        // Data URL con imagen JPG
  width: number;          // Ancho en píxeles
  height: number;         // Alto en píxeles
  size: number;           // Tamaño en bytes
  // Metadatos invisibles embebidos en la imagen:
  watermark: 'Smart Spaces';     // Opacity 8% - casi invisible
  universalCode: '5197148520';   // Opacity 5% - nivel metadatos
  spiritualMessage: 'Te amo Lo siento Perdón Gracias'; // Opacity 3%
}
```

## 📖 Guía de Uso

1. **Abrir la aplicación** - interfaz minimalista se carga
2. **Cargar PDF**: 
   - Arrastra el archivo a la zona elegante, o
   - Haz clic en "Seleccionar Archivo"
3. **Ajustar configuración**:
   - Slider de **Calidad** (10-100%)
   - Slider de **Resolución** (72-300 DPI)
   - Observa estimación en tiempo real
   - ⚠️ Si excedes 32MP o 8192×4096 px, verás advertencia de límite de Miro
4. **Convertir**:
   - Clic en "Convertir Documento"
   - Barra de progreso minimalista
5. **Descargar**:
   - Preview de todas las imágenes
   - Descarga individual o todas juntas
   - Archivos nombrados: `nombre_pagina_X_SmartSpaces.jpg`

## 🎨 Elementos de Diseño Luxury

- **Espaciado amplio** - respiración visual
- **Bordes sutiles** - 1px, colores suaves
- **Transiciones suaves** - 300ms duration
- **Hover effects** - cambios delicados
- **Tipografía jerárquica** - tamaños bien definidos
- **Tracking wider** - espaciado entre letras
- **Mayúsculas selectivas** - para labels y botones
- **Sombras mínimas** - solo en hover
- **Gradientes lineales** - líneas decorativas

## ⚠️ Sistema de Advertencias

### Límites de Miro
La aplicación detecta automáticamente cuando las dimensiones estimadas exceden los límites de Miro:

**Límites Máximos**:
- 📏 **Ancho**: 8192 píxeles
- 📏 **Alto**: 4096 píxeles  
- 🖼️ **Megapíxeles**: 32 MP (8192×4096)

**Advertencia Automática**:
- Se muestra en **tiempo real** mientras ajustas la resolución
- Aparece con **borde rojo** y fondo sutil
- Muestra dimensiones actuales vs. límites
- Sugiere reducir resolución para cumplir límites
- Desaparece automáticamente cuando estás dentro de los límites

**Ejemplo de Advertencia**:
```
⚠️ Advertencia: Las dimensiones exceden el límite de Miro (8192×4096 px)
Actual: 10240×7680 px (78.6 MP)
Reduce la resolución para cumplir con el límite de 32MP (8192×4096 px)
```

**Recomendaciones**:
- Para documentos A4: Usa 150 DPI (seguro para Miro)
- Para documentos grandes: Usa 72-120 DPI
- Para impresión: Usa 300 DPI solo si es necesario (puede exceder límites)

## 🔐 Branding Smart Spaces

### Marca de Agua (Invisible al Ojo Humano)
- **Ubicación**: Esquina inferior derecha
- **Capas de información embebida**:
  1. "Smart Spaces" (opacity 8%, 9px) - Apenas visible
  2. "5197148520" (opacity 5%, 7px) - Nivel metadatos
  3. "Te amo Lo siento Perdón Gracias" (opacity 3%, 6px) - Invisible
- **Propósito**: Identificación digital sin interferir visualmente
- **Detección**: Requiere análisis digital o zoom extremo

### Filosofía de Metadatos Ocultos
Los metadatos están diseñados para ser **invisibles al ojo humano** pero presentes digitalmente:
- ✅ **No interfieren** con el contenido visual
- ✅ **Mantienen limpieza** estética del documento
- ✅ **Identifican autoría** de Smart Spaces a nivel digital
- ✅ **Contienen codificación** universal y mensaje espiritual
- ✅ **Preservan profesionalismo** del documento convertido

### Nombres de Archivo
- **Formato**: `documento_pagina_X_SmartSpaces.jpg`
- **Ejemplo**: `invoice_pagina_1_SmartSpaces.jpg`
- **Identificación**: Clara propiedad de Smart Spaces en el nombre

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Build del proyecto
npm run build

# Desarrollo local con PM2
pm2 start ecosystem.config.cjs

# Ver logs
pm2 logs pdf-to-jpg --nostream

# Reiniciar servicio
fuser -k 3000/tcp
pm2 restart pdf-to-jpg

# Deploy a Cloudflare Pages
npm run deploy:prod
```

## 🚀 Deploy Automático desde GitHub

**Cloudflare Pages** está configurado para deploy automático:
- ✅ Cada push a `main` → Deploy automático
- ✅ URL de producción: https://pdf2jpg-smart.pages.dev
- ✅ Preview URLs para cada commit
- ✅ Rollback instantáneo a versiones anteriores

**Para hacer deploy manual:**
```bash
npm run build
npx wrangler pages deploy dist --project-name pdf2jpg-smart
```

## 🔮 Próximas Mejoras

- [ ] Conversión a PNG con transparencia
- [ ] Descarga en formato ZIP
- [ ] Selección de páginas específicas
- [ ] Ajustes de brillo/contraste
- [ ] Recorte automático de márgenes
- [ ] Batch conversion de múltiples PDFs
- [ ] Modo oscuro (dark luxury)
- [ ] Animaciones de entrada más elaboradas
- [ ] Preview en tiempo real

## ⚙️ Estado del Deployment

- **Desarrollo**: ✅ Activo en sandbox con diseño luxury
- **GitHub**: ✅ Código subido a https://github.com/giancarlomunozm-ai/SmartSpacesPDFtoJPG-Converter
- **Cloudflare Pages**: ✅ DESPLEGADO en https://pdf2jpg-smart.pages.dev
- **Branding**: ✅ Smart Spaces integrado completamente
- **Sistema de Advertencias**: ✅ Límites de Miro implementados

## 🛠️ Tecnologías Utilizadas

- **Hono** 4.12.7 - Framework web ultrarrápido
- **pdf-lib** 1.17.1 - Manipulación de PDF
- **pdf.js** 3.11.174 - Renderizado profesional
- **Tailwind CSS** 3.x - Utility-first CSS
- **Google Fonts** - Cormorant Garamond + Inter
- **Vite** 6.3.5 - Build tool moderno
- **Wrangler** 4.4.0 - CLI de Cloudflare

## 📝 Notas de Diseño

### Filosofía Visual
El diseño refleja la excelencia de Smart Spaces a través de:
- Simplicidad elegante
- Espacios bien pensados
- Jerarquía visual clara
- Interacciones refinadas
- Detalles sutiles que hacen la diferencia

### Inspiración
- Diseño editorial de alta gama
- Arquitectura minimalista
- Luxury branding internacional
- Interfaces de productos premium

---

**© 2026 Smart Spaces. Todos los derechos reservados.**  
**Software Propietario de Smart Spaces**

**Metadatos Embebidos** (Invisibles al ojo humano):
- Codificación Universal: 5197148520
- Mensaje Espiritual: Te amo, Lo siento, Perdón y Gracias
- Marca de Agua: Smart Spaces

**Última actualización**: 2026-03-13  
**Versión**: 2.2.0 (Luxury Edition - Con Advertencias de Límites Miro)  
**Estado**: Diseño premium con identificación digital invisible + Sistema de advertencias
