/* --- CONFIGURATION --- */
const BASE_URL = "https://image.pollinations.ai/prompt/";
let currentImageUrl = "";

// KAMUS STYLE & QUALITY BOOSTERS
// Ini adalah "bumbu rahasia" untuk membuat gambar menjadi ultra detail
const styles = {
    photorealistic: "photorealistic, shot on 70mm lens, depth of field, 8k textures, raytracing, highly detailed",
    cinematic: "cinematic lighting, movie scene, imax quality, color graded, dramatic atmosphere, ultra wide shot",
    anime: "anime style, studio ghibli, makoto shinkai, cgsociety, detailed lines, vibrant colors, 4k",
    cyberpunk: "cyberpunk, neon lights, futuristic city, chrome reflections, high contrast, blade runner vibe",
    dark_fantasy: "dark fantasy, gothic atmosphere, mysterious, volumetric fog, eldritch, hyperdetailed",
    digital_art: "digital painting, artstation trends, concept art, sharp focus, masterpiece, smooth composition",
    vintage: "vintage aesthetic, retro photography, film grain, polaroid style, nostalgic, 1980s",
    "3d_render": "unreal engine 5 render, octane render, 3d masterpiece, physcially based rendering, 8k"
};

const qualityBoosters = {
    standard: "",
    high: "high quality, sharp details, hd, 4k",
    extreme: "masterpiece, best quality, ultra detailed, 8k resolution, hdr, intricate details, professional photography, perfect composition, no blur"
};

/* --- DOM ELEMENTS --- */
const els = {
    prompt: document.getElementById('promptInput'),
    style: document.getElementById('styleInput'),
    ratio: document.getElementById('ratioInput'),
    quality: document.getElementById('qualityInput'),
    enhance: document.getElementById('enhanceInput'),
    btnGenerate: document.getElementById('generateBtn'),
    btnClear: document.getElementById('clearHistoryBtn'),
    btnDownload: document.getElementById('downloadBtn'),
    btnFullscreen: document.getElementById('fullscreenBtn'),
    img: document.getElementById('resultImage'),
    loader: document.getElementById('loader'),
    placeholder: document.getElementById('placeholder'),
    actions: document.getElementById('actionButtons'),
    history: document.getElementById('historyContainer')
};

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', loadHistory);
els.btnGenerate.addEventListener('click', generateImage);
els.btnClear.addEventListener('click', clearHistory);
els.btnDownload.addEventListener('click', downloadImage);
els.btnFullscreen.addEventListener('click', () => {
    if (els.img.src) window.open(els.img.src, '_blank');
});

// Helper untuk Toggle Checkbox dari div container
window.toggleCheckbox = (id) => {
    const cb = document.getElementById(id);
    cb.checked = !cb.checked;
}

/* --- CORE LOGIC --- */
async function generateImage() {
    const userPrompt = els.prompt.value.trim();
    
    if (!userPrompt) {
        alert("⚠️ Masukkan deskripsi gambar terlebih dahulu!");
        els.prompt.focus();
        return;
    }

    setLoading(true);

    // 1. Ambil Parameter
    const styleKey = els.style.value;
    const qualityKey = els.quality.value;
    const [width, height] = els.ratio.value.split('x');
    const isEnhance = els.enhance.checked;
    const seed = Math.floor(Math.random() * 999999999);

    // 2. PROMPT ENGINEERING (Penggabungan Pintar)
    // Format: [User Prompt] + [Style Keywords] + [Quality Booster]
    let finalPrompt = userPrompt;
    
    if (styleKey && styles[styleKey]) {
        finalPrompt += `, ${styles[styleKey]}`;
    }
    
    if (qualityBoosters[qualityKey]) {
        finalPrompt += `, ${qualityBoosters[qualityKey]}`;
    }

    // 3. Construct URL
    // nologo=true : Hilangkan watermark
    // private=true : Privasi lebih terjaga (jika didukung API key)
    // model=flux : Model terbaik saat ini untuk detail
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const url = `${BASE_URL}${encodedPrompt}?width=${width}&height=${height}&model=flux&seed=${seed}&nologo=true&enhance=${isEnhance}&quality=hd`;

    currentImageUrl = url;

    // 4. Load Image
    els.img.onload = () => {
        setLoading(false);
        saveToHistory(url);
    };

    els.img.onerror = () => {
        setLoading(false);
        alert("Gagal memuat gambar. Server mungkin sedang sibuk.");
    };

    els.img.src = url;
}

function setLoading(isLoading) {
    if (isLoading) {
        els.btnGenerate.disabled = true;
        els.btnGenerate.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rendering Pixels...';
        els.loader.style.display = 'block';
        els.placeholder.style.display = 'none';
        els.img.style.display = 'none';
        els.actions.classList.remove('active');
    } else {
        els.btnGenerate.disabled = false;
        els.btnGenerate.innerHTML = '<i class="fas fa-bolt"></i> Generate Ultra Image';
        els.loader.style.display = 'none';
        els.img.style.display = 'block';
        els.actions.classList.add('active');
    }
}

/* --- DOWNLOAD & HISTORY --- */
async function downloadImage() {
    if (!currentImageUrl) return;
    const originalText = els.btnDownload.innerHTML;
    
    try {
        els.btnDownload.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Loading...';
        const response = await fetch(currentImageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DERY-AI-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (e) {
        alert("Gunakan Klik Kanan > Save Image As");
    } finally {
        els.btnDownload.innerHTML = originalText;
    }
}

function saveToHistory(url) {
    let history = JSON.parse(localStorage.getItem('deryAiUltraHistory')) || [];
    if (!history.includes(url)) {
        history.unshift(url);
        if (history.length > 8) history.pop(); // Simpan 8 terakhir agar tidak berat
        localStorage.setItem('deryAiUltraHistory', JSON.stringify(history));
    }
    renderHistory();
}

function loadHistory() { renderHistory(); }

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('deryAiUltraHistory')) || [];
    els.history.innerHTML = '';
    history.forEach(url => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<img src="${url}" loading="lazy">`;
        div.onclick = () => {
            setLoading(true);
            currentImageUrl = url;
            els.img.src = url;
            // Load ulang event handler manual karena onload tidak selalu trigger jika cache
            if (els.img.complete) setLoading(false);
            else els.img.onload = () => setLoading(false);
        };
        els.history.appendChild(div);
    });
}

function clearHistory() {
    if (confirm("Hapus history?")) {
        localStorage.removeItem('deryAiUltraHistory');
        renderHistory();
    }
}
