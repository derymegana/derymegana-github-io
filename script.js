// Konfigurasi & State
const BASE_URL = "https://image.pollinations.ai/prompt/";

// Saat halaman dimuat, load history
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
});

// Fungsi Utama Generate
function generateImage() {
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

    // 1. Reset UI ke mode Loading
    loader.style.display = "flex"; // Pastikan flex agar tengah
    loadingText.innerText = "Meracik visual... (5-10 detik)";
    resultImg.style.display = "none";
    placeholder.style.display = "none";
    actionBar.style.display = "none";
    
    // 2. Tentukan Dimensi
    let width, height;
    switch (aspectRatio) {
        case '16:9': width = 1280; height = 720; break;
        case '9:16': width = 720; height = 1280; break; 
        case '4:3': width = 1152; height = 864; break;
        case '21:9': width = 1536; height = 640; break;
        default: width = 1024; height = 1024;
    }

    // 3. Buat Seed Acak
    const seed = Math.floor(Math.random() * 999999);

    // 4. Susun Prompt
    let finalPrompt = promptInput;
    if (style) finalPrompt = `${style} style, ${finalPrompt}`;
    if (enhancePrompt) finalPrompt += ", cinematic lighting, 8k resolution, detailed texture";
    if (qualityBoost) finalPrompt += ", masterpiece, ultra detailed, photorealistic, HDR, sharp focus";

    // 5. Susun URL (Menggunakan encodeURIComponent agar simbol aman)
    const encodedPrompt = encodeURIComponent(finalPrompt);
    // Tambahkan parameter 'nologo=true' dan 'private=true'
    const imageUrl = `${BASE_URL}${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=true&enhance=false`;

    console.log("Loading URL:", imageUrl); // Untuk debugging

    // 6. Trik Loading Gambar Stabil (Direct Source)
    // Kita set src langsung, lalu tunggu event onload
    resultImg.src = imageUrl;

    resultImg.onload = function() {
        // Sukses
        loader.style.display = "none";
        resultImg.style.display = "block";
        actionBar.style.display = "flex";
        seedDisplay.innerText = `Seed: ${seed}`;
        
        // Simpan ke history (URL saja agar ringan)
        saveToHistory(imageUrl, seed);
    };

    resultImg.onerror = function() {
        // Gagal
        loader.style.display = "none";
        placeholder.style.display = "block";
        loadingText.innerText = "Gagal memuat. Server sibuk.";
        alert("Gagal memuat gambar. Server sedang sibuk atau koneksi tidak stabil. Silakan tekan Generate lagi.");
    };
}

// Fungsi Download (Membuka gambar di tab baru untuk disimpan)
function downloadImage() {
    const img = document.getElementById('resultImage');
    if (img.src) {
        // Karena masalah keamanan browser (CORS), cara paling aman di HP adalah membuka link
        // lalu user menekan tahan gambar untuk save.
        const link = document.createElement('a');
        link.href = img.src;
        link.target = "_blank";
        link.download = `dery-ai-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// === FITUR HISTORY (Dioptimalkan) ===

function saveToHistory(imageUrl, seed) {
    let history = JSON.parse(localStorage.getItem('deryAiHistory')) || [];
    
    // Simpan URL saja (bukan base64) agar localStorage tidak penuh
    history.unshift({
        url: imageUrl,
        seed: seed
    });

    if (history.length > 10) history.pop(); // Batasi 10 item

    localStorage.setItem('deryAiHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const historyGrid = document.getElementById('historyGrid');
    const history = JSON.parse(localStorage.getItem('deryAiHistory')) || [];
    
    historyGrid.innerHTML = ""; 

    if (history.length === 0) {
        historyGrid.innerHTML = "<p style='color:#666; width:100%; text-align:center;'>Belum ada riwayat.</p>";
        return;
    }

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        // Menggunakan img tag standard
        div.innerHTML = `<img src="${item.url}" loading="lazy" alt="History">`;
        
        div.onclick = () => {
            const resultImg = document.getElementById('resultImage');
            const actionBar = document.getElementById('actionBar');
            const placeholder = document.getElementById('placeholder');
            const loader = document.getElementById('loader');

            loader.style.display = "none";
            placeholder.style.display = "none";
            resultImg.style.display = "block";
            resultImg.src = item.url;
            actionBar.style.display = "flex";
            document.getElementById('seedDisplay').innerText = `Seed: ${item.seed}`;
            
            document.querySelector('.output-panel').scrollIntoView({ behavior: 'smooth' });
        };
        
        historyGrid.appendChild(div);
    });
}

function clearHistory() {
    if (confirm("Hapus semua riwayat?")) {
        localStorage.removeItem('deryAiHistory');
        loadHistory();
    }
}
