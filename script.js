// --- Configuration ---
const BASE_URL = "https://image.pollinations.ai/prompt/";
const HISTORY_KEY = "dery_ai_v2_history";

// --- DOM Elements ---
const els = {
    prompt: document.getElementById('promptInput'),
    model: document.getElementById('modelSelect'),
    style: document.getElementById('styleSelect'),
    ratio: document.getElementById('ratioSelect'),
    quality: document.getElementById('qualitySelect'),
    seed: document.getElementById('seedInput'),
    enhance: document.getElementById('enhanceToggle'),
    btn: document.getElementById('generateBtn'),
    img: document.getElementById('resultImage'),
    loader: document.getElementById('loader'),
    loadingText: document.getElementById('loadingText'),
    empty: document.getElementById('emptyState'),
    actions: document.getElementById('imageActions'),
    history: document.getElementById('historyList')
};

// --- Loading Messages to keep user interested ---
const loadingMessages = [
    "Menghubungkan ke Neural Network...",
    "Meracik Pixel Digital...",
    "Menerapkan Style Artistik...",
    "Rendering High Resolution...",
    "Hampir Selesai...",
    "Mewujudkan Imajinasi..."
];

let loadingInterval;

// --- Core Functions ---

function generateImage() {
    const promptVal = els.prompt.value.trim();
    if (!promptVal) {
        shakeElement(els.prompt);
        return;
    }

    setLoading(true);

    // Logic: Speed vs Quality
    const isFastMode = els.quality.value === 'fast';
    const [width, height] = els.ratio.value.split('x');
    const seed = els.seed.value || Math.floor(Math.random() * 1000000);
    
    // Construct Prompt
    let finalPrompt = promptVal;
    if (els.style.value) finalPrompt += `, ${els.style.value}`;
    
    // Construct URL Params
    const params = new URLSearchParams({
        width: width,
        height: height,
        seed: seed,
        nologo: 'true',
        enhance: els.enhance.checked // Auto enhance prompt
    });

    // Special Handling for Turbo/Quality
    if (isFastMode) {
        params.append('model', 'turbo'); // Force fast model
        // No 'quality' param for speed
    } else {
        params.append('model', els.model.value); // Use selected model
        params.append('quality', 'hd'); // Force HD
    }

    const url = `${BASE_URL}${encodeURIComponent(finalPrompt)}?${params.toString()}`;
    
    // Set Image Source
    els.img.src = url;
    
    // Save metadata for history
    els.img.dataset.prompt = promptVal; 
}

function onImageLoad() {
    setLoading(false);
    saveHistory(els.img.src, els.img.dataset.prompt);
}

function onImageError() {
    setLoading(false);
    alert("Gagal memuat gambar. Server sedang sibuk, coba 'Speed Mode' atau coba lagi nanti.");
    els.empty.style.display = 'block';
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
        els.btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESSING...';
        
        // Cycle loading text
        let msgIndex = 0;
        els.loadingText.innerText = loadingMessages[0];
        loadingInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % loadingMessages.length;
            els.loadingText.innerText = loadingMessages[msgIndex];
        }, 1500);
        
    } else {
        clearInterval(loadingInterval);
        els.loader.style.display = 'none';
        els.img.style.display = 'block';
        els.actions.style.display = 'flex';
        els.btn.disabled = false;
        els.btn.innerHTML = '<span class="btn-content">GENERATE <i class="fas fa-arrow-right"></i></span>';
    }
}

function shakeElement(element) {
    element.style.borderColor = '#ef4444';
    element.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(0)' }
    ], { duration: 300 });
    setTimeout(() => element.style.borderColor = 'var(--border)', 1000);
}

// --- Features ---

async function downloadImage() {
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
    } catch (e) {
        window.open(els.img.src, '_blank');
    }
}

function copyPrompt() {
    navigator.clipboard.writeText(els.prompt.value);
    const btn = document.querySelector('.action-btn.copy');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied';
    setTimeout(() => btn.innerHTML = original, 2000);
}

// --- History System ---

function saveHistory(url, prompt) {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    // Avoid duplicates at the top
    if (history.length > 0 && history[0].url === url) return;
    
    history.unshift({ url, prompt });
    if (history.length > 20) history.pop(); // Max 20 items
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    els.history.innerHTML = '';
    
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<img src="${item.url}" loading="lazy">`;
        div.onclick = () => {
            els.img.src = item.url;
            els.prompt.value = item.prompt;
            els.empty.style.display = 'none';
            els.img.style.display = 'block';
            els.actions.style.display = 'flex';
        };
        els.history.appendChild(div);
    });
}

function clearHistory() {
    if(confirm("Hapus semua history?")) {
        localStorage.removeItem(HISTORY_KEY);
        renderHistory();
    }
}

// Init
renderHistory();
