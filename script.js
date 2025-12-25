// KONFIGURASI
const BASE_URL = "https://image.pollinations.ai/prompt/";
let currentRawImage = null; // Menyimpan gambar mentah (tanpa watermark) untuk diedit ulang

// Load History
window.onload = loadHistory;

// 1. FUNGSI UTAMA GENERATE
function startGenerate() {
    const prompt = document.getElementById('promptInput').value.trim();
    if (!prompt) return alert("Silakan isi prompt dulu!");

    // UI Reset
    const loader = document.getElementById('loader');
    const placeholder = document.getElementById('placeholder');
    const canvas = document.getElementById('resultCanvas');
    const btns = document.getElementById('actionButtons');
    
    loader.style.display = "flex";
    placeholder.style.display = "none";
    canvas.style.display = "none";
    btns.style.display = "none";

    // PARAMETER INPUT
    const model = document.getElementById('modelSelect').value;
    const ratio = document.getElementById('aspectRatio').value;
    const style = document.getElementById('styleSelect').value;
    const color = document.getElementById('colorSelect').value;
    const comp = document.getElementById('compSelect').value;
    const enhance = document.getElementById('enhancePrompt').checked;
    const quality = document.getElementById('qualityBoost').checked;

    // DIMENSI (ASPEK RASIO LENGKAP)
    let w = 1024, h = 1024;
    if (ratio === "16:9") { w = 1280; h = 720; }
    else if (ratio === "9:16") { w = 720; h = 1280; }
    else if (ratio === "4:5") { w = 864; h = 1080; }
    else if (ratio === "3:4") { w = 864; h = 1152; }
    else if (ratio === "21:9") { w = 1536; h = 640; }

    // PROMPT ENGINEERING (GABUNG SEMUA FITUR)
    let finalPrompt = prompt;
    if (style) finalPrompt += `, ${style} art style`;
    if (color) finalPrompt += `, ${color}`;
    if (comp) finalPrompt += `, ${comp}`;
    if (quality) finalPrompt += ", masterpiece, best quality, ultra detailed, 8k resolution, HDR";
    if (enhance) finalPrompt += ", cinematic lighting, sharp focus, intricate texture";

    // SEED & URL
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(finalPrompt);
    
    // URL Konstruksi
    const url = `${BASE_URL}${encodedPrompt}?width=${w}&height=${h}&model=${model}&seed=${seed}&nologo=true&enhance=false`;

    // PROSES GAMBAR (LOAD KE MEMORI DULU)
    const imgObj = new Image();
    imgObj.crossOrigin = "Anonymous"; // PENTING: Agar bisa diedit di canvas
    imgObj.src = url;

    imgObj.onload = function() {
        currentRawImage = imgObj; // Simpan di variabel global
        drawCanvas(); // Panggil fungsi gambar ke kanvas
        
        loader.style.display = "none";
        canvas.style.display = "block";
        btns.style.display = "flex";
        document.getElementById('seedInfo').innerText = `Seed: ${seed}`;
        
        // Simpan URL mentah ke history
        saveHistory(url);
    };

    imgObj.onerror = function() {
        loader.style.display = "none";
        placeholder.style.display = "block";
        alert("Gagal memuat gambar. Coba ganti Model atau periksa koneksi.");
    };
}

// 2. FUNGSI WATERMARK & CANVAS (REAL-TIME)
function drawCanvas() {
    if (!currentRawImage) return;

    const canvas = document.getElementById('resultCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set ukuran canvas sama dengan gambar asli
    canvas.width = currentRawImage.width;
    canvas.height = currentRawImage.height;

    // A. Gambar Foto AI
    ctx.drawImage(currentRawImage, 0, 0);

    // B. Ambil Settingan Watermark
    const text = document.getElementById('wmText').value;
    
    if (text.trim() !== "") {
        const size = document.getElementById('wmSize').value;
        const opacity = document.getElementById('wmOpacity').value;
        const color = document.getElementById('wmColor').value;
        const pos = document.getElementById('wmPosition').value;

        // Setup Font
        const fontSize = (canvas.width * size) / 1000; // Skala font responsif terhadap lebar gambar
        ctx.font = `bold ${fontSize + 20}px 'Poppins', sans-serif`;
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        
        // Setup Posisi (X, Y)
        let x, y;
        const padding = 40;

        if (pos === "bottom-right") {
            ctx.textAlign = "right";
            x = canvas.width - padding;
            y = canvas.height - padding;
        } else if (pos === "bottom-left") {
            ctx.textAlign = "left";
            x = padding;
            y = canvas.height - padding;
        } else if (pos === "top-right") {
            ctx.textAlign = "right";
            x = canvas.width - padding;
            y = padding + fontSize;
        } else if (pos === "top-left") {
            ctx.textAlign = "left";
            x = padding;
            y = padding + fontSize;
        } else { // Center
            x = canvas.width / 2;
            y = canvas.height / 2;
        }

        // Gambar Teks Shadow (agar terbaca di background terang/gelap)
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 4;
        ctx.fillText(text, x, y);
    }
}

// Fungsi Trigger Update saat slider digeser
function updateWatermarkPreview() {
    if (currentRawImage) {
        requestAnimationFrame(drawCanvas);
    }
}

// 3. FUNGSI DOWNLOAD (HASIL CANVAS)
function downloadCanvas() {
    const canvas = document.getElementById('resultCanvas');
    if (canvas.style.display === "none") return;

    const link = document.createElement('a');
    link.download = `DERY-ART-${Date.now()}.png`;
    // Mengubah isi canvas menjadi file PNG
    link.href = canvas.toDataURL("image/png", 1.0); 
    link.click();
}

// 4. HISTORY SYSTEM
function saveHistory(url) {
    let history = JSON.parse(localStorage.getItem('deryProHistory')) || [];
    if (!history.includes(url)) {
        history.unshift(url);
        if (history.length > 12) history.pop();
        localStorage.setItem('deryProHistory', JSON.stringify(history));
        loadHistory();
    }
}

function loadHistory() {
    const grid = document.getElementById('historyGrid');
    const history = JSON.parse(localStorage.getItem('deryProHistory')) || [];
    
    grid.innerHTML = "";
    if (history.length === 0) grid.innerHTML = "<p style='color:#555; font-size:0.8rem;'>Belum ada riwayat.</p>";

    history.forEach(url => {
        const div = document.createElement('div');
        div.className = 'hist-item';
        div.innerHTML = `<img src="${url}" loading="lazy">`;
        div.onclick = () => {
            // Load ulang gambar ke canvas editor
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = url;
            img.onload = () => {
                currentRawImage = img;
                drawCanvas();
                document.getElementById('resultCanvas').style.display = "block";
                document.getElementById('placeholder').style.display = "none";
                document.getElementById('actionButtons').style.display = "flex";
                document.getElementById('loader').style.display = "none";
            };
        };
        grid.appendChild(div);
    });
}

function clearHistory() {
    if (confirm("Hapus semua riwayat?")) {
        localStorage.removeItem('deryProHistory');
        loadHistory();
    }
}
