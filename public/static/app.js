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
        uploadArea.classList.add('border-gray-900');
        uploadArea.classList.remove('border-gray-300');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('border-gray-900');
        uploadArea.classList.add('border-gray-300');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-gray-900');
        uploadArea.classList.add('border-gray-300');
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

    // Check Miro limits (32MP = 8192x4096 max)
    const MAX_WIDTH = 8192;
    const MAX_HEIGHT = 4096;
    const MAX_MEGAPIXELS = 32;
    const currentMegapixels = (widthPx * heightPx) / 1000000;
    
    const exceedsWidth = widthPx > MAX_WIDTH;
    const exceedsHeight = heightPx > MAX_HEIGHT;
    const exceedsMegapixels = currentMegapixels > MAX_MEGAPIXELS;

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

    // Show or hide warning
    let warningEl = document.getElementById('miroWarning');
    
    if (exceedsWidth || exceedsHeight || exceedsMegapixels) {
        if (!warningEl) {
            warningEl = document.createElement('div');
            warningEl.id = 'miroWarning';
            warningEl.className = 'mt-4 p-4 border border-red-200 bg-red-50 fade-in';
            document.getElementById('controls').appendChild(warningEl);
        }
        
        let warningMessage = '';
        if (exceedsWidth || exceedsHeight) {
            warningMessage = `<p class="text-xs text-red-700 font-light mb-2">
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <strong>Advertencia:</strong> Las dimensiones exceden el límite de Miro (8192×4096 px)
            </p>`;
        } else if (exceedsMegapixels) {
            warningMessage = `<p class="text-xs text-red-700 font-light mb-2">
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <strong>Advertencia:</strong> La imagen excede 32MP (límite de Miro)
            </p>`;
        }
        
        warningMessage += `<p class="text-xs text-red-600 font-light mb-2">
            Actual: ${widthPx}×${heightPx} px (${currentMegapixels.toFixed(1)} MP)
        </p>`;
        warningMessage += `<p class="text-xs text-gray-600 font-light">
            Reduce la resolución para cumplir con el límite de 32MP (8192×4096 px)
        </p>`;
        
        warningEl.innerHTML = warningMessage;
        warningEl.classList.remove('hidden');
    } else if (warningEl) {
        warningEl.classList.add('hidden');
    }
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
            progressText.textContent = `Procesando página ${pageNum} de ${pageCount}...`;
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

            // Add Smart Spaces watermark (subtle, luxury style)
            addSmartSpacesWatermark(context, canvas.width, canvas.height);

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

function addSmartSpacesWatermark(ctx, width, height) {
    // Save context state
    ctx.save();
    
    // Add very subtle watermark at bottom right corner
    // Subtle enough to be almost invisible but present in metadata
    ctx.font = '9px Inter, sans-serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; // Very subtle opacity
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    
    const padding = 15;
    const text = 'Smart Spaces';
    ctx.fillText(text, width - padding, height - padding);
    
    // Add universal code (extremely subtle - metadata level)
    ctx.font = '7px Inter, sans-serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Almost invisible
    ctx.fillText('5197148520', width - padding, height - padding - 12);
    
    // Add spiritual message (invisible - only in metadata)
    ctx.font = '6px Inter, sans-serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'; // Invisible to naked eye
    ctx.fillText('Te amo Lo siento Perdón Gracias', width - padding, height - padding - 22);
    
    // Restore context state
    ctx.restore();
}

function createImageCard(imgData) {
    const card = document.createElement('div');
    card.className = 'border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 fade-in';
    
    card.innerHTML = `
        <div class="aspect-[3/4] bg-gray-50 flex items-center justify-center overflow-hidden">
            <img src="${imgData.dataUrl}" alt="Página ${imgData.pageNum}" class="max-w-full max-h-full object-contain">
        </div>
        <div class="p-4 space-y-3 border-t border-gray-100">
            <div>
                <p class="text-xs text-gray-900 font-light">Página ${imgData.pageNum}</p>
                <p class="text-xs text-gray-500 font-light mt-1">${imgData.width} × ${imgData.height} px</p>
                <p class="text-xs text-gray-500 font-light">${formatBytes(imgData.size)}</p>
            </div>
            <button onclick='downloadImage(\`${imgData.dataUrl}\`, ${imgData.pageNum})' 
                    class="w-full py-2 text-xs uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-300 font-light">
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
    buttonContainer.className = 'mt-8 pt-8 border-t border-gray-200';
    buttonContainer.innerHTML = `
        <button id="downloadAllBtn" onclick='downloadAll(${JSON.stringify(images.map(img => ({ dataUrl: img.dataUrl, pageNum: img.pageNum })))})' 
                class="w-full py-4 text-sm uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 transition-all duration-300 font-light">
            Descargar Todas (${images.length})
        </button>
    `;
    
    results.appendChild(buttonContainer);
}

function downloadImage(dataUrl, pageNum) {
    const fileName = currentPDF.name.replace('.pdf', '');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName}_pagina_${pageNum}_SmartSpaces.jpg`;
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
            link.download = `${fileName}_pagina_${img.pageNum}_SmartSpaces.jpg`;
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
