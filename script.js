/* --- KONFIGURASI UTAMA --- */
const BASE_URL = "https://image.pollinations.ai/prompt/";
let currentImageUrl = "";

// --- KAMUS KATA KUNCI (RAHASIA KUALITAS) ---
// KUNCI 1: Kata kunci ini akan DITAMBAHKAN DI DEPAN prompt pengguna.
// Ini memaksa AI untuk fokus pada kualitas dulu, baru objeknya.
const qualityPrepend = {
    high: "(high quality, highly detailed, sharp focus, 4k uhd)",
    // Extreme menggunakan bobot (weighting) untuk menekan AI
    extreme: "(masterpiece, best quality, ultra-detailed, hyperrealistic, 8k resolution, intricate details, sharp focus, ray tracing, cinematic lighting, unreal engine 5 render:1.4), (extremely detailed texture, no blur:1.3)"
};

// KUNCI 2: Style ditambahkan di akhir sebagai pelengkap suasana.
const stylesAppend = {
    no_style: "",
    photorealistic: "photograph, shot on 70mm lens, depth of field, professional camera",
    cinematic: "cinematic shot, movie scene, imax quality, color graded, dramatic atmosphere",
    anime: "anime style, studio ghibli, makoto shinkai, detailed lines, vibrant colors, 4k render",
    cyberpunk: "cyberpunk setting, neon lights, futuristic city, chrome reflections, high contrast",
    dark_fantasy: "dark fantasy art, gothic atmosphere, mysterious, volumetric fog, eldritch, intricate armor",
    "3d_render": "3d octane render, cgsociety masterpiece, physically based rendering, highly polished"
};

/* --- MENGAMBIL ELEMEN HTML --- */
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

/* --- INITIALISASI --- */
document.addEventListener('DOMContentLoaded', loadHistory);
els.btnGenerate.addEventListener('click', generateImage);
els.btnClear.addEventListener('click', clearHistory);
els.btnDownload.addEventListener('click', downloadImageAsPNG); // Menggunakan fungsi download PNG baru
els.btnFullscreen.addEventListener('click', () => {
    if (els.img.src) window.open(els.img.src, '_blank');
});

// Helper untuk toggle checkbox
window.toggleCheckbox = (id) => {
    const cb = document.getElementById(id);
    cb.checked = !cb.checked;
}

/* --- LOGIKA UTAMA GENERATE --- */
async function generateImage() {
    const userPrompt = els.prompt.value.trim();
    
    if (!userPrompt) {
        alert("⚠️ Masukkan deskripsi objek gambar terlebih dahulu.");
        els.prompt.focus();
        return;
    }

    setLoading(true);

    // 1. Ambil Parameter dari UI
    const styleKey = els.style.value;
    const qualityKey = els.quality.value;
    const [width, height] = els.ratio.value.split('x');
    const isEnhance = els.enhance.checked;
    // Seed acak agar hasil selalu unik
    const seed = Math.floor(Math.random() * 999999999);

    // 2. PROMPT ENGINEERING (PENGGABUNGAN PINTAR)
    // URUTAN SANGAT PENTING: [Kualitas] + [Prompt User] + [Style]
    
    let finalPromptArray = [];

    // A. Masukkan Kualitas DULUAN (Prioritas Tertinggi)
    if (qualityPrepend[qualityKey]) {
        finalPromptArray.push(qualityPrepend[qualityKey]);
    }

    // B. Masukkan Prompt Pengguna (Objek Utama)
    finalPromptArray.push(userPrompt);

    // C. Masukkan Style Terakhir (Pelengkap)
    if (styleKey !== 'no_style' && stylesAppend[styleKey]) {
        finalPromptArray.push(stylesAppend[styleKey]);
    }

    // Gabungkan semua dengan koma
    const finalPromptString = finalPromptArray.join(", ");

    console.log("Prompt yang dikirim ke AI:", finalPromptString); // Cek konsol untuk melihat prompt final

    // 3. Susun URL API
    // Kita gunakan model 'flux' dan parameter 'enhance=true' serta 'quality=hd'
    const encodedPrompt = encodeURIComponent(finalPromptString);
    // Catatan: Meskipun kita meminta HD, API mungkin menurunkan resolusi jika server sibuk. 
    // Namun prompt kita sudah memaksa detail di resolusi berapapun.
    const url = `${BASE_URL}${encodedPrompt}?width=${width}&height=${height}&model=flux&seed=${seed}&nologo=true&enhance=${isEnhance}&quality=hd`;

    currentImageUrl = url;

    // 4. Muat Gambar
    // Kita gunakan trik: set src menjadi kosong dulu untuk memicu event onload dengan benar
    els.img.src = ''; 
    
    els.img.onload = () => {
        setLoading(false);
        saveToHistory(url);
    };

    els.img.onerror = () => {
        setLoading(false);
        alert("Gagal merender gambar. Server mungkin sedang sangat sibuk. Coba lagi dalam beberapa saat.");
    };

    // Set src sebenarnya untuk memulai proses
    els.img.src = url;
}

/* --- FUNGSI UI LOADING --- */
function setLoading(isLoading) {
    if (isLoading) {
        els.btnGenerate.disabled = true;
        els.btnGenerate.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> SEDANG MERENDER...';
        els.loader.style.display = 'block';
        els.placeholder.style.display = 'none';
        els.img.style.display = 'none';
        els.actions.classList.remove('active');
    } else {
        els.btnGenerate.disabled = false;
        els.btnGenerate.innerHTML = '<i class="fas fa-bolt"></i> RENDER ULTRA IMAGE';
        els.loader.style.display = 'none';
        els.img.style.display = 'block'; // Pastikan gambar terlihat
        els.actions.classList.add('active');
    }
}

/* --- FUNGSI DOWNLOAD PNG (BARU) --- */
async function downloadImageAsPNG() {
    if (!currentImageUrl) return;
    const originalText = els.btnDownload.innerHTML;
    
    try {
        els.btnDownload.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses PNG...';
        els.btnDownload.disabled = true;

        // 1. Fetch gambar sebagai data blob (mentah)
        const response = await fetch(currentImageUrl);
        const blob = await response.blob();

        // 2. Buat URL objek sementara dari blob tersebut
        const url = window.URL.createObjectURL(blob);
        
        // 3. Buat elemen <a> tersembunyi untuk memicu download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        // 4. PENTING: Paksa ekstensi .png pada nama file
        a.download = `DERY-ULTRA-DETAIL-${Date.now()}.png`;
        
        document.body.appendChild(a);
        a.click();
        
        // 5. Bersihkan memori
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (e) {
        console.error("Download error:", e);
        alert("Gagal mengunduh otomatis. Silakan Klik Kanan pada gambar > 'Save Image As...'");
    } finally {
        // Kembalikan tombol seperti semula
        els.btnDownload.innerHTML = originalText;
        els.btnDownload.disabled = false;
    }
}

/* --- FUNGSI HISTORY --- */
function saveToHistory(url) {
    // Gunakan nama storage yang berbeda agar tidak bentrok dengan versi sebelumnya
    let history = JSON.parse(localStorage.getItem('deryUltraEnginePro')) || [];
    // Cek duplikasi
    if (!history.includes(url)) {
        history.unshift(url);
        // Simpan 8 gambar terakhir saja agar performa terjaga
        if (history.length > 8) history.pop();
        localStorage.setItem('deryUltraEnginePro', JSON.stringify(history));
    }
    renderHistory();
}

function loadHistory() { renderHistory(); }

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('deryUltraEnginePro')) || [];
    els.history.innerHTML = '';
    history.forEach(url => {
        const div = document.createElement('div');
        div.className = 'history-item';
        // Gunakan lazy loading agar tidak membebani browser saat awal buka
        div.innerHTML = `<img src="${url}" loading="lazy" alt="History thumbnail">`;
        
        div.onclick = () => {
            // Saat klik history, muat ulang gambar ke preview utama
            setLoading(true);
            currentImageUrl = url;
            els.img.src = ''; // Reset src triggers onload correctly
            els.img.src = url;
            
            // Handler sederhana jika gambar sudah di-cache browser
            if (els.img.complete) {
                 setLoading(false);
            } else {
                els.img.onload = () => setLoading(false);
            }
        };
        els.history.appendChild(div);
    });
}

function clearHistory() {
    if (confirm("Yakin ingin menghapus semua riwayat render?")) {
        localStorage.removeItem('deryUltraEnginePro');
        renderHistory();
    }
}
