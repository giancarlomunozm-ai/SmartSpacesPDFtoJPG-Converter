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
        <title>PDF a JPG - Convertidor Online</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <script>
          // Configure PDF.js worker
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        </script>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-gray-800 mb-2">
                    <i class="fas fa-file-pdf text-red-500 mr-2"></i>
                    PDF a JPG
                </h1>
                <p class="text-gray-600">Convierte tus archivos PDF a imágenes JPG con control total</p>
            </div>

            <!-- Main Card -->
            <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                <!-- Upload Area -->
                <div id="uploadArea" class="border-3 border-dashed border-blue-300 rounded-xl p-12 text-center bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer mb-6">
                    <i class="fas fa-cloud-upload-alt text-6xl text-blue-500 mb-4"></i>
                    <p class="text-xl font-semibold text-gray-700 mb-2">Arrastra tu PDF aquí</p>
                    <p class="text-gray-500 mb-4">o haz clic para seleccionar</p>
                    <input type="file" id="fileInput" accept=".pdf" class="hidden">
                    <button onclick="document.getElementById('fileInput').click()" 
                            class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-all">
                        Seleccionar PDF
                    </button>
                </div>

                <!-- File Info -->
                <div id="fileInfo" class="hidden mb-6 p-4 bg-gray-50 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-file-pdf text-red-500 text-2xl"></i>
                            <div>
                                <p class="font-semibold text-gray-800" id="fileName">-</p>
                                <p class="text-sm text-gray-600" id="fileSize">-</p>
                                <p class="text-sm text-gray-600" id="pageCount">-</p>
                            </div>
                        </div>
                        <button onclick="resetUpload()" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Controls -->
                <div id="controls" class="hidden space-y-6 mb-6">
                    <!-- Quality Slider -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            <i class="fas fa-sliders-h mr-2"></i>
                            Calidad JPG: <span id="qualityValue" class="text-blue-600">85</span>%
                        </label>
                        <input type="range" id="qualitySlider" min="10" max="100" value="85" 
                               class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                        <div class="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Menor tamaño</span>
                            <span>Mejor calidad</span>
                        </div>
                    </div>

                    <!-- Resolution Slider -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            <i class="fas fa-expand-arrows-alt mr-2"></i>
                            Resolución: <span id="resolutionValue" class="text-blue-600">150</span> DPI
                        </label>
                        <input type="range" id="resolutionSlider" min="72" max="300" value="150" step="6"
                               class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                        <div class="flex justify-between text-xs text-gray-500 mt-1">
                            <span>72 DPI (web)</span>
                            <span>150 DPI</span>
                            <span>300 DPI (print)</span>
                        </div>
                    </div>

                    <!-- Estimated Output -->
                    <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-gray-700 mb-1">
                                    <i class="fas fa-info-circle text-purple-500 mr-2"></i>
                                    Tamaño Estimado de Salida
                                </p>
                                <p class="text-2xl font-bold text-purple-600" id="estimatedSize">-</p>
                                <p class="text-xs text-gray-600 mt-1" id="estimatedDimensions">-</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-gray-600">Páginas</p>
                                <p class="text-3xl font-bold text-gray-800" id="totalPages">0</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Convert Button -->
                <div id="convertSection" class="hidden">
                    <button id="convertBtn" onclick="convertPDF()"
                            class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg">
                        <i class="fas fa-magic mr-2"></i>
                        Convertir a JPG
                    </button>
                </div>

                <!-- Progress -->
                <div id="progressSection" class="hidden mt-6">
                    <div class="bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div id="progressBar" class="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300" style="width: 0%"></div>
                    </div>
                    <p class="text-center text-sm text-gray-600 mt-2" id="progressText">Procesando...</p>
                </div>

                <!-- Results -->
                <div id="results" class="hidden mt-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-images mr-2 text-green-500"></i>
                        Imágenes Generadas
                    </h3>
                    <div id="imageGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
                </div>
            </div>

            <!-- Features -->
            <div class="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white p-6 rounded-xl shadow-lg text-center">
                    <i class="fas fa-tachometer-alt text-4xl text-blue-500 mb-3"></i>
                    <h3 class="font-bold text-gray-800 mb-2">Rápido</h3>
                    <p class="text-sm text-gray-600">Procesamiento en tu navegador</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-lg text-center">
                    <i class="fas fa-shield-alt text-4xl text-green-500 mb-3"></i>
                    <h3 class="font-bold text-gray-800 mb-2">Seguro</h3>
                    <p class="text-sm text-gray-600">Tus archivos no salen de tu dispositivo</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-lg text-center">
                    <i class="fas fa-cog text-4xl text-purple-500 mb-3"></i>
                    <h3 class="font-bold text-gray-800 mb-2">Personalizable</h3>
                    <p class="text-sm text-gray-600">Control total sobre calidad y resolución</p>
                </div>
            </div>
        </div>

        <script src="/static/app.js"></script>
    </body>
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
