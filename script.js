// Konfigurasi
const BASE_URL = "https://image.pollinations.ai/prompt/";
let currentImageUrl = "";

// Mengambil Elemen DOM
const promptInput = document.getElementById('promptInput');
const styleInput = document.getElementById('styleInput');
const ratioInput = document.getElementById('ratioInput');
const enhanceInput = document.getElementById('enhanceInput');
const generateBtn = document.getElementById('generateBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const downloadBtn = document.getElementById('downloadBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

const resultImage = document.getElementById('resultImage');
const loader = document.getElementById('loader');
const placeholder = document.getElementById('placeholder');
const actionButtons = document.getElementById('actionButtons');
const historyContainer = document.getElementById('historyContainer');

// Event Listeners
document.addEventListener('DOMContentLoaded', loadHistory);
generateBtn.addEventListener('click', generateImage);
clearHistoryBtn.addEventListener('click', clearHistory);
downloadBtn.addEventListener('click', downloadImage);
fullscreenBtn.addEventListener('click', () => {
    if (resultImage.src) window.open(resultImage.src, '_blank');
});

// Fungsi Utama Generate
async function generateImage() {
    const promptRaw = promptInput.value.trim();
    
    if (!promptRaw) {
        alert("Harap masukkan deskripsi gambar (Prompt) terlebih dahulu!");
        return;
    }

    // Ubah status UI jadi Loading
    setLoading(true);

    // Siapkan Parameter
    const style = styleInput.value;
    // Menggabungkan style ke dalam prompt agar hasil lebih akurat
    const finalPrompt = style ? `${promptRaw}, ${style}, highly detailed, 8k resolution` : promptRaw;
    const [width, height] = ratioInput.value.split('x');
    const isEnhance = enhanceInput.checked;
    
    // Seed Random agar gambar selalu baru meskipun prompt sama
    const seed = Math.floor(Math.random() * 1000000); 

    // Encode Prompt URL
    const encodedPrompt = encodeURIComponent(finalPrompt);
    
    // Susun URL Final
    const url = `${BASE_URL}${encodedPrompt}?width=${width}&height=${height}&model=flux&quality=hd&enhance=${isEnhance}&nologo=true&private=false&seed=${seed}`;

    currentImageUrl = url;

    // Load Gambar
    resultImage.onload = () => {
        setLoading(false);
        saveToHistory(url);
    };

    resultImage.onerror = () => {
        setLoading(false);
        alert("Gagal membuat gambar. Coba persingkat prompt atau coba lagi nanti.");
    };

    resultImage.src = url;
}

// Fungsi Mengatur Tampilan Loading
function setLoading(isLoading) {
    if (isLoading) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sedang Membuat...';
        loader.style.display = 'block';
        placeholder.style.display = 'none';
        resultImage.style.display = 'none';
        actionButtons.classList.remove('active');
    } else {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-bolt"></i> Generate Image';
        loader.style.display = 'none';
        resultImage.style.display = 'block';
        actionButtons.classList.add('active');
    }
}

// Fungsi Download (Mengatasi masalah CORS/Tab baru)
async function downloadImage() {
    if (!currentImageUrl) return;

    try {
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        const response = await fetch(currentImageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        // Nama file unik berdasarkan waktu
        a.download = `dery-ai-gen-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download HD';
    } catch (error) {
        console.error(error);
        alert("Gagal download otomatis. Silakan 'Klik Kanan > Save Image' pada gambar.");
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download HD';
    }
}

// --- FUNGSI HISTORY ---

function saveToHistory(url) {
    let history = JSON.parse(localStorage.getItem('deryAiHistory')) || [];
    
    // Tambah ke awal array
    history.unshift(url);
    
    // Batasi maks 12 gambar
    if (history.length > 12) history.pop();
    
    localStorage.setItem('deryAiHistory', JSON.stringify(history));
    renderHistory();
}

function loadHistory() {
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('deryAiHistory')) || [];
    historyContainer.innerHTML = '';

    history.forEach(url => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<img src="${url}" loading="lazy" alt="History Item">`;
        
        // Klik history untuk load kembali ke preview utama
        div.onclick = () => {
            setLoading(true);
            currentImageUrl = url;
            resultImage.src = url;
            // Kita tidak perlu trigger saveToHistory lagi saat restore
            resultImage.onload = () => setLoading(false);
        };
        
        historyContainer.appendChild(div);
    });
}

function clearHistory() {
    if(confirm("Yakin ingin menghapus semua riwayat?")) {
        localStorage.removeItem('deryAiHistory');
        renderHistory();
    }
}
