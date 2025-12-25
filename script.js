// CONFIG
const BASE_URL = "https://image.pollinations.ai/prompt/";
let currentImageUrl = ""; // Menyimpan URL gambar saat ini

// Load history saat web dibuka
window.onload = loadHistory;

function startGenerate() {
    const prompt = document.getElementById('promptInput').value.trim();
    if (!prompt) return alert("Isi deskripsi gambar dulu!");

    // UI ELEMENTS
    const loader = document.getElementById('loader');
    const resultImg = document.getElementById('resultImage');
    const placeholder = document.getElementById('placeholder');
    const btns = document.getElementById('actionButtons');
    
    // INPUT VALUES
    const model = document.getElementById('modelSelect').value;
    const ratio = document.getElementById('aspectRatio').value;
    const enhance = document.getElementById('enhancePrompt').checked;
    const quality = document.getElementById('qualityBoost').checked;

    // 1. Tentukan Ukuran (Resolusi Aman)
    let w = 1024, h = 1024;
    if (ratio === "16:9") { w = 1280; h = 720; }
    else if (ratio === "9:16") { w = 720; h = 1280; }

    // 2. Buat Prompt Final
    let finalPrompt = prompt;
    if (quality) finalPrompt += ", ultra detailed, 8k resolution, masterpiece, sharp focus";
    if (enhance) finalPrompt += ", cinematic lighting, vivid colors";

    // 3. Buat Seed Acak
    const seed = Math.floor(Math.random() * 1000000);

    // 4. SUSUN URL (Encode wajib ada!)
    // Kita tambah parameter 'nologo=true' dan 'private=true'
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const url = `${BASE_URL}${encodedPrompt}?width=${w}&height=${h}&model=${model}&seed=${seed}&nologo=true&enhance=false`;

    currentImageUrl = url;

    // 5. PROSES LOADING GAMBAR
    // Reset Tampilan
    loader.style.display = "flex";
    placeholder.style.display = "none";
    resultImg.style.display = "none";
    btns.style.display = "none";

    // Teknik Pre-loading Image
    const imgLoader = new Image();
    imgLoader.src = url;

    // Jika BERHASIL
    imgLoader.onload = function() {
        loader.style.display = "none";
        resultImg.src = url;
        resultImg.style.display = "block";
        btns.style.display = "flex";
        document.getElementById('seedInfo').innerText = `Seed: ${seed}`;
        
        // Simpan ke History
        saveHistory(url);
    };

    // Jika GAGAL (Timeout / Error Server)
    imgLoader.onerror = function() {
        loader.style.display = "none";
        placeholder.style.display = "block";
        alert("Gagal memuat gambar. Server sedang sibuk, coba tekan Generate lagi.");
    };
}

// FUNGSI DOWNLOAD (Smart Fallback)
async function forceDownload() {
    if (!currentImageUrl) return;

    try {
        // Coba fetch blob (cara ideal)
        const response = await fetch(currentImageUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `DERY-AI-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        // Jika fetch gagal (karena CORS di HP), buka tab baru
        console.log("Download otomatis gagal, membuka tab baru...");
        window.open(currentImageUrl, '_blank');
    }
}

// MANAJEMEN HISTORY
function saveHistory(url) {
    let history = JSON.parse(localStorage.getItem('deryHistory')) || [];
    // Cek duplikasi
    if (!history.includes(url)) {
        history.unshift(url);
        if (history.length > 8) history.pop(); // Simpan max 8
        localStorage.setItem('deryHistory', JSON.stringify(history));
        loadHistory();
    }
}

function loadHistory() {
    const grid = document.getElementById('historyGrid');
    const history = JSON.parse(localStorage.getItem('deryHistory')) || [];
    
    grid.innerHTML = "";
    history.forEach(url => {
        const div = document.createElement('div');
        div.className = 'hist-item';
        div.innerHTML = `<img src="${url}" loading="lazy">`;
        div.onclick = () => {
            // Restore gambar
            document.getElementById('resultImage').src = url;
            document.getElementById('resultImage').style.display = "block";
            document.getElementById('placeholder').style.display = "none";
            document.getElementById('actionButtons').style.display = "flex";
            currentImageUrl = url;
        };
        grid.appendChild(div);
    });
}

function clearHistory() {
    if(confirm("Hapus semua riwayat?")) {
        localStorage.removeItem('deryHistory');
        loadHistory();
    }
}
