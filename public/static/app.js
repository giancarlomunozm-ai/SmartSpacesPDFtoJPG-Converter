let currentPDF = null;
let pdfDocument = null;
let pdfJsDocument = null;
let currentQuality = 85;
let currentResolution = 150;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const qualitySlider = document.getElementById('qualitySlider');
    const resolutionSlider = document.getElementById('resolutionSlider');

    // File input handler
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-blue-500', 'bg-blue-200');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('border-blue-500', 'bg-blue-200');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-blue-500', 'bg-blue-200');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            fileInput.files = files;
            handleFileSelect({ target: { files } });
        }
    });

    // Sliders
    qualitySlider.addEventListener('input', (e) => {
        currentQuality = parseInt(e.target.value);
        document.getElementById('qualityValue').textContent = currentQuality;
        updateEstimatedSize();
    });

    resolutionSlider.addEventListener('input', (e) => {
        currentResolution = parseInt(e.target.value);
        document.getElementById('resolutionValue').textContent = currentResolution;
        updateEstimatedSize();
    });
});

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    currentPDF = file;
    
    // Show file info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatBytes(file.size);
    document.getElementById('fileInfo').classList.remove('hidden');
    document.getElementById('uploadArea').classList.add('hidden');

    // Load PDF with both libraries
    try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Load with pdf-lib for info
        pdfDocument = await PDFLib.PDFDocument.load(arrayBuffer);
        
        // Load with pdf.js for rendering
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        pdfJsDocument = await loadingTask.promise;
        
        const pageCount = pdfDocument.getPageCount();
        const firstPage = pdfDocument.getPage(0);
        const { width, height } = firstPage.getSize();

        document.getElementById('pageCount').textContent = `${pageCount} página${pageCount > 1 ? 's' : ''}`;
        document.getElementById('totalPages').textContent = pageCount;
        
        // Show controls
        document.getElementById('controls').classList.remove('hidden');
        document.getElementById('convertSection').classList.remove('hidden');
        
        // Calculate estimated size
        updateEstimatedSize();
    } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Error al cargar el PDF. Asegúrate de que sea un archivo válido.');
        resetUpload();
    }
}

function updateEstimatedSize() {
    if (!pdfDocument) return;

    const pageCount = pdfDocument.getPageCount();
    const firstPage = pdfDocument.getPage(0);
    const { width, height } = firstPage.getSize();

    // Calculate dimensions based on resolution
    const dpi = currentResolution;
    const widthPx = Math.round((width / 72) * dpi);
    const heightPx = Math.round((height / 72) * dpi);

    // Estimate file size (rough calculation)
    // JPG compression varies, but we can estimate based on quality
    const pixelCount = widthPx * heightPx;
    const bytesPerPixel = (currentQuality / 100) * 3; // RGB channels
    const compressionFactor = currentQuality >= 90 ? 0.5 : 
                             currentQuality >= 70 ? 0.3 : 
                             currentQuality >= 50 ? 0.2 : 0.1;
    
    const estimatedSizePerPage = pixelCount * bytesPerPixel * compressionFactor;
    const totalSize = estimatedSizePerPage * pageCount;

    document.getElementById('estimatedSize').textContent = formatBytes(totalSize);
    document.getElementById('estimatedDimensions').textContent = 
        `${widthPx} × ${heightPx} px por página`;
}

async function convertPDF() {
    if (!pdfJsDocument) return;

    const convertBtn = document.getElementById('convertBtn');
    const progressSection = document.getElementById('progressSection');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const results = document.getElementById('results');
    const imageGrid = document.getElementById('imageGrid');

    // Reset results
    imageGrid.innerHTML = '';
    results.classList.add('hidden');
    
    // Show progress
    convertBtn.disabled = true;
    convertBtn.classList.add('opacity-50', 'cursor-not-allowed');
    progressSection.classList.remove('hidden');
    progressBar.style.width = '0%';

    const pageCount = pdfJsDocument.numPages;
    const images = [];

    try {
        for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
            progressText.textContent = `Convirtiendo página ${pageNum} de ${pageCount}...`;
            progressBar.style.width = `${(pageNum / pageCount) * 100}%`;

            // Get page
            const page = await pdfJsDocument.getPage(pageNum);
            
            // Calculate scale based on DPI
            const viewport = page.getViewport({ scale: 1.0 });
            const scale = currentResolution / 72;
            const scaledViewport = page.getViewport({ scale });

            // Create canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;

            // Render PDF page to canvas
            const renderContext = {
                canvasContext: context,
                viewport: scaledViewport
            };
            
            await page.render(renderContext).promise;

            // Convert canvas to JPEG with quality
            const dataUrl = canvas.toDataURL('image/jpeg', currentQuality / 100);
            
            // Calculate actual size
            const base64Length = dataUrl.split(',')[1].length;
            const actualSize = Math.round((base64Length * 3) / 4);

            images.push({
                dataUrl,
                width: canvas.width,
                height: canvas.height,
                size: actualSize,
                pageNum
            });

            // Small delay to update UI
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Show results
        progressSection.classList.add('hidden');
        results.classList.remove('hidden');

        images.forEach((imgData) => {
            const card = createImageCard(imgData);
            imageGrid.appendChild(card);
        });

        // Show download all button
        addDownloadAllButton(images);
        
    } catch (error) {
        console.error('Error converting PDF:', error);
        alert('Error durante la conversión: ' + error.message);
    } finally {
        convertBtn.disabled = false;
        convertBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

function createImageCard(imgData) {
    const card = document.createElement('div');
    card.className = 'bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-blue-400 transition-all';
    
    card.innerHTML = `
        <div class="aspect-[3/4] mb-3 bg-white rounded overflow-hidden flex items-center justify-center">
            <img src="${imgData.dataUrl}" alt="Página ${imgData.pageNum}" class="max-w-full max-h-full object-contain">
        </div>
        <div class="space-y-2">
            <p class="font-semibold text-gray-800">Página ${imgData.pageNum}</p>
            <p class="text-xs text-gray-600">${imgData.width} × ${imgData.height} px</p>
            <p class="text-xs text-gray-600">${formatBytes(imgData.size)}</p>
            <button onclick='downloadImage(\`${imgData.dataUrl}\`, ${imgData.pageNum})' 
                    class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-all">
                <i class="fas fa-download mr-2"></i>
                Descargar
            </button>
        </div>
    `;
    
    return card;
}

function addDownloadAllButton(images) {
    const results = document.getElementById('results');
    
    // Check if button already exists
    if (document.getElementById('downloadAllBtn')) return;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'mt-6';
    buttonContainer.innerHTML = `
        <button id="downloadAllBtn" onclick='downloadAll(${JSON.stringify(images.map(img => ({ dataUrl: img.dataUrl, pageNum: img.pageNum })))})' 
                class="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg">
            <i class="fas fa-download mr-2"></i>
            Descargar Todas las Imágenes (${images.length})
        </button>
    `;
    
    results.appendChild(buttonContainer);
}

function downloadImage(dataUrl, pageNum) {
    const fileName = currentPDF.name.replace('.pdf', '');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName}_pagina_${pageNum}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadAll(images) {
    const fileName = currentPDF.name.replace('.pdf', '');
    
    // Download each image with a small delay
    images.forEach((img, index) => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = img.dataUrl;
            link.download = `${fileName}_pagina_${img.pageNum}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, index * 300); // 300ms delay between downloads
    });
}

function resetUpload() {
    currentPDF = null;
    pdfDocument = null;
    pdfJsDocument = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').classList.add('hidden');
    document.getElementById('controls').classList.add('hidden');
    document.getElementById('convertSection').classList.add('hidden');
    document.getElementById('progressSection').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('uploadArea').classList.remove('hidden');
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
