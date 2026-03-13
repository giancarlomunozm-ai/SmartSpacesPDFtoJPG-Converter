import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { PDFDocument } from 'pdf-lib'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Smart Spaces - PDF Converter</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet">
        <script>
          // Configure PDF.js worker
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        </script>
        <style>
          * {
            font-family: 'Inter', sans-serif;
          }
          .font-serif {
            font-family: 'Cormorant Garamond', serif;
          }
          .luxury-border {
            position: relative;
          }
          .luxury-border::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, #1a1a1a, transparent);
          }
          .slider-luxury::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            background: #1a1a1a;
            cursor: pointer;
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }
          .slider-luxury::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: #1a1a1a;
            cursor: pointer;
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-in {
            animation: fadeIn 0.4s ease-out;
          }
        </style>
    </head>
    <body class="bg-white min-h-screen">
        <!-- Subtle top border -->
        <div class="h-px bg-gradient-to-r from-transparent via-gray-900 to-transparent"></div>
        
        <div class="container mx-auto px-6 py-12 max-w-5xl">
            <!-- Header -->
            <header class="text-center mb-16 fade-in">
                <div class="mb-4">
                    <h1 class="font-serif text-5xl md:text-6xl font-light text-gray-900 mb-2 tracking-wide">
                        Smart Spaces
                    </h1>
                    <div class="flex items-center justify-center gap-3 mb-6">
                        <div class="h-px w-12 bg-gray-300"></div>
                        <p class="text-xs uppercase tracking-[0.3em] text-gray-500 font-light">PDF Converter</p>
                        <div class="h-px w-12 bg-gray-300"></div>
                    </div>
                </div>
                <p class="text-gray-600 text-sm font-light max-w-md mx-auto leading-relaxed">
                    Herramienta de conversión de documentos PDF a imágenes JPG de alta calidad
                </p>
            </header>

            <!-- Main Card -->
            <div class="bg-white border border-gray-200 shadow-sm mb-12">
                <div class="p-8 md:p-12">
                    <!-- Upload Area -->
                    <div id="uploadArea" class="border-2 border-dashed border-gray-300 p-16 text-center hover:border-gray-900 transition-all duration-300 cursor-pointer mb-8">
                        <div class="space-y-4">
                            <div class="w-16 h-16 mx-auto border border-gray-300 flex items-center justify-center">
                                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                </svg>
                            </div>
                            <input type="file" id="fileInput" accept=".pdf" class="hidden">
                            <div>
                                <p class="text-sm text-gray-900 font-light mb-1">Arrastra tu documento aquí</p>
                                <p class="text-xs text-gray-500 font-light">o</p>
                            </div>
                            <button onclick="document.getElementById('fileInput').click()" 
                                    class="inline-block px-8 py-3 text-sm uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-300 font-light">
                                Seleccionar Archivo
                            </button>
                        </div>
                    </div>

                    <!-- File Info -->
                    <div id="fileInfo" class="hidden mb-8 p-6 bg-gray-50 border-l-2 border-gray-900 fade-in">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 border border-gray-300 flex items-center justify-center">
                                    <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <p class="font-light text-gray-900" id="fileName">-</p>
                                    <p class="text-xs text-gray-500 font-light mt-1" id="fileSize">-</p>
                                    <p class="text-xs text-gray-500 font-light" id="pageCount">-</p>
                                </div>
                            </div>
                            <button onclick="resetUpload()" class="text-gray-400 hover:text-gray-900 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Controls -->
                    <div id="controls" class="hidden space-y-8 mb-8 fade-in">
                        <!-- Quality Slider -->
                        <div>
                            <label class="block text-xs uppercase tracking-wider text-gray-700 mb-4 font-light">
                                Calidad <span id="qualityValue" class="text-gray-900 font-normal">85</span>%
                            </label>
                            <input type="range" id="qualitySlider" min="10" max="100" value="85" 
                                   class="slider-luxury w-full h-px bg-gray-300 appearance-none cursor-pointer">
                            <div class="flex justify-between text-xs text-gray-400 mt-2 font-light">
                                <span>Menor</span>
                                <span>Óptimo</span>
                            </div>
                        </div>

                        <!-- Resolution Slider -->
                        <div>
                            <label class="block text-xs uppercase tracking-wider text-gray-700 mb-4 font-light">
                                Resolución <span id="resolutionValue" class="text-gray-900 font-normal">150</span> DPI
                            </label>
                            <input type="range" id="resolutionSlider" min="72" max="300" value="150" step="6"
                                   class="slider-luxury w-full h-px bg-gray-300 appearance-none cursor-pointer">
                            <div class="flex justify-between text-xs text-gray-400 mt-2 font-light">
                                <span>Pantalla</span>
                                <span>Equilibrado</span>
                                <span>Impresión</span>
                            </div>
                        </div>

                        <!-- Estimated Output -->
                        <div class="border-t border-gray-200 pt-6 luxury-border">
                            <div class="flex items-start justify-between">
                                <div>
                                    <p class="text-xs uppercase tracking-wider text-gray-700 mb-2 font-light">
                                        Tamaño Estimado
                                    </p>
                                    <p class="text-2xl font-light text-gray-900" id="estimatedSize">-</p>
                                    <p class="text-xs text-gray-500 mt-1 font-light" id="estimatedDimensions">-</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-xs text-gray-500 font-light">Páginas</p>
                                    <p class="text-3xl font-light text-gray-900" id="totalPages">0</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Convert Button -->
                    <div id="convertSection" class="hidden">
                        <button id="convertBtn" onclick="convertPDF()"
                                class="w-full py-4 text-sm uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 transition-all duration-300 font-light">
                            Convertir Documento
                        </button>
                    </div>

                    <!-- Progress -->
                    <div id="progressSection" class="hidden mt-8 fade-in">
                        <div class="bg-gray-100 h-px overflow-hidden">
                            <div id="progressBar" class="bg-gray-900 h-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                        <p class="text-center text-xs text-gray-500 mt-3 font-light uppercase tracking-wider" id="progressText">Procesando...</p>
                    </div>

                    <!-- Results -->
                    <div id="results" class="hidden mt-12 fade-in">
                        <h3 class="text-xs uppercase tracking-wider text-gray-700 mb-6 font-light border-b border-gray-200 pb-3">
                            Imágenes Generadas
                        </h3>
                        <div id="imageGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
                    </div>
                </div>
            </div>

            <!-- Universal Code Message -->
            <div class="text-center mb-8 fade-in">
                <div class="inline-block border border-gray-200 p-6 bg-gray-50">
                    <p class="text-xs uppercase tracking-[0.3em] text-gray-500 font-light mb-3">
                        Codificación Universal
                    </p>
                    <p class="font-serif text-2xl tracking-wider text-gray-900 mb-4">
                        5 1 9 7 1 4 8 5 2 0
                    </p>
                    <div class="space-y-1">
                        <p class="text-sm text-gray-700 font-light">Te amo</p>
                        <p class="text-sm text-gray-700 font-light">Lo siento</p>
                        <p class="text-sm text-gray-700 font-light">Perdón</p>
                        <p class="text-sm text-gray-700 font-light">Gracias</p>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <footer class="text-center border-t border-gray-200 pt-8">
                <p class="text-xs text-gray-500 font-light mb-2">
                    © 2026 Smart Spaces. Todos los derechos reservados.
                </p>
                <p class="text-xs text-gray-400 font-light">
                    Software propietario de Smart Spaces
                </p>
            </footer>
        </div>
    </body>
    <script src="/static/app.js"></script>
    </html>
  `)
})

// API endpoint to get PDF info
app.post('/api/pdf-info', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('pdf') as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const pageCount = pdfDoc.getPageCount()
    
    // Get first page dimensions
    const firstPage = pdfDoc.getPage(0)
    const { width, height } = firstPage.getSize()

    return c.json({
      pageCount,
      width,
      height,
      fileSize: arrayBuffer.byteLength
    })
  } catch (error) {
    return c.json({ error: 'Error processing PDF: ' + error.message }, 500)
  }
})

export default app
