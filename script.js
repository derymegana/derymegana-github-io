document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        promptInput: document.getElementById('promptInput'),
        negativePrompt: document.getElementById('negativePrompt'),
        widthInput: document.getElementById('width'),
        heightInput: document.getElementById('height'),
        seedInput: document.getElementById('seed'),
        randomSeedBtn: document.getElementById('randomSeedBtn'),
        modelSelect: document.getElementById('model'),
        styleSelect: document.getElementById('style'),
        aspectRatioSelect: document.getElementById('aspectRatio'),
        stepsInput: document.getElementById('steps'),
        stepsValue: document.getElementById('stepsValue'),
        colorPaletteSelect: document.getElementById('colorPalette'),
        compositionSelect: document.getElementById('composition'),
        nsfwToggle: document.getElementById('nsfwToggle'),
        generateBtn: document.getElementById('generateBtn'),
        enhancePromptBtn: document.getElementById('enhancePrompt'),
        ultraEnhanceBtn: document.getElementById('ultraEnhanceBtn'),
        randomPromptBtn: document.getElementById('randomPrompt'),
        downloadBtn: document.getElementById('downloadBtn'),
        saveHistoryBtn: document.getElementById('saveHistoryBtn'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        themeToggle: document.getElementById('themeToggle'),
        languageToggle: document.getElementById('languageToggle'),
        loadingElement: document.getElementById('loading'),
        imageElement: document.getElementById('generatedImage'),
        imageControls: document.getElementById('imageControls'),
        historyList: document.getElementById('historyList'),
        advancedBtn: document.getElementById('advancedBtn')
    };

    // State
    const state = {
        currentLanguage: 'en',
        history: JSON.parse(localStorage.getItem('promptHistory')) || [],
        advancedSettingsVisible: false
    };

    // Art Style Combinations
    const artStyleCombinations = {
        'ghibli': ['fractal', 'surrealism'],
        'watercolor': ['airbrush', 'aquarelle'],
        'graphite': ['impressionism', 'oilpainting'],
        'graphitepencil': ['impressionism', 'oilpainting'],
        'digital': ['cinematic', 'ultradetailed'],
        'digitalart': ['cinematic', 'ultradetailed'],
        'cinematic': ['vintage', 'hyperrealism'],
        'psychedelic': ['macabre', 'sanctuary'],
        'macabre': ['sanctuary', 'surrealism'],
        'sanctuary': ['surrealism', 'fantasy'],
        'surrealism': ['fractalvorter', 'surreal'],
        'darkfantasy': ['fantasy', 'mystery'],
        'fractalvorter': ['fractalspiral', 'surreal'],
        'fractal': ['spiral', 'surreal'],
        'geometric': ['zentangle', 'isometric'],
        'ornamentgeometric': ['zentangle', 'isometric'],
        'futurism': ['scifi', 'hyperrealism'],
        'futuristic': ['cyberpunk', 'fantasy']
    };

    // Translations
    const translations = {
        en: {
            promptPlaceholder: "Enter your image description...",
            negativePromptPlaceholder: "Negative prompt (what you don't want to see)...",
            generateBtn: "GENERATE",
            enhancePrompt: "Enhance",
            ultraEnhance: "Ultra Enhance",
            randomPrompt: "Random",
            loadingText: "DERY AI LOADING",
            historyTitle: "Prompt History",
            clearHistory: "Clear History",
            download: "Download",
            save: "Save",
            copyright: "Copyright &copy; 2025 DERY AI GENERATOR",
            poweredBy: "Powered by Pollinations API | Developed by Dery Lau",
            thanks: "Thanks to Github, Cloudflare & DeepSeek",
            advanced: "Advanced",
            hide: "Hide"
        },
        id: {
            promptPlaceholder: "Masukkan deskripsi gambar Anda...",
            negativePromptPlaceholder: "Prompt negatif (yang tidak ingin Anda lihat)...",
            generateBtn: "BUAT GAMBAR",
            enhancePrompt: "Tingkatkan",
            ultraEnhance: "Tingkatkan Ultra",
            randomPrompt: "Acak",
            loadingText: "DERY AI MEMPROSES",
            historyTitle: "Riwayat Prompt",
            clearHistory: "Hapus Riwayat",
            download: "Unduh",
            save: "Simpan",
            copyright: "Hak Cipta &copy; 2025 DERY AI GENERATOR",
            poweredBy: "Didukung oleh Pollinations API | Dikembangkan oleh Dery Lau",
            thanks: "Terima kasih untuk Github, Cloudflare & DeepSeek",
            advanced: "Lanjutan",
            hide: "Sembunyikan"
        }
    };

    // Initialize
    init();

    function init() {
        // Event listeners
        setupEventListeners();
        
        // Load history
        renderHistory();
        
        // Update aspect ratio
        updateAspectRatio();
        
        // Set initial language
        updateLanguage();
        
        // Generate random seed
        generateRandomSeed();
        
        // Hide advanced settings by default
        toggleAdvancedSettings(false);
    }

    function setupEventListeners() {
        // Generate button
        elements.generateBtn.addEventListener('click', generateImage);
        
        // Enhance prompt button
        elements.enhancePromptBtn.addEventListener('click', enhancePrompt);
        
        // Ultra enhance button
        elements.ultraEnhanceBtn.addEventListener('click', ultraEnhancePrompt);
        
        // Random prompt button
        elements.randomPromptBtn.addEventListener('click', generateRandomPrompt);
        
        // Random seed button
        elements.randomSeedBtn.addEventListener('click', generateRandomSeed);
        
        // Download button
        elements.downloadBtn.addEventListener('click', downloadImage);
        
        // Save to history button
        elements.saveHistoryBtn.addEventListener('click', saveToHistory);
        
        // Clear history button
        elements.clearHistoryBtn.addEventListener('click', clearHistory);
        
        // Theme toggle
        elements.themeToggle.addEventListener('click', toggleTheme);
        
        // Language toggle
        elements.languageToggle.addEventListener('click', toggleLanguage);
        
        // Steps slider
        elements.stepsInput.addEventListener('input', function() {
            elements.stepsValue.textContent = this.value;
        });
        
        // Aspect ratio change
        elements.aspectRatioSelect.addEventListener('change', updateAspectRatio);
        
        // History item click
        elements.historyList.addEventListener('click', function(e) {
            if (e.target.tagName === 'LI') {
                elements.promptInput.value = e.target.dataset.prompt;
                if (e.target.dataset.negativePrompt) {
                    elements.negativePrompt.value = e.target.dataset.negativePrompt;
                }
            }
        });
        
        // Advanced settings button
        elements.advancedBtn.addEventListener('click', function() {
            toggleAdvancedSettings();
        });
    }

    function applyArtStyleCombination(baseStyle) {
        const normalizedBaseStyle = baseStyle.toLowerCase().replace(/\s+/g, '');
        
        if (artStyleCombinations[normalizedBaseStyle]) {
            const combinedStyles = [baseStyle, ...artStyleCombinations[normalizedBaseStyle]];
            const combinedValue = combinedStyles.join('-');
            
            // Check if the combined style exists, if not add it
            if (!Array.from(elements.styleSelect.options).some(opt => opt.value === combinedValue)) {
                const option = document.createElement('option');
                option.value = combinedValue;
                option.textContent = combinedStyles.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' + ');
                elements.styleSelect.appendChild(option);
            }
            
            elements.styleSelect.value = combinedValue;
            return true;
        }
        
        return false;
    }

    function generateImage() {
        let prompt = elements.promptInput.value.trim();
        
        // Check for special style combination format
        const styleMatch = prompt.match(/^style:(\w+)\s+(.+)/i);
        if (styleMatch) {
            const baseStyle = styleMatch[1];
            const description = styleMatch[2];
            
            if (applyArtStyleCombination(baseStyle)) {
                // Update prompt with just the description
                elements.promptInput.value = description;
                prompt = description;
            }
        }
        
        if (!prompt) {
            alert(state.currentLanguage === 'en' ? "Please enter a prompt first!" : "Silakan masukkan prompt terlebih dahulu!");
            return;
        }

        // If seed is empty, generate random seed
        if (!elements.seedInput.value.trim()) {
            generateRandomSeed();
        }

        // Show loading, hide previous image
        elements.loadingElement.style.display = 'block';
        elements.imageElement.style.display = 'none';
        elements.imageControls.style.display = 'none';

        // Get parameters
        const width = elements.widthInput.value || 1024;
        const height = elements.heightInput.value || 1024;
        const seed = elements.seedInput.value ? `&seed=${elements.seedInput.value}` : '';
        const model = getModelEndpoint(elements.modelSelect.value);
        const style = elements.styleSelect.value ? `&style=${elements.styleSelect.value}` : '';
        const steps = `&steps=${elements.stepsInput.value}`;
        const nsfw = `&safe=${!elements.nsfwToggle.checked}`;
        const colorPalette = elements.colorPaletteSelect.value ? `&palette=${elements.colorPaletteSelect.value}` : '';
        const composition = elements.compositionSelect.value ? `&composition=${elements.compositionSelect.value}` : '';
        const negativePrompt = elements.negativePrompt.value ? `&negative=${encodeURIComponent(elements.negativePrompt.value)}` : '';

        // Enhanced parameters for best quality PNG
        const qualityParams = `&format=png&quality=100&enhance=true&nologo=true&private=false&upscale=true`;

        // Encode prompt for URL
        const encodedPrompt = encodeURIComponent(prompt);

        // Build image URL based on model
        let imageUrl;
        if (model.includes('http')) {
            // Special models with different endpoints
            imageUrl = `${model}${encodedPrompt}?width=${width}&height=${height}${style}${steps}${seed}${nsfw}${colorPalette}${composition}${negativePrompt}${qualityParams}`;
        } else {
            // Default pollinations.ai
            imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}${model}${style}${steps}${seed}${nsfw}${colorPalette}${composition}${negativePrompt}${qualityParams}`;
        }

        // Set timeout for image loading
        const loadingTimeout = setTimeout(() => {
            elements.loadingElement.style.display = 'none';
            alert(state.currentLanguage === 'en' 
                ? "Image generation is taking longer than expected. Please try again or modify your prompt." 
                : "Pembuatan gambar memakan waktu lebih lama dari yang diharapkan. Silakan coba lagi atau ubah prompt Anda.");
        }, 30000); // 30 seconds timeout

        // Load image
        elements.imageElement.onload = function() {
            clearTimeout(loadingTimeout);
            elements.loadingElement.style.display = 'none';
            elements.imageElement.style.display = 'block';
            elements.imageControls.style.display = 'flex';
        };

        elements.imageElement.onerror = function() {
            clearTimeout(loadingTimeout);
            elements.loadingElement.style.display = 'none';
            alert(state.currentLanguage === 'en' 
                ? "Failed to generate image. Please try again with a different prompt." 
                : "Gagal membuat gambar. Silakan coba dengan prompt yang berbeda.");
        };

        elements.imageElement.src = imageUrl;
    }

    function getModelEndpoint(model) {
        switch(model) {
            case 'dalle3':
                return '&model=dalle3';
            case 'midjourney':
                return '&model=midjourney';
            case 'stablediffusion':
                return '&model=stablediffusion-xl';
            case 'kandinsky':
                return '&model=kandinsky';
            case 'deepfloyd':
                return '&model=deepfloyd';
            case 'gptimage':
                return '&model=gptimage';
            case 'flux':
                return '&model=flux';
            case 'turbo':
                return '&model=turbo';
            default:
                return ''; // Default pollinations.ai
        }
    }

    function enhancePrompt() {
        const prompt = elements.promptInput.value.trim();
        if (!prompt) return;
        
        const enhanced = `highly detailed, 4k, ultra HD, professional photography, ${prompt}`;
        elements.promptInput.value = enhanced;
    }

    function ultraEnhancePrompt() {
        const prompt = elements.promptInput.value.trim();
        if (!prompt) return;
        
        const enhanced = `ultra detailed, 8k, ultra HD, professional photography, cinematic lighting, intricate details, hyper realistic, ${prompt}`;
        elements.promptInput.value = enhanced;
        
        // Set quality parameters automatically
        elements.widthInput.value = 1024;
        elements.heightInput.value = 1024;
        elements.stepsInput.value = 100;
        elements.stepsValue.textContent = '100';
    }

    function generateRandomPrompt() {
        const randomPrompts = [
            "A futuristic cityscape at sunset with flying cars and neon lights",
            "A mystical forest with glowing mushrooms and fairies",
            "A cyberpunk samurai standing in the rain at night",
            "An astronaut exploring an alien jungle",
            "A steampunk airship flying over mountains",
            "A dragon sleeping on a pile of gold in a cave",
            "A magical library floating in space",
            "A post-apocalyptic wasteland with a lone wanderer",
            "A underwater city with glass domes and mermaids",
            "A giant robot fighting a kaiju in downtown Tokyo"
        ];
        
        const randomIndex = Math.floor(Math.random() * randomPrompts.length);
        elements.promptInput.value = randomPrompts[randomIndex];
    }

    function generateRandomSeed() {
        const randomSeed = Math.floor(Math.random() * 1000000);
        elements.seedInput.value = randomSeed;
    }

    function downloadImage() {
        if (!elements.imageElement.src) return;
        
        const link = document.createElement('a');
        link.href = elements.imageElement.src;
        link.download = `dery-ai-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function saveToHistory() {
        const prompt = elements.promptInput.value.trim();
        if (!prompt) return;
        
        const negativePrompt = elements.negativePrompt.value.trim();
        
        // Add to history
        state.history.unshift({
            prompt,
            negativePrompt,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 20 items
        if (state.history.length > 20) {
            state.history = state.history.slice(0, 20);
        }
        
        // Save to localStorage
        localStorage.setItem('promptHistory', JSON.stringify(state.history));
        
        // Update UI
        renderHistory();
        
        // Show confirmation
        alert(state.currentLanguage === 'en' 
            ? "Prompt saved to history!" 
            : "Prompt disimpan ke riwayat!");
    }

    function clearHistory() {
        if (confirm(state.currentLanguage === 'en' 
            ? "Are you sure you want to clear all history?" 
            : "Apakah Anda yakin ingin menghapus semua riwayat?")) {
            state.history = [];
            localStorage.removeItem('promptHistory');
            renderHistory();
        }
    }

    function renderHistory() {
        elements.historyList.innerHTML = '';
        
        state.history.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = item.prompt.length > 50 
                ? item.prompt.substring(0, 50) + '...' 
                : item.prompt;
            li.dataset.prompt = item.prompt;
            if (item.negativePrompt) {
                li.dataset.negativePrompt = item.negativePrompt;
            }
            elements.historyList.appendChild(li);
        });
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        
        // Update icon
        const icon = elements.themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    function toggleLanguage() {
        state.currentLanguage = state.currentLanguage === 'en' ? 'id' : 'en';
        updateLanguage();
    }

    function updateLanguage() {
        const lang = translations[state.currentLanguage];
        
        // Update UI elements
        elements.promptInput.placeholder = lang.promptPlaceholder;
        elements.negativePrompt.placeholder = lang.negativePromptPlaceholder;
        elements.generateBtn.innerHTML = `<i class="fas fa-cogs"></i> ${lang.generateBtn}`;
        elements.enhancePromptBtn.innerHTML = `<i class="fas fa-magic"></i> ${lang.enhancePrompt}`;
        elements.ultraEnhanceBtn.innerHTML = `<i class="fas fa-stars"></i> ${lang.ultraEnhance}`;
        elements.randomPromptBtn.innerHTML = `<i class="fas fa-random"></i> ${lang.randomPrompt}`;
        document.querySelector('.loading-text').textContent = lang.loadingText;
        document.querySelector('.history-section h2').innerHTML = `<i class="fas fa-history"></i> ${lang.historyTitle}`;
        elements.clearHistoryBtn.textContent = lang.clearHistory;
        elements.downloadBtn.innerHTML = `<i class="fas fa-download"></i> ${lang.download}`;
        elements.saveHistoryBtn.innerHTML = `<i class="fas fa-save"></i> ${lang.save}`;
        
        // Update footer
        const footerParagraphs = document.querySelectorAll('footer p');
        footerParagraphs[0].innerHTML = lang.copyright;
        footerParagraphs[1].textContent = lang.poweredBy;
        footerParagraphs[2].textContent = lang.thanks;
        
        // Update advanced button
        elements.advancedBtn.innerHTML = state.advancedSettingsVisible 
            ? `<i class="fas fa-times"></i> ${lang.hide}` 
            : `<i class="fas fa-sliders-h"></i> ${lang.advanced}`;
    }

    function updateAspectRatio() {
        const ratio = elements.aspectRatioSelect.value;
        let width, height;
        
        switch(ratio) {
            case '1:1':
                width = height = 1024;
                break;
            case '4:3':
                width = 1366;
                height = 1024;
                break;
            case '16:9':
                width = 1920;
                height = 1080;
                break;
            case '9:16':
                width = 1080;
                height = 1920;
                break;
            case '3:2':
                width = 1536;
                height = 1024;
                break;
            case '2:3':
                width = 1024;
                height = 1536;
                break;
            default:
                width = height = 1024;
        }
        
        elements.widthInput.value = width;
        elements.heightInput.value = height;
    }

    function toggleAdvancedSettings(animate = true) {
        state.advancedSettingsVisible = !state.advancedSettingsVisible;
        
        const advancedSettings = document.querySelectorAll('.settings-column:nth-child(n+2)');
        advancedSettings.forEach(setting => {
            if (state.advancedSettingsVisible) {
                setting.style.display = 'block';
                if (animate) {
                    gsap.from(setting, {
                        opacity: 0,
                        y: 20,
                        duration: 0.3,
                        stagger: 0.1
                    });
                }
            } else {
                setting.style.display = 'none';
            }
        });
        
        const lang = translations[state.currentLanguage];
        elements.advancedBtn.innerHTML = state.advancedSettingsVisible 
            ? `<i class="fas fa-times"></i> ${lang.hide}` 
            : `<i class="fas fa-sliders-h"></i> ${lang.advanced}`;
    }

    // Social share functions
    document.querySelector('.share-btn.facebook').addEventListener('click', function() {
        shareOnSocial('facebook');
    });

    document.querySelector('.share-btn.whatsapp').addEventListener('click', function() {
        shareOnSocial('whatsapp');
    });

    document.querySelector('.share-btn.twitter').addEventListener('click', function() {
        shareOnSocial('twitter');
    });

    function shareOnSocial(platform) {
        if (!elements.imageElement.src) return;
        
        const text = encodeURIComponent(state.currentLanguage === 'en' 
            ? "Check out this AI-generated image I created with DERY AI!" 
            : "Lihat gambar AI yang saya buat dengan DERY AI!");
        const url = encodeURIComponent(elements.imageElement.src);
        
        let shareUrl;
        switch(platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${text} ${url}`;
                break;
            default:
                return;
        }
        
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
});