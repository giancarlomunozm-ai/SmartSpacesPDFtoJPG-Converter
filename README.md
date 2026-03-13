# PDF a JPG - Convertidor Online

## 🎯 Descripción del Proyecto

Aplicación web moderna para convertir archivos PDF a imágenes JPG con control total sobre la calidad y resolución de salida. Todo el procesamiento se realiza localmente en el navegador del usuario, garantizando privacidad y seguridad.

## ✨ Características Implementadas

- ✅ **Carga de archivos PDF** mediante drag & drop o selector de archivos
- ✅ **Control de calidad JPG** de 0-100% con slider interactivo
- ✅ **Control de resolución** desde 72 DPI (web) hasta 300 DPI (impresión)
- ✅ **Estimación de tamaño de salida** en tiempo real basada en configuraciones
- ✅ **Conversión página por página** con barra de progreso
- ✅ **Vista previa de imágenes generadas** en grid responsive
- ✅ **Descarga individual** de cada página convertida
- ✅ **Información detallada** de dimensiones y tamaños
- ✅ **Procesamiento local** - ningún archivo se envía al servidor
- ✅ **Interfaz moderna** con Tailwind CSS y animaciones

## 🌐 URLs

- **Desarrollo (Sandbox)**: https://3000-imkosxcdcm9xz1pt3lqd4-8f57ffe2.sandbox.novita.ai
- **GitHub**: (Pendiente de configurar)
- **Producción**: (Pendiente de deploy a Cloudflare Pages)

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Backend**: Hono Framework (Cloudflare Workers)
- **Frontend**: HTML5, JavaScript Vanilla, Tailwind CSS
- **Procesamiento PDF**: pdf-lib (librería client-side)
- **Iconos**: Font Awesome 6.4.0
- **Deployment**: Cloudflare Pages

### Flujo de Datos
1. Usuario carga archivo PDF (drag & drop o file picker)
2. PDF se carga en memoria del navegador usando pdf-lib
3. Se extrae información (número de páginas, dimensiones)
4. Usuario ajusta calidad (10-100%) y resolución (72-300 DPI)
5. Se calcula estimación de tamaño basada en:
   - Dimensiones de página × escala DPI
   - Factor de compresión según calidad
   - Número de páginas
6. Al convertir, cada página se procesa individualmente:
   - Se crea PDF de una sola página
   - Se renderiza a canvas con escala configurada
   - Se convierte a JPEG con calidad especificada
   - Se genera data URL para descarga
7. Imágenes se muestran en grid con preview y botón de descarga

### Estructura de Archivos
```
webapp/
├── src/
│   └── index.tsx          # Aplicación Hono con HTML embebido
├── public/
│   └── static/
│       └── app.js         # Lógica de conversión frontend
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

### Resultado de Imagen
```typescript
interface ImageResult {
  dataUrl: string;        // Data URL de la imagen JPG
  width: number;          // Ancho en píxeles
  height: number;         // Alto en píxeles
  size: number;           // Tamaño estimado en bytes
}
```

## 📖 Guía de Uso

1. **Abrir la aplicación** en tu navegador
2. **Cargar PDF**: 
   - Arrastra el archivo a la zona de carga, o
   - Haz clic en "Seleccionar PDF"
3. **Ajustar configuración**:
   - Mueve el slider de **Calidad** (menor = archivo más pequeño)
   - Mueve el slider de **Resolución** (mayor = mejor detalle)
   - Observa el tamaño estimado en tiempo real
4. **Convertir**:
   - Haz clic en "Convertir a JPG"
   - Espera mientras se procesa cada página
5. **Descargar**:
   - Visualiza las imágenes generadas
   - Descarga las que necesites individualmente

## 🎨 Características de la Interfaz

- **Diseño responsive** - funciona en móviles, tablets y desktop
- **Animaciones suaves** - transiciones y efectos hover
- **Feedback visual** - barra de progreso durante conversión
- **Indicadores claros** - tamaños, dimensiones y páginas
- **Tema moderno** - gradientes azul-índigo

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local con PM2
npm run build
pm2 start ecosystem.config.cjs

# Ver logs
pm2 logs pdf-to-jpg --nostream

# Reiniciar servicio
fuser -k 3000/tcp
pm2 restart pdf-to-jpg

# Build para producción
npm run build

# Deploy a Cloudflare Pages
npm run deploy:prod
```

## 🔮 Próximas Mejoras

- [ ] Soporte para conversión a PNG
- [ ] Descarga masiva (ZIP con todas las páginas)
- [ ] Selección de páginas específicas para convertir
- [ ] Ajuste de brillo/contraste antes de convertir
- [ ] Recorte de márgenes automático
- [ ] Conversión batch de múltiples PDFs
- [ ] Historial de conversiones recientes
- [ ] Modo oscuro

## ⚙️ Estado del Deployment

- **Desarrollo**: ✅ Activo en sandbox
- **GitHub**: ❌ Pendiente de configurar repositorio
- **Cloudflare Pages**: ❌ Pendiente de deploy a producción

## 🛠️ Tecnologías Utilizadas

- **Hono** 4.12.7 - Framework web ultrarrápido
- **pdf-lib** 1.17.1 - Manipulación de PDF en el navegador
- **Tailwind CSS** 3.x - Framework CSS utility-first
- **Font Awesome** 6.4.0 - Iconos vectoriales
- **Vite** 6.3.5 - Build tool y dev server
- **Wrangler** 4.4.0 - CLI de Cloudflare

## 📝 Notas Técnicas

- El procesamiento es 100% client-side usando Web APIs
- No se requiere backend para la conversión
- Compatible con navegadores modernos (Chrome, Firefox, Safari, Edge)
- Límite de tamaño de PDF depende de la memoria del navegador
- La calidad de renderizado puede variar según el navegador

---

**Última actualización**: 2026-03-13  
**Versión**: 1.0.0  
**Estado**: En desarrollo activo
