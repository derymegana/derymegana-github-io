const BASE_URL = "https://image.pollinations.ai/prompt/";

function generateImage() {
    const promptInput = document.getElementById('promptInput').value.trim();
    if (!promptInput) {
        alert("Wajib isi deskripsi gambar dulu ya!");
        return;
    }

    // UI Elements
    const loader = document.getElementById('loader');
    const resultImg = document.getElementById('resultImage');
    const placeholder = document.getElementById('placeholder');
    const actionBtns = document.getElementById('actionButtons');
    const downloadLink = document.getElementById('downloadBtn');
    const seedInfo = document.getElementById('seedInfo');

    // Reset UI
    loader.style.display = "block";
    resultImg.style.display = "none";
    placeholder.style.display = "none";
    actionBtns.style.display = "none";

    // Ambil Parameter
    const model = document.getElementById('modelSelect').value;
    const ratio = document.getElementById('aspectRatio').value;
    const style = document.getElementById('styleSelect').value;

    // Tentukan Resolusi
    let width = 1024, height = 1024;
    if (ratio === "16:9") { width = 1280; height = 720; }
    else if (ratio === "9:16") { width = 720; height = 1280; }
    else if (ratio === "4:5") { width = 864; height = 1080; }

    // Prompt Engineering Otomatis
    let finalPrompt = promptInput;
    if (style) finalPrompt += `, ${style} style`;
    // Menambahkan keyword wajib agar gambar bagus
    finalPrompt += ", 8k resolution, highly detailed, masterpiece, sharp focus, HDR";

    // Seed Acak (PENTING: Agar gambar selalu baru)
    const seed = Math.floor(Math.random() * 1000000);

    // Encode Prompt (PENTING: Agar spasi tidak error)
    const encodedPrompt = encodeURIComponent(finalPrompt);

    // Konstruksi URL
    // Kita tambahkan parameter acak '?t=' di akhir agar browser tidak mengambil cache lama
    const imageUrl = `${BASE_URL}${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=true&enhance=true`;

    console.log("Loading URL:", imageUrl); // Cek console jika error

    // Load Gambar
    resultImg.src = imageUrl;

    resultImg.onload = function() {
        loader.style.display = "none";
        resultImg.style.display = "block";
        actionBtns.style.display = "flex";
        
        // Update Link Download & Info
        downloadLink.href = imageUrl;
        seedInfo.innerText = `Seed: ${seed}`;
    };

    resultImg.onerror = function() {
        loader.style.display = "none";
        placeholder.style.display = "block";
        alert("Gagal memuat gambar. Kemungkinan server sibuk atau prompt mengandung kata yang dilarang. Coba deskripsi lain.");
    };
}

function clearInput() {
    document.getElementById('promptInput').value = "";
    document.getElementById('promptInput').focus();
}

function viewImage(url) {
    if(url) window.open(url, '_blank');
}
