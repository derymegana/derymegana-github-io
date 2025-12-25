// === KONFIGURASI ===
const BASE_URL = "https://image.pollinations.ai/prompt/";
let currentImage = null; // Menyimpan objek gambar asli

// Init
window.onload = () => {
    setupAccordion();
    loadHistory();
};

// 1. LOGIKA ACCORDION (MENU LIPAT)
function setupAccordion() {
    const acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }
}

// 2. FUNGSI GENERATE (DENGAN SMART LOADING)
function startGenerate() {
    const prompt = document.getElementById('promptInput').value.trim();
    if (!prompt) return alert("Prompt tidak boleh kosong!");

    // UI Reset
    const loader = document.getElementById('loader');
    const loadingText = document.getElementById('loadingText');
    const placeholder = document.getElementById('placeholder');
    const canvas = document.getElementById('resultCanvas');
    const actions = document.getElementById('actionArea');
    
    // Tampilkan Loader
    loader.style.display = "flex";
    placeholder.style.display = "none";
    canvas.style.display = "none";
    actions.style.display = "none";
    
    // Rotasi Teks Loading (Agar user tidak bosan menunggu 5-15 detik)
    const messages = [
        "Menghubungi Neural Network...",
        "Meracik Komposisi...",
        "Rendering Tekstur 8K...",
        "Menerapkan Efek Cahaya...",
        "Sedikit lagi..."
    ];
    let msgIndex = 0;
    loadingText.innerText = messages[0];
    const msgInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        loadingText.innerText = messages[msgIndex];
    }, 2500);

    // Ambil Parameter
    const model = document.getElementById('modelSelect').value;
    const ratio = document.getElementById('aspectRatio').value;
    const style = document.getElementById('styleSelect').value;
    const color = document.getElementById('colorSelect').value;
    const enhance = document.getElementById('enhancePrompt').checked;
    const quality = document.getElementById('qualityBoost').checked;

    // Dimensi
    let w = 1024, h = 1024;
    if (ratio === '9:16') { w = 720; h = 1280; }
    else if (ratio === '16:9') { w = 1280; h = 720; }
    else if (ratio === '4:5') { w = 864; h = 1080; }

    // Prompt Engineering
    let fullPrompt = prompt;
    if (style) fullPrompt += `, ${style} style`;
    if (color) fullPrompt += `, ${color}`;
    if (quality) fullPrompt += ", masterpiece, best quality, ultra detailed, 8k resolution, HDR, sharp focus";
    if (enhance) fullPrompt += ", cinematic lighting, intricate details";

    // Seed Random
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(fullPrompt);
    
    // URL Final
    const url = `${BASE_URL}${encodedPrompt}?width=${w}&height=${h}&model=${model}&seed=${seed}&nologo=true&enhance=false`;

    // Load Image
    const img = new Image();
    img.crossOrigin = "Anonymous"; // PENTING untuk Canvas
    img.src = url;

    img.onload = () => {
        clearInterval(msgInterval); // Stop teks loading
        currentImage = img;
        
        loader.style.display = "none";
        canvas.style.display = "block";
        actions.style.display = "flex";
        document.getElementById('seedBadge').innerText = `Seed: ${seed}`;
        
        // Render Canvas + Watermark
        updateWatermark();
        saveHistory(url);
    };

    img.onerror = () => {
        clearInterval(msgInterval);
        loader.style.display = "none";
        placeholder.style.display = "block";
        alert("Gagal memuat. Server sibuk atau koneksi timeout. Coba model 'Turbo' untuk kecepatan.");
    };
}

// 3. FUNGSI WATERMARK & CANVAS RENDERING
function updateWatermark() {
    if (!currentImage) return;

    const canvas = document.getElementById('resultCanvas');
    const ctx = canvas.getContext('2d');
    
    // Resize canvas sesuai gambar
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;

    // 1. Gambar Foto AI
    ctx.drawImage(currentImage, 0, 0);

    // 2. Gambar Watermark
    const text = document.getElementById('wmText').value;
    if (text) {
        const size = document.getElementById('wmSize').value;
        const opacity = document.getElementById('wmOpacity').value;
        const color = document.getElementById('wmColor').value;
        const pos = document.getElementById('wmPosition').value;

        // Font Scalable
        const fontSize = (canvas.width * size) / 800; 
        ctx.font = `bold ${fontSize + 10}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        
        // Shadow agar teks terbaca
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        let x, y;
        const pad = canvas.width * 0.05; // padding 5%

        if (pos === 'center') {
            ctx.textAlign = 'center';
            x = canvas.width / 2;
            y = canvas.height / 2;
        } else if (pos.includes('right')) {
            ctx.textAlign = 'right';
            x = canvas.width - pad;
        } else {
            ctx.textAlign = 'left';
            x = pad;
        }

        if (pos.includes('bottom')) {
            y = canvas.height - pad;
        } else if (pos.includes('top')) {
            y = pad + fontSize;
        } else if (pos === 'center') {
            // y sudah diset di atas
        }
        
        ctx.fillText(text, x, y);
    }
}

// 4. DOWNLOAD & HISTORY
function downloadImage() {
    const canvas = document.getElementById('resultCanvas');
    const link = document.createElement('a');
    link.download = `DERY-AI-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
}

function saveHistory(url) {
    let history = JSON.parse(localStorage.getItem('deryHistoryV3')) || [];
    if (!history.includes(url)) {
        history.unshift(url);
        if (history.length > 8) history.pop();
        localStorage.setItem('deryHistoryV3', JSON.stringify(history));
        loadHistory();
    }
}

function loadHistory() {
    const grid = document.getElementById('historyGrid');
    const history = JSON.parse(localStorage.getItem('deryHistoryV3')) || [];
    
    grid.innerHTML = "";
    history.forEach(url => {
        const div = document.createElement('div');
        div.className = 'hist-item';
        div.innerHTML = `<img src="${url}" loading="lazy">`;
        div.onclick = () => {
            // Reload Image to Editor
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = url;
            img.onload = () => {
                currentImage = img;
                document.getElementById('loader').style.display = "none";
                document.getElementById('placeholder').style.display = "none";
                document.getElementById('resultCanvas').style.display = "block";
                document.getElementById('actionArea').style.display = "flex";
                updateWatermark();
            };
        };
        grid.appendChild(div);
    });
}

function clearHistory() {
    if(confirm("Hapus semua riwayat?")) {
        localStorage.removeItem('deryHistoryV3');
        loadHistory();
    }
}
