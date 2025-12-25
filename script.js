const BASE_URL = "https://image.pollinations.ai/prompt/";

function generateArt() {
    const promptText = document.getElementById('prompt').value.trim();
    if (!promptText) return alert("Isi deskripsi gambar dulu!");

    // UI ELEMENTS
    const imgEl = document.getElementById('outputImage');
    const loader = document.getElementById('loading');
    const placeholder = document.getElementById('placeholder');
    const errorMsg = document.getElementById('errorMsg');
    const actions = document.getElementById('actions');
    const dlBtn = document.getElementById('downloadBtn');
    const manualLink = document.getElementById('manualLink');

    // RESET TAMPILAN
    loader.style.display = "flex";
    placeholder.style.display = "none";
    imgEl.style.display = "none";
    errorMsg.style.display = "none";
    actions.style.display = "none";

    // PARAMETER
    const model = document.getElementById('model').value;
    const ratio = document.getElementById('ratio').value;
    const style = document.getElementById('style').value;

    let w = 1024, h = 1024;
    if (ratio === "16:9") { w = 1280; h = 720; }
    else if (ratio === "9:16") { w = 720; h = 1280; }
    else if (ratio === "4:5") { w = 864; h = 1080; }

    // PROMPT ENGINEERING
    let finalPrompt = promptText;
    if (style) finalPrompt += `, ${style} style`;
    finalPrompt += ", 8k resolution, highly detailed, masterpiece, sharp focus, HDR, cinematic lighting";

    // KONSTRUKSI URL (ANTI-CACHE)
    const seed = Math.floor(Math.random() * 1000000);
    // encodeURIComponent WAJIB agar spasi tidak memutus link
    const encodedPrompt = encodeURIComponent(finalPrompt);
    
    // Parameter timestamp (&t=) memaksa browser memuat gambar baru
    const timeStamp = Date.now(); 
    
    const imageUrl = `${BASE_URL}${encodedPrompt}?width=${w}&height=${h}&model=${model}&seed=${seed}&nologo=true&enhance=true&t=${timeStamp}`;

    console.log("Requesting:", imageUrl); // Cek console untuk debug

    // SET URL GAMBAR
    imgEl.src = imageUrl;
    
    // UPDATE LINK MANUAL & DOWNLOAD
    // Ini penting jika gambar tidak muncul di preview, user bisa klik manual
    manualLink.href = imageUrl;
    dlBtn.href = imageUrl;

    // EVENT LISTENER
    imgEl.onload = function() {
        loader.style.display = "none";
        imgEl.style.display = "block";
        actions.style.display = "flex";
    };

    imgEl.onerror = function() {
        loader.style.display = "none";
        errorMsg.style.display = "block";
        // Jangan alert, cukup tampilkan pesan error dan link manual
    };
}

function copyLink() {
    const url = document.getElementById('downloadBtn').href;
    if(url && url !== "#") {
        navigator.clipboard.writeText(url);
        alert("Link gambar disalin!");
    }
}
