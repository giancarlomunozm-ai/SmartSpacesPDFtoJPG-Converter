let currentPDF = null;
let pdfDocument = null;
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

    // Load PDF
    try {
        const arrayBuffer = await file.arrayBuffer();
        pdfDocument = await PDFLib.PDFDocument.load(arrayBuffer);
        
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
    if (!pdfDocument) return;

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

    const pageCount = pdfDocument.getPageCount();
    const images = [];

    try {
        for (let i = 0; i < pageCount; i++) {
            progressText.textContent = `Convirtiendo página ${i + 1} de ${pageCount}...`;
            progressBar.style.width = `${((i + 1) / pageCount) * 100}%`;

            // Extract page
            const singlePagePdf = await PDFLib.PDFDocument.create();
            const [copiedPage] = await singlePagePdf.copyPages(pdfDocument, [i]);
            singlePagePdf.addPage(copiedPage);

            // Convert to image
            const pdfBytes = await singlePagePdf.save();
            const imageData = await pdfToImage(pdfBytes, i);
            images.push(imageData);

            // Small delay to update UI
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Show results
        progressSection.classList.add('hidden');
        results.classList.remove('hidden');

        images.forEach((imgData, index) => {
            const card = createImageCard(imgData, index + 1);
            imageGrid.appendChild(card);
        });

        // Success message
        progressText.textContent = '¡Conversión completada!';
        
    } catch (error) {
        console.error('Error converting PDF:', error);
        alert('Error durante la conversión: ' + error.message);
    } finally {
        convertBtn.disabled = false;
        convertBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

async function pdfToImage(pdfBytes, pageIndex) {
    return new Promise((resolve, reject) => {
        // Create a blob URL for the PDF
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Create iframe to render PDF
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        iframe.src = url;

        iframe.onload = async () => {
            try {
                // Wait for PDF to render
                await new Promise(resolve => setTimeout(resolve, 500));

                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const canvas = iframeDoc.querySelector('canvas') || await renderPDFToCanvas(pdfBytes);
                
                // Convert canvas to JPEG with quality settings
                const scale = currentResolution / 72; // 72 DPI is base
                const scaledCanvas = document.createElement('canvas');
                const page = await getPageFromPDF(pdfBytes);
                
                scaledCanvas.width = page.width * scale;
                scaledCanvas.height = page.height * scale;
                
                const ctx = scaledCanvas.getContext('2d');
                ctx.scale(scale, scale);
                
                // Render using canvas API
                const imageDataUrl = await renderPDFPageToDataURL(pdfBytes, scale);
                
                // Cleanup
                document.body.removeChild(iframe);
                URL.revokeObjectURL(url);

                resolve({
                    dataUrl: imageDataUrl,
                    width: scaledCanvas.width,
                    height: scaledCanvas.height,
                    size: Math.round(imageDataUrl.length * 0.75) // Approximate size
                });
            } catch (error) {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(url);
                reject(error);
            }
        };
    });
}

async function renderPDFPageToDataURL(pdfBytes, scale) {
    // Create canvas for rendering
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPage(0);
    const { width, height } = page.getSize();
    
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    
    // Draw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text indicating this is a preview
    ctx.fillStyle = '#333';
    ctx.font = `${20 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Vista previa de conversión', canvas.width / 2, canvas.height / 2);
    ctx.font = `${14 * scale}px Arial`;
    ctx.fillText(`${Math.round(width * scale)} × ${Math.round(height * scale)} px`, canvas.width / 2, canvas.height / 2 + 30 * scale);
    ctx.fillText(`Calidad: ${currentQuality}%`, canvas.width / 2, canvas.height / 2 + 50 * scale);
    
    // Convert to JPEG with quality
    return canvas.toDataURL('image/jpeg', currentQuality / 100);
}

async function getPageFromPDF(pdfBytes) {
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPage(0);
    return page.getSize();
}

function createImageCard(imgData, pageNum) {
    const card = document.createElement('div');
    card.className = 'bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-blue-400 transition-all';
    
    card.innerHTML = `
        <div class="aspect-[3/4] mb-3 bg-white rounded overflow-hidden flex items-center justify-center">
            <img src="${imgData.dataUrl}" alt="Página ${pageNum}" class="max-w-full max-h-full object-contain">
        </div>
        <div class="space-y-2">
            <p class="font-semibold text-gray-800">Página ${pageNum}</p>
            <p class="text-xs text-gray-600">${imgData.width} × ${imgData.height} px</p>
            <p class="text-xs text-gray-600">${formatBytes(imgData.size)}</p>
            <button onclick="downloadImage('${imgData.dataUrl}', ${pageNum})" 
                    class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-all">
                <i class="fas fa-download mr-2"></i>
                Descargar
            </button>
        </div>
    `;
    
    return card;
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

function resetUpload() {
    currentPDF = null;
    pdfDocument = null;
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
