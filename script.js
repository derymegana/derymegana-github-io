// Konfigurasi dasar
const baseUrl = "https://image.pollinations.ai/prompt/";
const historyKey = "dery_ai_history";

// Mendapatkan elemen DOM
const promptInput = document.getElementById('promptInput');
const modelSelect = document.getElementById('modelSelect');
const styleSelect = document.getElementById('styleSelect');
const ratioSelect = document.getElementById('ratioSelect');
const seedInput = document.getElementById('seedInput');
const enhanceToggle = document.getElementById('enhanceToggle');
const generateBtn = document.getElementById('generateBtn');

const resultImage = document.getElementById('resultImage');
const placeholder = document.querySelector('.placeholder');
const loading = document.getElementById('loading');
const actionButtons = document.getElementById('actionButtons');
const historyList = document.getElementById('historyList');

// Fungsi Utama Generate
function generateImage() {
    const rawPrompt = promptInput.value.trim();
    
    if (!rawPrompt) {
        alert("Mohon isi deskripsi gambar (Prompt) terlebih dahulu!");
        return;
    }

    // UI Loading State
    toggleLoading(true);

    // Persiapan Parameter
    const style = styleSelect.value;
    const model = modelSelect.value;
    // Menggabungkan style ke prompt jika ada
    const finalPrompt = style ? `${rawPrompt}, ${style}` : rawPrompt;
    
    const [width, height] = ratioSelect.value.split('x');
    const seed = seedInput.value || Math.floor(Math.random() * 999999);
    const enhance = enhanceToggle.checked;

    // Membangun URL
    // Parameter private=false & nologo=true agar hasil bersih
    const imageUrl = `${baseUrl}${encodeURIComponent(finalPrompt)}?width=${width}&height=${height}&model=${model}&seed=${seed}&enhance=${enhance}&nologo=true&quality=hd`;

    // Memuat Gambar
    resultImage.onload = () => {
        toggleLoading(false);
        saveToHistory(imageUrl, rawPrompt);
    };

    resultImage.onerror = () => {
        toggleLoading(false);
        alert("Gagal memuat gambar. Coba prompt lain atau model berbeda.");
        showPlaceholder();
    };

    resultImage.src = imageUrl;
}

// Helper: Toggle Tampilan Loading
function toggleLoading(isLoading) {
    if (isLoading) {
        placeholder.style.display = 'none';
        resultImage.style.display = 'none';
        actionButtons.style.display = 'none';
        loading.style.display = 'block';
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    } else {
        loading.style.display = 'none';
        resultImage.style.display = 'block';
        actionButtons.style.display = 'flex';
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> GENERATE ART';
    }
}

function showPlaceholder() {
    placeholder.style.display = 'block';
    resultImage.style.display = 'none';
    actionButtons.style.display = 'none';
}

// Fitur Download
async function downloadImage() {
    const imageUrl = resultImage.src;
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Penamaan file unik
        a.download = `DERY-AI-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Gagal download:", err);
        // Fallback buka di tab baru jika fetch gagal (misal masalah CORS)
        window.open(imageUrl, '_blank');
    }
}

// --- History Management ---

function saveToHistory(url, prompt) {
    let history = JSON.parse(localStorage.getItem(historyKey)) || [];
    // Simpan data baru di awal array
    history.unshift({ url, prompt });
    
    // Batasi max 12 item
    if (history.length > 12) history.pop();
    
    localStorage.setItem(historyKey, JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem(historyKey)) || [];
    historyList.innerHTML = '';

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.title = item.prompt; // Tooltip prompt
        
        const img = document.createElement('img');
        img.src = item.url;
        img.loading = "lazy";
        
        // Klik history untuk load kembali ke main view
        div.onclick = () => {
            resultImage.src = item.url;
            resultImage.style.display = 'block';
            placeholder.style.display = 'none';
            actionButtons.style.display = 'flex';
            promptInput.value = item.prompt;
        };

        div.appendChild(img);
        historyList.appendChild(div);
    });
}

function clearHistory() {
    if(confirm("Hapus semua riwayat gambar?")) {
        localStorage.removeItem(historyKey);
        renderHistory();
    }
}

// Inisialisasi saat load
window.addEventListener('DOMContentLoaded', () => {
    renderHistory();
});
