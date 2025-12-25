// URL Dasar
const BASE_URL = "https://image.pollinations.ai/prompt/";

function generate() {
    const prompt = document.getElementById('prompt').value.trim();
    if (!prompt) return alert("Mohon isi deskripsi gambar dulu!");

    // 1. Ambil Elemen UI
    const resultImg = document.getElementById('resultImage');
    const loader = document.getElementById('loading');
    const placeholder = document.getElementById('placeholder');
    const actions = document.getElementById('actions');
    const downloadBtn = document.getElementById('downloadLink');

    // 2. Reset Tampilan (Loading State)
    loader.style.display = "block";
    placeholder.style.display = "none";
    resultImg.style.display = "none";
    actions.style.display = "none";

    // 3. Ambil Parameter
    const model = document.getElementById('aiModel').value;
    const ratio = document.getElementById('aspectRatio').value;
    const style = document.getElementById('artStyle').value;
    const color = document.getElementById('colorPalette').value;
    const isEnhance = document.getElementById('enhance').checked;
    const isHD = document.getElementById('hd').checked;

    // 4. Hitung Resolusi
    let width = 1024, height = 1024;
    if (ratio === "16:9") { width = 1280; height = 720; }
    else if (ratio === "9:16") { width = 720; height = 1280; }
    else if (ratio === "4:5") { width = 864; height = 1080; }
    else if (ratio === "21:9") { width = 1536; height = 640; }

    // 5. Susun Prompt (Prompt Engineering Otomatis)
    let finalPrompt = prompt;
    if (style) finalPrompt += `, ${style} style`;
    if (color) finalPrompt += `, ${color}`;
    if (isHD) finalPrompt += ", ultra detailed, 8k resolution, masterpiece, sharp focus, HDR";
    if (isEnhance) finalPrompt += ", cinematic lighting, vivid details";

    // 6. Buat Random Seed (Agar gambar selalu baru)
    const seed = Math.floor(Math.random() * 1000000);

    // 7. KONSTRUKSI URL (Metode Tercepat)
    const encodedPrompt = encodeURIComponent(finalPrompt);
    // Tambahkan 'nologo=true' agar bersih
    // 'enhance=false' di URL karena kita sudah enhance manual di prompt (lebih stabil)
    const imageUrl = `${BASE_URL}${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=true`;

    // 8. Tampilkan Gambar (Browser yang kerja, bukan script)
    resultImg.src = imageUrl;

    // Event saat gambar selesai didownload browser
    resultImg.onload = function() {
        loader.style.display = "none";
        resultImg.style.display = "block";
        actions.style.display = "flex";
        
        // Update Info Seed & Link Download
        document.getElementById('seedBadge').innerText = `Seed: ${seed}`;
        downloadBtn.href = imageUrl;
    };

    // Event jika error
    resultImg.onerror = function() {
        loader.style.display = "none";
        placeholder.style.display = "flex";
        alert("Gagal memuat. Server sibuk, coba tekan Generate lagi.");
    };
}

function resetApp() {
    document.getElementById('prompt').value = "";
    document.getElementById('resultImage').style.display = "none";
    document.getElementById('placeholder').style.display = "flex";
    document.getElementById('actions').style.display = "none";
}

function openFull(url) {
    window.open(url, '_blank');
}
