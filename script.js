// Konfigurasi & State
const BASE_URL = "https://image.pollinations.ai/prompt/";
let currentBlobUrl = null;

// Saat halaman dimuat, load history
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
});

// Fungsi Utama Generate
async function generateImage() {
    const promptInput = document.getElementById('promptInput').value.trim();
    const model = document.getElementById('modelSelect').value;
    const style = document.getElementById('styleSelect').value;
    const aspectRatio = document.getElementById('aspectRatio').value;
    const enhancePrompt = document.getElementById('enhancePrompt').checked;
    const qualityBoost = document.getElementById('qualityBoost').checked;

    const loader = document.getElementById('loader');
    const resultImg = document.getElementById('resultImage');
    const placeholder = document.getElementById('placeholder');
    const actionBar = document.getElementById('actionBar');
    const seedDisplay = document.getElementById('seedDisplay');
    const loadingText = document.getElementById('loadingText');

    if (!promptInput) {
        alert("Mohon isi deskripsi gambar (Prompt) terlebih dahulu!");
        return;
    }

    // Reset UI
    loader.style.display = "block";
    resultImg.style.display = "none";
    placeholder.style.display = "none";
    actionBar.style.display = "none";
    
    // Tentukan Resolusi
    let width, height;
    switch (aspectRatio) {
        case '16:9': width = 1280; height = 720; break;
        case '9:16': width = 720; height = 1280; break; // Terbaik untuk HP
        case '4:3': width = 1152; height = 864; break;
        case '21:9': width = 1536; height = 640; break;
        default: width = 1024; height = 1024; // 1:1
    }

    // Generate Seed Random
    const seed = Math.floor(Math.random() * 999999);

    // Prompt Engineering
    let finalPrompt = promptInput;
    if (style) finalPrompt = `${style} style, ${finalPrompt}`;
    if (enhancePrompt) finalPrompt += ", detailed lighting, cinematic composition, trending on artstation";
    if (qualityBoost) finalPrompt += ", ultra detailed, high resolution 8k, Masterpiece Maximalisme, HDR, sharp focus";

    // Update Text Loading
    loadingText.innerText = "Sedang meracik pixel... (Tunggu sebentar)";

    // URL Construction
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const url = `${BASE_URL}${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=true&enhance=true&private=false&quality=hd`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Gagal mengambil gambar");

        const blob = await response.blob();
        currentBlobUrl = URL.createObjectURL(blob);

        // Tampilkan Hasil
        resultImg.src = currentBlobUrl;
        resultImg.onload = () => {
            loader.style.display = "none";
            resultImg.style.display = "block";
            actionBar.style.display = "flex";
            seedDisplay.innerText = `Seed: ${seed}`;
            
            // Simpan ke History otomatis
            saveToHistory(currentBlobUrl, seed);
        };

    } catch (error) {
        console.error(error);
        loader.style.display = "none";
        placeholder.style.display = "block";
        alert("Terjadi kesalahan koneksi atau server sibuk. Coba lagi.");
    }
}

// Fungsi Download
function downloadImage() {
    if (!currentBlobUrl) return;
    
    const a = document.createElement('a');
    a.href = currentBlobUrl;
    a.download = `dery-ai-gen-${Date.now()}.png`; // Format PNG
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// === FITUR HISTORY ===

function saveToHistory(imageUrl, seed) {
    // Ambil data lama
    let history = JSON.parse(localStorage.getItem('deryAiHistory')) || [];
    
    // Convert blob URL ke Base64 agar bisa disimpan di LocalStorage (terbatas size)
    // Catatan: Untuk produksi skala besar, Base64 di LS tidak disarankan, tapi untuk tool simple ini oke.
    // Kita gunakan teknik canvas untuk convert gambar yang sudah load ke base64
    const img = document.getElementById('resultImage');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    try {
        const base64Data = canvas.toDataURL('image/png');
        
        // Simpan object baru di awal array
        history.unshift({
            image: base64Data,
            seed: seed,
            timestamp: new Date().getTime()
        });

        // Batasi history maksimal 12 gambar agar browser tidak berat
        if (history.length > 12) history.pop();

        localStorage.setItem('deryAiHistory', JSON.stringify(history));
        loadHistory(); // Refresh tampilan

    } catch (e) {
        console.warn("Storage penuh, gagal simpan history", e);
    }
}

function loadHistory() {
    const historyGrid = document.getElementById('historyGrid');
    const history = JSON.parse(localStorage.getItem('deryAiHistory')) || [];
    
    historyGrid.innerHTML = ""; // Bersihkan dulu

    if (history.length === 0) {
        historyGrid.innerHTML = "<p style='color:#666; grid-column: 1/-1; text-align:center;'>Belum ada riwayat.</p>";
        return;
    }

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<img src="${item.image}" alt="History ${item.seed}">`;
        
        // Klik history untuk menampilkan ulang di main preview
        div.onclick = () => {
            const resultImg = document.getElementById('resultImage');
            const actionBar = document.getElementById('actionBar');
            const placeholder = document.getElementById('placeholder');
            
            resultImg.src = item.image;
            resultImg.style.display = "block";
            placeholder.style.display = "none";
            actionBar.style.display = "flex";
            
            // Re-create blob url untuk download button agar jalan
            fetch(item.image).then(res => res.blob()).then(blob => {
                currentBlobUrl = URL.createObjectURL(blob);
            });
            
            document.getElementById('seedDisplay').innerText = `Seed: ${item.seed}`;
            
            // Scroll ke atas (Mobile user experience)
            document.querySelector('.output-panel').scrollIntoView({ behavior: 'smooth' });
        };
        
        historyGrid.appendChild(div);
    });
}

function clearHistory() {
    if (confirm("Hapus semua riwayat gambar?")) {
        localStorage.removeItem('deryAiHistory');
        loadHistory();
    }
}
