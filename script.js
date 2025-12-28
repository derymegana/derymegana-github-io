// --- Configuration ---
const BASE_URL = "https://image.pollinations.ai/prompt/";
const HISTORY_KEY = "dery_ai_v3_history";
const LOAD_TIMEOUT_MS = 30000; // Batas waktu loading 30 detik

// --- DOM Elements ---
const els = {
    prompt: document.getElementById('promptInput'),
    model: document.getElementById('modelSelect'),
    style: document.getElementById('styleSelect'),
    ratio: document.getElementById('ratioSelect'),
    quality: document.getElementById('qualitySelect'),
    enhance: document.getElementById('enhanceToggle'),
    btn: document.getElementById('generateBtn'),
    btnText: document.querySelector('#generateBtn .btn-text'),
    img: document.getElementById('resultImage'),
    loader: document.getElementById('loader'),
    loadingText: document.getElementById('loadingText'),
    empty: document.getElementById('emptyState'),
    actions: document.getElementById('imageActions'),
    history: document.getElementById('historyList'),
    imageFrame: document.getElementById('imageFrame')
};

// --- Loading Messages ---
const loadingMessages = [
    "Inisialisasi Core AI...",
    "Mengakses Neural Network...",
    "Merender Piksel...",
    "Menerapkan Gaya...",
    "Finalisasi Gambar...",
    "Hampir Selesai!"
];

let loadingInterval, timeoutTimer;

// --- Core Functions ---

function generateImage() {
    const promptVal = els.prompt.value.trim();
    if (!promptVal) {
        els.prompt.focus();
        // Efek getar sederhana jika kosong
        els.prompt.style.borderColor = 'red';
        setTimeout(() => els.prompt.style.borderColor = 'var(--border)', 500);
        return;
    }

    setLoading(true);

    // === Logic: Speed vs Quality ===
    const isFastMode = els.quality.value === 'fast';
    const [width, height] = els.ratio.value.split('x');
    // Seed acak untuk variasi
    const seed = Math.floor(Math.random() * 1000000);
    
    // Construct Prompt
    let finalPrompt = promptVal;
    if (els.style.value) finalPrompt += `, ${els.style.value}`;
    
    // Construct URL Params
    const params = new URLSearchParams({
        width: width,
        height: height,
        seed: seed,
        nologo: 'true', // Hasil bersih
        enhance: els.enhance.checked // Auto enhance prompt
    });

    // === OPTIMALISASI TURBO ===
    if (isFastMode) {
        // Paksa model turbo & hapus parameter quality untuk kecepatan maks
        params.set('model', 'turbo'); 
        params.delete('quality');
    } else {
        // Mode HD: Gunakan model pilihan & paksa kualitas HD
        params.set('model', els.model.value);
        params.set('quality', 'hd');
    }

    const url = `${BASE_URL}${encodeURIComponent(finalPrompt)}?${params.toString()}`;
    
    // Pre-load image untuk menangkap event onload/onerror
    const tempImg = new Image();
    tempImg.onload = () => {
        clearTimeout(timeoutTimer);
        els.img.src = url; // Set src ke elemen img asli setelah berhasil diload di memori
        els.img.dataset.prompt = promptVal;
        setLoading(false);
        saveHistory(url, promptVal);
    };
    tempImg.onerror = () => {
        clearTimeout(timeoutTimer);
        handle Error("Gagal memuat gambar. Server mungkin sibuk.");
    };

    // Mulai memuat & set timeout
    tempImg.src = url;
    timeoutTimer = setTimeout(() => {
        tempImg.src = ""; // Batalkan request
        handleError("Waktu habis! Coba mode 'Turbo' atau coba lagi nanti.");
    }, LOAD_TIMEOUT_MS);
}

function handleError(msg) {
    setLoading(false);
    alert(msg);
    els.empty.style.display = 'flex';
    els.empty.innerHTML = `<i class="fas fa-exclamation-triangle" style="color:red"></i><p>${msg}</p>`;
    els.img.style.display = 'none';
}

// --- UI Helpers ---

function setLoading(state) {
    if (state) {
        els.loader.style.display = 'flex';
        els.empty.style.display = 'none';
        els.img.style.display = 'none';
        els.actions.style.display = 'none';
        els.btn.disabled = true;
        els.btnText.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> MEMPROSES...';
        
        // Scroll ke preview di mobile agar terlihat prosesnya
        if (window.innerWidth <= 768) {
            els.imageFrame.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Cycle loading text lebih cepat
        let msgIndex = 0;
        els.loadingText.innerText = loadingMessages[0];
        loadingInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % loadingMessages.length;
            els.loadingText.innerText = loadingMessages[msgIndex];
        }, 800); // Ubah teks setiap 0.8 detik
        
    } else {
        clearInterval(loadingInterval);
        clearTimeout(timeoutTimer);
        els.loader.style.display = 'none';
        els.img.style.display = 'block';
        els.actions.style.display = 'flex';
        els.btn.disabled = false;
        els.btnText.innerHTML = 'GENERATE <i class="fas fa-rocket"></i>';
    }
}

// --- Features (Download & Copy) ---

async function downloadImage() {
    if (!els.img.src) return;
    try {
        const response = await fetch(els.img.src);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DERY-AI-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (e) {
        // Fallback: buka di tab baru jika fetch gagal (CORS dll)
        window.open(els.img.src, '_blank');
    }
}

function copyPrompt() {
    const promptText = els.img.dataset.prompt || els.prompt.value;
    if (!promptText) return;
    navigator.clipboard.writeText(promptText);
    const btn = document.querySelector('.action-btn.copy');
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
    btn.style.borderColor = 'var(--primary)';
    setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.style.borderColor = 'var(--border)';
    }, 2000);
}

// --- History System ---

function saveHistory(url, prompt) {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    // Hindari duplikat di paling atas
    if (history.length > 0 && history[0].url === url) return;
    
    history.unshift({ url, prompt });
    if (history.length > 15) history.pop(); // Batasi 15 item
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    els.history.innerHTML = '';
    
    if (history.length === 0) {
        els.history.innerHTML = '<span style="color:var(--text-muted); font-size:0.8rem;">Belum ada riwayat.</span>';
        return;
    }

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<img src="${item.url}" loading="lazy" alt="history">`;
        div.onclick = () => {
            els.img.src = item.url;
            els.img.dataset.prompt = item.prompt; // Simpan prompt asli
            els.prompt.value = item.prompt;
            els.empty.style.display = 'none';
            els.img.style.display = 'block';
            els.actions.style.display = 'flex';
            // Scroll ke preview di mobile
            if (window.innerWidth <= 768) {
                els.imageFrame.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };
        els.history.appendChild(div);
    });
}

function clearHistory() {
    if(confirm("Hapus semua riwayat gambar?")) {
        localStorage.removeItem(HISTORY_KEY);
        renderHistory();
    }
}

// Init
renderHistory();
// Set default ke Turbo untuk kecepatan
els.quality.value = 'fast';
els.model.value = 'turbo';
