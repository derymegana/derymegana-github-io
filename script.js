// Konfigurasi Parameter Dasar
const BASE_URL = "https://image.pollinations.ai/prompt/";

// Fungsi Utama Generate
async function generateImage() {
    const promptInput = document.getElementById('promptInput').value.trim();
    const model = document.getElementById('modelSelect').value;
    const style = document.getElementById('styleSelect').value;
    const aspectRatio = document.getElementById('aspectRatio').value;
    const seedInput = document.getElementById('seedInput').value;
    const enhancePrompt = document.getElementById('enhancePrompt').checked;
    const qualityBoost = document.getElementById('qualityBoost').checked;

    // UI Elements
    const resultImg = document.getElementById('resultImage');
    const loader = document.getElementById('loader');
    const placeholderText = document.getElementById('placeholderText');
    const statusText = document.getElementById('statusText');
    const actionButtons = document.getElementById('actionButtons');
    const downloadBtn = document.getElementById('downloadBtn');

    if (!promptInput) {
        alert("Harap masukkan deskripsi gambar (Prompt)!");
        return;
    }

    // 1. Setup Dimensi (Width & Height) berdasarkan Rasio
    let width, height;
    switch (aspectRatio) {
        case '16:9': width = 1280; height = 720; break;
        case '9:16': width = 720; height = 1280; break;
        case '4:3': width = 1152; height = 864; break;
        case '3:4': width = 864; height = 1152; break;
        case '21:9': width = 1536; height = 640; break;
        default: width = 1024; height = 1024; // 1:1
    }

    // 2. Setup Seed (Acak jika kosong)
    const seed = seedInput ? seedInput : Math.floor(Math.random() * 10000000);

    // 3. Konstruksi Final Prompt
    let finalPrompt = promptInput;

    // Tambahkan Style
    if (style) {
        finalPrompt = `${style} style, ${finalPrompt}`;
    }

    // Fitur Enhance Prompt (Menambah detail artistik)
    if (enhancePrompt) {
        finalPrompt += ", detailed lighting, cinematic composition, vivid colors";
    }

    // Fitur Quality Boost (Sesuai request: Ultra detailed, 8k, Maximalism)
    if (qualityBoost) {
        finalPrompt += ", ultra detailed, high resolution 8k, Masterpiece Maximalisme, sharp focus, HDR";
    }

    // 4. Encode URL Prompt
    // Pollinations menggunakan prompt di path URL
    const encodedPrompt = encodeURIComponent(finalPrompt);

    // 5. Susun URL Lengkap dengan Parameter
    // Parameter: width, height, model, nologo, seed, enhance, private
    const requestUrl = `${BASE_URL}${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=true&enhance=true&quality=hd&private=false`;

    console.log("Requesting:", requestUrl); // Debugging

    // 6. Update UI ke mode Loading
    loader.style.display = "block";
    resultImg.style.display = "none";
    placeholderText.style.display = "none";
    actionButtons.style.display = "none";
    statusText.innerText = "Sedang meracik gambar... (Tunggu 5-15 detik)";
    statusText.style.color = "#00f2ea";

    // 7. Fetch Gambar
    // Kita gunakan fetch blob agar bisa menghandle error dan membuat link download
    try {
        const response = await fetch(requestUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP Error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        // Tampilkan Gambar
        resultImg.src = imageUrl;
        resultImg.onload = () => {
            loader.style.display = "none";
            resultImg.style.display = "block";
            actionButtons.style.display = "block";
            statusText.innerText = `Selesai! Seed: ${seed}`;
            statusText.style.color = "#4caf50";
        };

        // Update Link Download
        downloadBtn.href = imageUrl;
        // Nama file download dinamis
        downloadBtn.download = `dery-ai-${seed}.png`;

    } catch (error) {
        console.error("Error generating image:", error);
        loader.style.display = "none";
        placeholderText.style.display = "block";
        placeholderText.innerText = "Gagal membuat gambar. Coba lagi.";
        statusText.innerText = "Error koneksi ke server AI.";
        statusText.style.color = "#ff0055";
        alert("Gagal menghubungi server. Pastikan koneksi internet stabil atau coba ganti Model.");
    }
}
